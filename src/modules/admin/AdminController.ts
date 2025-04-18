import { HttpStatusCode } from '@/common/constants';
import { RequestCustom, ResponseCustom } from '@/common/interfaces/express';
import { NextFunction } from 'express';
import AdminService from './AdminService';
import { validationResult } from 'express-validator';
import BadRequestException from '@/common/exception/BadRequestException';

class AdminController {
  async login(
    request: RequestCustom,
    response: ResponseCustom,
    next: NextFunction
  ) {
    try {
      const { email, password } = request.body;
      const error = validationResult(request);
      if (!error.isEmpty()) throw new BadRequestException(error.array());
      const { accessToken, refreshToken, user } = await AdminService.login(
        email,
        password
      );
      return response.status(HttpStatusCode.OK).json({
        httpStatusCode: HttpStatusCode.OK,
        data: { accessToken, refreshToken, user },
      });
    } catch (error) {
      next(error);
    }
  }

  async acceptRequest(
    req: RequestCustom,
    res: ResponseCustom,
    next: NextFunction
  ) {
    const { requestId } = req.params;
    console.log(requestId);
    try {
      await AdminService.acceptExpertRequest(requestId);
      return res.status(200).json({
        httpStatusCode: HttpStatusCode.OK,
      });
    } catch (error) {
      console.log(error);
      next(error);
    }
  }

  // User Management
  async getAllUsers(
    req: RequestCustom,
    res: ResponseCustom,
    next: NextFunction
  ) {
    try {
      const users = await AdminService.getAllUsers();
      return res.status(200).json({
        httpStatusCode: HttpStatusCode.OK,
        data: users,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateUserStatus(
    req: RequestCustom,
    res: ResponseCustom,
    next: NextFunction
  ) {
    const { userId } = req.params;
    const { role } = req.body;
    try {
      await AdminService.updateUserStatus(userId, role);
      return res.status(200).json({
        httpStatusCode: HttpStatusCode.OK,
      });
    } catch (error) {
      next(error);
    }
  }

  // Hotel Management
  async getAllHotels(
    req: RequestCustom,
    res: ResponseCustom,
    next: NextFunction
  ) {
    try {
      const hotels = await AdminService.getAllHotels();
      return res.status(200).json({
        httpStatusCode: HttpStatusCode.OK,
        data: hotels,
      });
    } catch (error) {
      next(error);
    }
  }

  // async updateHotelStatus(req: RequestCustom, res: ResponseCustom, next: NextFunction) {
  //     const { hotelId } = req.params;
  //     const { status } = req.body;
  //     try {
  //         await AdminService.updateHotelStatus(hotelId, status);
  //         return res.status(200).json({
  //             httpStatusCode: HttpStatusCode.OK,
  //         });
  //     } catch (error) {
  //         next(error);
  //     }
  // }

  // Booking Management
  async getAllBookings(
    req: RequestCustom,
    res: ResponseCustom,
    next: NextFunction
  ) {
    try {
      const bookings = await AdminService.getAllBookings();
      return res.status(200).json({
        httpStatusCode: HttpStatusCode.OK,
        data: bookings,
      });
    } catch (error) {
      next(error);
    }
  }

  // Review Management
  async getAllReviews(
    req: RequestCustom,
    res: ResponseCustom,
    next: NextFunction
  ) {
    try {
      const reviews = await AdminService.getAllReviews();
      return res.status(200).json({
        httpStatusCode: HttpStatusCode.OK,
        data: reviews,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteReview(
    req: RequestCustom,
    res: ResponseCustom,
    next: NextFunction
  ) {
    const { reviewId } = req.params;
    try {
      await AdminService.deleteReview(reviewId);
      return res.status(200).json({
        httpStatusCode: HttpStatusCode.OK,
      });
    } catch (error) {
      next(error);
    }
  }

  // System Statistics
  async getSystemStats(
    req: RequestCustom,
    res: ResponseCustom,
    next: NextFunction
  ) {
    try {
      const stats = await AdminService.getSystemStats();
      return res.status(200).json({
        httpStatusCode: HttpStatusCode.OK,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }
  // admin method
  async blockUsers(
    request: RequestCustom,
    response: ResponseCustom,
    next: NextFunction
  ) {
    try {
      const { uids } = request.body;
      await AdminService.blockUsers(uids);
      return response
        .status(HttpStatusCode.OK)
        .json({ httpStatusCode: HttpStatusCode.OK, data: 'Blocked users successfully' });
    } catch (error) {
      next(error);
    }
  }

  async unblockUsers(
    request: RequestCustom,
    response: ResponseCustom,
    next: NextFunction
  ) {
    try {
      const { uids } = request.body;
      await AdminService.unblockUsers(uids);
      return response
        .status(HttpStatusCode.OK)
        .json({ httpStatusCode: HttpStatusCode.OK });
    } catch (error) {
      next(error);
    }
  }

  // Owner Request Management
  async getAllOwnerRequests(req: RequestCustom, res: ResponseCustom, next: NextFunction) {
    try {
      const requests = await AdminService.getAllOwnerRequests();
      return res.status(HttpStatusCode.OK).json({
        httpStatusCode: HttpStatusCode.OK,
        data: requests
      });
    } catch (error) {
      next(error);
    }
  }

  async getOwnerRequestById(req: RequestCustom, res: ResponseCustom, next: NextFunction) {
    const { requestId } = req.params;
    try {
      const request = await AdminService.getOwnerRequestById(requestId);
      return res.status(HttpStatusCode.OK).json({
        httpStatusCode: HttpStatusCode.OK,
        data: request
      });
    } catch (error) {
      next(error);
    }
  }

  // Owner Management
  async getAllOwners(req: RequestCustom, res: ResponseCustom, next: NextFunction) {
    try {
      const owners = await AdminService.getAllOwners();
      return res.status(HttpStatusCode.OK).json({
        httpStatusCode: HttpStatusCode.OK,
        data: owners
      });
    } catch (error) {
      next(error);
    }
  }

  async getOwnerById(req: RequestCustom, res: ResponseCustom, next: NextFunction) {
    const { ownerId } = req.params;
    try {
      const owner = await AdminService.getOwnerById(ownerId);
      return res.status(HttpStatusCode.OK).json({
        httpStatusCode: HttpStatusCode.OK,
        data: owner
      });
    } catch (error) {
      next(error);
    }
  }
}

export const adminController = new AdminController();
