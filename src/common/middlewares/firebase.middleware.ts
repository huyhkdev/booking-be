import admin from "@/firebase/config";
import { NextFunction } from "express";
import { RequestCustom, ResponseCustom } from "../interfaces/express";
import UnauthorizedExeption from "../exception/UnauthorizedExeption";
import ErrorCode from "../constants/errorCode";
export const firebaseMiddleware = async (req: RequestCustom, res: ResponseCustom, next: NextFunction) => {
  const accessToken = req.headers.authorization?.split(" ")[1];
  if (!accessToken) {
    throw new UnauthorizedExeption({
      errorMessage: 'Invalid authorization header',
      errorCode: ErrorCode.UNAUTHORIZED,
    });
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(accessToken);
    req.data = decodedToken; // Attach user info to request object
    next();
  } catch (error) {
    throw new UnauthorizedExeption({
      errorCode: ErrorCode.VERIFY_FAILED,
      errorMessage: "Invalid token",
    });
  }
};
