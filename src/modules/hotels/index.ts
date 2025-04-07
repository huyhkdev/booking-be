import { Router } from 'express';
import HotelsController from './HotelsController';
const HotelsRouter = Router();

HotelsRouter.get('/all', HotelsController.findAllHotel);
HotelsRouter.get('/city', HotelsController.findAllHotelByCity);
HotelsRouter.get('/:hotelId', HotelsController.findHotelById);
export default HotelsRouter;
