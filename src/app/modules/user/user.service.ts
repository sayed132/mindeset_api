import { User, UserRole,} from '@prisma/client';
import bcrypt from 'bcrypt';
import prisma from '../../utils/prisma';
import AppError from '../../errors/AppError';
import httpStatus from 'http-status';
import config from '../../../config';
import { Secret } from 'jsonwebtoken';
import { generateToken } from '../../utils/generateToken';
import emailSender from '../../utils/emailSender';
import { AuthServices } from '../auth/auth.service';
import { notificationServices } from '../Notification/Notification.service';
import { IUserUpdate } from './user.interface';

interface UserWithOptionalPassword extends Omit<User, 'password'> {
  password?: string;
}



const registerUserIntoDB = async (payload: {
  email: string;
  name: string;
  password: string;
  fcmToken: string;
}) => {
  if (payload.email) {
    const existingUser = await prisma.user.findUnique({
      where: {
        email: payload.email,
      },
    });
    
    if(existingUser){
      throw new AppError(httpStatus.CONFLICT, ' email already exists.');
    }
  }

      // Generate 6-digit OTP
      // const otp = Math.floor(100000 + Math.random() * 900000).toString();
      // const expiry = new Date(Date.now() + OTP_EXPIRY_TIME);
  
      const hashedPassword =await bcrypt.hash(payload.password,parseInt(config.bcrypt_salt_rounds!))
      // Update OTP if phone number exists

      
      const createdUser = await prisma.user.create({
        data: {
          name:payload.name,
          email:payload.email,
          password:hashedPassword,
          fcmToken: payload.fcmToken,
        },
      });

      
        const accessToken = await generateToken(
          {
            id: createdUser.id,
            email: createdUser.email,
            role: createdUser.role,
          },
          config.jwt.access_secret as Secret,
          config.jwt.access_expires_in as string,
        );

        await prisma.user.update({where:{id:createdUser.id}, data:{accessToken}})

      return {
        name:createdUser.name,
        email:createdUser.email,
        fcmToken:createdUser.fcmToken,
        role:createdUser.role,
        accessToken
      }

      // // Send OTP via Twilio SMS
      // const message = await client.messages.create({
      //   body: `Your OTP code is ${otp}. It will expire in 2 minutes.`,
      //   from: config.twilio.twilioPhoneNumber,
      //   to: phone,
      // });



      // Return formatted response
  //     return {
  //       body: message.body,
  //       from: message.from,
  //       to: message.to,
  //       dateCreated: message.dateCreated,
  //     };
  //   }
  // }

  // const result = await prisma.$transaction(async (transactionClient: any) => {
  //   const user = await transactionClient.user.create({
  //     data: {
  //       ...payload,
  //       status: UserStatus.INACTIVE,
  //     },
  //   });
  //   if (!user) {
  //     throw new AppError(httpStatus.BAD_REQUEST, 'User not created!');
  //   }
  //   return user;
  // });

  // if (!result) {
  //   throw new AppError(httpStatus.BAD_REQUEST, 'User not created!');
  // }
  // const client = new Twilio(config.twilio.accountSid, config.twilio.authToken);
  // const OTP_EXPIRY_TIME = 2 * 60 * 1000; // 2 minutes in milliseconds
  // const { phone } = payload;

  // // Validate phone number
  // if (!phone || !phone.startsWith('+')) {
  //   throw new AppError(
  //     httpStatus.BAD_REQUEST,
  //     'Phone number must be in E.164 format with country code.',
  //   );
  // }
  // // Generate 6-digit OTP
  // const otp = Math.floor(100000 + Math.random() * 900000).toString();
  // const expiry = new Date(Date.now() + OTP_EXPIRY_TIME);

  // // Check if phone number already exists in the OTP table
  // const existingOtp = await prisma.user.findUnique({
  //   where: { id: result.id },
  // });

  // if (existingOtp) {
  //   // Update OTP if phone number exists
  //   await prisma.user.update({
  //     where: { email: payload.email },
  //     data: {
  //       otp: Number(otp),
  //       otpExpiry: expiry,
  //       fcmToken: payload.fcmToken,
  //     },
  //   });
  // }

  // // Send OTP via Twilio SMS
  // const message = await client.messages.create({
  //   body: `Your OTP code is ${otp}. It will expire in 2 minutes.`,
  //   from: config.twilio.twilioPhoneNumber,
  //   to: phone,
  // });

  // Return formatted response
  // return {
  //   body: message.body,
  //   from: message.from,
  //   to: message.to,
  //   dateCreated: message.dateCreated,
  // };
};

