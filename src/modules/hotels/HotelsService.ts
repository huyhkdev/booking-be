import Booking from '@/databases/entities/Booking';
import Hotel, { IHotel } from '@/databases/entities/Hotel';
import Room from '@/databases/entities/Room';

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
    const availableRoom = await Room.find({ hotel: hotelId, _id: { $nin: bookingRoomId } });
    return {
      ...hotel.toObject(),
      rooms: availableRoom,
    };
  }
  async findHotelByIdOwner(hotelId: string) {
    const hotel = await Hotel.findOne({ _id: hotelId });
    if (!hotel) {
      throw new Error('Hotel not found or you do not have access to this hotel');
    }
    return hotel;
  }

  async createHotel(hotelData: IHotel) {
    const hotel = new Hotel(hotelData);
    return await hotel.save();
  }

  async updateHotel(hotelId: string, updateData: Partial<IHotel>) {
    const hotel = await Hotel.findByIdAndUpdate(hotelId, updateData, { new: true });
    if (!hotel) {
      throw new Error('Hotel not found');
    }
    return hotel;
  }

  async deleteHotel(hotelId: string) {

    const hotel = await Hotel.findByIdAndDelete(hotelId);
    if (!hotel) {
      throw new Error('Hotel not found');
    }

    await Room.deleteMany({ hotel: hotelId });

    return hotel;
  }
}
export default new HotelsService();
