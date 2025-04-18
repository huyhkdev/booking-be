import BadRequestException from '@/common/exception/BadRequestException';
import Booking from '@/databases/entities/Booking';
import Review from '@/databases/entities/Review';
import Hotel from '@/databases/entities/Hotel';
import mongoose from 'mongoose';

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

  async getReviewsByOwner(userId: string) {
    // First get all hotels owned by the user
    const hotels = await Hotel.find({ user: userId });
    const hotelIds = hotels.map(hotel => (hotel._id as mongoose.Types.ObjectId).toString());

    // Get all reviews for these hotels
    const reviews = await Review.find({ hotel: { $in: hotelIds } })
      .populate({
        path: 'user',
        select: 'name email avatar'
      })
      .populate({
        path: 'hotel',
        select: 'name'
      });

    // Calculate average rating for each hotel
    const hotelReviews = reviews.reduce((acc, review) => {
      const hotelId = (review.hotel as any)._id.toString();
      if (!acc[hotelId]) {
        acc[hotelId] = {
          hotelId,
          hotelName: (review.hotel as any).name,
          totalReviews: 0,
          averageRating: 0,
          reviews: []
        };
      }
      acc[hotelId].totalReviews += 1;
      acc[hotelId].reviews.push({
        userId: (review.user as any)._id,
        userName: (review.user as any).name,
        userAvatar: (review.user as any).avatar,
        rating: review.rating,
        comment: review.comment,
        createdAt: review.createdAt
      });
      return acc;
    }, {} as Record<string, {
      hotelId: string;
      hotelName: string;
      totalReviews: number;
      averageRating: number;
      reviews: Array<{
        userId: string;
        userName: string;
        userAvatar?: string;
        rating: number;
        comment: string;
        createdAt: Date;
      }>;
    }>);

    // Calculate average rating for each hotel
    Object.values(hotelReviews).forEach(hotel => {
      const totalRating = hotel.reviews.reduce((sum, review) => sum + review.rating, 0);
      hotel.averageRating = hotel.totalReviews > 0 ? totalRating / hotel.totalReviews : 0;
    });

    return {
      totalReviews: reviews.length,
      hotels: Object.values(hotelReviews)
    };
  }
}

export default new ReviewService();
