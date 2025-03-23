import express, { Router } from 'express'
import userAuth from '../middleware/userAuth.js'
import { addQuestions, getOfficerProfile } from '../controllers/officerContoller.js'

const officerRouter = express.Router();

officerRouter.get('/profile', userAuth,getOfficerProfile);
officerRouter.post('/mock-test',userAuth,addQuestions);

export default officerRouter;