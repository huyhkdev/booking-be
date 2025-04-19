
import { validationResult } from "express-validator";
import { HttpStatusCode } from "@/common/constants";
import { NextFunction, Request } from "express";
import userService from "./user.service";
import BadRequestException from "@/common/exception/BadRequestException";
import { RequestCustom, ResponseCustom } from "@/common/interfaces/express";
import sendVerifyLink from "@/common/heplers/sendVerifyLink";
import Jwt from "@/common/utils/Jwt";
import ErrorCode from "@/common/constants/errorCode";
import config from "@/common/config/config";
import hashing from "@/common/utils/hashing";
import ServerInternalException from "@/common/exception/ServerInternalExeption";

class UserController {
  async register(
    request: Request,
    response: ResponseCustom,
    next: NextFunction
  ) {
    try {
      const errors = validationResult(request);
      if (!errors.isEmpty()) throw new BadRequestException(errors.array());
      const { fullName, email, password } = request.body;

      const user = await userService.register(
        fullName,
        email,
        password,
      );
      return sendVerifyLink(response, user.email, "verify");

    } catch (error) {
      next(error);
    }
  }

  async loginGoogle(
    request: RequestCustom,
    response: ResponseCustom,
    next: NextFunction
  ) {
    const { name, email, picture } = request.data as {
      name: string;
      email: string;
      picture: string;
    };
    try {
      const userExist = await userService.findUserByEmail(email);
      if (!userExist) {
        const user = await userService.createActiveUser(name, email, picture);
        return response.status(HttpStatusCode.OK).json({
          httpStatusCode: HttpStatusCode.OK,
          data: {
            accessToken: Jwt.generateAccessToken(user.id, user.role),
            refreshToken: Jwt.generateRefreshToken(user.id),
            user,
          },
        });
      }
      return response.status(HttpStatusCode.OK).json({
        httpStatusCode: HttpStatusCode.OK,
        data: {
          accessToken: Jwt.generateAccessToken(userExist.id, userExist.role),
          refreshToken: Jwt.generateRefreshToken(userExist.id),
          user: userExist,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async verifyEmail(
    request: Request,
    response: ResponseCustom,
    next: NextFunction
  ) {
    const { encryptEmail } = request.params;
    try {
      if (!encryptEmail) {
        throw new BadRequestException({
          errorCode: ErrorCode.FAILED_VALIDATE_BODY,
          errorMessage: 'Lỗi xác thực',
        });
      }
      await userService.verifyEmail(encryptEmail);
      console.log(config.verifyReturnUrl);
      response.redirect(config.verifyReturnUrl as string);
    } catch (error: any) {
      if (error.name === 'TokenExpiredError')
        console.log(config.verifyExpiredUrl);
      response.redirect(config.verifyExpiredUrl as string);
    }
  }
  async verifyEmailLink(
    request: Request,
    response: ResponseCustom,
    next: NextFunction
  ) {
    const { email } = request.body;
    console.log(email);
    try {
      if (!email) {
        throw new BadRequestException({
          errorCode: ErrorCode.FAILED_VALIDATE_BODY,
          errorMessage: 'Email là bắt buộc',
        });
      }
      const userExist = await userService.findUserByEmail(email);
      if (!userExist || userExist.state === 'active') {
        throw new BadRequestException({
          errorCode: ErrorCode.NOT_FOUND,
          errorMessage: 'Không tìm thấy người dùng chưa xác thực',
        });
      }
      sendVerifyLink(response, email, 'verify');
    } catch (error) {
      next(error);
    }
  }

  async login(request: Request, response: ResponseCustom, next: NextFunction) {
    try {
      const { email, password } = request.body;
      const error = validationResult(request);
      if (!error.isEmpty()) throw new BadRequestException(error.array());
      const { accessToken, refreshToken, user } = await userService.login(
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
  async userProfile(
    request: RequestCustom,
    response: ResponseCustom,
    next: NextFunction
  ) {
    const { uid } = request.userInfo;
    try {
      const user = await userService.findUserById(uid);
      if (!user)
        throw new BadRequestException({
          errorCode: ErrorCode.NOT_FOUND,
          errorMessage: 'Không tìm thấy người dùng',
        });

      const {
        email,
        fullName,
        role,
        state,
        dob,
        gender,
        avatarUrl,
      } = user;

      const data = {
        email,
        fullName,
        dob,
        gender,
        role,
        state,
        avatarUrl
      };
      return response
        .status(HttpStatusCode.OK)
        .json({ httpStatusCode: HttpStatusCode.OK, data });
    } catch (error) {
      next(error);
    }
  }

  async forgotPassword(
    request: Request,
    response: ResponseCustom,
    next: NextFunction
  ) {
    try {
      const error = validationResult(request);
      if (!error.isEmpty()) throw new BadRequestException(error.array());
      const { email } = request.body;
      const userExist = await userService.findUserByEmail(email);
      if (!userExist) {
        throw new BadRequestException({
          errorCode: ErrorCode.NOT_FOUND,
          errorMessage: 'Không tìm thấy người dùng',
        });
      }
      sendVerifyLink(
        response,
        email,
        'resetPassword',
        config.forgotPasswordReturnUrl
      );
    } catch (error) {
      next(error);
    }
  }

  async resetPassword(
    request: Request,
    response: ResponseCustom,
    next: NextFunction
  ) {
    try {
      const errors = validationResult(request);
      if (!errors.isEmpty()) throw new BadRequestException(errors.array());
      const { newPassword, resetToken } = request.body;
      const token = decodeURIComponent(resetToken);
      const { email } = Jwt.verifyEmailToken(token);
      userService.changePassword(email, newPassword);
      return response.status(HttpStatusCode.OK).json({
        httpStatusCode: HttpStatusCode.OK,
      });
    } catch (error: any) {
      if (error.name === 'TokenExpiredError') {
        return response.status(HttpStatusCode.BAD_REQUEST).json({
          httpStatusCode: HttpStatusCode.BAD_REQUEST,
          errors: [
            {
              errorCode: ErrorCode.TOKEN_EXPIRED,
              errorMessage: 'Token của bạn đã hết hạn',
            },
          ],
        });
      }
      next(error);
    }
  }

  async refreshToken(
    request: RequestCustom,
    response: ResponseCustom,
    next: NextFunction
  ) {
    const uid = request.data;
    try {
      const userExist = await userService.findUserById(uid);
      if (!userExist) {
        throw new BadRequestException({
          errorCode: ErrorCode.NOT_FOUND,
          errorMessage: 'Không tìm thấy người dùng',
        });
      }
      const accessToken = Jwt.generateAccessToken(userExist.id, userExist.role);
      return response
        .status(HttpStatusCode.OK)
        .json({ httpStatusCode: HttpStatusCode.OK, data: { accessToken } });
    } catch (error) {
      next(error);
    }
  }

  async changePassword(
    request: RequestCustom,
    response: ResponseCustom,
    next: NextFunction
  ) {
    try {
      const { oldPassword, newPassword } = request.body;
      const { uid } = request.userInfo;
      if (!newPassword) {
        throw new BadRequestException({
          errorCode: ErrorCode.FAILED_VALIDATE_BODY,
          errorMessage: 'Mật khẩu mới là bắt buộc',
        });
      }
      const userExist = await userService.findUserById(uid);
      if (!userExist) {
        throw new BadRequestException({
          errorCode: ErrorCode.NOT_FOUND,
          errorMessage: 'Không tìm thấy người dùng',
        });
      }
      const isPasswordMatch = await hashing.comparePassword(
        oldPassword,
        userExist.password
      );
      if (!isPasswordMatch) {
        throw new BadRequestException({
          errorCode: ErrorCode.NOT_FOUND,
          errorMessage: 'Mật khẩu cũ không đúng',
        });
      }

      userService.changePassword(userExist.email, newPassword);
      return response
        .status(HttpStatusCode.OK)
        .json({ httpStatusCode: HttpStatusCode.OK });
    } catch (error) {
      next(error);
    }
  }

  async toggleNotification(
    request: RequestCustom,
    response: ResponseCustom,
    next: NextFunction
  ) {
    try {
      const { uid } = request.userInfo;
      await userService.toggleNotification(uid);

      return response
        .status(HttpStatusCode.OK)
        .json({ httpStatusCode: HttpStatusCode.OK });
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(
    request: RequestCustom,
    response: ResponseCustom,
    next: NextFunction
  ) {
    try {
      const { uid } = request.userInfo;
      const data = await userService.updateUser(uid, request.body);
      return response
        .status(HttpStatusCode.OK)
        .json({ httpStatusCode: HttpStatusCode.OK, data });
    } catch (error) {
      next(error);
    }
  }


  async changeAvatar(
    request: RequestCustom,
    response: ResponseCustom,
    next: NextFunction
  ) {
    try {
      if (!request.file) {
        throw new ServerInternalException({ errorCode: ErrorCode.UPLOAD_ERROR, errorMessage: "Error when upload image" });
      }
      const { uid } = request.userInfo;
      const avatarUrl = request.file.path;
      console.log(avatarUrl)
      await userService.updateAvatar(uid, avatarUrl);
      return response
        .status(HttpStatusCode.OK)
        .json({ httpStatusCode: HttpStatusCode.OK });
    } catch (error) {
      next(error);
    }
  }
}
export default new UserController();
