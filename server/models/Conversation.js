import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Conversation = sequelize.define('Conversation', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  user1Id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  user2Id: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
});

export default Conversation;
