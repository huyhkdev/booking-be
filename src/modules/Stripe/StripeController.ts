import { ResponseCustom } from '@/utils/expressCustom';
import { NextFunction, Request } from 'express';
import Stripe from 'stripe';
import BookingService from '../booking/BookingService';
import Room from '@/databases/entities/Room';
import mongoose from 'mongoose';
import config from '@/common/config/config';
import { Wallet } from '@/databases/entities/Wallet';

class StripeController {
  async enventByStripe(
    request: Request,
    response: ResponseCustom,
    next: NextFunction
  ) {
    const endpointSecret = config.pointSecret;
    const stripe = new Stripe(config.stripeSecret);
    const sig = request.headers['stripe-signature'] as
      | string
      | string[]
      | Buffer;
    let event;
    try {
      event = stripe.webhooks.constructEvent(request.body, sig, endpointSecret);
      if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        const { orderData } = session.metadata;
        const parsedOrderData = JSON.parse(orderData);
        const wallet = await Wallet.findOne({ owner: parsedOrderData.ownerId });
        if (!wallet) {
          return;
        }

        const { rooms, checkInDate, checkOutDate, paymentMethod } =
          parsedOrderData;

        const totalPrice = await Promise.all(
          rooms.map(
            async (room: { id: mongoose.Types.ObjectId; quantity: number }) => {
              const roomDetails = await Room.findById(room.id);
              if (!roomDetails) {
                throw new Error(`Room not found for id: ${room.id}`);
              }

              return roomDetails.pricePerNight * room.quantity;
            }
          )
        );

        const totalGuests = rooms.reduce(
          (total, room) => total + room.quantity,
          0
        );
        const totalBookingPrice = totalPrice.reduce(
          (sum, price) => sum + price,
          0
        );
        await BookingService.createBooking(
          rooms.map((room) => room.id),
          totalBookingPrice,
          totalGuests,
          new Date(checkInDate),
          new Date(checkOutDate),
          paymentMethod,
          session.payment_intent
        );
        const ownerAmount = (totalBookingPrice / 100) * 90;
        wallet.balance += ownerAmount;

        await wallet.save();

        return response.sendStatus(200);
      }

      return response.sendStatus(200);
    } catch (error) {
      next(error);
    }
  }
}
export default new StripeController();
