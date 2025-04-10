import ErrorCode from '@/common/constants/errorCode';
import BadRequestException from '@/common/exception/BadRequestException';
import { User } from '@/databases/entities/User';
import { HotelOwnerRegister } from '@/databases/entities/HotelOwnerRegister';
import { ObjectId } from 'mongoose';

class OwnerService {
  async ownerRegister(uid: string, cvPath: string) {
    const user = await User.findOne({ _id: uid });
    if (!user || user.role === 'blocker') {
      throw new BadRequestException({
        errorCode: ErrorCode.NOT_FOUND,
        errorMessage: 'Not found user',
      });
    }
    const newOwner = HotelOwnerRegister.build({
      user: user._id as ObjectId,
      hotelInfoFileUrl: cvPath,
    });
    return await newOwner.save();
  }

  async findHotelOwnerRegisterById(id: string) {
    const ownerRegister = await HotelOwnerRegister.findOne({ user: id });
    if (!ownerRegister) {
      return {}
    }
    return ownerRegister;
  }
}
export default new OwnerService();
