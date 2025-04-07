import Booking from '@/databases/entities/Booking';
import Room from '@/databases/entities/Room';

class RoomService {
  private async findRoomByDate(checkInDate: Date) {
    const bookingRooms = await Booking.find({
      checkOutDate: { $gte: checkInDate },
    }).select('room');
    const bookingRoomId = bookingRooms.flatMap(
      (bookingRoom) => bookingRoom.room
    );
    const availableRoom = await Room.find({ _id: { $nin: bookingRoomId } });
    return availableRoom;
  }
  private async findRoomsByCity(filteredRoomByDate: any[], city: string) {
    const populatedFilteredRooms = await Room.populate(filteredRoomByDate, {
      path: 'hotel',
      select: 'name city star amenities images type rating longDescription',
    });

    const roomsByCity = populatedFilteredRooms.filter(
      (rooms) => rooms.hotel.city === city
    );

    const roomsGroupedByHotel = roomsByCity.reduce(
      (result: Record<string, any[]>, room: any) => {
        const hotelId = room.hotel._id.toString();
        if (!result[hotelId]) {
          result[hotelId] = [];
        }
        result[hotelId].push(room);
        return result;
      },
      {}
    );

    return roomsGroupedByHotel;
  }
  private filterHotelsByRoomCount(
    roomsGroupedByHotel: Record<string, any[]>,
    roomCount: number
  ) {
    return Object.values(roomsGroupedByHotel).filter(
      (rooms) => rooms.length >= roomCount
    );
  }
  private findByNumberOfPeople(
    filteredRoomByCity: any[],
    capacity: number,
    room: number
  ) {
    const resultPeople = Math.floor(capacity / room);
    return filteredRoomByCity.filter(
      (roomItem) => roomItem.capacity >= resultPeople
    );
  }

  async findAvailableRooms(
    checkInDate: string,
    checkOutDate: string, // make sure you have checkOutDate as well
    city: string,
    capacity: number,
    room: number,
    limit = 3,
    index = 1, // Ensure index is passed as an argument
    maxPrice: number,
    minPrice: number,
    rating: string[],
    roomType: string,
    amenities: string[]
  ) {
    const filteredRoomByDate = await this.findRoomByDate(new Date(checkInDate));
    const roomsGroupedByHotel = await this.findRoomsByCity(
      filteredRoomByDate,
      city
    );
    const filteredHotels = this.filterHotelsByRoomCount(
      roomsGroupedByHotel,
      room
    );
    const rooms = filteredHotels.flat();
    const startIndex = (index - 1) * Number(limit);
    const endIndex = startIndex + Number(limit);
    let roomResult = this.findByNumberOfPeople(rooms, capacity, room);
    if (maxPrice && minPrice ) {
      roomResult = roomResult.filter(
        (item) =>
          Number(item.pricePerNight) >= minPrice &&
          Number(item.pricePerNight) <= maxPrice
      );
    }
    if (rating) {
      roomResult = roomResult.filter((item) =>
        rating.includes(String(item.hotel.rating))
      );
    }
    if (amenities) {
      roomResult = roomResult.filter((item) =>
        amenities.every((ame) => item.hotel.amenities.includes(ame))
      );
    }
    if (roomType) {
      roomResult = roomResult.filter((item) => item.hotel.type === roomType);
    }
    const roomByHotel = roomResult.reduce(
      (result: Record<string, any[]>, curr: any) => {
        const hotelId = curr.hotel._id.toString();
        if (!result[hotelId]) {
          result[hotelId] = [];
        }
        result[hotelId].push(curr);
        return result;
      },
      {}
    );
    const uniqueRoomsByHotel = Object.keys(roomByHotel).reduce((result: Record<string, any[]>, hotelId) => {
      const uniqueRooms: any[] = [];
      const seenNames = new Set();
      for (const r of roomByHotel[hotelId]) {
        if (!seenNames.has(r.name)) {
          seenNames.add(r.name);
          uniqueRooms.push(r);
        }
      }
      result[hotelId] = uniqueRooms;
      return result;
    }, {});
    const finalResult = Object.values(uniqueRoomsByHotel).flat();
    return {
      rooms: finalResult.slice(startIndex, endIndex),
      total: finalResult.length,
    };
  }
}

export default new RoomService();
