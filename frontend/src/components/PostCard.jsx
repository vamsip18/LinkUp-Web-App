import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageCircle, Clock, Send, X } from 'lucide-react';
import { getUserFromStorage } from '../utils/auth';

const PostCard = ({ post, onLike, onComment, onEdit, onDelete, canEdit, showActions = true, currentUserId }) => {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const user = getUserFromStorage();

  const formatDate = (date) => {
    const now = new Date();
    const postDate = new Date(date);
    const diffInSeconds = Math.floor((now - postDate) / 1000);

    if (diffInSeconds < 60) {
      return 'Just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    if (!post._id) {
      console.error('Post ID is missing');
      return;
    }

    setIsSubmittingComment(true);
    try {
      await onComment(post._id, commentText);
      setCommentText('');
    } catch (error) {
      console.error('Error submitting comment:', error);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const isLiked = post.isLiked || false;
  const likesCount = (post.likes && Array.isArray(post.likes)) ? post.likes.length : 0;
  const comments = (post.comments && Array.isArray(post.comments)) ? post.comments : [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-2xl shadow-lg p-6 mb-4 hover:shadow-xl transition-shadow duration-300"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          {post.userProfilePhoto ? (
            <img
              src={`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${post.userProfilePhoto}`}
              alt={post.username}
              className="w-10 h-10 rounded-full object-cover"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
          ) : null}
          <div className={`w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold ${post.userProfilePhoto ? 'hidden' : ''}`}>
            {post.username?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">{post.username || 'Anonymous'}</h3>
            <div className="flex items-center gap-1 text-gray-500 text-sm">
              <Clock size={14} />
              <span>{formatDate(post.createdAt)}</span>
            </div>
          </div>
        </div>
        {canEdit && (
          <div className="flex gap-2">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onEdit(post)}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              Edit
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onDelete(post)}
              className="text-red-600 hover:text-red-700 text-sm font-medium"
            >
              Delete
            </motion.button>
          </div>
        )}
      </div>

      <p className="text-gray-700 mb-4 leading-relaxed">{post.content}</p>

      {post.image && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-4 rounded-xl overflow-hidden"
        >
          <img
            src={`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${post.image}`}
            alt="Post"
            className="w-full h-auto object-cover max-h-96 rounded-xl"
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/600x400?text=Image+Not+Found';
            }}
          />
        </motion.div>
      )}

      {showActions && (
        <>
          <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                if (post._id) {
                  onLike(post._id);
                } else {
                  console.error('Post ID is missing');
                }
              }}
              className={`flex items-center gap-2 transition-colors duration-300 ${
                isLiked
                  ? 'text-red-500 hover:text-red-600'
                  : 'text-gray-600 hover:text-red-500'
              }`}
            >
              <Heart size={20} fill={isLiked ? 'currentColor' : 'none'} />
              <span className="text-sm font-medium">{likesCount > 0 && likesCount}</span>
              <span className="text-sm">Like</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowComments(!showComments)}
              className="flex items-center gap-2 text-gray-600 hover:text-blue-500 transition-colors duration-300"
            >
              <MessageCircle size={20} />
              <span className="text-sm font-medium">{comments.length > 0 && comments.length}</span>
              <span className="text-sm">Comment</span>
            </motion.button>
          </div>

          <AnimatePresence>
            {showComments && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-4 pt-4 border-t border-gray-100 overflow-hidden"
              >
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {comments.length === 0 ? (
                    <p className="text-gray-500 text-sm text-center py-4">No comments yet. Be the first to comment!</p>
                  ) : (
                    comments.map((comment, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex gap-3 p-3 bg-gray-50 rounded-xl"
                      >
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-400 to-indigo-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {comment.username?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-sm text-gray-800">{comment.username}</span>
                            <span className="text-xs text-gray-500">{formatDate(comment.createdAt)}</span>
                          </div>
                          <p className="text-sm text-gray-700">{comment.content}</p>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>

                <form onSubmit={handleCommentSubmit} className="mt-4 flex gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <input
                    type="text"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Write a comment..."
                    className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all duration-300 text-sm"
                    disabled={isSubmittingComment}
                  />
                  <motion.button
                    type="submit"
                    disabled={!commentText.trim() || isSubmittingComment}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:shadow-lg transition-shadow disabled:opacity-50"
                  >
                    <Send size={18} />
                  </motion.button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </motion.div>
  );
};

export default PostCard;