import ErrorCode from '@/common/constants/errorCode';
import BadRequestException from '@/common/exception/BadRequestException';
import Booking from '@/databases/entities/Booking';
import Hotel, { IHotel } from '@/databases/entities/Hotel';
import Review from '@/databases/entities/Review';
import Room from '@/databases/entities/Room';
import { User } from '@/databases/entities/User';
import mongoose from 'mongoose';

class HotelsService {
  async findAllHotels() {
    return await Hotel.find();
  }
  async findAllHotelByCity(city: string) {
    return Hotel.find({ city });
  }
  async findHotelById(hotelId: string, checkInDate: string, checkOutDate: string) {
    const hotel = await Hotel.findById(hotelId);
    if (!hotel) {
      throw new Error('Không tìm thấy khách sạn');
    }
    const reviews = await Review.find({ hotel: hotel._id }).populate("user");

    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);

    // Tìm các booking có giao với khoảng ngày muốn đặt
    const bookingRooms = await Booking.find({
      checkInDate: { $lt: checkOut },
      checkOutDate: { $gt: checkIn },
    }).select('room');

    const bookingRoomId = bookingRooms.flatMap((b) => b.room);

    const availableRooms = await Room.find({
      hotel: hotelId,
      _id: { $nin: bookingRoomId },
    });

    return {
      ...hotel.toObject(),
      reviews,
      rooms: availableRooms,
    };
  }
  async findHotelsByOwnerId(ownerId: string) {
    return await Hotel.find({ user: ownerId });
  }

  async findHotelByHotelIdOwner(ownerId: string, hotelId: string) {
    const hotel = await Hotel.findOne({ _id: hotelId, user: ownerId }).populate("rooms");
    if (!hotel) {
      throw new Error(
        'Không tìm thấy khách sạn hoặc bạn không có quyền truy cập vào khách sạn này'
      );
    }
    return hotel;
  }

  async createHotel(ownerId: string, hotelData: IHotel, images: string[]) {
    const user = await User.findOne({ _id: ownerId });
    if (!user || user.role === 'blocker') {
      throw new BadRequestException({
        errorCode: ErrorCode.NOT_FOUND,
        errorMessage: 'Không tìm thấy người dùng',
      });
    }
    const hotel = new Hotel(hotelData);

    hotel.user = user._id as mongoose.Types.ObjectId;
    hotel.images = images;
    return await hotel.save();
  }

  async updateHotel(uid: string, hotelId: string, updateData: Partial<IHotel>) {
    const hotel = await Hotel.findOne({ _id: hotelId, user: uid });
    if (!hotel) {
      throw new Error('Không tìm thấy khách sạn hoặc bạn không có quyền truy cập vào khách sạn này');
    }
    const updatedHotel = await Hotel.findByIdAndUpdate(hotelId, updateData, {
      new: true,
    });
    return updatedHotel;
  }

  async deleteHotel(uid: string, hotelId: string) {
    const hotel = await Hotel.findOne({ _id: hotelId, user: uid });
    if (!hotel) {
      throw new Error('Không tìm thấy khách sạn hoặc bạn không có quyền truy cập vào khách sạn này');
    }
    const deleteHotel = await Hotel.findByIdAndDelete(hotelId);

    await Room.deleteMany({ hotel: hotelId });

    return deleteHotel;
  }
}
export default new HotelsService();
