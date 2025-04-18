import { Router } from 'express';
import BookingController from './BookingController';
import { authMiddleware } from '@/common/middlewares';
const BookingRouter = Router();

BookingRouter.post('/createOrder', authMiddleware,  BookingController.createBooking);
BookingRouter.get('/allOrder', BookingController.getAllOrders);
BookingRouter.delete('/removeAll', BookingController.removeAllOrders);
BookingRouter.delete('/removeAll', BookingController.removeAllOrders);
BookingRouter.get('/user-bookings',authMiddleware,  BookingController.getBookingByUid);
BookingRouter.get('/hotel/:hotelId', authMiddleware, BookingController.getBookingsByHotelId);
BookingRouter.get('/revenue', authMiddleware, BookingController.getTotalRevenue);
BookingRouter.get('/statistics', authMiddleware, BookingController.getRevenueStatistics);
export default BookingRouter;
