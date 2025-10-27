import express from 'express'
import {
  register,
  login,
  verifyToken,
  verifyEmail,
  resendVerificationEmail,
} from '../controllers/authController.js'
import authMiddleware from '../middleware/auth.js'
import { validateRegister, validateLogin } from '../middleware/validation.js'
import rateLimit from 'express-rate-limit'

const router = express.Router()

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    success: false,
    message: 'Too many attempts. Please try again after 15 minutes.',
  },
})

router.post('/register', validateRegister, authLimiter, register)
router.post('/login', validateLogin, authLimiter, login)
router.get('/verify-email', verifyEmail)
router.get('/verify-token', authMiddleware, verifyToken)
router.post('/resend-verification', resendVerificationEmail)

export default router
