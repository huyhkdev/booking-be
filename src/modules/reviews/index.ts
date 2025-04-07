import { Router } from 'express';
import reviewController from './reviewController';
import uploadCloud from '@/utils/upload';

export const ReviewRouter = Router();
ReviewRouter.post(
  '/createReview/:roomId',
  uploadCloud.single('imgUrl'),
  reviewController.CreateReview
);
ReviewRouter.put(
  '/editReview/:reviewId',
  uploadCloud.single('imgUrl'),
  reviewController.EditReview
);
ReviewRouter.delete('/deleteReview/:reviewId', reviewController.DeleteReview);
ReviewRouter.get('/allReview', reviewController.ReviewAll);
