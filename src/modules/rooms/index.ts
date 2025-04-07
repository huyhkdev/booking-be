import { Router } from 'express';
import RoomController from './RoomController';
import { findAvailableRooms } from '@/middlewares/userBodyMiddlewares';
const RoomRouter = Router();

RoomRouter.get(
  '/findAll',
  findAvailableRooms,
  RoomController.findAvailableRooms
);

export default RoomRouter;