const toggoleDoNoDisturb = async(userId:string)=>{
  const user = await prisma.user.findUnique({where:{id:userId}})

  if (!user){
    throw new AppError(httpStatus.NOT_FOUND, "user not found")
  }

 const newUser =  await prisma.user.update({where:{id:userId}, data:{doNotDisturb:!user.doNotDisturb},select:{doNotDisturb:true}})
  return newUser
}


const getAllUsersFromDB = async () => {
  const result = await prisma.user.findMany({
    where: {
      role: UserRole.USER,
    },
    select: {
      id: true,
      name: true,
      email: true,
    },
  });

  if (result.length === 0) {
    return { message: 'No users found!' };
  }

  return result;
};

// const getMyProfileFromDB = async (id: string) => {
//   const Profile = await prisma.user.findUnique({
//     where: {
//       id: id
//     },include:{streak:true},
//   });
//   if (!Profile) {
//     throw new AppError(httpStatus.NOT_FOUND, 'User not found!');
//   }

//   return Profile;
// };

// const getUserDetailsFromDB = async (id: string) => {
//   const user = await prisma.user.findUnique({
//     where: { id },
//     select: {
//       id: true,
//       name: true,
//       email: true,
//       role: true,
    
//       createdAt: true,
//       updatedAt: true,
//     }
//     });
//   if (!user) {
//     throw new AppError(httpStatus.NOT_FOUND, 'User not found!');
//   }
//   return user;
// };

const updateMyProfileIntoDB = async (userId: string, payload:IUserUpdate ) => {
  const user = await prisma.user.findUniqueOrThrow({
    where: {
      id: userId,
    },
  });
  if (!user) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      'User not found ',
    );
  }
  if (payload.email){
    payload.email = user.email
  }

  if(payload.dob){
    payload.dob = new Date(payload.dob).toISOString()
  }
  // update user data
  const updatedUser = await  prisma.user.update({where:{id:userId}, data:payload, select:{name:true, email:true,dob:true,location:true,gender:true,avatar:true, id:true}})
  
  
  // await prisma.$transaction(
  //   async (transactionClient: any) => {
  //     // Update user data
  //     const user = await transactionClient.user.update({
  //       where: {
  //         id: userId,
        
  //       },
  //       data: payload
  //     });

  //     if (!user) {
  //       throw new AppError(httpStatus.BAD_REQUEST, 'User not updated!');
  //     }
     
  //   },
  // );
 

  return updatedUser;
};

// const updateUserRoleStatusIntoDB = async (userId: string, payload: any) => {
//   const user = await prisma.user.findUnique({
//     where: {
//       id: userId,
//     },
//   });

//   if (!user) {
//     throw new AppError(
//       httpStatus.BAD_REQUEST,
//       'User not found or not Rutgers student!',
//     );
//   }
  
//   }

// const changePassword = async (user: any, payload: any) => {
//   const userData = await prisma.user.findUnique({
//     where: {
//       email: user.email,
//     },
//   });

//   if (!userData) {
//     throw new AppError(httpStatus.NOT_FOUND, 'User not found!');
//   }

//   const isCorrectPassword: boolean = await bcrypt.compare(
//     payload.oldPassword,
//     userData.password ? userData.password : '',
//   );

//   if (!isCorrectPassword) {
//     throw new Error('Password incorrect!');
//   }

//   const hashedPassword: string = await bcrypt.hash(payload.newPassword, 12);

//   await prisma.user.update({
//     where: {
//       id: userData.id,
//     },
//     data: {
//       password: hashedPassword,
//     },
//   });

//   return {
//     message: 'Password changed successfully!',
//   };
// };

