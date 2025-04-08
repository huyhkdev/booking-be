import { NextFunction, Request, Response } from 'express';
import RoomService from './RoomService';
import 'express-async-errors';
import { validationResult } from 'express-validator';
import BadRequestException from '@/common/exception/BadRequestException';
import { IRoom } from '@/databases/entities/Room';
import HotelsService from '../hotels/HotelsService';
class RoomController {
  async findAvailableRooms(req: Request, res: Response, next: NextFunction) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new BadRequestException(errors.array());
    }
    try {
      const {
        checkInDate,
        checkOutDate,
        city,
        capacity,
        room,
        limit,
        maxPrice,
        minPrice,
        rating,
        roomType,
        amenities,
      } = req.query;
      const rooms = await RoomService.findAvailableRooms(
        checkInDate as string,
        checkOutDate as string,
        city as string,
        Number(capacity),
        Number(room),
        Number(limit),
        1,
        Number(maxPrice),
        Number(minPrice),
        rating as string[],
        roomType as string,
        amenities as string[]
      );
      return res.status(200).json({
        msg: 'Find Rooms Success',
        ...rooms,
      });
    } catch (error) {
      console.error(error);
      next(error);
    }
  }

  async createRoom(req: Request, res: Response, next: NextFunction) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new BadRequestException(errors.array());
    }
    try {
      const roomData = req.body;

      const hotel = await HotelsService.findHotelByIdOwner(roomData.hotel);
      if (!hotel) {
        return res.status(404).json({
          msg: 'Hotel not found',
        });
      }

      const newRoom = await RoomService.createRoom(roomData);

      return res.status(201).json({
        msg: 'Create Room Success',
        data: newRoom,
      });
    } catch (error) {
      console.log(error);
      next(error);
    }
  }

  async updateRoom(req: Request, res: Response, next: NextFunction) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new BadRequestException(errors.array());
    }
    try {
      const { roomId } = req.params;
      const updateData: Partial<IRoom> = req.body;
      const updatedRoom = await RoomService.updateRoom(roomId, updateData);
      return res.status(200).json({
        msg: 'Update Room Success',
        data: updatedRoom,
      });
    } catch (error) {
      console.log(error);
      next(error);
    }
  }

  async deleteRoom(req: Request, res: Response, next: NextFunction) {
    try {
      const { roomId } = req.params;
      const deletedRoom = await RoomService.deleteRoom(roomId);
      return res.status(200).json({
        msg: 'Delete Room Success',
        data: deletedRoom,
      });
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
  async findRoomsByHotel(req: Request, res: Response, next: NextFunction) {
    try {
      const { hotelId } = req.params;
      const rooms = await RoomService.findRoomsByHotel(hotelId);
      return res.status(200).json({
        msg: 'Find Rooms By Hotel Success',
        data: rooms,
      });
    } catch (error) {
      console.log(error);
      next(error);
    }
  }

  async findRoomById(req: Request, res: Response, next: NextFunction) {
    try {
      const { roomId } = req.params;
      const room = await RoomService.findRoomById(roomId);
      return res.status(200).json({
        msg: 'Find Room By Id Success',
        data: room,
      });
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
}
export default new RoomController();
