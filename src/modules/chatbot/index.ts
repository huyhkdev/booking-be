import { Router } from 'express';
import ChatbotController from './ChatbotController';
import { authMiddleware } from '@/common/middlewares';

const ChatbotRouter = Router();

ChatbotRouter.post('/chat', authMiddleware, ChatbotController.chat);

export default ChatbotRouter; 