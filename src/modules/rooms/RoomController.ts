import { NextFunction, Request, Response } from 'express';
import RoomService from './RoomService';
import 'express-async-errors';
import { validationResult } from 'express-validator';
import BadRequestException from '@/common/exception/BadRequestException';
import { IRoom, IRoomCreate } from '@/databases/entities/Room';
import HotelsService from '../hotels/HotelsService';
import { RequestCustom, ResponseCustom } from '@/common/interfaces/express';
import { HttpStatusCode } from '@/common/constants';
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
        msg: 'Tìm kiếm phòng thành công',
        ...rooms,
      });
    } catch (error) {
      console.error(error);
      next(error);
    }
  }

  async createRoom(
    req: RequestCustom,
    res: ResponseCustom,
    next: NextFunction
  ) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new BadRequestException(errors.array());
    }
    try {
      const { uid } = req.userInfo;
      const roomData: IRoomCreate = req.body;
      const files = req.files;
      const imagePaths = Array.isArray(files)
        ? files.map((file: Express.Multer.File) => file.path)
        : [];

      const hotel = await HotelsService.findHotelByHotelIdOwner(
        uid,
        roomData.hotel
      );
      if (!hotel) {
        return res.status(HttpStatusCode.NOT_FOUND).json({
          httpStatusCode: HttpStatusCode.NOT_FOUND,
          data: 'Không tìm thấy khách sạn',
        });
      }
      const newRoom = await RoomService.createRoom(roomData, imagePaths);

      return res.status(HttpStatusCode.CREATED).json({
        httpStatusCode: HttpStatusCode.CREATED,
        data: newRoom,
      });
    } catch (error) {
      console.log(error);
      next(error);
    }
  }

  async updateRoom(
    req: RequestCustom,
    res: ResponseCustom,
    next: NextFunction
  ) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new BadRequestException(errors.array());
    }
    try {
      const { roomId } = req.params;
      const { uid } = req.userInfo;
      const updateData: Partial<IRoom> = req.body;
      const oldImages: string[] = req.body.oldImages
        ? JSON.parse(req.body.oldImages)
        : [];

      const files = req.files as Express.Multer.File[];

      const newImagePaths = files?.map((file) => file.path) ?? [];

      if (oldImages.length && Array.isArray(oldImages)) {
        updateData.images = [...oldImages, ...newImagePaths];
      } else if (updateData.images) {
        updateData.images = [...updateData.images, ...newImagePaths];
      } else {
        updateData.images = newImagePaths;
      }

      const updatedRoom = await RoomService.updateRoom(roomId, uid, updateData);
      return res.status(HttpStatusCode.OK).json({
        httpStatusCode: HttpStatusCode.OK,
        data: updatedRoom,
      });
    } catch (error) {
      console.log(error);
      next(error);
    }
  }

  async deleteRoom(
    req: RequestCustom,
    res: ResponseCustom,
    next: NextFunction
  ) {
    try {
      const { roomId } = req.params;
      const { uid } = req.userInfo;
      const deletedRoom = await RoomService.deleteRoom(uid, roomId);
      return res.status(HttpStatusCode.OK).json({
        httpStatusCode: HttpStatusCode.OK,
        data: deletedRoom,
      });
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
  async findRoomByRoomIdOwner(
    req: RequestCustom,
    res: ResponseCustom,
    next: NextFunction
  ) {
    try {
      const { uid } = req.userInfo;
      const { roomId } = req.params;
      const room = await RoomService.findRoomByRoomIdOwner(uid, roomId);
      return res.status(HttpStatusCode.OK).json({
        httpStatusCode: HttpStatusCode.OK,
        data: room,
      });
    } catch (error) {
      console.log(error);
      next(error);
    }
  }

  async findRoomsByHotelOwner(
    req: RequestCustom,
    res: ResponseCustom,
    next: NextFunction
  ) {
    try {
      const { uid } = req.userInfo;
      const { hotelId } = req.params;
      const rooms = await RoomService.findRoomsByHotelOwner(uid, hotelId);
      return res.status(HttpStatusCode.OK).json({
        httpStatusCode: HttpStatusCode.OK,
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
        msg: 'Tìm kiếm phòng thành công',
        data: room,
      });
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
}
export default new RoomController();
