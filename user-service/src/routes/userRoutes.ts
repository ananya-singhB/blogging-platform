import express from 'express';
import { getProfile, updateProfile, getUserById } from '../controllers/userController.ts';
import authMiddleware from '../middleware/auth.ts';

const router = express.Router();

router.get('/profile', authMiddleware, getProfile);
router.put('/profile', authMiddleware, updateProfile);
router.get('/:userId', getUserById);

export default router;
