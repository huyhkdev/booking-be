import { HttpStatusCode } from "@/common/constants";
import { RequestCustom, ResponseCustom } from "@/common/interfaces/express";
import { NextFunction } from "express";
import { adminService } from "./AdminService";

class AdminController{

      async acceptRequest(req: RequestCustom, res: ResponseCustom, next: NextFunction) {
        const {requestId} = req.params;
        console.log(requestId);
        try {
           await adminService.acceptExpertRequest(requestId);
          return res.status(200).json({
            httpStatusCode: HttpStatusCode.OK,
          });
        } catch (error) {
          console.log(error);
          next(error);
        }
      }

}
export const adminController = new AdminController();