const forgotPassword = async (payload: { email: string }) => {
  const userData = await prisma.user.findUnique({
    where: {
      email: payload.email,
    },
  });

  if (!userData) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found!');
  }

  // const client = new Twilio(config.twilio.accountSid, config.twilio.authToken);
  const OTP_EXPIRY_TIME = 5 * 60 * 1000; // 5 minutes in milliseconds
  // const { phone } = payload;

  // Validate phone number
  // if (!phone || !phone.startsWith('+')) {
  //   throw new AppError(
  //     httpStatus.BAD_REQUEST,
  //     'Phone number must be in E.164 format with country code.',
  //   );
  // }
  // Generate 6-digit OTP
  const otp = Math.floor(10000 + Math.random() * 90000).toString();
  const expiry = new Date(Date.now() + OTP_EXPIRY_TIME);

  // // Check if phone number already exists in the OTP table
  // const existingOtp = await prisma.user.findUnique({
  //   where: { id: userData.id },
  // });
  await prisma.user.update({where:{id:userData.id}, data:{otp,otpExpiry:expiry}})

  // if (existingOtp) {
  //   // Update OTP if phone number exists
  //   await prisma.user.update({
  //     where: { phone },
  //     data: {
  //       otp: Number(otp),
  //       otpExpiry: expiry,
  //     },
  //   });
  // }

  // Send OTP via Twilio SMS
  // const message = await client.messages.create({
  //   body: `Your OTP code is ${otp}. It will expire in 2 minutes.`,
  //   from: config.twilio.twilioPhoneNumber,
  //   to: phone,
  // });
    try{
      await emailSender("Reset password verification",userData.email, `<p>Your OTP code is <strong>${otp}</strong>. It will expire in 5 minutes.</p>`)
    }catch(err){
      console.log("Error sending email", err)
    }
    

    return {message:"Verification otp sent to your authorized email"}

  // Return formatted response
  // return {
  //   body: message.body,
  //   from: message.from,
  //   to: message.to,
  //   dateCreated: message.dateCreated,
  // };
};

// verify otp
const verifyOtpInDB = async (payload: { email: string; otp: string }) => {

  const userData = await prisma.user.findUnique({
    where: { email: payload.email },
  });

  if (!userData) {
    throw new AppError(httpStatus.CONFLICT, 'user not found!');
  }
  const currentTime = new Date(Date.now());

  if (userData?.otp !== payload.otp) {

    throw new AppError(httpStatus.BAD_REQUEST, 'Your OTP is incorrect!');

  } else if (!userData.otpExpiry || userData.otpExpiry <= currentTime) {
    throw new AppError(
      httpStatus.CONFLICT,
      'Your OTP is expired',
    );
  }

  const updateStatus = await prisma.user.update({
    where: { id:userData.id },
    data: {
      otp: null,
      otpExpiry: null,
    },
  });
  if (!updateStatus) {
    throw new AppError(httpStatus.BAD_REQUEST, 'User not updated!');
  }

  // const accessToken = await generateToken(
  //   {
  //     id: userData.id,
  //     email: userData.email,
  //     role: userData.role,
  //   },
  //   config.jwt.access_secret as Secret,
  //   config.jwt.access_expires_in as string,
  // );
  return {
    message: 'OTP verified successfully!',
  };
};

const getStreak = async (userId:string)=>{
  const user = await prisma.user.findUnique({where:{id:userId}})

  if (!user){
    throw new AppError(httpStatus.NOT_FOUND, 'User not found')
  }
  const journalCount = await prisma.journal.count({where:{userId}})
  return {
    totalStreak:journalCount
  }
}

const verifyOtpForgotPasswordInDB = async (payload: {
  email: string;
  otp: string;
}) => {
  const userData = await prisma.user.findUnique({
    where: { email: payload.email },
  });

  if (!userData) {
    throw new AppError(httpStatus.CONFLICT, 'User not found!');
  }
  const currentTime = new Date(Date.now());

  if (!userData.otp || userData.otp !== payload.otp) {
    throw new AppError(httpStatus.CONFLICT, 'Your OTP is incorrect!');
  } else if (!userData.otpExpiry || userData.otpExpiry <= currentTime) {
    throw new AppError(
      httpStatus.CONFLICT,
      'Your OTP is expired, please try with new otp',
    );
  }

 
    await prisma.user.update({
      where: { email: payload.email },
      data: {
        otp: null,
        otpExpiry: null,
     
      },
    });
  

  return { message: 'OTP verified successfully!' };
};

