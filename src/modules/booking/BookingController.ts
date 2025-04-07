import BadRequestException from '@/common/exception/BadRequestException';
import { NextFunction, Request, Response } from 'express';
import { validationResult } from 'express-validator';
import BookingService from './BookingService';

class BookingController {
  async createBooking(req: Request, res: Response, next: NextFunction) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new BadRequestException(errors.array());
    }
    try {
      const { room, checkInDate, checkOutDate, paymentMethod } = req.body;

      const { paymentUrl } = await BookingService.createBookingSession(
        room,
        checkInDate,
        checkOutDate,
        paymentMethod
      );
      return res.status(200).json({
        msg: 'Create Success',
        data: { paymentUrl },
      });
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
  async getAllOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const bookings = await BookingService.getAllOrders();
      return res.status(200).json({
        msg: 'Orders retrieved successfully',
        data: bookings,
      });
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
  async removeAllOrders(req: Request, res: Response, next: NextFunction) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new BadRequestException(errors.array());
    }
    try {
      await BookingService.removeAll();
      return res.status(200).json({ msg: 'remove all succees' });
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
}
export default new BookingController();
