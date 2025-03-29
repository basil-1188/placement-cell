import express, { Router } from 'express'
import userAuth from '../middleware/userAuth.js'
import { addQuestions, checkAttendees, checkResults, getFullStudentDetailsForOfficer, getOfficerProfile, postJobOpening, publishTest, viewAllTest } from '../controllers/officerContoller.js'

const officerRouter = express.Router();

officerRouter.get('/profile', userAuth,getOfficerProfile);
officerRouter.post('/mock-test',userAuth,addQuestions);
officerRouter.get('/get-user-details',userAuth,getFullStudentDetailsForOfficer)
officerRouter.get('/view-all-tests',userAuth,viewAllTest)
officerRouter.put('/publish-test/:testId',userAuth,publishTest)
officerRouter.get('/mock-test-attendees',userAuth,checkAttendees)
officerRouter.get('/check-results',userAuth,checkResults);
officerRouter.post('/job-posting',userAuth,postJobOpening);

export default officerRouter;