import jwt from 'jsonwebtoken';
import { User, Message } from '../models/index.js';

// In-memory mapping of active userId to socketId
const onlineUsers = new Map();

export const initSockets = (io) => {
  // Authentication middleware for WebSocket connections
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.headers?.token;
      
      if (!token) {
        return next(new Error('Authentication failed: Missing JWT token'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'yoursupersecurejwtsecretkeyforchat123');
      const user = await User.findByPk(decoded.id, {
        attributes: ['id', 'name', 'email', 'profilePic']
      });

      if (!user) {
        return next(new Error('Authentication failed: User no longer exists'));
      }

      socket.user = user;
      next();
    } catch (err) {
      return next(new Error('Authentication failed: Token is invalid or expired'));
    }
  });

  io.on('connection', async (socket) => {
    const userId = socket.user.id;
    console.log(`User connected: ${socket.user.name} (ID: ${userId}, Socket: ${socket.id})`);

    // Map user id to current socket id
    onlineUsers.set(userId, socket.id);

    // Update database status to online
    try {
      await User.update({ isOnline: true }, { where: { id: userId } });
      
      // Broadcast online status to all other users
      socket.broadcast.emit('user_status_changed', {
        userId,
        isOnline: true
      });
    } catch (err) {
      console.error('Error updating online status:', err);
    }

    // Send active online users list to the newly connected user
    socket.emit('get_online_users', Array.from(onlineUsers.keys()));

    // 1. Join Chat Room
    socket.on('join_chat', (conversationId) => {
      const room = conversationId.toString();
      socket.join(room);
      console.log(`Socket ${socket.id} joined room: ${room}`);
    });

    // 2. Real-time Messaging
    socket.on('send_message', async (data) => {
      try {
        const { conversationId, receiverId, message } = data;
        const senderId = socket.user.id;

        if (!conversationId || !receiverId || !message) {
          return socket.emit('error_message', { message: 'Required fields missing for sending message' });
        }

        // Save message to MySQL database
        const newMessage = await Message.create({
          senderId,
          receiverId,
          conversationId,
          message,
          seen: false
        });

        // Hydrate message with sender and receiver details
        const hydratedMessage = await Message.findByPk(newMessage.id, {
          include: [
            { model: User, as: 'sender', attributes: ['id', 'name', 'profilePic', 'isOnline'] },
            { model: User, as: 'receiver', attributes: ['id', 'name', 'profilePic', 'isOnline'] }
          ]
        });

        // 1. Deliver message exactly once to the sender's socket
        socket.emit('receive_message', hydratedMessage);

        // 2. Deliver message exactly once to the receiver's socket (if online)
        const receiverSocketId = onlineUsers.get(parseInt(receiverId));
        if (receiverSocketId) {
          io.to(receiverSocketId).emit('receive_message', hydratedMessage);
        }
      } catch (err) {
        console.error('Error handling socket message:', err);
        socket.emit('error_message', { message: 'Failed to process sent message' });
      }
    });

    // 3. Typing Indicators
    socket.on('typing', ({ conversationId, receiverId }) => {
      const receiverSocket = onlineUsers.get(parseInt(receiverId));
      if (receiverSocket) {
        io.to(receiverSocket).emit('typing', {
          conversationId,
          senderId: userId
        });
      }
    });

    socket.on('stop_typing', ({ conversationId, receiverId }) => {
      const receiverSocket = onlineUsers.get(parseInt(receiverId));
      if (receiverSocket) {
        io.to(receiverSocket).emit('stop_typing', {
          conversationId,
          senderId: userId
        });
      }
    });

    // 4. Read / Seen receipts
    socket.on('message_seen', async ({ conversationId, senderId }) => {
      try {
        // Mark all messages in this conversation from sender to me (receiver) as seen
        await Message.update(
          { seen: true },
          {
            where: {
              conversationId,
              senderId,
              receiverId: userId,
              seen: false
            }
          }
        );

        // Notify the original sender that their messages have been read
        const senderSocket = onlineUsers.get(parseInt(senderId));
        if (senderSocket) {
          io.to(senderSocket).emit('messages_marked_seen', {
            conversationId,
            receiverId: userId // The current user who read the messages
          });
        }
      } catch (err) {
        console.error('Error marking messages as seen:', err);
      }
    });

    // 5. Connection Disconnect
    socket.on('disconnect', async () => {
      console.log(`User disconnected: ${socket.user.name} (ID: ${userId})`);
      
      // Remove from online map
      onlineUsers.delete(userId);

      // Update database status to offline
      try {
        await User.update({ isOnline: false }, { where: { id: userId } });
        
        // Broadcast offline status to all other users
        socket.broadcast.emit('user_status_changed', {
          userId,
          isOnline: false
        });
      } catch (err) {
        console.error('Error updating offline status:', err);
      }
    });
  });
};
