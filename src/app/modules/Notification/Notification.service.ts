import httpStatus from "http-status";
import AppError from "../../errors/AppError";
import ApiError from "../../errors/AppError"
import prisma from "../../utils/prisma";
import admin from "./firebaseAdmin";


// Send notification to a single user
const sendSingleNotification = async (req: any) => {
  try {
    const { userId } = req.params;
  
    const { title, body,author } = req.body;

    if (!title || !body || !author) {
      throw new ApiError(400, "Title, body and author are required");
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.fcmToken ) {
      throw new AppError(httpStatus.BAD_REQUEST, "Fcm token is not present")
    }

    if (user.doNotDisturb){
      return
    }

    const message = {
      notification: {
        title,
        body,
      },
      token: user.fcmToken,
    };

    await prisma.notification.create({
      data: {
        recieverId: userId,
        senderId: req.user.id,
        title,
        body,
        author
      },
    });

    const response = await admin.messaging().send(message);

    console.log(response);
    return response;
  } catch (error: any) {
    console.error("Error sending notification:", error);
    if (error.code === "messaging/invalid-registration-token") {
      throw new ApiError(400, "Invalid FCM registration token");
    } else if (error.code === "messaging/registration-token-not-registered") {
      throw new ApiError(404, "FCM token is no longer registered");
    } else {
      throw new ApiError(500, error.message || "Failed to send notification");
    }
  }
};

const sendNotificationToMultipleUsers = async (userId:string, payload:{title:string, body:string,author:string,recievers:string[]})=>{
  
  if (!payload.title || !payload.body || !payload.author){
       throw new ApiError(400, "Title, body and author are required");
  }
  if (!payload.recievers || payload.recievers.length == 0){
    throw new AppError(httpStatus.BAD_REQUEST, "Select at least one user")
  }

  let users = await   Promise.all(payload.recievers.map(async (reciever,idx) => {
    
    const user =  await prisma.user.findUnique({where:{id:reciever}})
    if (user?.fcmToken && user.fcmToken !== "" && !user.doNotDisturb) { 
      
      return user
    } else {
      console.log(`User with ID ${reciever} not found or does not have a valid FCM token.`);
      return null
    }
    }))
  



  let tokenizedUsers = users.filter( user => user != null)

  let tokens = tokenizedUsers.map((user:any) => user.fcmToken);
  
    const message = {
      notification: {
        title:payload.title,
        body:payload.body,
        author:payload.author
      },
      tokens,
    };

     const response = await admin
      .messaging()
      .sendEachForMulticast(message as any);
 
    const successfulTokens = response.responses
      .map((res: any, idx: number) => (res.success ? idx : null))
      .filter((_, idx: number) => _ !== null) as number[];
    
    const successfulUsers = successfulTokens.map((idx:number) => users[idx]);

   

    if (successfulUsers.length === 0) {
     
    }else{
      
    const notificationData = successfulUsers.map((user) => ({
      recieverId: user?.id as string,
      senderId: userId,
      title:payload.title,
      body:payload.body,
      author:payload.author
    }));



    await prisma.notification.createMany({
      data: notificationData,
    });
    }

   
    const failedTokens = response.responses
      .map((res: any, idx: number) => {
        if (!res.success) {
          return tokens[idx];
        }
        return null;  
      })
      // .filter((token) => token !== null);
    return {
      successCount: response.successCount,
      failureCount: response.failureCount,
      failedTokens,
    };
  
}

// Send notifications to all users with valid FCM tokens
const sendNotifications = async (req: any) => {
  try {
    const { title, body, author } = req.body;

    if (!title || !body || !author) {
      throw new ApiError(400, "Title, body and author are required");
    }

    const users = await prisma.user.findMany({
      where: {
        fcmToken: {
          not: null,
        },
      },
      select: {
        id: true,
        fcmToken: true,
      },
    });

    if (!users || users.length === 0) {
      return
    }

    const fcmTokens = users.map((user:any) => user.fcmToken);

    const message = {
      notification: {
        title,
        body,
        author
      },
      tokens: fcmTokens,
    };

    const response = await admin
      .messaging()
      .sendEachForMulticast(message as any);

    const successIndices = response.responses
      .map((res: any, idx: number) => (res.success ? idx : null))
      .filter((_, idx: number) => idx !== null) as number[];


    const successfulUsers = successIndices.map((idx) => users[idx]);

    const notificationData = successfulUsers.map((user) => ({
      recieverId: user.id,
      senderId: req.user.id,
      title,
      body,
      author
    }));

    await prisma.notification.createMany({
      data: notificationData,
    });

    const failedTokens = response.responses
      .map((res: any, idx: number) => (!res.success ? fcmTokens[idx] : null))
      .filter((token): token is string => token !== null);

    return {
      successCount: response.successCount,
      failureCount: response.failureCount,
      failedTokens,
    };
  } catch (error: any) {
    throw new ApiError(500, error.message || "Failed to send notifications");
  }
};

// Fetch notifications for the current user
// Fetch notifications for the current user
const getNotificationsFromDB = async (req: any) => {
  try {
    const userId = req.user.id;

    // Validate user ID
    if (!userId) {
      throw new ApiError(400, "User ID is required");
    }
    // const userNotification = await prisma.user.findUnique({ where: { id: userId }, include: { recievedNotification: true } })

    // Fetch notifications for the current user
    const notifications = await prisma.notification.findMany({
      where: {
        recieverId: userId,
      },
      include: {
        sender: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Check if notifications exist

    // Return formatted notifications
    return notifications.map((notification) => ({
      id: notification.id,
      title: notification.title,
      body: notification.body,
      isRead: notification.read,
      author:notification.author,
      createdAt: notification.createdAt,
      sender: {
        id: notification.sender.id,
        email: notification.sender.email,
        name: notification.sender.name,

      },
    }));
  } catch (error: any) {
    throw new ApiError(500, error.message || "Failed to fetch notifications");
  }
};

// Fetch a single notification and mark it as read
const getSingleNotificationFromDB = async (
  req: any,
  notificationId: string
) => {
  try {
    const userId = req.user.id;

    // Validate user and notification ID
    if (!userId) {
      throw new ApiError(400, "User ID is required");
    }

    if (!notificationId) {
      throw new ApiError(400, "Notification ID is required");
    }

    // Fetch the notification
    const notification = await prisma.notification.findFirst({
      where: {
        id: notificationId,
        recieverId: userId,
      },
      include: {
        sender: {
          select: {
            id: true,
            email: true,
            name: true
          },
        },
      },
    });

    // Mark the notification as read
    const updatedNotification = await prisma.notification.update({
      where: { id: notificationId },
      data: { read: true },
      include: {
        sender: {
          select: {
            id: true,
            email: true,
            name: true,
          
           
          },
        },
      },
    });

    // Return the updated notification
    return {
      id: updatedNotification.id,
      title: updatedNotification.title,
      body: updatedNotification.body,
      isRead: updatedNotification.read,
      createdAt: updatedNotification.createdAt,
      sender: {
        id: updatedNotification.sender.id,
        email: updatedNotification.sender.email,
        name: updatedNotification.sender.name,

      },
    };
  } catch (error: any) {
    throw new ApiError(500, error.message || "Failed to fetch notification");
  }
};

export const notificationServices = {
  sendSingleNotification,
  sendNotifications,
  getNotificationsFromDB,
  getSingleNotificationFromDB,
  sendNotificationToMultipleUsers
};
