
import BadRequestException from '@/common/exception/BadRequestException';
import Booking from '@/databases/entities/Booking';
import Review from '@/databases/entities/Review';
class ReviewService {
  async createReview(userId: string, bookingId: string, rating: number, comment: string) {
    // Kiểm tra booking có tồn tại và thuộc về user không
    const booking = await Booking.findOne({ _id: bookingId, user: userId }).populate('room');

    if (!booking) {
      throw new BadRequestException({
        errorCode: "",
        errorMessage: "Không tìm thấy đơn đặt phòng"
      })
    }


    const hotelId = (booking.room[0] as any).hotel;

    // Tạo review
    const review = await Review.create({
      user: userId,
      hotel: hotelId,
      rating,
      comment,
    });

    booking.isReview = true;
    await booking.save();
    return review;
  }
}

export default new ReviewService();
