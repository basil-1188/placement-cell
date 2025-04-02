import express from 'express';
import userAuth from '../middleware/userAuth.js';
import { getUserData } from '../controllers/userController.js';
import { uploadResume } from '../middleware/multer.js';
import { addStudentDetails, applyForCampusDrive, attendMockTest, getAvailableMockTests, getBlogById, getLiveLink, getRanks, getStudentBlogs, getStudentDetails, getStudentMarks, getStudentQA, getUserMaterials, jobOpening, pastResults, showUserVideos, submitMockTest } from '../controllers/studentController.js';
import { getCampusDriveStudents } from '../controllers/officerContoller.js';

const userRouter = express.Router();

userRouter.get('/data',userAuth, getUserData)
userRouter.post('/details',userAuth, uploadResume.single("resume"), addStudentDetails)
userRouter.get('/details',userAuth,getStudentDetails)
userRouter.get('/attend-test/:id', userAuth, attendMockTest);
userRouter.post('/submit-test/:id', userAuth, submitMockTest);
userRouter.get('/available-tests', userAuth, getAvailableMockTests);
userRouter.get('/past-results',userAuth,pastResults);
userRouter.get('/ranks',userAuth,getRanks);
userRouter.get('/get-job-openings',userAuth,jobOpening)
userRouter.get("/marks", userAuth, getStudentMarks);
userRouter.post('/apply-campus-drive', userAuth,applyForCampusDrive);
userRouter.get('/campus-drive-students',userAuth,getCampusDriveStudents);
userRouter.get('/student-blogs',userAuth,getStudentBlogs)
userRouter.get('/blogs/:blogId', userAuth, getBlogById);
userRouter.get('/user-materials', userAuth, getUserMaterials);
userRouter.get('/user-videos',userAuth,showUserVideos);
userRouter.get('/qa',userAuth,getStudentQA);
userRouter.get('/live-link',userAuth,getLiveLink);

export default userRouter;