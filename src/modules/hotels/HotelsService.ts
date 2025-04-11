import ErrorCode from '@/common/constants/errorCode';
import BadRequestException from '@/common/exception/BadRequestException';
import Booking from '@/databases/entities/Booking';
import Hotel, { IHotel } from '@/databases/entities/Hotel';
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
  async findHotelById(hotelId: string, checkInDate: string) {
    const hotel = await Hotel.findById(hotelId);
    if (!hotel) {
      throw new Error('Hotel not found');
    }
    const bookingRooms = await Booking.find({
      checkOutDate: { $gte: new Date(checkInDate) },
    }).select('room');
    const bookingRoomId = bookingRooms.flatMap(
      (bookingRoom) => bookingRoom.room
    );
    const availableRoom = await Room.find({
      hotel: hotelId,
      _id: { $nin: bookingRoomId },
    });
    return {
      ...hotel.toObject(),
      rooms: availableRoom,
    };
  }
  async findHotelsByOwnerId(ownerId: string) {
    return await Hotel.find({ user: ownerId });
  }

  async findHotelByHotelIdOwner(ownerId: string, hotelId: string) {
    const hotel = await Hotel.findOne({ _id: hotelId, user: ownerId }).populate("rooms");
    if (!hotel) {
      throw new Error(
        'Hotel not found or you do not have access to this hotel'
      );
    }
    return hotel;
  }

  async createHotel(ownerId: string, hotelData: IHotel, images: string[]) {
    const user = await User.findOne({ _id: ownerId });
    if (!user || user.role === 'blocker') {
      throw new BadRequestException({
        errorCode: ErrorCode.NOT_FOUND,
        errorMessage: 'Not found user',
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
      throw new Error('Hotel not found or you do not have access to this hotel');
    }
    const updatedHotel = await Hotel.findByIdAndUpdate(hotelId, updateData, {
      new: true,
    });
    return updatedHotel;
  }

  async deleteHotel(uid:string, hotelId: string) {
    const hotel = await Hotel.findOne({ _id: hotelId, user: uid });
    if (!hotel) {
      throw new Error('Hotel not found or you do not have access to this hotel');
    }
    const deleteHotel = await Hotel.findByIdAndDelete(hotelId);
    
    await Room.deleteMany({ hotel: hotelId });

    return deleteHotel;
  }
}
export default new HotelsService();
