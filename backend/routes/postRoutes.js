import express from 'express';
import {
  getAllPosts,
  createPost,
  deletePost,
  updatePost,
  getUserPosts,
  likePost,
  addComment,
} from '../controllers/postController.js';
import { protect } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.get('/', protect, getAllPosts);
router.get('/user', protect, getUserPosts);
router.post('/', protect, upload.array('media', 10), createPost); // Allow up to 10 files
router.post('/:id/like', protect, likePost);
router.post('/:id/comment', protect, addComment);
router.put('/:id', protect, upload.array('media', 10), updatePost); // Allow adding files when editing
router.delete('/:id', protect, deletePost);

export default router;
