import express from 'express';
import { register, login, verifyToken } from '../controllers/authController.ts';
import authMiddleware from '../middleware/auth.ts';
import { validateRegister, validateLogin } from '../middleware/validation.ts';
import rateLimit from 'express-rate-limit';

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    success: false,
    message: 'Too many attempts. Please try again after 15 minutes.'
  }
});

router.post('/register', validateRegister, authLimiter, register);
router.post('/login', validateLogin, authLimiter, login);
router.get('/verify', authMiddleware, verifyToken);

export default router;
