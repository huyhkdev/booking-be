import { Router } from 'express';
import BookingController from './BookingController';
const BookingRouter = Router();

BookingRouter.post('/createOrder', BookingController.createBooking);
BookingRouter.get('/allOrder', BookingController.getAllOrders);
BookingRouter.delete('/removeAll', BookingController.removeAllOrders);
export default BookingRouter;