// const socialLoginIntoDB = async (payload: {
//   fullName?: string;
//   appleId?: string;
//   email: string;
//   fcmToken: string;
// }) => {
//   const user = await prisma.user.findFirst({
//     where: {
//       OR: [{ email: payload.email }, { appleId: payload.appleId }],
//     },
//   });

//   // const generateRandomPhoneNumber = () => {
//   //   return '1' + Math.floor(1000000000 + Math.random() * 9000000000).toString();
//   // };

//   // const phone = generateRandomPhoneNumber();

//   // if (!user) {
//   //   const newUser = await prisma.user.create({
//   //     data: {
//   //       ...payload,
//   //       phone: phone,
//   //       isVerified: true,
//   //     },
//   //   });
//   //   if (!newUser) {
//   //     throw new AppError(httpStatus.BAD_REQUEST, 'User not created!');
//   //   }
//   //   const accessToken = await generateToken(
//   //     {
//   //       id: newUser.id,
//   //       email: newUser.email,
//   //       role: newUser.role,
//   //     },
//   //     config.jwt.access_secret as Secret,
//   //     config.jwt.access_expires_in as string,
//   //   );
//   //   return { newUser, accessToken };
//   // }

//   if (user) {
//     if(!user?.isVerified){
//       throw new AppError(httpStatus.CONFLICT, 'User is not verified!');
//     }
//     if(!user.isRutgersStudent){
//       throw new AppError(httpStatus.CONFLICT, 'User is not verified!!');
//     }
//     const fcmUpdate = await prisma.user.update({
//       where: { email: payload.email },
//       data: {
//         fcmToken: payload.fcmToken,
//       },
//     });
//     const accessToken = await generateToken(
//       {
//         id: user.id,
//         email: user.email,
//         role: user.role,
//       },
//       config.jwt.access_secret as Secret,
//       config.jwt.access_expires_in as string,
//     );
//     return { user, accessToken };
//   } else {
//     throw new AppError(httpStatus.NOT_FOUND, 'No account found, please sign up or try again!');
//   }
// };


// const socialRegisterIntoDB = async (payload: {
//   fullName?: string;
//   appleId?: string;
//   email: string;
//   fcmToken: string;
// }) => {
//   const user = await prisma.user.findFirst({
//     where: {
//       OR: [
//         { email: payload.email },
//         { appleId: payload.appleId },
//       ],
//     },
//   });

//   const generateRandomPhoneNumber = () => {
//     return '1' + Math.floor(1000000000 + Math.random() * 9000000000).toString();
//   };

//   const phone = generateRandomPhoneNumber();

//   if (!user) {
//     const newUser = await prisma.user.create({
//       data: {
//         ...payload,
//         phone: phone,
//         isVerified: true,
//         status: UserStatus.ACTIVE,
  
//       },
//     });
//     if (!newUser) {
//       throw new AppError(httpStatus.BAD_REQUEST, 'User not created!');
//     }
//     const accessToken = await generateToken(
//       {
//         id: newUser.id,
//         email: newUser.email,
//         role: newUser.role,
//       },
//       config.jwt.access_secret as Secret,
//       config.jwt.access_expires_in as string,
//     );

//     return { newUser, accessToken };
//   }

//   if (user) {
//     throw new AppError(httpStatus.CONFLICT, 'User already exists, please try with another account!');
//   }


// }



const updatePasswordIntoDb = async (payload: any) => {
  const { email,password, confirmPassword} = payload

  if (confirmPassword){
    if (password !== confirmPassword){
      throw new AppError(httpStatus.BAD_REQUEST, "Password does not matched")
    }
  }

  const userData = await prisma.user.findUnique({
    where: { email: email },
  });

  if (!userData) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found!');
  }
  const hashedPassword: string = await bcrypt.hash(password, parseInt(config.bcrypt_salt_rounds!));
  const result = await prisma.user.update({
    where: {
      email: userData.email,
    },
    data: {
      password: hashedPassword,
    },
  });
  if (!result) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Password not updated!');
  }
  return {
    message: 'Password updated successfully!',
  };
};

