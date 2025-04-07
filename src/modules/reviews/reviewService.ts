import Booking from '@/databases/entities/Booking';
import Review, { IReview } from '@/databases/entities/Review';
import Room from '@/databases/entities/Room';
import mongoose from 'mongoose';

class ReviewService {
  async findUserByOrder(roomId: string, userId: mongoose.Types.ObjectId) {
    const room = await Room.findById(roomId).populate('hotel');
    if (!room) {
      throw new Error('Room not found');
    }
    const booking = await Booking.findOne({
      user: userId,
      room: roomId,
    });
    console.log(booking);
    return !!booking;
  }

  async createReview(
    hotelId: mongoose.Types.ObjectId,
    userId: mongoose.Types.ObjectId,
    rating: number,
    comment: string,
    imgPath?: string
  ) {
    const review = new Review({
      hotel: hotelId,
      user: userId,
      rating,
      comment,
      imgUrl: imgPath,
    });
    return await review.save();
  }
  async findAllReview() {
    return await Review.find();
  }
  async editRoom(reviewId: string, updateData: Partial<IReview>) {
    const review = await Review.findById(reviewId);
    if (!review) {
      throw new Error('review not found');
    }
    Object.assign(review, updateData);
    return await review.save();
  }
  async DeleteByReview(reviewId: string) {
    return await Review.findByIdAndDelete(reviewId);
  }
}

export default new ReviewService();
