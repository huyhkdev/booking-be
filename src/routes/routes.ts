import BookingRouter from '@/modules/booking';
import HotelsRouter from '@/modules/hotels';
import { ReviewRouter } from '@/modules/reviews';
import RoomRouter from '@/modules/rooms';
import UserRouter from '@/modules/user';
import Router from 'express';
const router = Router();

router.use('/room', RoomRouter);
router.use('/hotels', HotelsRouter);
router.use('/booking', BookingRouter);
router.use('/user', UserRouter);
router.use('/review', ReviewRouter);
export default router;
