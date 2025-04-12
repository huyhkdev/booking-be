import { Router } from "express";
import ownerController from "./owner.controller";
import uploadCloud from "@/utils/upload";
import { authMiddleware, ownerMiddleware } from "@/common/middlewares";

const OwnerRouter = Router();

OwnerRouter.post('/register', authMiddleware, uploadCloud.single('hotelInfoFileUrl'), ownerController.ownerRegister);
OwnerRouter.get('/info-request', authMiddleware, ownerController.findRequest);
OwnerRouter.post('/withdraw', authMiddleware, ownerMiddleware, ownerController.withdrawMoney);


export default OwnerRouter;