const resendOtpIntoDB = async (payload: any) => {
   const { email } = payload;

    if (!email) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Email is required',
    );
  }
  const userData = await prisma.user.findUnique({
    where: { email },
  });

  if (!userData) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found!');
  }
  // const client = new Twilio(config.twilio.accountSid, config.twilio.authToken);
  const OTP_EXPIRY_TIME = 5 * 60 * 1000; // 5 minutes in milliseconds
 

  // Validate phone number
 
  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 9000).toString();
  const expiry = new Date(Date.now() + OTP_EXPIRY_TIME);

  // Check if phone number already exists in the OTP table
  // const existingOtp = await prisma.user.findUnique({
  //   where: { id: userData.id },
  // });


    // Update OTP if phone number exists
    await prisma.user.update({
      where: { email },
      data: {
        otp:otp,
        otpExpiry: expiry,
      },
    });
  

  // Send OTP via Twilio SMS
  // const message = await client.messages.create({
  //   body: `Your OTP code is ${otp}. It will expire in 2 minutes.`,
  //   from: config.twilio.twilioPhoneNumber,
  //   to: phone,
  // });

  // Return formatted response
  return {
   message:"Otp sent again"
  };
};

const updateProfileImageIntoDB = async (
  userId: string,
  profileImageUrl: string,
) => {
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      avatar: profileImageUrl,
    },select:{
      id:true,
      name:true,
      email:true,
      avatar:true,
    }
  });

  if (!updatedUser) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Profile image not updated!');
  }

  return updatedUser;
};

// const getEarningsFromDB = async (userId: string) => {
//   const user = await prisma.user.findUnique({
//     where: { id: userId },
//     select: {
//       id: true,
//       stripeCustomerId: true,
//     },
//   });

//   if (!user) {
//     throw new AppError(httpStatus.NOT_FOUND, 'User not found!');
//   }

//   // if (user.stripeCustomerId) {
//   //   const balance = await stripe.balance.retrieve({
//   //     stripeAccount: user.stripeCustomerId,
//   //   });

//   //   return balance;
//   // }
//   if (user.stripeCustomerId) {
//     const payments = await prisma.payment.findMany({
//       where: {
//         stripeAccountIdReceiver: user.stripeCustomerId,
//       },
//       select: {
//         paymentAmount: true,
//       },
//     });

//     const totalEarnings = payments.reduce(
//       (total, payment) => total + payment.paymentAmount,
//       0,
//     );

//     return { totalEarnings, payments };
//   }

//   // return user;
// };

// const withdrawBalanceFromDB = async (
//   userId: string,
//   data: {
//     amount: number;
//   },
// ) => {
//   const user = await prisma.user.findUnique({
//     where: { id: userId },
//     select: {
//       id: true,
//       stripeCustomerId: true, // Use the connected account ID
//     },
//   });

//   if (!user) {
//     throw new AppError(httpStatus.NOT_FOUND, 'User not found!');
//   }

//   if (!user.stripeCustomerId) {
//     throw new AppError(
//       httpStatus.BAD_REQUEST,
//       'User does not have a connected Stripe account!',
//     );
//   }

//   // Validate the amount (Stripe requires the smallest currency unit, e.g., cents for USD)
//   const validAmount = Number(data.amount);
//   if (isNaN(validAmount)) {
//     throw new AppError(httpStatus.BAD_REQUEST, 'Invalid amount provided!');
//   }

//   //  console.log(transportPriceInKobo);
//   //  if (transportPriceInKobo < 25000) {
//   //    throw new AppError(
//   //      httpStatus.BAD_REQUEST,
//   //      'Minimum amount to be paid is 250',
//   //    );
//   //  }

//   // Create a payout to the connected account's bank account

//   const payout = await stripe.payouts.create(
//     {
//       amount: data.amount * 100, // Amount in cents (e.g., $10.00 = 1000)
//       currency: 'usd', // Ensure currency matches the connected account's balance
//       method: 'instant', // Optional: 'instant' for faster payouts, incurs fees
//     },
//     {
//       stripeAccount: user.stripeCustomerId, // Connected account ID
//     },
//   );
//   if (!payout) {
//     throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, 'Payout failed!');
//   }

