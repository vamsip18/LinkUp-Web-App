import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../utils/api';
import PostCard from '../components/PostCard';
import { User, Mail, Edit2, Trash2, X, Save, Camera, Image as ImageIcon } from 'lucide-react';
import { getUserFromStorage, setAuthToken } from '../utils/auth';

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingPost, setEditingPost] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const userData = getUserFromStorage();
        setUser(userData);

        // Fetch updated user profile
        const profileResponse = await api.get('/user/profile');
        setUser(profileResponse.data);
        // Update localStorage with new profile data
        localStorage.setItem('user', JSON.stringify(profileResponse.data));

        const response = await api.get('/posts/user');
        setPosts(response.data);
      } catch (error) {
        toast.error('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleEditPost = (post) => {
    setEditingPost(post);
    setEditContent(post.content);
  };

  const handleSaveEdit = async () => {
    if (!editContent.trim()) {
      toast.error('Post content cannot be empty');
      return;
    }

    try {
      const response = await api.put(`/posts/${editingPost._id}`, {
        content: editContent,
      });
      setPosts(posts.map((p) => (p._id === editingPost._id ? response.data : p)));
      setEditingPost(null);
      setEditContent('');
      toast.success('Post updated successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update post');
    }
  };

  const handleDeletePost = async () => {
    try {
      await api.delete(`/posts/${showDeleteConfirm._id}`);
      setPosts(posts.filter((p) => p._id !== showDeleteConfirm._id));
      setShowDeleteConfirm(null);
      toast.success('Post deleted successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete post');
    }
  };

  const handleLike = async (postId) => {
    try {
      if (!postId) {
        toast.error('Post ID is missing');
        return;
      }
      const response = await api.post(`/posts/${postId}/like`);
      setPosts(posts.map((p) => (p._id === postId ? response.data : p)));
    } catch (error) {
      console.error('Like error:', error);
      toast.error(error.response?.data?.message || error.message || 'Failed to like post');
    }
  };

  const handleComment = async (postId, content) => {
    try {
      if (!postId) {
        toast.error('Post ID is missing');
        return;
      }
      if (!content || !content.trim()) {
        toast.error('Comment cannot be empty');
        return;
      }
      const response = await api.post(`/posts/${postId}/comment`, { content });
      setPosts(posts.map((p) => (p._id === postId ? response.data : p)));
      toast.success('Comment added successfully!');
    } catch (error) {
      console.error('Comment error:', error);
      toast.error(error.response?.data?.message || error.message || 'Failed to add comment');
      throw error;
    }
  };

  const handleProfilePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('image', file);

      const token = localStorage.getItem('token');
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${apiUrl}/user/profile/photo`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to upload profile photo');
      }

      const data = await response.json();
      setUser(data);
      localStorage.setItem('user', JSON.stringify(data));
      toast.success('Profile photo updated successfully!');
    } catch (error) {
      toast.error(error.message || 'Failed to upload profile photo');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg p-8 mb-6"
        >
          <div className="flex items-center gap-6">
            <div className="relative">
              {user?.profilePhoto ? (
                <img
                  src={`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${user.profilePhoto}`}
                  alt={user.name}
                  className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div 
                className={`w-24 h-24 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white text-4xl font-bold ${user?.profilePhoto ? 'hidden' : ''}`}
              >
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <label className="absolute bottom-0 right-0 p-2 bg-blue-500 text-white rounded-full cursor-pointer hover:bg-blue-600 transition-colors shadow-lg">
                <Camera size={18} />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleProfilePhotoUpload}
                  className="hidden"
                />
              </label>
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">{user?.name || 'User'}</h1>
              <div className="flex items-center gap-2 text-gray-600 mb-1">
                <Mail size={18} />
                <span>{user?.email || 'No email'}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600 mt-2">
                <User size={18} />
                <span>{posts.length} {posts.length === 1 ? 'post' : 'posts'}</span>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Your Posts</h2>

          {posts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12 bg-white rounded-2xl shadow-lg"
            >
              <p className="text-gray-600 text-lg">You haven't posted anything yet.</p>
            </motion.div>
          ) : (
            <div className="space-y-4">
              {posts.map((post, index) => (
                <motion.div
                  key={post._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  {editingPost && editingPost._id === post._id ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="bg-white rounded-2xl shadow-lg p-6 mb-4"
                    >
                      <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all duration-300 resize-none mb-4"
                        rows="4"
                      />
                      <div className="flex gap-2">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={handleSaveEdit}
                          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-medium"
                        >
                          <Save size={18} />
                          Save
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => {
                            setEditingPost(null);
                            setEditContent('');
                          }}
                          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-200 text-gray-700 font-medium"
                        >
                          <X size={18} />
                          Cancel
                        </motion.button>
                      </div>
                    </motion.div>
                  ) : (
                    <PostCard
                      post={post}
                      onLike={handleLike}
                      onComment={handleComment}
                      onEdit={handleEditPost}
                      onDelete={() => setShowDeleteConfirm(post)}
                      canEdit={true}
                      showActions={true}
                    />
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowDeleteConfirm(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                  <Trash2 className="text-red-600" size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">Delete Post</h3>
                  <p className="text-gray-600">This action cannot be undone.</p>
                </div>
              </div>
              <p className="text-gray-700 mb-6">Are you sure you want to delete this post?</p>
              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleDeletePost}
                  className="flex-1 py-3 px-4 rounded-xl bg-red-600 text-white font-medium hover:bg-red-700 transition-colors"
                >
                  Delete
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowDeleteConfirm(null)}
                  className="flex-1 py-3 px-4 rounded-xl bg-gray-200 text-gray-700 font-medium hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProfilePage;
