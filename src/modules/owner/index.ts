import { Router } from "express";
import ownerController from "./owner.controller";
import uploadCloud from "@/utils/upload";
import { authMiddleware } from "@/common/middlewares";

const OwnerRouter = Router();

OwnerRouter.post('/register', authMiddleware, uploadCloud.single('hotelInfoFileUrl'), ownerController.ownerRegister);
OwnerRouter.get('/info-request', authMiddleware, ownerController.findRequest);

export default OwnerRouter;