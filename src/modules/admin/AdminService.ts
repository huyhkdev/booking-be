import config from '@/common/config/config';
import BadRequestException from '@/common/exception/BadRequestException';
import ServerInternalException from '@/common/exception/ServerInternalExeption';
import { sendTextEmail } from '@/common/utils/mail';
import Booking from '@/databases/entities/Booking';
import Hotel from '@/databases/entities/Hotel';
import { HotelOwnerRegister } from '@/databases/entities/HotelOwnerRegister';
import Review from '@/databases/entities/Review';
import { Role, User } from '@/databases/entities/User';
import { Wallet } from '@/databases/entities/Wallet';
import Stripe from 'stripe';
import hashing from '@/common/utils/hashing';
import Jwt from '@/common/utils/Jwt';
import UnauthorizedExeption from '@/common/exception/UnauthorizedExeption';
import ErrorCode from '@/common/constants/errorCode';
import Room from '@/databases/entities/Room';
import mongoose from 'mongoose';

class AdminService {
    async acceptExpertRequest(requestId: string) {
        const request = await HotelOwnerRegister.findById(requestId);
        if (!request) {
            throw new BadRequestException({
                errorCode: "",
                errorMessage: "Không tìm thấy yêu cầu"
            })
        }
        const userId = request.user;
        const user = await User.findById(userId);
        if (!user) {
            throw new BadRequestException({
                errorCode: "",
                errorMessage: "Không tìm thấy người dùng"
            })
        }
        let accountId = '';
        const stripe = new Stripe(config.stripeSecret);
        try {
            const account = await stripe.accounts.create({
                type: 'express',
                country: 'US',
                email: user.email,
            });

            accountId = account.id;
            const wallet = new Wallet({ owner: userId, connectedId: account.id });
            await wallet.save();

        } catch (e) {
            console.log(e);
            throw new ServerInternalException({
                errorCode: "",
                errorMessage: "Lỗi tạo ví"
            })
        }

        try {
            const accountLink = await stripe.accountLinks.create({
                account: accountId,
                refresh_url: 'https://example.com/reauth',
                return_url: `${config.striptAccountReturnUrl}`,
                type: 'account_onboarding',
            });

            try {
                sendTextEmail({
                    email: user.email,
                    subject: "Hoàn tất thông tin ví của bạn",
                    text: `Nhấn vào đây để hoàn tất thông tin ví của bạn: ${accountLink.url}`
                })
                request.status = 'approved';
                await request.save();

                user.role = 'owner';
                await user.save();

            } catch (e) {
                throw new ServerInternalException({
                    errorCode: "",
                    errorMessage: "Lỗi gửi email"
                })
            }

        } catch (e) {
            console.log(e);
            throw new ServerInternalException({
                errorCode: "",
                errorMessage: "Lỗi tạo ví"
            })
        }
      }
  // Admin authentication
  async login(email: string, password: string) {
    const user = await User.findOne({ email, role: 'admin' });
    if (!user) {
      throw new BadRequestException({
        errorCode: ErrorCode.NOT_FOUND,
        errorMessage: 'Không tìm thấy admin với email này',
      });
    }
    if (user.state !== 'active') {
      throw new BadRequestException({
        errorCode: ErrorCode.VERIFY_EMAIL_NEED,
        errorMessage: 'Bạn cần xác thực email',
      });
    }

    const isCorrectPassword = await hashing.comparePassword(
      password,
      user.password
    );
    if (!isCorrectPassword)
      throw new UnauthorizedExeption({
        errorCode: ErrorCode.INCORRECT,
        errorMessage: 'Mật khẩu không chính xác',
      });

    const accessToken = Jwt.generateAccessToken(user.id, user.role);
    const refreshToken = Jwt.generateRefreshToken(user.id);
    return { accessToken, refreshToken, user };
  }

  // User Management
  async getAllUsers() {
    return await User.find().select('-password');
  }

  async updateUserStatus(userId: string, role: Role) {
    const user = await User.findById(userId);
    if (!user) {
      throw new BadRequestException({
        errorCode: ErrorCode.NOT_FOUND,
        errorMessage: 'không tìm thấy người dùng',
      });
    }
    if (user.role === 'admin') {
      throw new BadRequestException({
        errorCode: ErrorCode.UNAUTHORIZED,
        errorMessage: 'Không thể cập nhật vai trò của admin',
      });
    }

    // If role is true, block the user (set role to blocker)
    // If role is false, unblock the user (set role back to user)
    user.role = role ? 'blocker' : 'user';
    await user.save();
  }

  // Hotel Management
  async getAllHotels() {
    return await Hotel.find().populate('user').populate('rooms');
  }

  // async updateHotelStatus(hotelId: string, status: string) {
  //     const hotel = await Hotel.findById(hotelId);
  //     if (!hotel) {
  //         throw new BadRequestException({
  //             errorCode: "",
  //             errorMessage: "Hotel not found"
  //         });
  //     }
  //     hotel.status = status;
  //     await hotel.save();
  // }

  // Booking Management
  async getAllBookings() {
    return await Booking.find()
      .populate('user')
      .populate('room');
  }

  // Review Management
  async getAllReviews() {
    return await Review.find().populate('user').populate('hotel');
  }

  async deleteReview(reviewId: string) {
    const review = await Review.findById(reviewId);
    if (!review) {
      throw new BadRequestException({
        errorCode: '',
        errorMessage: 'không tìm thấy đánh giá',
      });
    }
    await review.deleteOne();
  }

