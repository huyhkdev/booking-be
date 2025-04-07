import { NextFunction, Request, Response } from 'express';
import reviewService from './reviewService';
import Room from '@/databases/entities/Room';
import mongoose from 'mongoose';
interface RequestWithFile extends Request {
  file?: Express.Multer.File; // Hoặc kiểu cụ thể nếu bạn muốn
}
class ReviewController {
  async CreateReview(req: RequestWithFile, res: Response, next: NextFunction) {
    try {
      const { roomId } = req.params;
      const { userId, rating, comment } = req.body;
      const UserByBooking = await reviewService.findUserByOrder(roomId, userId);
      const imgPath = req.file?.path;
      console.log(imgPath);
      if (!UserByBooking) {
        return res.status(404).json({
          msg: ' You have not booked this room yet, so you cannot comment ',
        });
      }
      const room = await Room.findById(roomId).populate('hotel');
      if (!room) {
        return res.status(404).json({
          msg: 'Room not found.',
        });
      }

      const hotelId = room.hotel._id as mongoose.Types.ObjectId;
      const newReview = await reviewService.createReview(
        hotelId,
        userId,
        rating,
        comment,
        imgPath
      );

      return res.status(201).json({
        msg: 'Review created successfully',
        data: newReview,
      });
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
  async ReviewAll(req: Request, res: Response, next: NextFunction) {
    try {
      const review = await reviewService.findAllReview();
      return res.status(200).json({
        msg: 'Find All Review Success',
        data: review,
      });
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
  async EditReview(req: Request, res: Response, next: NextFunction) {
    try {
      const { reviewId } = req.params;
      const updateData = req.body;
      console.log(req.body);
      const imgPath = req.file?.path;
      if (imgPath) {
        updateData.imgUrl = imgPath;
      }
      const editReviewByRoom = await reviewService.editRoom(
        reviewId,
        updateData
      );
      return res.status(200).json({
        msg: 'Update Data Review Success',
        data: editReviewByRoom,
      });
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
  async DeleteReview(req: Request, res: Response, next: NextFunction) {
    try {
      const { reviewId } = req.params;
      await reviewService.DeleteByReview(reviewId);
      return res.status(200).json({
        msg: 'Delete Review Success',
      });
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
}
export default new ReviewController();
