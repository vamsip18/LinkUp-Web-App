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
router.post('/', protect, upload.single('image'), createPost);
router.post('/:id/like', protect, likePost);
router.post('/:id/comment', protect, addComment);
router.put('/:id', protect, updatePost);
router.delete('/:id', protect, deletePost);

export default router;
