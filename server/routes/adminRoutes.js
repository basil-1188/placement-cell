import express from "express";
import userAuth from "../middleware/userAuth.js";
import { deleteStudent, getAdminIndex, getAdminTools, getAllBlogs, getAllJobs, getAllTheStudents, getAllUsers, getCampusDriveApplicants, getDashboardStats, getFeedback, getFullUserDetails, getInterviewFeedback, getInterviewParticipants, getInterviewResults, getInterviews, getMockTests, getNotifications, getOfficerTrainingTeam, getProfile, getReports, getStudentResponses, getTrainingResources, scheduleInterviewQuestions, updateInterviewFeedback, updateProfile, updateRole } from "../controllers/adminController.js"; 

const adminRouter = express.Router();

adminRouter.get("/index", userAuth, getAdminIndex);
adminRouter.get("/users", userAuth, getAllUsers);
adminRouter.patch("/update-role", userAuth, updateRole); 
adminRouter.get("/full-user-details",userAuth, getFullUserDetails);
adminRouter.get('/officer-training-team', userAuth, getOfficerTrainingTeam);
adminRouter.delete('/delete-student/:studentId', userAuth, deleteStudent);
adminRouter.get('/mock-tests',userAuth,getMockTests);
adminRouter.get('/training-resources',userAuth,getTrainingResources);
adminRouter.get('/jobs', userAuth, getAllJobs);
adminRouter.get('/campus-drive-applicants/:jobId', userAuth, getCampusDriveApplicants);
adminRouter.get('/blogs', userAuth, getAllBlogs);
adminRouter.get('/reports', userAuth, getReports);
adminRouter.get('/notifications', userAuth, getNotifications);
adminRouter.get('/admin-tools', userAuth, getAdminTools);
adminRouter.get('/dashboard-stats',userAuth, getDashboardStats);
adminRouter.post('/schedule-interview-questions', userAuth, scheduleInterviewQuestions);
adminRouter.get('/students', userAuth, getAllTheStudents);
adminRouter.get('/interview-results', userAuth, getInterviewResults);
adminRouter.get('/interview-feedback', userAuth, getInterviewFeedback);
adminRouter.get('/interviews', userAuth, getInterviews);
adminRouter.get('/interview-participants/:id', userAuth, getInterviewParticipants);
adminRouter.get("/student-responses/:interviewId/:studentId", userAuth, getStudentResponses);
adminRouter.post("/update-feedback", userAuth, updateInterviewFeedback);
adminRouter.get("/feedback", userAuth, getFeedback);
adminRouter.get("/profile", userAuth, getProfile);
adminRouter.put("/profile", userAuth, updateProfile);

export default adminRouter;