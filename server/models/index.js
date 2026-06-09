import sequelize from '../config/db.js';
import User from './User.js';
import Conversation from './Conversation.js';
import Message from './Message.js';

// User HasMany Messages (Sent and Received)
User.hasMany(Message, { foreignKey: 'senderId', as: 'sentMessages' });
User.hasMany(Message, { foreignKey: 'receiverId', as: 'receivedMessages' });

// Conversation HasMany Messages
Conversation.hasMany(Message, { foreignKey: 'conversationId', as: 'messages', onDelete: 'CASCADE' });

// Message BelongsTo User (Sender and Receiver)
Message.belongsTo(User, { foreignKey: 'senderId', as: 'sender' });
Message.belongsTo(User, { foreignKey: 'receiverId', as: 'receiver' });

// Message BelongsTo Conversation
Message.belongsTo(Conversation, { foreignKey: 'conversationId', as: 'conversation' });

export {
  sequelize,
  User,
  Conversation,
  Message
};
export default {
  sequelize,
  User,
  Conversation,
  Message
};
