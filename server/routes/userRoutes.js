import express from 'express';
import userAuth from '../middleware/userAuth.js';
import { getUserData } from '../controllers/userController.js';
import { atsUpload, uploadProfileImage, uploadResume } from '../middleware/multer.js';
import { addStudentDetails, applyForCampusDrive, attendMockTest, deleteStudentResume, getAvailableMockTests, getBlogById, getInterviewFeedback, getLiveLink, getRanks, getStudentBlogs, getStudentDetails, getStudentMarks, getStudentQA, getUserInterviewById, getUserInterviews, getUserMaterials, jobOpening, manualResumeFeedback, pastResults, showUserVideos, submitFeedback, submitInterviewResponse, submitMockTest, submitQuery, updateProfileImage } from '../controllers/studentController.js';
import { getCampusDriveStudents } from '../controllers/officerContoller.js';
import { checkResume } from '../controllers/atsController.js';

const userRouter = express.Router();

userRouter.get('/data',userAuth, getUserData)
userRouter.post('/details',userAuth, uploadResume.single("resume"), addStudentDetails)
userRouter.get('/details',userAuth,getStudentDetails)
userRouter.delete('/delete-resume', userAuth, deleteStudentResume);
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
userRouter.get('/resume/manual-feedbacks',userAuth,manualResumeFeedback);
userRouter.post('/check-resume',userAuth, atsUpload.single("resume"), checkResume);
userRouter.post("/update-profile-image", userAuth, uploadProfileImage.single("profileImage"), updateProfileImage);
userRouter.get("/ai-interviews", userAuth, getUserInterviews);
userRouter.get("/ai-interview/:id", userAuth, getUserInterviewById); 
userRouter.post("/ai-interview-query", userAuth, submitQuery);
userRouter.post("/ai-interview/:id/response", userAuth, submitInterviewResponse);
userRouter.post("/submit-feedback", userAuth, submitFeedback);
userRouter.get("/ai-interview/:id/feedback", userAuth, getInterviewFeedback);

export default userRouter;