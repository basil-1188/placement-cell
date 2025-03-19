import express from "express";
import userAuth from "../middleware/userAuth.js";
import { getAdminIndex } from "../controllers/adminController.js"; 

const adminRouter = express.Router();

adminRouter.get("/index", userAuth, getAdminIndex);

export default adminRouter;