import express from 'express'
import { isAuthenticated, login, logout, register, resetPassword, sendResetOtp } from '../controllers/authController.js';
import userAuth from '../middleware/userAuth.js';
import { uploadProfileImage, uploadResume } from '../middleware/multer.js';
import { addStudentDetails } from '../controllers/studentController.js';

const authRouter = express.Router();

authRouter.post('/register',uploadProfileImage.single("profileImage"), register);
authRouter.post('/login', login);
authRouter.post('/logout', logout)
authRouter.get('/is-auth', userAuth, isAuthenticated)
authRouter.post('/send-reset-otp', sendResetOtp);
authRouter.post('/reset-password',  resetPassword)


export default authRouter;