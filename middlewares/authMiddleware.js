import { jwtVerify } from "jose"
import { JWT_SECRET } from "../utils/getJwtSecret.js"
import User from "../models/user.js"

export const protect = async (req, res, next) => {
  try {
    const autheHeader = req.headers.authorization
    if (!autheHeader || !autheHeader.startsWith('Bearer ')) {
      res.status(401)
      throw new Error('not authorized, no token')
    }
    const token = autheHeader.split(' ')[1]
    const { payload } = await jwtVerify(token, JWT_SECRET)
    const user = User.findById(payload.userId).select('_id name email')
    if (!user) {
      res.status(401)
      throw new Error('User not found')
    }
    req.user = user
    next()
  } catch (error) {
    res.status(401)
    next(new Error('not authorized, token failed'))
  }
}