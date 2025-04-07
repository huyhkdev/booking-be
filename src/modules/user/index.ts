import { Router } from "express";
import userController from "./user.controller";
import { registerMiddleware, loginMiddleware, authMiddleware, forgotPasswordMiddleWare, resetPasswordMiddleware, refreshTokenMiddleware, adminMiddleware } from "@/common/middlewares";
import { firebaseMiddleware } from "@/common/middlewares/firebase.middleware";

const userRouter = Router();
userRouter.post('/register', registerMiddleware, userController.register);// register user
userRouter.get('/verify/:encryptEmail', userController.verifyEmail);// verify email user
userRouter.post('/verify-request', userController.verifyEmailLink); // request to get verify email
userRouter.post('/login', loginMiddleware, userController.login);// register user
userRouter.get('/profile', authMiddleware, userController.userProfile);
userRouter.post('/forgot-password', forgotPasswordMiddleWare, userController.forgotPassword);
userRouter.post('/reset-password', resetPasswordMiddleware, userController.resetPassword);
userRouter.get('/refresh-token', refreshTokenMiddleware, userController.refreshToken);
userRouter.post('/change-password', authMiddleware, userController.changePassword);

userRouter.post('/admin/block', authMiddleware, adminMiddleware, userController.blockUsers);
userRouter.post('/admin/un-block', authMiddleware, adminMiddleware, userController.unblockUsers);

userRouter.post('/login-google', firebaseMiddleware, userController.loginGoogle); // request to get verify email


export default userRouter;