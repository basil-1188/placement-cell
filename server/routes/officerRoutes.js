import express, { Router } from 'express'
import userAuth from '../middleware/userAuth.js'
import { addQuestions, checkAttendees, checkResults, createBlog, deleteBlog, getBlogs, getCampusDrives, getCampusDriveStudents, getFullStudentDetailsForOfficer, getOfficerProfile, postJobOpening, publishTest, sendCampusDriveEmail, updateBlog, viewAllTest } from '../controllers/officerContoller.js'
import { uploadProfileImage } from '../middleware/multer.js';

const officerRouter = express.Router();

officerRouter.get('/profile', userAuth,getOfficerProfile);
officerRouter.post('/mock-test',userAuth,addQuestions);
officerRouter.get('/get-user-details',userAuth,getFullStudentDetailsForOfficer)
officerRouter.get('/view-all-tests',userAuth,viewAllTest)
officerRouter.put('/publish-test/:testId',userAuth,publishTest)
officerRouter.get('/mock-test-attendees',userAuth,checkAttendees)
officerRouter.get('/check-results',userAuth,checkResults);
officerRouter.post('/job-posting',userAuth,postJobOpening);
officerRouter.get('/campus-drives', userAuth, getCampusDrives);
officerRouter.get('/campus-drive-students/:jobId', userAuth, getCampusDriveStudents);
officerRouter.post("/send-campus-drive-email", userAuth,sendCampusDriveEmail);
officerRouter.get("/blogs", userAuth, getBlogs);
officerRouter.post("/blogs", userAuth, uploadProfileImage.single("image"), createBlog);
officerRouter.put("/blogs/:blogId", userAuth, uploadProfileImage.single("image"), updateBlog);
officerRouter.delete("/blogs/:blogId", userAuth, deleteBlog);

export default officerRouter;