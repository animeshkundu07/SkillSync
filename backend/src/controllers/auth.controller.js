const userModel = require("../models/user.model")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const tokenBlacklistModel = require("../models/blacklist.model")

const cookieOptions = {
    httpOnly: true,
    secure: true, // true in production with HTTPS
    sameSite: "none",
    maxAge: 24 * 60 * 60 * 1000, // 1 day
}

function createToken(user) {
    return jwt.sign(
        {
            id: user._id,
            username: user.username,
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "1d",
        }
    )
}

function sendUserResponse(res, statusCode, message, user, token) {
    res.cookie("token", token, cookieOptions)

    return res.status(statusCode).json({
        message,
        user: {
            id: user._id,
            username: user.username,
            email: user.email,
        },
    })
}

async function registerUserController(req, res) {
    try {
        const { username, email, password } = req.body

        if (!username || !email || !password) {
            return res.status(400).json({
                message: "Please provide username, email and password",
            })
        }

        const existingUser = await userModel.findOne({
            $or: [{ username }, { email }],
        })

        if (existingUser) {
            return res.status(400).json({
                message: "Account already exists with this username or email",
            })
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        const user = await userModel.create({
            username,
            email,
            password: hashedPassword,
        })

        const token = createToken(user)

        return sendUserResponse(
            res,
            201,
            "User registered successfully",
            user,
            token
        )
    } catch (error) {
        console.error("Register error:", error)

        return res.status(500).json({
            message: "Failed to register user",
        })
    }
}

async function loginUserController(req, res) {
    try {
        const { email, password } = req.body

        if (!email || !password) {
            return res.status(400).json({
                message: "Please provide email and password",
            })
        }

        const user = await userModel.findOne({ email })

        if (!user) {
            return res.status(401).json({
                message: "Invalid email or password",
            })
        }

        const isPasswordValid = await bcrypt.compare(
            password,
            user.password
        )

        if (!isPasswordValid) {
            return res.status(401).json({
                message: "Invalid email or password",
            })
        }

        const token = createToken(user)

        return sendUserResponse(
            res,
            200,
            "User logged in successfully",
            user,
            token
        )
    } catch (error) {
        console.error("Login error:", error)

        return res.status(500).json({
            message: "Failed to login",
        })
    }
}

async function logoutUserController(req, res) {
    try {
        const token = req.cookies.token

        if (token) {
            await tokenBlacklistModel.create({
                token,
            })
        }

        res.clearCookie("token", {
            httpOnly: true,
            secure: true,
            sameSite: "none",
        })

        return res.status(200).json({
            message: "User logged out successfully",
        })
    } catch (error) {
        console.error("Logout error:", error)

        return res.status(500).json({
            message: "Failed to logout",
        })
    }
}

async function getMeController(req, res) {
    try {
        const user = await userModel
            .findById(req.user.id)
            .select("-password")

        if (!user) {
            return res.status(404).json({
                message: "User not found",
            })
        }

        return res.status(200).json({
            message: "User details fetched successfully",
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
            },
        })
    } catch (error) {
        console.error("Get me error:", error)

        return res.status(500).json({
            message: "Failed to fetch user",
        })
    }
}

module.exports = {
    registerUserController,
    loginUserController,
    logoutUserController,
    getMeController,
}

