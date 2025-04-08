import { Router } from 'express';
import HotelsController from './HotelsController';
const HotelsRouter = Router();

HotelsRouter.get('/all', HotelsController.findAllHotel);
HotelsRouter.get('/city', HotelsController.findAllHotelByCity);
HotelsRouter.get('/:hotelId', HotelsController.findHotelById);
HotelsRouter.post('/', HotelsController.createHotel);
HotelsRouter.put('/:hotelId', HotelsController.updateHotel);
HotelsRouter.delete('/:hotelId', HotelsController.deleteHotel);
export default HotelsRouter;
