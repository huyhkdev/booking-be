import { NextFunction } from "express";

import { RequestCustom, ResponseCustom } from "../interfaces/express";
import ForbiddenException from "../exception/ForbiddenException";
import ErrorCode from "../constants/errorCode";
export const ownerMiddleware = async (
  req: RequestCustom,
  _: ResponseCustom,
  next: NextFunction
) => {
  if (req.userInfo.role === "owner") {
    return next();
  }
  throw new ForbiddenException({ errorCode: ErrorCode.ADMIN_ISNT, errorMessage: "Permission Error" })

};
