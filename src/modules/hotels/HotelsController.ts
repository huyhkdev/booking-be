import { NextFunction, Request, Response } from 'express';
import HotelsService from './HotelsService';
import { validationResult } from 'express-validator';
import BadRequestException from '@/common/exception/BadRequestException';
import { IHotel } from '@/databases/entities/Hotel';

class HotelsController {
  async findAllHotel(req: Request, res: Response, next: NextFunction) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new BadRequestException(errors.array());
    }
    try {
      const hotelAll = await HotelsService.findAllHotels();
      return res.status(200).json({
        msg: 'Find All Hotels Succes',
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
        msg: 'Find Hotel By City Success',
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
      const {
        checkInDate,
      } = req.query;
      const hotels = await HotelsService.findHotelById(hotelId, checkInDate as string);
      return res.status(200).json({
        msg: 'Find Hotel By Id Success',
        data: hotels,
      });
    } catch (error) {
      console.log(error);
      next(error);
    }
  }

  async createHotel(req: Request, res: Response, next: NextFunction) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new BadRequestException(errors.array());
    }
    try {
      const hotelData: IHotel = req.body;
      const newHotel = await HotelsService.createHotel(hotelData);
      return res.status(201).json({
        msg: 'Create Hotel Success',
        data: newHotel,
      });
    } catch (error) {
      console.log(error);
      next(error);
    }
  }

  async updateHotel(req: Request, res: Response, next: NextFunction) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new BadRequestException(errors.array());
    }
    try {
      const { hotelId } = req.params;
      const updateData: Partial<IHotel> = req.body;
      const updatedHotel = await HotelsService.updateHotel(hotelId, updateData);
      return res.status(200).json({
        msg: 'Update Hotel Success',
        data: updatedHotel,
      });
    } catch (error) {
      console.log(error);
      next(error);
    }
  }

  async deleteHotel(req: Request, res: Response, next: NextFunction) {
    try {
      const { hotelId } = req.params;
      const deletedHotel = await HotelsService.deleteHotel(hotelId);
      return res.status(200).json({
        msg: 'Delete Hotel Success',
        data: deletedHotel,
      });
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
}
export default new HotelsController();
