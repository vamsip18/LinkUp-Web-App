import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Image as ImageIcon, X } from 'lucide-react';

const CreatePost = ({ onSubmit }) => {
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImage(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() && !image) {
      return;
    }
    setIsSubmitting(true);
    await onSubmit(content, image);
    setContent('');
    setImage(null);
    setImagePreview(null);
    setIsSubmitting(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-lg p-6 mb-6"
    >
      <h2 className="text-xl font-bold text-gray-800 mb-4">Create a Post</h2>
      <form onSubmit={handleSubmit}>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What's on your mind?"
          className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all duration-300 resize-none mb-4"
          rows="4"
          disabled={isSubmitting}
        />
        
        {imagePreview && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative mb-4"
          >
            <img
              src={imagePreview}
              alt="Preview"
              className="w-full rounded-xl object-cover max-h-96"
            />
            <motion.button
              type="button"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleRemoveImage}
              className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
            >
              <X size={18} />
            </motion.button>
          </motion.div>
        )}

        <div className="flex items-center gap-4 mb-4">
          <label className="flex items-center gap-2 px-4 py-2 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-blue-500 transition-colors duration-300">
            <ImageIcon size={20} className="text-gray-600" />
            <span className="text-sm font-medium text-gray-600">Add Image</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
              disabled={isSubmitting}
            />
          </label>
          {image && (
            <span className="text-sm text-gray-500">{image.name}</span>
          )}
        </div>

        <motion.button
          type="submit"
          disabled={(!content.trim() && !image) || isSubmitting}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full py-3 px-6 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold shadow-lg hover:shadow-xl transition-shadow duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <Send size={20} />
          {isSubmitting ? 'Posting...' : 'Post'}
        </motion.button>
      </form>
    </motion.div>
  );
};

export default CreatePost;