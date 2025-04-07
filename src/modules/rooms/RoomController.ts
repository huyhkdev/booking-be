import { NextFunction, Request, Response } from 'express';
import RoomService from './RoomService';
import 'express-async-errors';
import { validationResult } from 'express-validator';
import BadRequestException from '@/common/exception/BadRequestException';
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
}
export default new RoomController();
