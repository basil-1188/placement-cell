import express from "express";
import userAuth from "../middleware/userAuth.js";
import { getAdminIndex, getAllUsers, getFullUserDetails, updateRole } from "../controllers/adminController.js"; 

const adminRouter = express.Router();

adminRouter.get("/index", userAuth, getAdminIndex);
adminRouter.get("/users", userAuth, getAllUsers);
adminRouter.patch("/update-role", userAuth, updateRole); 
adminRouter.get("/full-user-details",userAuth, getFullUserDetails);

export default adminRouter;