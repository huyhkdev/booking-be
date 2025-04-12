import config from '@/common/config/config';
import BadRequestException from '@/common/exception/BadRequestException';
import Booking, { IBooking } from '@/databases/entities/Booking';
import Hotel from '@/databases/entities/Hotel';
import Room from '@/databases/entities/Room';
import { differenceInBusinessDays, differenceInDays } from 'date-fns';
import mongoose from 'mongoose';
import Stripe from 'stripe';

class BookingService {
  async createBookingSession(
    rooms: Array<{
      id: mongoose.Types.ObjectId;
      quantity: number;
    }>,
    checkInDate: Date,
    checkOutDate: Date,
    paymentMethod: string
  ) {
    const stripe = new Stripe(config.stripeSecret);
    let orderData = {
      rooms,
      checkInDate,
      checkOutDate,
      paymentMethod,
      ownerId: "",
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
    transactionID: string
  ): Promise<IBooking> {
    const booking = new Booking({
      room: rooms,
      totalGuests,
      totalPrice,
      checkInDate,
      checkOutDate,
      paymentMethod,
      status: 'confirmed',
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
}

export default new BookingService();