//   return { message: 'Amount transferred successfully!', payout };
// };

// const uploadIdProofIntoDB = async (
//   userId: string,
//   frontIdCardUrl: string,
//   backIdCardUrl: string,
// ) => {
//   const updatedUser = await prisma.user.update({
//     where: { id: userId },
//     data: {
//       frontIdCard: frontIdCardUrl,
//       backIdCard: backIdCardUrl,
//       isVerified: true,
//       status:UserStatus.ACTIVE
//     },
//   });

//   if (!updatedUser) {
//     throw new AppError(httpStatus.BAD_REQUEST, 'ID Proof not updated!');
//   }

//   return updatedUser;
// };

const createPasswordIntoDb = async (userId: string, payload: any) => {
  const userData = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!userData) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found!');
  }
  const hashedPassword: string = await bcrypt.hash(payload.password, config.bcrypt_salt_rounds!);
  await prisma.user.update({
    where: { id: userId },
    data: {
      password: hashedPassword,
    },
  });
  return {
    message: 'Password updated successfully!',
  };
};

// const studentIdInfoIntoDB = async (userId: string, studentData: any) => {
//   const { data, studentIdImage } = studentData;
//   const user = await prisma.user.findUnique({
//     where: {
//       id: userId,
//       isRutgersStudent: RutgersStudent.PENDING,
//     },
//   });

//   if (!user) {
//     throw new AppError(httpStatus.NOT_FOUND, 'User not found!');
//   }

//   if (data.rutgersStudentEmail) {
//     const existingUser = await prisma.user.findUnique({
//       where: {
//         id: userId,
//         rutgersStudentEmail: data.rutgersStudentEmail,
//       },
//     });
//     if (existingUser) {
//       throw new AppError(httpStatus.CONFLICT, 'User already exists!');
//     }
//   }

//   const updatedUser = await prisma.user.update({
//     where: { id: userId },
//     data: {
//       ...data,
//       rutgersFrontID: studentIdImage,
//     },
//   });

//   if (!updatedUser) {
//     throw new AppError(httpStatus.BAD_REQUEST, 'Student ID info not updated!');
//   }

//   return updatedUser;
// };

// const updateStudentIdStatusIntoDB = async (
//   userId: string,
//   studentId: string,
//   data: any,
// ) => {
//   const user = await prisma.user.findUnique({
//     where: { id: userId },
//   });

//   if (!user) {
//     throw new AppError(httpStatus.NOT_FOUND, 'User not found!');
//   }

//   const updatedUser = await prisma.user.update({
//     where: { id: studentId },
//     data: {
//       isRutgersStudent: data.isRutgersStudent,
//       driverStatus: data.driverStatus,
//       role: data.role,
//     },
//   });

//   if (!updatedUser) {
//     throw new AppError(
//       httpStatus.BAD_REQUEST,
//       'Student ID status not updated!',
//     );
//   }

//   if (data.isRutgersStudent && updatedUser.isNotificationOn === true) {
//     if (updatedUser.isRutgersStudent === RutgersStudent.APPROVED) {
//       //Send notification to the user
//       const user = await prisma.user.findUnique({
//         where: { id: studentId },
//         select: { fcmToken: true, id: true },
//       });

//       const notificationTitle = 'Your student info has been verified!';
//       const notificationBody = '';

//       if (user && user.fcmToken) {
//         await notificationService.sendNotification(
//           user.fcmToken,
//           notificationTitle,
//           notificationBody,
//           user.id,
//         );
//       }
//     } else {
//       //Send notification to the user
//       const user = await prisma.user.findUnique({
//         where: { id: studentId },
//         select: { fcmToken: true },
//       });

//       const notificationTitle = 'Your student info has been rejected!';
//       const notificationBody = '';

//       if (user && user.fcmToken) {
//         await notificationService.sendNotification(
//           user.fcmToken,
//           notificationTitle,
//           notificationBody,
//           studentId,
//         );
//       }
  
//     }
//   }

//   if (data.driverStatus && updatedUser.isNotificationOn === true) {
//     if (updatedUser.driverStatus === UserStatus.ACTIVE) {
//       //Send notification to the user
//       const user = await prisma.user.findUnique({
//         where: { id: studentId },
//         select: { fcmToken: true },
//       });

