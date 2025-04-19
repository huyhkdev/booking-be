import ErrorCode from '@/common/constants/errorCode';
import BadRequestException from '@/common/exception/BadRequestException';
import ForbiddenException from '@/common/exception/ForbiddenException';
import UnauthorizedExeption from '@/common/exception/UnauthorizedExeption';
import hashing from '@/common/utils/hashing';
import Jwt from '@/common/utils/Jwt';
import { User } from '@/databases/entities/User';

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
        errorMessage: 'Email đã được đăng ký',
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
        errorMessage: 'Không tìm thấy người dùng',
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
        errorMessage: 'Không tìm thấy người dùng với email này',
      });
    }
    if (user.role == 'blocker') {
      throw new ForbiddenException({
        errorCode: ErrorCode.BLOCKED,
        errorMessage: 'Bạn đã bị chặn',
      });
    }
    if (user.state !== 'active') {
      throw new BadRequestException({
        errorCode: ErrorCode.VERIFY_EMAIL_NEED,
        errorMessage: 'Bạn cần xác thực email',
      });
    }

    const isCorrectPassword = await hashing.comparePassword(
      password,
      user.password
    );
    if (!isCorrectPassword)
      throw new UnauthorizedExeption({
        errorCode: ErrorCode.INCORRECT,
        errorMessage: 'Mật khẩu không đúng',
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
        errorMessage: 'Không tìm thấy người dùng',
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
        errorMessage: 'Không tìm thấy người dùng',
      });
    }
    user.role = 'blocker';
    await user.save();
  }

  async toggleNotification(uid: string) {
    const user = await User.findById(uid);
    if (!user) {
      throw new BadRequestException({
        errorCode: ErrorCode.NOT_FOUND,
        errorMessage: 'Không tìm thấy người dùng',
      });
    }
    await user.save();
  }

  async findAllUsers() {
    const users = await User.find({ role: ['user', 'blocker'] });
    if (!users.length) {
      throw new BadRequestException({
        errorCode: ErrorCode.NOT_FOUND,
        errorMessage: 'Không tìm thấy người dùng',
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
