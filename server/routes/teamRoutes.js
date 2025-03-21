import express from 'express'
import userAuth from '../middleware/userAuth.js'
import { getTeamProfile } from '../controllers/teamController.js'

const teamRouter = express.Router();

teamRouter.get('/profile',userAuth,getTeamProfile);

export default teamRouter;