import ErrorCode from '@/common/constants/errorCode';
import BadRequestException from '@/common/exception/BadRequestException';
import { User } from '@/databases/entities/User';
import { HotelOwnerRegister } from '@/databases/entities/HotelOwnerRegister';
import { ObjectId } from 'mongoose';
import { Wallet } from '@/databases/entities/Wallet';
import Stripe from 'stripe';
import config from '@/common/config/config';
import { Withdraw } from '@/databases/entities/Withdraw';

class OwnerService {
  async ownerRegister(uid: string, cvPath: string) {
    const user = await User.findOne({ _id: uid });
    if (!user || user.role === 'blocker') {
      throw new BadRequestException({
        errorCode: ErrorCode.NOT_FOUND,
        errorMessage: 'Không tìm thấy người dùng',
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

  async withdrawMoney(uid: string, amountVND: number) {
    const stripe = new Stripe(config.stripeSecret);
    const wallet = await Wallet.findOne({ owner: uid });
    if (!wallet) {
      throw new BadRequestException({ errorCode: "", errorMessage: "Không tìm thấy ví" });
    }
  
    // Giả sử 1 USD = 25,000 VND
    const exchangeRate = 25000;
    const amountUSD = amountVND / exchangeRate;
  
    if (wallet.balance < amountUSD) {
      throw new BadRequestException({ errorCode: "", errorMessage: "Không đủ số dư (USD)" });
    }
  
    const transfer = await stripe.transfers.create({
      amount: Math.round(amountUSD * 100), // cents
      currency: 'usd',
      destination: wallet.connectedId,
      transfer_group: 'ORDER_95',
    });
  
    wallet.balance -= amountVND;
    await wallet.save();
  
    const withdraw = new Withdraw({
      wallet: wallet._id,
      amount: amountVND,
      transactionID: transfer.id,
    });
    await withdraw.save();
  }

  async getWallet(uid: string) {
    const wallet = await Wallet.findOne({ owner: uid });
    if (!wallet) {
      throw new BadRequestException({ errorCode: "", errorMessage: "Không tìm thấy ví" });
    }
    return wallet;
  }

  async withdrawHistory(uid: string) {
    const wallet = await Wallet.findOne({ owner: uid });
    if (!wallet) {
      throw new BadRequestException({ errorCode: "", errorMessage: "Không tìm thấy ví" });
    }
    const withdraw = await Withdraw.find({ wallet: wallet._id }).sort({ createdAt: -1 });

    return withdraw;
  }

}
export default new OwnerService();
