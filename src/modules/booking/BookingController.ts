import BadRequestException from '@/common/exception/BadRequestException';
import { NextFunction, Request, Response } from 'express';
import { validationResult } from 'express-validator';
import BookingService from './BookingService';
import { RequestCustom, ResponseCustom } from '@/common/interfaces/express';
import { HttpStatusCode } from '@/common/constants';

class BookingController {
  async createBooking(req: RequestCustom, res: ResponseCustom, next: NextFunction) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new BadRequestException(errors.array());
    }
    const {uid} = req.userInfo;
    try {
      const { room, checkInDate, checkOutDate, paymentMethod, capacity } = req.body;
      const { paymentUrl } = await BookingService.createBookingSession(
        room,
        checkInDate,
        checkOutDate,
        paymentMethod,
        uid,
        capacity,
      );
      return res.status(200).json({
        httpStatusCode: HttpStatusCode.OK,
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
      return res.status(200).json({ msg: 'Xóa tất cả đơn hàng thành công' });
    } catch (error) {
      console.log(error);
      next(error);
    }
  }


  async getBookingByUid(req: RequestCustom, res: ResponseCustom, next: NextFunction) {

    const { uid } = req.userInfo;
    try {
      const data = await BookingService.getBookingByUid(uid);
      return res.status(200).json({ httpStatusCode: HttpStatusCode.OK, data });
    } catch (error) {
      console.log(error);
      next(error);
    }
  }

  async getBookingsByHotelId(req: RequestCustom, res: ResponseCustom, next: NextFunction) {
    try {
      const { hotelId } = req.params;
      const { uid } = req.userInfo;
      const data = await BookingService.getBookingsByHotelId(hotelId, uid);
      return res.status(200).json({
        httpStatusCode: HttpStatusCode.OK,
        data
      });
    } catch (error) {
      console.log(error);
      next(error);
    }
  }

  async getTotalRevenue(req: RequestCustom, res: ResponseCustom, next: NextFunction) {
    try {
      const { uid } = req.userInfo;
      const data = await BookingService.getTotalRevenueByOwner(uid);
      return res.status(200).json({
        httpStatusCode: HttpStatusCode.OK,
        data
      });
    } catch (error) {
      console.log(error);
      next(error);
    }
  }

  async getRevenueStatistics(req: RequestCustom, res: ResponseCustom, next: NextFunction) {
    try {
      const { uid } = req.userInfo;
      const data = await BookingService.getRevenueStatisticsByOwner(uid);
      return res.status(200).json({
        httpStatusCode: HttpStatusCode.OK,
        data
      });
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
}
export default new BookingController();
