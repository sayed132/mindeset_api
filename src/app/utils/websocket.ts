import { Server } from 'http';
import { WebSocket, WebSocketServer } from 'ws';
import { verifyToken } from './verifyToken';
import config from '../../config';
import { Secret } from 'jsonwebtoken';
import prisma from './prisma';

interface ExtendedWebSocket extends WebSocket {
  userId?: string;
}

const onlineUsers = new Set<string>();
const userSockets = new Map<string, ExtendedWebSocket>();

export function setupWebSocket(server: Server) {
  const wss = new WebSocketServer({ server });

  wss.on('connection', (ws: ExtendedWebSocket) => {
    // console.log('A user connected');

    ws.on('message', async (data: string) => {
      try {
        const parsedData = JSON.parse(data);

        switch (parsedData.event) {
          case 'authenticate': {
            const token = parsedData.token;

            if (!token) {
              // console.log('No token provided');
              ws.close();
              return;
            }

            const user = verifyToken(token, config.jwt.access_secret as Secret);

            if (!user) {
              // console.log('Invalid token');
              ws.close();
              return;
            }

            const { id } = user;

            ws.userId = id;
            onlineUsers.add(id);
            userSockets.set(id, ws);

            broadcastToAll(wss, {
              event: 'userStatus',
              data: { userId: id, isOnline: true },
            });
            break;
          }

          case 'joinRoom': {
            const { roomId } = parsedData;

            if (!ws.userId || !roomId) {
              // console.log('Invalid join room payload');
              return;
            }

            const room = await prisma.room.findUnique({
              where: { id: roomId },
            });

            const userInRoom = await prisma.rideRoomSchedule.findFirst({
              where: {
                rideRoomId: roomId,
                passengers: {
                  has: {
                    passengerId: ws.userId,
                    status: 'CONFIRMED',
                  },
                },
              },
            });

            if (userInRoom) {
              ws.send(
                JSON.stringify({
                  event: 'alreadyInRoom',
                  data: {
                    roomId: roomId,
                    message: 'You are already in this room',
                  },
                }),
              );
              return;
            }

            if (!room) {
              ws.send(
                JSON.stringify({ event: 'error', message: 'Room not found' }),
              );
              return;
            }

            try {
              // Add user to the room only if they are not already in it
              await prisma.roomUser.create({
                data: { userId: ws.userId, roomId: roomId },
              });

              const user = await prisma.user.findUnique({
                where: { id: ws.userId },
                select: { fullName: true, image: true },
              });

              ws.send(
                JSON.stringify({
                  event: 'joinedRoom',
                  data: {
                    roomId: roomId,
                    message: `${user?.fullName} joined the ride`,
                    image: user?.image,
                  },
                }),
              );

              // console.log(`User ${ws.userId} joined room ${roomId}`);
            } catch (error) {
              if ((error as any).code === 'P2002') {
                // console.log(`User ${ws.userId} is already in room ${roomId}`);
                ws.send(
                  JSON.stringify({
                    event: 'alreadyInRoom',
                    data: {
                      roomId: roomId,
                      message: 'You are already in this room',
                    },
                  }),
                );
              } else {
                console.error('Error joining room:', error);
                ws.send(
                  JSON.stringify({
                    event: 'error',
                    message: 'Failed to join the room',
                  }),
                );
              }
            }
            break;
          }

          case 'leaveRoom': {
            const { roomId } = parsedData;

            if (!ws.userId || !roomId) {
              // console.log('Invalid leave room payload');
              return;
            }

            const room = await prisma.room.findUnique({
              where: { id: roomId },
            });

            if (!room) {
              ws.send(
                JSON.stringify({ event: 'error', message: 'Room not found' }),
              );
              return;
            }

            // Remove user from the room
            await prisma.roomUser.deleteMany({
              where: { userId: ws.userId, roomId: roomId },
            });

            ws.send(
              JSON.stringify({
                event: 'leftRoom',
                data: { roomId: roomId, message: 'Successfully left the room' },
              }),
            );

            // console.log(`User ${ws.userId} left room ${roomId}`);
            break;
          }

          case 'message': {
            const { roomId, message, images } = parsedData;

            if (!ws.userId || !roomId || !message) {
              return;
            }

            const room = await prisma.room.findUnique({
              where: { id: roomId },
            });

            if (!room) {
              return;
            }

            // Create the chat message
            const chat = await prisma.chat.create({
              data: {
                senderId: ws.userId,
                roomId: roomId,
                message,
                images: { set: images || [] },
              },
            });

            // Fetch all participants in the room
            const participants = await prisma.roomUser.findMany({
              where: { roomId: roomId },
              select: { userId: true },
            });

            // Create ChatReadStatus entries for each participant
            await Promise.all(
              participants.map(async participant => {
                await prisma.chatReadStatus.create({
                  data: {
                    chatId: chat.id,
                    userId: participant.userId,
                    isRead: participant.userId === ws.userId, // Mark as read for the sender
                  },
                });
              }),
            );

            // Broadcast the message to all participants
            // participants.forEach(participant => {
            //   const participantSocket = userSockets.get(participant.userId);
            //   if (participantSocket) {
            //     participantSocket.send(
            //       JSON.stringify({ event: 'message', data: chat }),
            //     );
            //   }
            // });

            ws.send(JSON.stringify({ event: 'message', data: chat }));
            break;
          }

          case 'fetchChats': {
            const { roomId } = parsedData;
            if (!ws.userId) {
              return;
            }

            const room = await prisma.room.findUnique({
              where: { id: roomId },
            });

            if (!room) {
              ws.send(JSON.stringify({ event: 'noRoomFound' }));
              return;
            }

            // Fetch chats without including readStatus
            const chats = await prisma.chat.findMany({
              where: { roomId: roomId },
              orderBy: { createdAt: 'asc' },
              include: {
                sender: {
                  select: {
                    id: true,
                    fullName: true,
                    image: true,
                  },
                },
              },
            });

            // Send the chats to the client
            ws.send(
              JSON.stringify({
                event: 'fetchChats',
                data: chats,
              }),
            );
            break;
          }

          case 'unReadMessages': {
            const { roomId } = parsedData;
            if (!ws.userId || !roomId) {
              return;
            }

            const room = await prisma.room.findUnique({
              where: { id: roomId },
            });

            if (!room) {
              ws.send(JSON.stringify({ event: 'noUnreadMessages', data: [] }));
              return;
            }

            const unReadMessages = await prisma.chatReadStatus.findMany({
              where: {
                userId: ws.userId,
                isRead: false,
                chat: { roomId: roomId },
              },
              include: { chat: true },
            });

            const unReadCount = unReadMessages.length;

            ws.send(
              JSON.stringify({
                event: 'unReadMessages',
                data: { messages: unReadMessages, count: unReadCount },
              }),
            );
            break;
          }

          case 'messageList': {
            try {
              const rooms = await prisma.roomUser.findMany({
                where: { userId: ws.userId },
                include: {
                  room: {
                    include: {
                      chat: {
                        orderBy: { createdAt: 'desc' },
                        take: 1,
                      },
                    },
                  },
                },
              });

              const userWithLastMessages = await Promise.all(
                rooms.map(async roomUser => {
                  const room = roomUser.room;
                  const lastMessage = room.chat[0] || null;

                  // Count unread messages for the current user in this room
                  const unReadMessages = await prisma.chatReadStatus.count({
                    where: {
                      userId: ws.userId,
                      isRead: false,
                      chat: { roomId: room.id },
                    },
                  });

                  return {
                    roomId: room.id,
                    lastMessage,
                    unReadCount: unReadMessages,
                  };
                }),
              );

              const sortedUserWithLastMessages = userWithLastMessages.sort(
                (a, b) => {
                  if (!a.lastMessage || !b.lastMessage) return 0;
                  return (
                    new Date(b.lastMessage.createdAt).getTime() -
                    new Date(a.lastMessage.createdAt).getTime()
                  );
                },
              );

              ws.send(
                JSON.stringify({
                  event: 'messageList',
                  data: sortedUserWithLastMessages,
                }),
              );
            } catch (error) {
              console.error(
                'Error fetching user list with last messages:',
                error,
              );
              ws.send(
                JSON.stringify({
                  event: 'error',
                  message: 'Failed to fetch users with last messages',
                }),
              );
            }
            break;
          }

          default:
          // console.log('Unknown event type:', parsedData.event);
        }
      } catch (error) {
        console.error('Error handling WebSocket message:', error);
      }
    });

    ws.on('close', () => {
      if (ws.userId) {
        onlineUsers.delete(ws.userId);
        userSockets.delete(ws.userId);

        broadcastToAll(wss, {
          event: 'userStatus',
          data: { userId: ws.userId, isOnline: false },
        });
      }
      // console.log('User disconnected');
    });
  });

  return wss;
}

function broadcastToAll(wss: WebSocketServer, message: object) {
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
    }
  });
}
