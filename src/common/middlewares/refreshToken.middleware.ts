import { Request, NextFunction, Response } from "express";
import Jwt from "../utils/Jwt";
import "express-async-errors";
import UnauthorizedExeption from "../exception/UnauthorizedExeption";
import { RequestCustom, ResponseCustom } from "../interfaces/express";
import ErrorCode from "../constants/errorCode";
export const refreshTokenMiddleware = async (
    req: RequestCustom,
    _: ResponseCustom,
    next: NextFunction
) => {
    const refreshToken = req.headers['authorization']?.split(' ')[1];
    if (!refreshToken) {
        throw new UnauthorizedExeption({
            errorMessage: "You need to login before",
            errorCode: ErrorCode.UNAUTHORIZED,
        });
    }
    try {
        const payload = Jwt.verifyRefreshToken(refreshToken);
        req.data = payload;
        next();
    } catch (error: any) {
        if (error.name === "TokenExpiredError") {
            throw new UnauthorizedExeption({
                errorCode: ErrorCode.TOKEN_EXPIRED,
                errorMessage: "Token was expired",
            });
        }
        throw new UnauthorizedExeption({
            errorCode: ErrorCode.VERIFY_FAILED,
            errorMessage: "Invalid token",
        });
    }
};
