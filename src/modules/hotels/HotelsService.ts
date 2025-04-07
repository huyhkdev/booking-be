import Booking from '@/databases/entities/Booking';
import Hotel from '@/databases/entities/Hotel';
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
}
export default new HotelsService();
