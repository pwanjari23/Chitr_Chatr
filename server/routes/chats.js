import express from 'express';
import {
  getOrCreateConversation,
  getConversations,
  getMessages,
  sendMessage
} from '../controllers/chatController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/conversation', protect, getOrCreateConversation);
router.get('/conversations', protect, getConversations);
router.get('/messages/:conversationId', protect, getMessages);
router.post('/message', protect, sendMessage);

export default router;