  // System Statistics
  async getSystemStats() {
    // Basic counts
    const [
      totalUsers,
      totalHotels,
      totalBookings,
      totalReviews,
      totalRooms,
      activeUsers,
      activeHotels,
    ] = await Promise.all([
      User.countDocuments(),
      Hotel.countDocuments(),
      Booking.countDocuments(),
      Review.countDocuments(),
      Room.countDocuments(),
      User.countDocuments({ state: 'active' }),
      Hotel.countDocuments(),
    ]);

    // Revenue statistics
    const last12Months = Array.from({ length: 12 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      return date;
    }).reverse();

    const monthlyRevenue = await Promise.all(
      last12Months.map(async (date) => {
        const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
        const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);

        const bookings = await Booking.find({
          createdAt: { $gte: startOfMonth, $lte: endOfMonth },
          status: 'confirmed'
        });

        const revenue = bookings.reduce((sum, booking) => sum + (booking.totalPrice || 0), 0);

        return {
          month: date.toLocaleString('default', {
            month: 'short',
            year: 'numeric',
          }),
          revenue: Number(revenue.toFixed(2)),
          bookings: bookings.length
        };
      })
    );

    // Total revenue
    const totalRevenue = await Booking.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } }
    ]);

    // Booking statistics by time
    const monthlyBookings = await Promise.all(
      last12Months.map(async (date) => {
        const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
        const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);

        const count = await Booking.countDocuments({
          createdAt: { $gte: startOfMonth, $lte: endOfMonth },
        });

        return {
          month: date.toLocaleString('default', {
            month: 'short',
            year: 'numeric',
          }),
          count,
        };
      })
    );

    // Top rated hotels
    const topRatedHotels = await Review.aggregate([
      {
        $group: {
          _id: '$hotel',
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: 'hotels',
          localField: '_id',
          foreignField: '_id',
          as: 'hotel',
        },
      },
      { $unwind: '$hotel' },
      {
        $project: {
          _id: '$hotel._id',
          name: '$hotel.name',
          averageRating: 1,
          totalReviews: 1,
          address: '$hotel.address',
        },
      },
      { $sort: { averageRating: -1 } },
      { $limit: 5 },
    ]);

    return {
      // Basic statistics
      totalUsers,
      totalHotels,
      totalBookings,
      totalReviews,
      totalRooms,
      activeUsers,
      activeHotels,

      // Revenue statistics
      totalRevenue: totalRevenue[0]?.total || 0,
      monthlyRevenue,

      // Booking trends
      monthlyBookings,

      // Top rated hotels
      topRatedHotels,
    };
  }

  async blockUsers(uids: string[]) {
    const users = await User.find({ _id: { $in: uids } });
    if (!users.length) {
      throw new BadRequestException({
        errorCode: ErrorCode.NOT_FOUND,
        errorMessage: 'Không tìm thấy người dùng',
      });
    }

    await User.updateMany(
      { _id: { $in: uids } },
      { $set: { role: 'blocker' } }
    );
  }

  async unblockUsers(uids: string[]) {
    const users = await User.find({ _id: { $in: uids } });
    if (!users.length) {
      throw new BadRequestException({
        errorCode: ErrorCode.NOT_FOUND,
        errorMessage: 'Không tìm thấy người dùng',
      });
    }

    await User.updateMany({ _id: { $in: uids } }, { $set: { role: 'user' } });
  }

  // Owner Request Management
  async getAllOwnerRequests() {
    return await HotelOwnerRegister.find()
      .populate('user')
      .sort({ createdAt: -1 });
  }

  async getOwnerRequestById(requestId: string) {
    const request = await HotelOwnerRegister.findById(requestId)
      .populate('user');
    if (!request) {
      throw new BadRequestException({
        errorCode: ErrorCode.NOT_FOUND,
        errorMessage: 'Không tìm thấy yêu cầu',
      });
    }
    return request;
  }

  // Owner Management
  async getAllOwners() {
    const owners = await User.find({ role: 'owner' })
      .select('-password');
    const hotels = await Hotel.find({ user: { $in: owners.map(owner => owner._id) } });
    
    return owners.map(owner => {
      const ownerHotels = hotels.filter(hotel => hotel.user.equals(owner._id as mongoose.Types.ObjectId));
      const averageRating = ownerHotels.length > 0 
        ? ownerHotels.reduce((sum, hotel) => sum + (hotel.rating || 0), 0) / ownerHotels.length 
        : 0;

      return {
        ...owner.toJSON(),
        hotels: ownerHotels,
        averageRating: Number(averageRating.toFixed(1))
      };
    });
  }

  async getOwnerById(ownerId: string) {
    const owner = await User.findById(ownerId).select('-password');
    
    if (!owner) {
      throw new BadRequestException({
        errorCode: ErrorCode.NOT_FOUND,
        errorMessage: 'Không tìm thấy chủ khách sạn',
      });
    }

    if (owner.role !== 'owner') {
      throw new BadRequestException({
        errorCode: ErrorCode.UNAUTHORIZED,
        errorMessage: 'Người dùng này không phải là chủ khách sạn',
      });
    }

    const hotels = await Hotel.find({ user: ownerId })
      .select('name address status rating totalRooms');

    const ownerData = owner.toJSON();
    return {
      ...ownerData,
      hotels
    };
  }
}

export default new AdminService();
