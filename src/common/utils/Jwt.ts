import jwt from "jsonwebtoken";
import { UserInfo } from "../interfaces/express";
import BadRequestException from "../exception/BadRequestException";
import ErrorCode from "../constants/errorCode";
import config from "../config/config";
class JwtHandler {
  generateAccessToken(uid: string, role: string) {
    const accessToken = jwt.sign(
      {
        uid,
        role
      },
      config.JWTKey,
      { expiresIn: '1h' }
    );

    return accessToken;
  }

  verifyAccessToken(accessToken: string) {
    const payload = jwt.verify(accessToken, config.JWTKey);
    return payload as UserInfo
  }

  generateRefreshToken(uid: string) {
    const refreshToken = jwt.sign(
      {
        uid
      },
      config.JWTRefreshKey,
      { expiresIn: '365d' }
    );

    return refreshToken;
  }



  verifyRefreshToken(refreshToken: string) {
    const payload = jwt.verify(refreshToken, config.JWTRefreshKey);
    return (payload as { uid: string }).uid;
  }

  generateVerifyEmailToken(email: string) {
    const emailToken = jwt.sign(
      {
        email
      },
      config.JWTKey,
      { expiresIn: '5m' }
    );

    return emailToken;
  }

  verifyEmailToken(emailToken: string) {
    try {
      return jwt.verify(emailToken, config.JWTKey) as { email: string };
    } catch (error: any) {
      throw new BadRequestException({
        errorCode: ErrorCode.VERIFY_FAILED,
        errorMessage: "Your session is invalid or expired",
      });
    }
  }

}
export default new JwtHandler()