import { Op } from 'sequelize';
import { User, Conversation, Message } from '../models/index.js';

// @desc    Get or Create a Conversation between current user and another user
// @route   POST /api/chats/conversation
// @access  Private
export const getOrCreateConversation = async (req, res, next) => {
  try {
    const { receiverId } = req.body;
    const senderId = req.user.id;

    if (!receiverId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a receiver ID'
      });
    }

    if (parseInt(receiverId) === senderId) {
      return res.status(400).json({
        success: false,
        message: 'You cannot start a conversation with yourself'
      });
    }

    // Verify receiver exists
    const receiver = await User.findByPk(receiverId);
    if (!receiver) {
      return res.status(404).json({
        success: false,
        message: 'Receiver user not found'
      });
    }

    // Uniquely identify the one-to-one room by ordering participant IDs
    const u1 = Math.min(senderId, parseInt(receiverId));
    const u2 = Math.max(senderId, parseInt(receiverId));

    // Atomic database findOrCreate ensures a single unique room ID between any two users
    const [convo, created] = await Conversation.findOrCreate({
      where: { user1Id: u1, user2Id: u2 }
    });

    return res.status(200).json({
      success: true,
      conversationId: convo.id,
      receiver: {
        id: receiver.id,
        name: receiver.name,
        email: receiver.email,
        profilePic: receiver.profilePic,
        isOnline: receiver.isOnline
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all conversations for the logged-in user with details
// @route   GET /api/chats/conversations
// @access  Private
export const getConversations = async (req, res, next) => {
  try {
    const currentUserId = req.user.id;

    // 1. Fetch all conversations where current user is user1 or user2
    const conversations = await Conversation.findAll({
      where: {
        [Op.or]: [
          { user1Id: currentUserId },
          { user2Id: currentUserId }
        ]
      }
    });

    const conversationsList = [];

    // 2. Fetch latest message and count unread logs for each room
    for (const convo of conversations) {
      const otherUserId = convo.user1Id === currentUserId ? convo.user2Id : convo.user1Id;

      // Hydrate fresh contact profile details
      const otherUser = await User.findByPk(otherUserId, {
        attributes: ['id', 'name', 'email', 'profilePic', 'isOnline']
      });

      if (!otherUser) continue;

      // Fetch the latest message
      const lastMessage = await Message.findOne({
        where: { conversationId: convo.id },
        order: [['createdAt', 'DESC']]
      });

      // Count unread incoming messages
      const unreadCount = await Message.count({
        where: {
          conversationId: convo.id,
          receiverId: currentUserId,
          seen: false
        }
      });

      conversationsList.push({
        conversationId: convo.id,
        otherUser,
        lastMessage: lastMessage ? {
          id: lastMessage.id,
          message: lastMessage.message,
          senderId: lastMessage.senderId,
          seen: lastMessage.seen,
          createdAt: lastMessage.createdAt
        } : null,
        unreadCount
      });
    }

    // Sort: Chats with messages are sorted by latest message date. Chats without messages yet are placed at the bottom.
    conversationsList.sort((a, b) => {
      if (!a.lastMessage && !b.lastMessage) return 0;
      if (!a.lastMessage) return 1;
      if (!b.lastMessage) return -1;
      return new Date(b.lastMessage.createdAt) - new Date(a.lastMessage.createdAt);
    });

    return res.status(200).json({
      success: true,
      conversations: conversationsList
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get message history for a conversation
// @route   GET /api/chats/messages/:conversationId
// @access  Private
export const getMessages = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const currentUserId = req.user.id;

    // Verify conversation exists or at least user belongs to it (by checking if they have messages or if conversation ID is valid)
    const conversation = await Conversation.findByPk(conversationId);
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    // Automatically mark all messages in this conversation received by the current user as seen
    await Message.update(
      { seen: true },
      {
        where: {
          conversationId: conversationId,
          receiverId: currentUserId,
          seen: false
        }
      }
    );

    // Fetch messages
    const messages = await Message.findAll({
      where: { conversationId },
      order: [['createdAt', 'ASC']],
      include: [
        { model: User, as: 'sender', attributes: ['id', 'name', 'profilePic', 'isOnline'] },
        { model: User, as: 'receiver', attributes: ['id', 'name', 'profilePic', 'isOnline'] }
      ]
    });

    return res.status(200).json({
      success: true,
      messages
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Send a message via HTTP REST API (acts as fallback)
// @route   POST /api/chats/message
// @access  Private
export const sendMessage = async (req, res, next) => {
  try {
    const { conversationId, receiverId, message } = req.body;
    const senderId = req.user.id;

    if (!conversationId || !receiverId || !message) {
      return res.status(400).json({
        success: false,
        message: 'Please provide conversationId, receiverId, and message content'
      });
    }

    // Verify recipient exists
    const receiver = await User.findByPk(receiverId);
    if (!receiver) {
      return res.status(404).json({
        success: false,
        message: 'Receiver user not found'
      });
    }

    const newMessage = await Message.create({
      senderId,
      receiverId,
      conversationId,
      message,
      seen: false
    });

    const fullMessage = await Message.findByPk(newMessage.id, {
      include: [
        { model: User, as: 'sender', attributes: ['id', 'name', 'profilePic', 'isOnline'] },
        { model: User, as: 'receiver', attributes: ['id', 'name', 'profilePic', 'isOnline'] }
      ]
    });

    return res.status(201).json({
      success: true,
      message: fullMessage
    });
  } catch (error) {
    next(error);
  }
};
