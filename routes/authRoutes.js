import express from 'express'
import User from '../models/user.js'
import { generateToken } from '../utils/generateToken.js'
import { jwtVerify } from 'jose'
import { JWT_SECRET } from '../utils/getJwtSecret.js'

const router = express.Router()

// @route         POST api/auth/register
// @description   Register new user
// @access        public
router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password } = req.body || {}
    if (!name || !email || !password) {
      res.status(400)
      throw new Error('All fields are required')
    }
    const existing = await User.findOne({ email })
    if (existing) {
      res.status(400)
      throw new Error('User already exists')
    }
    const user = await User.create({ name, email, password })

    // create tokens
    const payload = { userId: user._id.toString() }
    const accessToken = await generateToken(payload, '1m')
    const refreshToken = await generateToken(payload, '30d')

    // set refresh token in HTTP-only cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'none',
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    })

    res.status(201).json({
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    })
  } catch (error) {
    next(error)
  }
})

// @route         POST api/auth/login
// @description   Login user
// @access        public
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body || {}
    if (!email || !password) {
      res.status(400)
      throw new Error('Email and password are required')
    }
    // find user
    const user = await User.findOne({ email })
    if (!user) {
      res.status(401)
      throw new Error('Invalid Credentials')
    }

    // check if password matches
    const isMatch = await user.matchPassword(password)
    if (!isMatch) {
      res.status(401)
      throw new Error('Invalid Credentials')
    }

    // create tokens
    const payload = { userId: user._id.toString() }
    const accessToken = await generateToken(payload, '1m')
    const refreshToken = await generateToken(payload, '30d')

    // set refresh token in HTTP-only cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'none',
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    })

    res.status(201).json({
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    })

  } catch (error) {
    next(error)
  }
})

// @route         POST api/auth/logout
// @description   Logout user
// @access        public
router.post('/logout', (req, res) => {
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'none'
  })
  res.status(200).json({ message: 'Logged out successfully' })
})

// @route         POST api/auth/refresh
// @description   Generate new access token from refresh token
// @access        public (Needs valid refresh token in cookie)
router.post('/refresh', async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken
    console.log('Refreshing Token...');
    if (!token) {
      res.status(401)
      throw new Error('No refresh token')
    }

    const { payload } = await jwtVerify(token, JWT_SECRET)
    const user = await User.findById(payload.userId)
    if (!user) {
      res.status(401)
      throw new Error('No user')
    }

    const accessToken = await generateToken({ userId: user._id.toString() }, '1m')
    res.json({
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      }
    })
  } catch (error) {
    res.status(401)
    next(error)
  }
})

export default router