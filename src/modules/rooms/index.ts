import { Router } from 'express';
import RoomController from './RoomController';
import { findAvailableRooms } from '@/middlewares/userBodyMiddlewares';
import { authMiddleware, ownerMiddleware } from '@/common/middlewares';
import uploadCloud from '@/utils/upload';
const RoomRouter = Router();

RoomRouter.get(
  '/findAll',
  findAvailableRooms,
  RoomController.findAvailableRooms
);

RoomRouter.delete(
  '/owner/:roomId',
  authMiddleware,
  ownerMiddleware,
  RoomController.deleteRoom
);

RoomRouter.post(
  '/owner',
  authMiddleware,
  ownerMiddleware,
  uploadCloud.array('images'),
  RoomController.createRoom
);

RoomRouter.put(
  '/owner/:roomId',
  authMiddleware,
  ownerMiddleware,
  uploadCloud.array('images'),
  RoomController.updateRoom
);

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
