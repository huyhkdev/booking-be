import { Router } from 'express';
import HotelsController from './HotelsController';
import { authMiddleware, ownerMiddleware } from '@/common/middlewares';
const HotelsRouter = Router();

HotelsRouter.get('/all', HotelsController.findAllHotel);
HotelsRouter.get('/city', HotelsController.findAllHotelByCity);
HotelsRouter.get('/:hotelId', HotelsController.findHotelById);
HotelsRouter.post(
  '/',
  authMiddleware,
  ownerMiddleware,
  HotelsController.createHotel
);
HotelsRouter.put(
  '/:hotelId',
  authMiddleware,
  ownerMiddleware,
  HotelsController.updateHotel
);
HotelsRouter.delete(
  '/:hotelId',
  authMiddleware,
  ownerMiddleware,
  HotelsController.deleteHotel
);
export default HotelsRouter;
