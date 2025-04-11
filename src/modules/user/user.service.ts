import ErrorCode from '@/common/constants/errorCode';
import BadRequestException from '@/common/exception/BadRequestException';
import ForbiddenException from '@/common/exception/ForbiddenException';
import UnauthorizedExeption from '@/common/exception/UnauthorizedExeption';
import hashing from '@/common/utils/hashing';
import Jwt from '@/common/utils/Jwt';
import { User } from '@/databases/entities/User';
import { HotelOwnerRegister } from '@/databases/entities/HotelOwnerRegister';
import { ObjectId } from 'mongoose';

class UserService {
  async createActiveUser(fullName: string, email: string, picture: string) {
    return await User.create({
      fullName,
      email,
      state: 'active',
      avatarUrl: picture,
    });
  }
  async register(fullName: string, email: string, password: string) {
    const userExist = await User.findOne({ email });
    if (userExist) {
      throw new BadRequestException({
        errorCode: ErrorCode.EXIST,
        errorMessage: 'Email has been registered',
      });
    }
    const hashedPassword = await hashing.hashPassword(password);
    const newUser = User.build({
      fullName,
      email,
      password: hashedPassword,
    });
    return await newUser.save();
  }

  async verifyEmail(encryptEmail: string) {
    const token = decodeURIComponent(encryptEmail);
    const { email } = Jwt.verifyEmailToken(token);
    const userExist = await User.findOne({ email });
    if (!userExist) {
      throw new BadRequestException({
        errorCode: ErrorCode.NOT_FOUND,
        errorMessage: 'Not found user',
      });
    }
    userExist.state = 'active';
    await userExist.save();
  }
  async login(email: string, password: string) {
    const user = await this.findUserByEmail(email);
    if (!user) {
      throw new BadRequestException({
        errorCode: ErrorCode.NOT_FOUND,
        errorMessage: 'Not found user with this email',
      });
    }
    if (user.role == 'blocker') {
      throw new ForbiddenException({
        errorCode: ErrorCode.BLOCKED,
        errorMessage: 'You are blocked',
      });
    }
    if (user.state !== 'active') {
      throw new BadRequestException({
        errorCode: ErrorCode.VERIFY_EMAIL_NEED,
        errorMessage: 'You need to verify email',
      });
    }

    const isCorrectPassword = await hashing.comparePassword(
      password,
      user.password
    );
    if (!isCorrectPassword)
      throw new UnauthorizedExeption({
        errorCode: ErrorCode.INCORRECT,
        errorMessage: 'Incorrect password',
      });
    const accessToken = Jwt.generateAccessToken(user.id, user.role);
    const refreshToken = Jwt.generateRefreshToken(user.id);
    return { accessToken, refreshToken, user };
  }

  async findUserById(_id: string) {
    return await User.findOne({ _id });
  }

  async findUserByEmail(email: string) {
    return await User.findOne({ email });
  }

  async changePassword(email: string, password: string) {
    const hashedPassword = await hashing.hashPassword(password);
    const user = await this.findUserByEmail(email);
    if (!user) {
      throw new BadRequestException({
        errorCode: ErrorCode.NOT_FOUND,
        errorMessage: 'Not found user',
      });
    }
    user.password = hashedPassword;
    await user.save();
  }

  async blockUser(uid: string) {
    const user = await User.findOne({ _id: uid });
    if (!user) {
      throw new BadRequestException({
        errorCode: ErrorCode.NOT_FOUND,
        errorMessage: 'Not found user',
      });
    }
    user.role = 'blocker';
    await user.save();
  }

  async blockUsers(uids: string[]) {
    const users = await User.find({ _id: { $in: uids } });
    if (!users.length) {
      throw new BadRequestException({
        errorCode: ErrorCode.NOT_FOUND,
        errorMessage: 'No users found',
      });
    }

    await User.updateMany(
      { _id: { $in: uids } },
      { $set: { role: 'blocker' } }
    );
  }

  async unblockUsers(uids: string[]) {
    const users = await User.find({ _id: { $in: uids } });
    if (!users.length) {
      throw new BadRequestException({
        errorCode: ErrorCode.NOT_FOUND,
        errorMessage: 'No users found',
      });
    }

    await User.updateMany({ _id: { $in: uids } }, { $set: { role: 'user' } });
  }

  async toggleNotification(uid: string) {
    const user = await User.findById(uid);
    if (!user) {
      throw new BadRequestException({
        errorCode: ErrorCode.NOT_FOUND,
        errorMessage: 'Not found user',
      });
    }
    await user.save();
  }

  async findAllUsers() {
    const users = await User.find({ role: ['user', 'blocker'] });
    if (!users.length) {
      throw new BadRequestException({
        errorCode: ErrorCode.NOT_FOUND,
        errorMessage: 'No users found',
      });
    }
    return users;
  }



  async updateUser(uid: string, body: any) {
    return await User.findByIdAndUpdate(uid, body);
  }

  async updateAvatar(uid: string, avatarUrl: string) {
    return await User.findByIdAndUpdate(uid, { avatarUrl });
  }





}
export default new UserService();
