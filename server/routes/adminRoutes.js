import express from "express";
import userAuth from "../middleware/userAuth.js";
import { deleteStudent, getAdminIndex, getAdminTools, getAllBlogs, getAllJobs, getAllUsers, getCampusDriveApplicants, getDashboardStats, getFullUserDetails, getMockTests, getNotifications, getOfficerTrainingTeam, getReports, getTrainingResources, updateRole } from "../controllers/adminController.js"; 

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
adminRouter.get("/dashboard-stats",userAuth, getDashboardStats);

export default adminRouter;