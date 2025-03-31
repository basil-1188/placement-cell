import express from 'express'
import userAuth from '../middleware/userAuth.js'
import { createTeamBlog, deleteTeamBlog, getTeamBlogs, getTeamProfile, updateTeamBlog } from '../controllers/teamController.js'
import { uploadProfileImage } from '../middleware/multer.js';

const teamRouter = express.Router();

teamRouter.get('/profile',userAuth,getTeamProfile);
teamRouter.get('/blogs', userAuth, getTeamBlogs); 
teamRouter.post('/blogs', userAuth, uploadProfileImage.single("image"), createTeamBlog); 
teamRouter.put('/blogs/:blogId', userAuth, uploadProfileImage.single("image"), updateTeamBlog);
teamRouter.delete('/blogs/:blogId', userAuth, deleteTeamBlog);

export default teamRouter;