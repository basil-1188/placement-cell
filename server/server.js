import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import cookieParser from 'cookie-parser'
import connectDB from './config/mongodb.js'
import authRouter from './routes/authRoutes.js'
import userRouter from './routes/userRoutes.js'
import adminRouter from './routes/adminRoutes.js'

const app = express()
const port = process.env.PORT || 4000
connectDB()

app.use(express.json())
app.use(cookieParser())
app.use(cors({
    origin: "http://localhost:5173", 
    credentials: true,
  }));
  
app.get('/', (req, res) => res.send('API working fine'))

app.use('/api/auth', authRouter)
app.use('/api/user',userRouter)
app.use('/api/admin', adminRouter )

app.listen(port, () => console.log(`server started on PORT: ${port}`));