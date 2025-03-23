import express from 'express';
import userAuth from '../middleware/userAuth.js';
import { getUserData } from '../controllers/userController.js';
import { uploadResume } from '../middleware/multer.js';
import { addStudentDetails, attendMockTest, getAvailableMockTests, getStudentDetails, submitMockTest } from '../controllers/studentController.js';

const userRouter = express.Router();

userRouter.get('/data',userAuth, getUserData)
userRouter.post('/details',userAuth, uploadResume.single("resume"), addStudentDetails)
userRouter.get('/details',userAuth,getStudentDetails)
userRouter.get('/attend-test/:id', userAuth, attendMockTest);
userRouter.post('/submit-test/:id', userAuth, submitMockTest);
userRouter.get('/available-tests', userAuth, getAvailableMockTests);


export default userRouter;