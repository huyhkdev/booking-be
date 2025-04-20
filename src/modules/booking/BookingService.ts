import config from '@/common/config/config';
import BadRequestException from '@/common/exception/BadRequestException';
import ForbiddenException from '@/common/exception/ForbiddenException';
import ErrorCode from '@/common/constants/errorCode';
import Booking, { IBooking } from '@/databases/entities/Booking';
import Hotel from '@/databases/entities/Hotel';
import Room from '@/databases/entities/Room';
import { differenceInBusinessDays, differenceInDays } from 'date-fns';
import mongoose from 'mongoose';
import Stripe from 'stripe';
import Review from '@/databases/entities/Review';

class BookingService {
  async createBookingSession(
    rooms: Array<{
      id: mongoose.Types.ObjectId;
      quantity: number;
    }>,
    checkInDate: Date,
    checkOutDate: Date,
    paymentMethod: string,
    uid: string,
    capacity: string
  ) {
    const stripe = new Stripe(config.stripeSecret);
    let orderData = {
      rooms,
      checkInDate,
      checkOutDate,
      paymentMethod,
      uid,
      ownerId: "",
      totalAmount: 0,
      capacity
    };
    const roomDetails = await Room.find({
      _id: { $in: rooms.map((room) => room.id) },
    });
    const hotelId = roomDetails[0].hotel;
    const hotel = await Hotel.findById(hotelId);
    if (!hotel) {
      throw new BadRequestException({ errorCode: "", errorMessage: "Không tìm thấy hotel" })
    }
    orderData = { ...orderData, ownerId: hotel.user.toString() };
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    let totalAmount = 0;

    const lineItems = rooms.map((room) => {
      const roomDetail = roomDetails.find((detail: any) =>
        detail._id.equals(room.id)
      );
      if (!roomDetail) {
        throw new Error(`Room with ID ${room.id} not found`);
      }
      const totalPriceByRoom = roomDetail.pricePerNight * differenceInDays(new Date(checkOutDate), new Date(checkInDate));
      totalAmount += totalPriceByRoom;
      return {
        price_data: {
          currency: 'VND',
          product_data: {
            name: `Booking Room ${room.id}`,
            description: `Room booking from ${new Date(checkInDate).toLocaleDateString()} to ${new Date(checkOutDate).toLocaleDateString()}`,
          },
          unit_amount: totalPriceByRoom,
        },
        quantity: room.quantity,
      };
    });
      orderData = {...orderData, totalAmount}
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      metadata: {
        orderData: JSON.stringify(orderData),
      },
      line_items: lineItems,
      success_url: `http://localhost:3000/success`,
      cancel_url: `http://localhost:3000/cancel`,
      payment_method_types: ['card'],
    });

    return { paymentUrl: session.url };
  }

  async createBooking(
    rooms: mongoose.Types.ObjectId[],
    totalPrice: number,
    totalGuests: number,
    checkInDate: Date,
    checkOutDate: Date,
    paymentMethod: string,
    transactionID: string,
    uid: string,
  ): Promise<IBooking> {
    const booking = new Booking({
      room: rooms,
      totalGuests,
      totalPrice,
      checkInDate,
      checkOutDate,
      paymentMethod,
      status: 'confirmed',
      user: uid,
      transactionID,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    await booking.save();
    return booking;
  }
  async getAllOrders() {
    const bookings = await Booking.find();
    return bookings;
  }

  async removeAll() {
    const result = await Booking.deleteMany({});
    return result;
  }

  async getBookingByUid(uid: string) {
    return await Booking.find({ user: uid })
    .populate({
      path: 'room',
      populate: {
        path: 'hotel',
        model: 'Hotel'
      }
    });
  }

  async isHotelOwner(hotelId: string, userId: string): Promise<boolean> {
    const hotel = await Hotel.findById(hotelId);
    if (!hotel) {
      throw new BadRequestException({
        errorCode: "",
        errorMessage: "Không tìm thấy khách sạn"
      });
    }
    return hotel.user.toString() === userId;
  }

  async getBookingsByHotelId(hotelId: string, userId: string) {
    const isOwner = await this.isHotelOwner(hotelId, userId);
    if (!isOwner) {
      throw new ForbiddenException({
        errorCode: "FORBIDDEN",
        errorMessage: "Bạn không phải chủ của khách sạn này"
      });
    }

    return await Booking.find()
      .populate({
        path: 'room',
        match: { hotel: hotelId },
        populate: {
          path: 'hotel',
          model: 'Hotel'
        }
      })
      .then(bookings => bookings.filter(booking => booking.room.length > 0));
  }

  async getTotalRevenueByOwner(userId: string) {
    // First get all hotels owned by the user
    const hotels = await Hotel.find({ user: userId });
    const hotelIds = hotels.map(hotel => hotel._id);

    // Then get all rooms in these hotels
    const rooms = await Room.find({ hotel: { $in: hotelIds } });
    const roomIds = rooms.map(room => room._id);

    // Get all bookings for these rooms
    const bookings = await Booking.find({ room: { $in: roomIds } })
      .populate({
        path: 'room',
        populate: {
          path: 'hotel',
          model: 'Hotel'
        }
      });

    // Calculate total revenue
    const totalRevenue = bookings.reduce((sum, booking) => sum + booking.totalPrice, 0);

    // Group revenue by hotel
    const revenueByHotel = bookings.reduce((acc, booking) => {
      const rooms = booking.room as any[]; // Type assertion since we know it's populated
      
      // Process each room in the booking
      rooms.forEach(room => {
        const hotelId = room.hotel._id.toString();
        if (!acc[hotelId]) {
          acc[hotelId] = {
            hotelId,
            hotelName: room.hotel.name,
            totalRevenue: 0,
            bookingCount: 0
          };
        }
        // Distribute the total price equally among rooms
        const pricePerRoom = booking.totalPrice / rooms.length;
        acc[hotelId].totalRevenue += pricePerRoom;
        acc[hotelId].bookingCount += 1;
      });
      
      return acc;
    }, {});

    return {
      totalRevenue,
      revenueByHotel: Object.values(revenueByHotel)
    };
  }

  async getRevenueStatisticsByOwner(userId: string) {
    // First get all hotels owned by the user
    const hotels = await Hotel.find({ user: userId });
    const hotelIds = hotels.map(hotel => hotel._id);

    // Then get all rooms in these hotels
    const rooms = await Room.find({ hotel: { $in: hotelIds } });
    const roomIds = rooms.map(room => room._id);

    // Get all bookings for these rooms
    const bookings = await Booking.find({ room: { $in: roomIds } })
      .populate({
        path: 'room',
        populate: {
          path: 'hotel',
          model: 'Hotel'
        }
      });

    // Calculate statistics
    const statistics = {
      totalHotels: hotels.length,
      totalRooms: rooms.length,
      totalBookings: bookings.length,
      totalRevenue: bookings.reduce((sum, booking) => sum + booking.totalPrice, 0),
      averageBookingValue: bookings.length > 0 
        ? bookings.reduce((sum, booking) => sum + booking.totalPrice, 0) / bookings.length 
        : 0,
      revenueByHotel: {} as Record<string, {
        hotelId: string;
        hotelName: string;
        totalRevenue: number;
        bookingCount: number;
        roomCount: number;
      }>
    };

    // Initialize revenue by hotel
    hotels.forEach(hotel => {
      const hotelId = (hotel._id as mongoose.Types.ObjectId).toString();
      statistics.revenueByHotel[hotelId] = {
        hotelId,
        hotelName: (hotel as any).name,
        totalRevenue: 0,
        bookingCount: 0,
        roomCount: rooms.filter(room => room.hotel.toString() === hotelId).length
      };
    });

    // Calculate revenue and booking count by hotel
    bookings.forEach(booking => {
      const rooms = booking.room as any[];
      const pricePerRoom = booking.totalPrice / rooms.length;
      
      rooms.forEach(room => {
        const hotelId = room.hotel._id.toString();
        if (statistics.revenueByHotel[hotelId]) {
          statistics.revenueByHotel[hotelId].totalRevenue += pricePerRoom;
          statistics.revenueByHotel[hotelId].bookingCount += 1;
        }
      });
    });

    return statistics;
  }
}

export default new BookingService();
