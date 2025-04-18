import { Router } from 'express';
import chatController from './chat.controller';
import { authMiddleware } from '@/common/middlewares';

const chatRouter = Router();

chatRouter.post('/travel-itinerary/:bookingId', chatController.chat);
export default chatRouter;
