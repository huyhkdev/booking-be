import mongoose, { Document, Schema } from 'mongoose';
import { IHotel } from './Hotel';

// Định nghĩa interface cho Review
export interface IReview extends Document {
  user: mongoose.Types.ObjectId; // Liên kết tới User
  hotel: IHotel;
  rating: number; // Đánh giá từ 1-5 sao
  comment: string;
  createdAt: Date;
  updatedAt: Date;
}

// Định nghĩa schema cho Review
const reviewSchema: Schema<IReview> = new Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Liên kết tới người dùng
    hotel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hotel',
      required: true,
    }, // Liên kết tới phòng
    rating: { type: Number, required: true, min: 1, max: 5 }, // Giới hạn đánh giá từ 1 đến 5 sao
    comment: { type: String, required: true }
  },
  {
    timestamps: true,
  }
);

// Tạo model từ schema
const Review = mongoose.model<IReview>('Review', reviewSchema);
export default Review;
