import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageCircle, Clock, Send, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { getUserFromStorage } from '../utils/auth';

const PostCard = ({ post, onLike, onComment, onEdit, onDelete, canEdit, showActions = true }) => {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const user = getUserFromStorage();

  // Reset media index when post changes
  useEffect(() => {
    setCurrentMediaIndex(0);
  }, [post._id]);

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
  const likesCount = post.totalLikes || (post.likes && Array.isArray(post.likes) ? post.likes.length : 0);
  const likedUsers = post.likedUsers || [];
  const comments = (post.comments && Array.isArray(post.comments)) ? post.comments : [];
  const currentUserId = user?._id;
  
  // Determine display text for likes
  const getLikesDisplayText = () => {
    if (likesCount === 0) return null;
    if (likesCount === 1) {
      if (isLiked) return 'You';
      return likedUsers[0]?.name || 'Someone';
    }
    
    // Special case: if like count is exactly 4
    if (likesCount === 4) {
      if (isLiked) {
        return 'You and 3 others';
      } else {
        // Show the most recently liked user (first in array since we reverse it in backend)
        const recentUser = likedUsers[0]?.name || 'Someone';
        return `${recentUser} and 3 others`;
      }
    }
    
    // For other counts, show format: "You and X others" or "Name and X others"
    if (isLiked) {
      const otherCount = likesCount - 1;
      if (otherCount === 0) {
        return 'You';
      }
      return `You and ${otherCount} other${otherCount > 1 ? 's' : ''}`;
    } else {
      // Show most recently liked user
      const recentUser = likedUsers[0]?.name || 'Someone';
      const otherCount = likesCount - 1;
      if (otherCount === 0) {
        return recentUser;
      }
      return `${recentUser} and ${otherCount} other${otherCount > 1 ? 's' : ''}`;
    }
  };

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
              src={`${process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000'}${post.userProfilePhoto}`}
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

      {/* Display multiple media files with new layout */}
      {(post.media && post.media.length > 0) || post.image ? (
        <div className="mb-4">
          {post.media && post.media.length > 0 ? (
            post.media.length > 3 ? (
              // Carousel layout for more than 3 images with navigation arrows
              <div className="relative">
                <motion.div
                  key={currentMediaIndex}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="rounded-xl overflow-hidden"
                >
                  {post.media[currentMediaIndex].type === 'video' ? (
                    <video
                      src={`${process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000'}${post.media[currentMediaIndex].path}`}
                      controls
                      className="w-full h-auto object-cover max-h-96 rounded-xl"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  ) : (
                    <img
                      src={`${process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000'}${post.media[currentMediaIndex].path}`}
                      alt={`Post media ${currentMediaIndex + 1}`}
                      className="w-full h-auto object-cover max-h-96 rounded-xl"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/600x400?text=Image+Not+Found';
                      }}
                    />
                  )}
                </motion.div>
                
                {/* Left Arrow */}
                {currentMediaIndex > 0 && (
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setCurrentMediaIndex(currentMediaIndex - 1)}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black bg-opacity-50 hover:bg-opacity-70 rounded-full flex items-center justify-center text-white transition-all duration-300 z-10"
                  >
                    <ChevronLeft size={24} />
                  </motion.button>
                )}
                
                {/* Right Arrow */}
                {currentMediaIndex < post.media.length - 1 && (
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setCurrentMediaIndex(currentMediaIndex + 1)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black bg-opacity-50 hover:bg-opacity-70 rounded-full flex items-center justify-center text-white transition-all duration-300 z-10"
                  >
                    <ChevronRight size={24} />
                  </motion.button>
                )}
                
                {/* Image counter indicator */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black bg-opacity-50 rounded-full px-3 py-1 text-white text-sm font-medium z-10">
                  {currentMediaIndex + 1} / {post.media.length}
                </div>
                
                {/* Thumbnail grid below main image */}
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {post.media.slice(0, 4).map((mediaItem, index) => (
                    <motion.button
                      key={index}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setCurrentMediaIndex(index)}
                      className={`relative rounded-xl overflow-hidden ${
                        currentMediaIndex === index ? 'ring-2 ring-blue-500' : ''
                      }`}
                    >
                      {mediaItem.type === 'video' ? (
                        <video
                          src={`${process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000'}${mediaItem.path}`}
                          className="w-full h-20 object-cover rounded-xl"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      ) : (
                        <img
                          src={`${process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000'}${mediaItem.path}`}
                          alt={`Thumbnail ${index + 1}`}
                          className="w-full h-20 object-cover rounded-xl"
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/600x400?text=Image+Not+Found';
                          }}
                        />
                      )}
                      {index === 3 && post.media.length > 4 && (
                        <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center rounded-xl">
                          <span className="text-white text-xs font-bold">+{post.media.length - 4}</span>
                        </div>
                      )}
                    </motion.button>
                  ))}
                </div>
              </div>
            ) : (
              // Layout for 3 or fewer images: regular grid
              <div className={`grid gap-2 ${post.media.length === 1 ? 'grid-cols-1' : post.media.length === 2 ? 'grid-cols-2' : 'grid-cols-2'}`}>
                {post.media.map((mediaItem, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="rounded-xl overflow-hidden"
                  >
                    {mediaItem.type === 'video' ? (
                      <video
                        src={`${process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000'}${mediaItem.path}`}
                        controls
                        className="w-full h-auto object-cover max-h-96 rounded-xl"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <img
                        src={`${process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000'}${mediaItem.path}`}
                        alt={`Post media ${index + 1}`}
                        className="w-full h-auto object-cover max-h-96 rounded-xl"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/600x400?text=Image+Not+Found';
                        }}
                      />
                    )}
                  </motion.div>
                ))}
              </div>
            )
          ) : post.image ? (
            // Fallback to single image for backward compatibility
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="rounded-xl overflow-hidden"
            >
              <img
                src={`${process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000'}${post.image}`}
                alt="Post"
                className="w-full h-auto object-cover max-h-96 rounded-xl"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/600x400?text=Image+Not+Found';
                }}
              />
            </motion.div>
          ) : null}
        </div>
      ) : null}

      {showActions && (
        <>
          {/* Likes Display */}
          {likesCount > 0 && (
            <div className="flex items-center gap-2 pt-2 pb-2">
              <div className="flex items-center -space-x-2">
                {likedUsers.slice(0, 3).map((likedUser, index) => (
                  <div
                    key={likedUser._id || index}
                    className="w-6 h-6 rounded-full border-2 border-white overflow-hidden bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold"
                    title={likedUser.name}
                  >
                    {likedUser.profilePhoto ? (
                      <img
                        src={`${process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000'}${likedUser.profilePhoto}`}
                        alt={likedUser.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div className={`w-full h-full flex items-center justify-center ${likedUser.profilePhoto ? 'hidden' : ''}`}>
                      {likedUser.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  </div>
                ))}
                {likedUsers.length > 3 && (
                  <div className="w-6 h-6 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-700">
                    +{likedUsers.length - 3}
                  </div>
                )}
              </div>
              <span className="text-sm text-gray-700 font-medium">
                {getLikesDisplayText()}
              </span>
            </div>
          )}
          
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