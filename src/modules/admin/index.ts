import { Router } from "express";
import { adminController } from "./AdminController";

export const adminRouter  =  Router();

adminRouter.put("/accept/:requestId", adminController.acceptRequest);