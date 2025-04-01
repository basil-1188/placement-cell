import express from 'express'
import userAuth from '../middleware/userAuth.js'
import { createMaterial, createTeamBlog, deleteMaterial, deleteQA, deleteTeamBlog, deleteVideo, getMaterials, getTeamBlogs, getTeamProfile, getTeamQA, getVideos, publishQA, updateMaterial, updateTeamBlog, updateVideo, uploadQA, uploadVideos } from '../controllers/teamController.js'
import { uploadProfileImage, uploadStudyMaterial, uploadVideo } from '../middleware/multer.js';

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
teamRouter.post("/videos", userAuth, uploadVideo.fields([
  { name: "file0", maxCount: 1 },
  { name: "file1", maxCount: 1 },
  { name: "file2", maxCount: 1 },
]), uploadVideos);
teamRouter.put("/videos/:id", userAuth, uploadVideo.fields([
  { name: "file0", maxCount: 1 },
  { name: "file1", maxCount: 1 },
  { name: "file2", maxCount: 1 },
]), updateVideo);
teamRouter.get("/videos", userAuth, getVideos);
teamRouter.delete("/videos/:id", userAuth, deleteVideo);
teamRouter.post("/qa", userAuth, uploadQA); 
teamRouter.put("/qa/:id", userAuth, uploadQA); 
teamRouter.get("/qa", userAuth, getTeamQA); 
teamRouter.delete("/qa/:id", userAuth, deleteQA); 
teamRouter.put("/qa/publish/:id", userAuth, publishQA);
export default teamRouter;