import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../utils/api';
import CreatePost from '../components/CreatePost';
import PostCard from '../components/PostCard';
import { RefreshCw } from 'lucide-react';

const FeedPage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPosts = async () => {
    try {
      const response = await api.get('/posts');
      setPosts(response.data);
    } catch (error) {
      toast.error('Failed to load posts');
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleCreatePost = async (content, mediaFiles) => {
    try {
      const formData = new FormData();
      formData.append('content', content);
      if (mediaFiles && mediaFiles.length > 0) {
        mediaFiles.forEach((file) => {
          formData.append('media', file);
        });
      }

      const token = localStorage.getItem('token');
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/posts`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create post');
      }

      const data = await response.json();
      setPosts([data, ...posts]);
      toast.success('Post created successfully!');
    } catch (error) {
      toast.error(error.message || 'Failed to create post');
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

  const handleRefresh = () => {
    setRefreshing(true);
    fetchPosts();
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
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-6"
        >
          <h1 className="text-3xl font-bold text-gray-800">Feed</h1>
          <motion.button
            whileHover={{ scale: 1.1, rotate: 180 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow"
          >
            <RefreshCw size={20} className={refreshing ? 'animate-spin' : ''} />
          </motion.button>
        </motion.div>

        <CreatePost onSubmit={handleCreatePost} />

        <div className="space-y-4">
          {posts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12 bg-white rounded-2xl shadow-lg"
            >
              <p className="text-gray-600 text-lg">No posts yet. Be the first to post!</p>
            </motion.div>
          ) : (
            posts.map((post, index) => (
              <motion.div
                key={post._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <PostCard
                  post={post}
                  onLike={handleLike}
                  onComment={handleComment}
                  canEdit={false}
                  showActions={true}
                />
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default FeedPage;