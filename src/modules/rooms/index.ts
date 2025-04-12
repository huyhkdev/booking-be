import { Router } from 'express';
import RoomController from './RoomController';
import { findAvailableRooms } from '@/middlewares/userBodyMiddlewares';
import { authMiddleware, ownerMiddleware } from '@/common/middlewares';
const RoomRouter = Router();

RoomRouter.get(
  '/findAll',
  findAvailableRooms,
  RoomController.findAvailableRooms
);

RoomRouter.post(
  '/',
  authMiddleware,
  ownerMiddleware,
  RoomController.createRoom
);
RoomRouter.put(
  '/:roomId',
  authMiddleware,
  ownerMiddleware,
  RoomController.updateRoom
);
RoomRouter.delete('/:roomId', RoomController.deleteRoom);

RoomRouter.get(
  '/owner/:roomId',
  authMiddleware,
  ownerMiddleware,
  RoomController.findRoomByRoomIdOwner
);

RoomRouter.get(
  '/owner/hotel/:hotelId',
  authMiddleware,
  ownerMiddleware,
  RoomController.findRoomsByHotelOwner
);

export default RoomRouter;
