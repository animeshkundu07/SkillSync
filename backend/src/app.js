const express = require("express")
const cookieParser = require("cookie-parser")
const cors = require("cors")

const app = express()

// Middleware
app.use(express.json())
app.use(cookieParser())

app.use(
    cors({
        origin: process.env.FRONTEND_URL,
        credentials: true,
    })
)

// Routes
const authRouter = require("./routes/auth.routes")
const interviewRouter = require("./routes/interview.routes")

app.use("/api/auth", authRouter)
app.use("/api/interview", interviewRouter)

// Health check
app.get("/", (req, res) => {
    res.status(200).json({
        message: "SkillSync API is running",
    })
})

// Global error handler
app.use((err, req, res, next) => {
    console.error("Unhandled error:", err)

    res.status(err.status || 500).json({
        message: err.message || "Internal server error",
    })
})

module.exports = app

