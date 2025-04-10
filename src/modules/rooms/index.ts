import { Router } from 'express';
import RoomController from './RoomController';
import { findAvailableRooms } from '@/middlewares/userBodyMiddlewares';
const RoomRouter = Router();

RoomRouter.get(
  '/findAll',
  findAvailableRooms,
  RoomController.findAvailableRooms
);

RoomRouter.post('/', RoomController.createRoom);
RoomRouter.put('/:roomId', RoomController.updateRoom);
RoomRouter.delete('/:roomId', RoomController.deleteRoom);

export default RoomRouter;
