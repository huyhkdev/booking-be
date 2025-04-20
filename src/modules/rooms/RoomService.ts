import ErrorCode from '@/common/constants/errorCode';
import BadRequestException from '@/common/exception/BadRequestException';
import Booking from '@/databases/entities/Booking';
import Hotel from '@/databases/entities/Hotel';
import Review from '@/databases/entities/Review';
import Room, { IRoom, IRoomCreate } from '@/databases/entities/Room';
import { User } from '@/databases/entities/User';
import mongoose from 'mongoose';

class RoomService {
  private async findRoomByDateRange(checkInDate: Date, checkOutDate: Date) {
    const bookingRooms = await Booking.find({
      checkInDate: { $lt: checkOutDate },
      checkOutDate: { $gt: checkInDate },
    }).select('room');

    const bookingRoomId = bookingRooms.flatMap((b) => b.room);
    const availableRooms = await Room.find({ _id: { $nin: bookingRoomId } });
    return availableRooms;
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
    const filteredRoomByDate = await this.findRoomByDateRange(new Date(checkInDate), new Date(checkOutDate));
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
    if (maxPrice && minPrice) {
      roomResult = roomResult.filter(
        (item) =>
          Number(item.pricePerNight) >= minPrice &&
          Number(item.pricePerNight) <= maxPrice
      );
    }
    if (rating) {
      const filteredRoomResult = await Promise.all(
        roomResult.map(async (item) => {
          const hotelReviews = await Review.find({ hotel: item.hotel._id });
          const averageRating = hotelReviews.length
            ? hotelReviews.reduce((sum, r) => sum + r.rating, 0) / hotelReviews.length
            : 0;
    
          const matched = rating.includes(String(averageRating));
          return matched ? item : null;
        })
      );
    
      roomResult = filteredRoomResult.filter(item => item !== null);
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
    const uniqueRoomsByHotel = Object.keys(roomByHotel).reduce(
      (result: Record<string, any[]>, hotelId) => {
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
      },
      {}
    );
    const finalResult = Object.values(uniqueRoomsByHotel).flat();
    const combimeReviewsResult = await Promise.all(finalResult.map(async item => {
      const hotelId = item.hotel.id;
      const reviews = await Review.find({ hotel: hotelId }).lean();
      return { ...item.toObject(), reviews }
    }))
    return {
      rooms: combimeReviewsResult.slice(startIndex, endIndex),
      total: combimeReviewsResult.length,
    };
  }

  async createRoom(roomData: IRoomCreate, images: string[]) {
    const hotel = await Hotel.findById(roomData.hotel);
    if (!hotel) {
      throw new Error(
        'Không tìm thấy khách sạn hoặc bạn không có quyền truy cập vào khách sạn này'
      );
    }
    const room = new Room(roomData);
    room.hotel = hotel;
    room.isAvailable = true;
    room.images = images;
    await room.save();

    hotel.rooms.push(room._id as mongoose.Types.ObjectId);
    await hotel.save();

    return room;
  }

  async updateRoom(
    roomId: string,
    ownerId: string,
    updateData: Partial<IRoom>
  ) {
    const user = await User.findOne({ _id: ownerId });
    if (!user || user.role === 'blocker') {
      throw new BadRequestException({
        errorCode: ErrorCode.NOT_FOUND,
        errorMessage: 'Không tìm thấy người dùng',
      });
    }
    const roomCheck = await Room.findById(roomId);
    if (!roomCheck) {
      throw new Error('Không tìm thấy phòng');
    }
    const hotelCheck = await Hotel.findOne({
      user: ownerId,
      rooms: roomCheck._id,
    });
    if (!hotelCheck) {
      throw new Error('Không tìm thấy khách sạn hoặc bạn không có quyền truy cập vào khách sạn này');
    }
    const room = await Room.findByIdAndUpdate(roomId, updateData, {
      new: true,
    });

    return room;
  }

  async deleteRoom(uid: string, roomId: string) {
    const hotel = await Hotel.findOne({ user: uid, rooms: roomId });
    const room = await Room.findByIdAndDelete(roomId);
    if (!room) {
      throw new Error('Không tìm thấy phòng');
    }
    if (!hotel) {
      throw new Error('Không tìm thấy khách sạn hoặc bạn không có quyền truy cập vào khách sạn này');
    }
    hotel.rooms = hotel.rooms.filter(
      (roomIdInArray) => roomIdInArray.toString() !== roomId
    );
    await hotel.save();

    return room;
  }
  async findRoomByRoomIdOwner(roomId: string, ownerId: string) {
    const room = await Room.findOne({ _id: roomId });
    if (!room) {
      throw new Error('Không tìm thấy phòng');
    }
    if (room.hotel.user.toString() !== ownerId) {
      throw new Error('Không tìm thấy khách sạn hoặc bạn không có quyền truy cập vào khách sạn này');
    }

    return room;
  }
  async findRoomsByHotelOwner(uid: string, hotelId: string) {
    const hotel = await Hotel.findOne({ _id: hotelId, user: uid }).populate(
      'rooms'
    );
    if (!hotel) {
      throw new Error(
        'Không tìm thấy khách sạn hoặc bạn không có quyền truy cập vào khách sạn này'
      );
    }

    return hotel.rooms;
  }

  async findRoomById(roomId: string) {
    const room = await Room.findById(roomId);
    if (!room) {
      throw new Error('Không tìm thấy phòng');
    }
    return room;
  }
}

export default new RoomService();
