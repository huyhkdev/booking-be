import { NextFunction, Request, Response } from 'express';
import HotelsService from './HotelsService';
import { validationResult } from 'express-validator';
import BadRequestException from '@/common/exception/BadRequestException';
import { IHotel } from '@/databases/entities/Hotel';
import { RequestCustom, ResponseCustom } from '@/common/interfaces/express';
import { HttpStatusCode } from '@/common/constants';
import { getCoordinates } from '@/common/utils/getCoordinate';

class HotelsController {
  async findAllHotel(req: Request, res: Response, next: NextFunction) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new BadRequestException(errors.array());
    }
    try {
      const hotelAll = await HotelsService.findAllHotels();
      return res.status(200).json({
        msg: 'Find All Hotels Success',
        data: hotelAll,
      });
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
  async findAllHotelByCity(req: Request, res: Response, next: NextFunction) {
    try {
      const { city } = req.body;
      const hotel = await HotelsService.findAllHotelByCity(city);
      return res.status(200).json({
        msg: 'Tìm kiếm khách sạn theo thành phố thành công',
        data: hotel,
      });
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
  async findHotelById(req: Request, res: Response, next: NextFunction) {
    try {
      const { hotelId } = req.params;
      const { checkInDate,checkOutDate } = req.query;
      const hotels = await HotelsService.findHotelById(
        hotelId,
        checkInDate as string,
        checkOutDate as string
      );
      return res.status(200).json({
        msg: 'Tìm kiếm khách sạn thành công',
        data: hotels,
      });
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
  async findHotelByHotelIdOwner(
    req: RequestCustom,
    res: ResponseCustom,
    next: NextFunction
  ) {
    try {
      const { uid } = req.userInfo;
      const { hotelId } = req.params;
      const hotel = await HotelsService.findHotelByHotelIdOwner(uid, hotelId);
      return res.status(HttpStatusCode.OK).json({
        httpStatusCode: HttpStatusCode.OK,
        data: hotel,
      });
    } catch (error) {
      console.log(error);
      next(error);
    }
  }

  async findHotelsByIdOwner(
    req: RequestCustom,
    res: ResponseCustom,
    next: NextFunction
  ) {
    try {
      const { uid } = req.userInfo;
      const hotels = await HotelsService.findHotelsByOwnerId(uid);
      return res.status(HttpStatusCode.OK).json({
        httpStatusCode: HttpStatusCode.OK,
        data: hotels,
      });
    } catch (error) {
      console.log(error);
      next(error);
    }
  }

  async createHotel(
    req: RequestCustom,
    res: ResponseCustom,
    next: NextFunction
  ) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new BadRequestException(errors.array());
    }
    try {
      const hotelData: IHotel = req.body;
      const files = req.files;
      const { uid } = req.userInfo;
      const { latitude, longitude } = await getCoordinates(req.body.mapLink);
      const imagePaths = Array.isArray(files)
        ? files.map((file: Express.Multer.File) => file.path)
        : [];
        hotelData.latitude = latitude.toString()
        hotelData.longitude = longitude.toString()
      const newHotel = await HotelsService.createHotel(
        uid,
        hotelData,
        imagePaths
      );
      return res.status(HttpStatusCode.OK).json({
        httpStatusCode: HttpStatusCode.OK,
        data: newHotel,
      });
    } catch (error) {
      console.log(error);
      next(error);
    }
  }

  async updateHotel(
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
      const { hotelId } = req.params;
      const updateData: Partial<IHotel> = req.body;
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

      const updatedHotel = await HotelsService.updateHotel(
        uid,
        hotelId,
        updateData
      );
      return res.status(HttpStatusCode.OK).json({
        httpStatusCode: HttpStatusCode.OK,
        data: updatedHotel,
      });
    } catch (error) {
      console.log(error);
      next(error);
    }
  }

  async deleteHotel(
    req: RequestCustom,
    res: ResponseCustom,
    next: NextFunction
  ) {
    try {
      const { uid } = req.userInfo;
      const { hotelId } = req.params;
      const deletedHotel = await HotelsService.deleteHotel(uid, hotelId);
      return res.status(HttpStatusCode.OK).json({
        httpStatusCode: HttpStatusCode.OK,
        data: deletedHotel,
      });
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
}
export default new HotelsController();
