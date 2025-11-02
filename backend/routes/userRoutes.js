import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';
import { uploadProfilePhoto, getUserProfile, updateUsername } from '../controllers/userController.js';

const router = express.Router();

router.get('/profile', protect, getUserProfile);
router.post('/profile/photo', protect, upload.single('image'), uploadProfilePhoto);
router.put('/profile/username', protect, updateUsername);

export default router;
