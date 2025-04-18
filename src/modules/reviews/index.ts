import { Router } from 'express';
import ReviewController from './ReviewController';
import { authMiddleware } from '@/common/middlewares';

const ReviewRouter = Router();

ReviewRouter.post('/create', authMiddleware, ReviewController.createReview);
ReviewRouter.get('/owner', authMiddleware, ReviewController.getReviewsByOwner);

export default ReviewRouter;
