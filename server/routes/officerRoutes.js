import express, { Router } from 'express'
import userAuth from '../middleware/userAuth.js'
import { addQuestions, getFullStudentDetailsForOfficer, getOfficerProfile } from '../controllers/officerContoller.js'

const officerRouter = express.Router();

officerRouter.get('/profile', userAuth,getOfficerProfile);
officerRouter.post('/mock-test',userAuth,addQuestions);
officerRouter.get('/get-user-details',userAuth,getFullStudentDetailsForOfficer)

export default officerRouter;