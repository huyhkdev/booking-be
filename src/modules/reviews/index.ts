import { Router } from 'express';
import reviewController from './reviewController';
import { authMiddleware } from '@/common/middlewares';

export const ReviewRouter = Router();
ReviewRouter.post(
  '/createReview/:bookingId',
  authMiddleware,
  reviewController.createReview
);