//       const notificationTitle = 'Your driver account has been verified!';
//       const notificationBody = '';

//       if (user && user.fcmToken) {
//         await notificationService.sendNotification(
//           user.fcmToken,
//           notificationTitle,
//           notificationBody,
//           studentId,
//         );
//       }
//     } else {
//       //Send notification to the user
//       const user = await prisma.user.findUnique({
//         where: { id: studentId },
//         select: { fcmToken: true },
//       });

//       const notificationTitle = 'Your driver account has been rejected!';
//       const notificationBody = '';

//       if (user && user.fcmToken) {
//         await notificationService.sendNotification(
//           user.fcmToken,
//           notificationTitle,
//           notificationBody,
//           studentId,
//         );
//       }
//     }
//   }
  

//   if(updatedUser.isRutgersStudent===RutgersStudent.DECLINED){
//     await prisma.user.delete({where:{ id: studentId}})
//   }if(updatedUser.driverStatus === DriverStatus.BLOCKED){
//     await prisma.user.update({
//       where: { id: studentId },
//       data: { driverStatus: DriverStatus.INACTIVE }
//     });
//     await prisma.driver.delete({where:{userId:studentId}})
    
//   }
//   return updatedUser;
// };

// const getAllUsersByAdminFromDB = async (userId: string) => {
//   const result = await prisma.user.findMany({
//     where: {
//       role: {
//         in: [UserRoleEnum.PASSENGER, UserRoleEnum.DRIVER],
//       },
//     //  status: UserStatus.ACTIVE,
//     },
//   });

//   const earnings = await prisma.payment.findMany({
//     where: {
//       status: PaymentStatus.COMPLETED,
//     },
//     select: {
//       paymentAmount: true,
//     },
//   });

//   const totalEarnings = earnings.reduce(
//     (total, payment) => total + payment.paymentAmount,
//     0,
//   );

//   const deductedAmount = totalEarnings * 0.17;
//   const remainingAmount = totalEarnings - deductedAmount;

//   const usersWithLowRating = await prisma.user.findMany({
//     where: {
//       reviews: {
//         some: {
//           rating: 1,
//         },
//       },
//     },
//     select: {
//       id: true,
//       fullName: true,
//       email: true,
//       role: true,
//       phone: true,
//       image: true,
//     },
//   });

//   return {
//     resultLength: result.length,
//     totalEarnings: remainingAmount,
//     low_ratings: usersWithLowRating,
//   };
// };

// const updateStudentStatusIntoDB = async (userId: string, studentId: string) => {
//   const user = await prisma.user.findUnique({
//     where: { id: studentId },
//   });

//   if (!user) {
//     throw new AppError(httpStatus.NOT_FOUND, 'User not found!');
//   }

//   const updatedUser = await prisma.user.update({
//     where: { id: studentId },
//     data: {
//       status: UserStatus.INACTIVE,
//     },
//   });

//   if (!updatedUser) {
//     throw new AppError(
//       httpStatus.BAD_REQUEST,
//       'Student ID status not updated!',
//     );
//   }

//   return updatedUser;
// };

export const UserServices = {
  registerUserIntoDB,
  getAllUsersFromDB,
  // getMyProfileFromDB,
  // getUserDetailsFromDB,
  updateMyProfileIntoDB,
  // updateUserRoleStatusIntoDB,
  // changePassword,
  forgotPassword,
  verifyOtpInDB,
  getStreak,
  verifyOtpForgotPasswordInDB,
  // socialLoginIntoDB,
  // socialRegisterIntoDB,
  updatePasswordIntoDb,
  resendOtpIntoDB,
  // updateProfileImageIntoDB,
  // getEarningsFromDB,
  // withdrawBalanceFromDB,
  // uploadIdProofIntoDB,
  createPasswordIntoDb,
  toggoleDoNoDisturb,
  updateProfileImageIntoDB
  // studentIdInfoIntoDB,
  // updateStudentIdStatusIntoDB,
  // getAllUsersByAdminFromDB,
  // updateStudentStatusIntoDB,
};
