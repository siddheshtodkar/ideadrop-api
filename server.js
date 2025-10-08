import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import ideaRouter from "./routes/ideaRoutes.js"
import authRouter from "./routes/authRoutes.js"
import { errorHandler } from "./middlewares/errorHandler.js"
import connectDB from "./config/db.js"
import cookieParser from "cookie-parser"

dotenv.config()

const app = express()
const PORT = process.env.PORT ?? 8000

// connect to mongoose
connectDB()

// CORS config
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:4200',
  'https://ideadrop-ui-blush.vercel.app/'
]

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

// Routes
app.use('/api/ideas', ideaRouter)
app.use('/api/auth', authRouter)

// 404 fallback
app.use((req, res, next) => {
  res.status(404)
  next(new Error(`Not Found - ${req.originalUrl}`))
})

// Middlewares
app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`server is running at port ${PORT}`)
})