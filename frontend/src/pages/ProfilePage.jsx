import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../utils/api';
import PostCard from '../components/PostCard';
import { User, Mail, Edit2, Trash2, X, Save, Camera, Image as ImageIcon, Video } from 'lucide-react';
import { getUserFromStorage, setAuthToken } from '../utils/auth';

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingPost, setEditingPost] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [editMedia, setEditMedia] = useState([]); // Existing media to keep
  const [editNewMedia, setEditNewMedia] = useState([]); // New media files to add
  const [editNewMediaPreviews, setEditNewMediaPreviews] = useState([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [editingUsername, setEditingUsername] = useState(false);
  const [editUsername, setEditUsername] = useState('');

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
    // Initialize with existing media or empty array
    setEditMedia(post.media && post.media.length > 0 ? post.media : []);
    setEditNewMedia([]);
    setEditNewMediaPreviews([]);
  };

  const handleMediaChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const validFiles = [];
    const newPreviews = [];

    files.forEach((file) => {
      const maxSize = file.type.startsWith('video/') ? 50 * 1024 * 1024 : 5 * 1024 * 1024;
      if (file.size > maxSize) {
        toast.error(`${file.name} is too large. Max size: ${file.type.startsWith('video/') ? '50MB' : '5MB'}`);
        return;
      }

      validFiles.push(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        newPreviews.push({
          file,
          preview: reader.result,
          type: file.type.startsWith('video/') ? 'video' : 'image',
        });
        if (newPreviews.length === validFiles.length) {
          setEditNewMediaPreviews([...editNewMediaPreviews, ...newPreviews]);
          setEditNewMedia([...editNewMedia, ...validFiles]);
        }
      };
      reader.readAsDataURL(file);
    });

    e.target.value = '';
  };

  const handleRemoveEditMedia = (index, isExisting = false) => {
    if (isExisting) {
      setEditMedia(editMedia.filter((_, i) => i !== index));
    } else {
      const newFiles = editNewMedia.filter((_, i) => i !== index);
      const newPreviews = editNewMediaPreviews.filter((_, i) => i !== index);
      setEditNewMedia(newFiles);
      setEditNewMediaPreviews(newPreviews);
    }
  };

  const handleSaveEdit = async () => {
    if (!editContent.trim()) {
      toast.error('Post content cannot be empty');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('content', editContent);
      formData.append('keepMedia', JSON.stringify(editMedia));
      
      // Add new media files
      if (editNewMedia.length > 0) {
        editNewMedia.forEach((file) => {
          formData.append('media', file);
        });
      }

      const token = localStorage.getItem('token');
      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';
      const apiUrl = process.env.REACT_APP_API_URL || `${backendUrl}/api`;
      const response = await fetch(`${apiUrl}/posts/${editingPost._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update post');
      }

      const data = await response.json();
      setPosts(posts.map((p) => (p._id === editingPost._id ? data : p)));
      setEditingPost(null);
      setEditContent('');
      setEditMedia([]);
      setEditNewMedia([]);
      setEditNewMediaPreviews([]);
      toast.success('Post updated successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Failed to update post');
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

  const handleUpdateUsername = async () => {
    if (!editUsername.trim()) {
      toast.error('Username cannot be empty');
      return;
    }

    try {
      const response = await api.put('/user/profile/username', {
        name: editUsername.trim(),
      });
      setUser(response.data);
      localStorage.setItem('user', JSON.stringify(response.data));
      setEditingUsername(false);
      setEditUsername('');
      
      // Reload posts to reflect username changes
      const postsResponse = await api.get('/posts/user');
      setPosts(postsResponse.data);
      
      toast.success('Username updated successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update username');
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
<<<<<<< HEAD
      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';
      const apiUrl = process.env.REACT_APP_API_URL || `${backendUrl}/api`;
=======
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
>>>>>>> 4be1bb599a9e888a9339c8325377cea5eecd19d7
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
                  src={`${process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000'}${user.profilePhoto}`}
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
              {editingUsername ? (
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="text"
                    value={editUsername}
                    onChange={(e) => setEditUsername(e.target.value)}
                    className="text-3xl font-bold text-gray-800 border-2 border-blue-500 rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    placeholder="Enter username"
                    autoFocus
                  />
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleUpdateUsername}
                    className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                  >
                    <Save size={18} />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setEditingUsername(false);
                      setEditUsername('');
                    }}
                    className="p-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                  >
                    <X size={18} />
                  </motion.button>
                </div>
              ) : (
                <div className="flex items-center gap-2 mb-2">
                  <h1 className="text-3xl font-bold text-gray-800">{user?.name || 'User'}</h1>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setEditingUsername(true);
                      setEditUsername(user?.name || '');
                    }}
                    className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                    title="Edit username"
                  >
                    <Edit2 size={18} />
                  </motion.button>
                </div>
              )}
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
                        placeholder="What's on your mind?"
                      />
                      
                      {/* Existing Media */}
                      {editMedia.length > 0 && (
                        <div className="mb-4">
                          <h3 className="text-sm font-semibold text-gray-700 mb-2">Existing Media:</h3>
                          <div className={`grid gap-2 ${editMedia.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
                            {editMedia.map((mediaItem, index) => (
                              <div key={index} className="relative">
                                {mediaItem.type === 'video' ? (
                                  <video
                                    src={`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${mediaItem.path}`}
                                    controls
                                    className="w-full rounded-xl object-cover max-h-64"
                                  />
                                ) : (
                                  <img
                                    src={`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${mediaItem.path}`}
                                    alt={`Media ${index + 1}`}
                                    className="w-full rounded-xl object-cover max-h-64"
                                  />
                                )}
                                <motion.button
                                  type="button"
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => handleRemoveEditMedia(index, true)}
                                  className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                                >
                                  <X size={18} />
                                </motion.button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* New Media Previews */}
                      {editNewMediaPreviews.length > 0 && (
                        <div className="mb-4">
                          <h3 className="text-sm font-semibold text-gray-700 mb-2">New Media to Add:</h3>
                          <div className={`grid gap-2 ${editNewMediaPreviews.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
                            {editNewMediaPreviews.map((preview, index) => (
                              <div key={index} className="relative">
                                {preview.type === 'video' ? (
                                  <video
                                    src={preview.preview}
                                    controls
                                    className="w-full rounded-xl object-cover max-h-64"
                                  />
                                ) : (
                                  <img
                                    src={preview.preview}
                                    alt={`New media ${index + 1}`}
                                    className="w-full rounded-xl object-cover max-h-64"
                                  />
                                )}
                                <motion.button
                                  type="button"
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => handleRemoveEditMedia(index, false)}
                                  className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                                >
                                  <X size={18} />
                                </motion.button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Add Media Buttons */}
                      <div className="flex items-center gap-4 mb-4">
                        <label className="flex items-center gap-2 px-4 py-2 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-blue-500 transition-colors duration-300">
                          <ImageIcon size={20} className="text-gray-600" />
                          <span className="text-sm font-medium text-gray-600">Add Images</span>
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleMediaChange}
                            className="hidden"
                          />
                        </label>
                        <label className="flex items-center gap-2 px-4 py-2 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-blue-500 transition-colors duration-300">
                          <Video size={20} className="text-gray-600" />
                          <span className="text-sm font-medium text-gray-600">Add Videos</span>
                          <input
                            type="file"
                            accept="video/*"
                            multiple
                            onChange={handleMediaChange}
                            className="hidden"
                          />
                        </label>
                      </div>

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
                            setEditMedia([]);
                            setEditNewMedia([]);
                            setEditNewMediaPreviews([]);
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