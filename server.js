import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import router from "./routes/ideaRoutes.js"
import { errorHandler } from "./middlewares/errorHandler.js"

dotenv.config()

const app = express()
const PORT = process.env.PORT ?? 8000

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Routes
app.use('/api/ideas', router)

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