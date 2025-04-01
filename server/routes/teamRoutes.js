import express from 'express'
import userAuth from '../middleware/userAuth.js'
import { createMaterial, createTeamBlog, deleteMaterial, deleteTeamBlog, getMaterials, getTeamBlogs, getTeamProfile, updateMaterial, updateTeamBlog } from '../controllers/teamController.js'
import { uploadProfileImage, uploadStudyMaterial } from '../middleware/multer.js';

const teamRouter = express.Router();

teamRouter.get('/profile',userAuth,getTeamProfile);
teamRouter.get('/blogs', userAuth, getTeamBlogs); 
teamRouter.post('/blogs', userAuth, uploadProfileImage.single("image"), createTeamBlog); 
teamRouter.put('/blogs/:blogId', userAuth, uploadProfileImage.single("image"), updateTeamBlog);
teamRouter.delete('/blogs/:blogId', userAuth, deleteTeamBlog);
teamRouter.get("/study-materials", userAuth, getMaterials);
teamRouter.post("/study-materials", userAuth, uploadStudyMaterial.fields([
  { name: "file", maxCount: 1 },
  { name: "thumbnail", maxCount: 1 }
]), createMaterial);
teamRouter.put("/study-materials/:id", userAuth, uploadStudyMaterial.fields([
  { name: "file", maxCount: 1 },
  { name: "thumbnail", maxCount: 1 }
]), updateMaterial);
teamRouter.delete("/study-materials/:id", userAuth, deleteMaterial);
export default teamRouter;