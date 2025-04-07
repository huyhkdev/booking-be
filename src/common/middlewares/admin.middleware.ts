import { Request, NextFunction, Response } from "express";

import { RequestCustom, ResponseCustom } from "../interfaces/express";
import ForbiddenException from "../exception/ForbiddenException";
import ErrorCode from "../constants/errorCode";
export const adminMiddleware = async (
  req: RequestCustom,
  _: ResponseCustom,
  next: NextFunction
) => {
  if (req.userInfo.role === "admin") {
    return next();
  }
  throw new ForbiddenException({ errorCode: ErrorCode.ADMIN_ISNT, errorMessage: "Permission Error" })

};
