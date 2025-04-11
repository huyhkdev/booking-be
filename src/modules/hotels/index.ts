import { Router } from 'express';
import HotelsController from './HotelsController';
import { authMiddleware, ownerMiddleware } from '@/common/middlewares';
import uploadCloud from '@/utils/upload';
const HotelsRouter = Router();

HotelsRouter.get('/all', HotelsController.findAllHotel);
HotelsRouter.get('/city', HotelsController.findAllHotelByCity);
HotelsRouter.get('/:hotelId', HotelsController.findHotelById);
HotelsRouter.get(
  '/owner/:hotelId',
  authMiddleware,
  ownerMiddleware,
  HotelsController.findHotelByHotelIdOwner
);
HotelsRouter.get(
  '/',
  authMiddleware,
  ownerMiddleware,
  HotelsController.findHotelsByIdOwner
);
HotelsRouter.post(
  '/',
  authMiddleware,
  ownerMiddleware,
  uploadCloud.array('images'),
  HotelsController.createHotel
);
HotelsRouter.put(
  '/:hotelId',
  authMiddleware,
  ownerMiddleware,
  uploadCloud.array('images'),
  HotelsController.updateHotel
);
HotelsRouter.delete(
  '/:hotelId',
  authMiddleware,
  ownerMiddleware,
  HotelsController.deleteHotel
);
export default HotelsRouter;
