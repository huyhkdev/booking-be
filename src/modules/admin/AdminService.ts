import config from "@/common/config/config";
import BadRequestException from "@/common/exception/BadRequestException";
import ServerInternalException from "@/common/exception/ServerInternalExeption";
import { sendTextEmail } from "@/common/utils/mail";
import { HotelOwnerRegister } from "@/databases/entities/HotelOwnerRegister";
import { User } from "@/databases/entities/User";
import { Wallet } from "@/databases/entities/Wallet";
import Stripe from "stripe";

class AdminService {
    async acceptExpertRequest(requestId: string) {
        const request = await HotelOwnerRegister.findById(requestId);
        if (!request) {
            throw new BadRequestException({
                errorCode: "",
                errorMessage: "Không tìm thấy yêu cầu"
            })
        }
        const userId = request.user;
        const user = await User.findById(userId);
        if (!user) {
            throw new BadRequestException({
                errorCode: "",
                errorMessage: "Không tìm thấy người dùng"
            })
        }
        let accountId = '';
        const stripe = new Stripe(config.stripeSecret);
        try {
            const account = await stripe.accounts.create({
                type: 'express',
                country: 'US',
                email: user.email,
            });

            accountId = account.id;
            const wallet = new Wallet({ owner: userId, connectedId: account.id });
            await wallet.save();

        } catch (e) {
            console.log(e);
            throw new ServerInternalException({
                errorCode: "",
                errorMessage: "Lỗi tạo ví"
            })
        }

        try {
            const accountLink = await stripe.accountLinks.create({
                account: accountId,
                refresh_url: 'https://example.com/reauth',
                return_url: `${config.striptAccountReturnUrl}`,
                type: 'account_onboarding',
            });

            try {
                sendTextEmail({
                    email: user.email,
                    subject: "Hoàn tất thông tin ví của bạn",
                    text: `Nhấn vào đây để hoàn tất thông tin ví của bạn: ${accountLink.url}`
                })
                request.status = 'approved';
                await request.save();

                user.role = 'owner';
                await user.save();

            } catch (e) {
                throw new ServerInternalException({
                    errorCode: "",
                    errorMessage: "Lỗi gửi email"
                })
            }

        } catch (e) {
            console.log(e);
            throw new ServerInternalException({
                errorCode: "",
                errorMessage: "Lỗi tạo ví"
            })
        }
    };
}
export const adminService = new AdminService();