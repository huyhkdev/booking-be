import { adminRouter } from '@/modules/admin';
import chatRouter from '@/modules/ai';
import BookingRouter from '@/modules/booking';
import HotelsRouter from '@/modules/hotels';
import OwnerRouter from '@/modules/owner';
import ReviewRouter from '@/modules/reviews';
import RoomRouter from '@/modules/rooms';
import UserRouter from '@/modules/user';
import ChatbotRouter from '@/modules/chatbot';
import Router from 'express';
const router = Router();

router.use('/room', RoomRouter);    
router.use('/hotels', HotelsRouter);
router.use('/booking', BookingRouter);
router.use('/user', UserRouter);
router.use('/review', ReviewRouter);
router.use('/owner', OwnerRouter);
router.use('/admin', adminRouter);
router.use('/ai', chatRouter);
router.use('/chatbot', ChatbotRouter);


export default router;
