import { Router } from "express";
import ownerController from "./owner.controller";
import uploadCloud from "@/utils/upload";
import { authMiddleware, ownerMiddleware } from "@/common/middlewares";

const OwnerRouter = Router();

OwnerRouter.post('/register', authMiddleware, uploadCloud.single('hotelInfoFileUrl'), ownerController.ownerRegister);
OwnerRouter.get('/info-request', authMiddleware, ownerController.findRequest);
OwnerRouter.post('/withdraw', authMiddleware, ownerMiddleware, ownerController.withdrawMoney);
OwnerRouter.get('/wallet', authMiddleware, ownerMiddleware, ownerController.getWallet);
OwnerRouter.get('/withdraw-history', authMiddleware, ownerMiddleware, ownerController.withdrawHistory);


export default OwnerRouter;