import { HttpStatusCode } from '@/common/constants';
import { NextFunction } from 'express';
import { RequestCustom, ResponseCustom } from '@/common/interfaces/express';
import ownerService from './owner.service';

class OwnerController {
  async ownerRegister(
    request: RequestCustom,
    response: ResponseCustom,
    next: NextFunction
  ) {
    try {
      const cvPath = request.file?.path as string;
      const { uid } = request.userInfo;
      await ownerService.ownerRegister(uid, cvPath);
      return response
        .status(HttpStatusCode.OK)
        .json({ httpStatusCode: HttpStatusCode.OK });
    } catch (error) {
      next(error);
    }
  }


  async withdrawMoney(
    request: RequestCustom,
    response: ResponseCustom,
    next: NextFunction
  ) {
    try {
      const { amount } = request.body;
      const { uid } = request.userInfo;
      await ownerService.withdrawMoney(uid, amount);
      return response
        .status(HttpStatusCode.OK)
        .json({ httpStatusCode: HttpStatusCode.OK });
    } catch (error) {
      next(error);
    }
  }


  async getWallet(
    request: RequestCustom,
    response: ResponseCustom,
    next: NextFunction
  ) {
    try {
      const { uid } = request.userInfo;
      const data = await ownerService.getWallet(uid);
      return response.status(HttpStatusCode.OK).json({
        httpStatusCode: HttpStatusCode.OK,
        data
      });
    } catch (error) {
      next(error);
    }
  }

  async withdrawHistory(
    request: RequestCustom,
    response: ResponseCustom,
    next: NextFunction
  ) {
    try {
      const { uid } = request.userInfo;
      const data = await ownerService.withdrawHistory(uid);
      return response.status(HttpStatusCode.OK).json({
        httpStatusCode: HttpStatusCode.OK,
        data
      });
    } catch (error) {
      next(error);
    }
  }

  async findRequest(
    request: RequestCustom,
    response: ResponseCustom,
    next: NextFunction
  ) {
    try {
      const { uid } = request.userInfo;
      const infoRequest = await ownerService.findHotelOwnerRegisterById(uid);
      return response.status(HttpStatusCode.OK).json({
        httpStatusCode: HttpStatusCode.OK,
        data: { infoRequest },
      });
    } catch (error) {
      next(error);
    }
  }
}
export default new OwnerController();
