import express from 'express'
import { isAuthenticated, login, logout, register, resetPassword, sendResetOtp } from '../controllers/authController.js';
import userAuth from '../middleware/userAuth.js';
import upload from '../middleware/multer.js';

const authRouter = express.Router();

authRouter.post('/register',upload.single("profileImage"), register);
authRouter.post('/login', login);
authRouter.post('/logout', logout)
authRouter.post('/is-auth', userAuth, isAuthenticated)
authRouter.post('/send-reset-otp', sendResetOtp);
authRouter.post('/reset-password',  resetPassword)


export default authRouter;