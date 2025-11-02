import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Image as ImageIcon, Video, X } from 'lucide-react';

const CreatePost = ({ onSubmit }) => {
  const [content, setContent] = useState('');
  const [mediaFiles, setMediaFiles] = useState([]);
  const [mediaPreviews, setMediaPreviews] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleMediaChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const validFiles = [];
    const newPreviews = [];

    files.forEach((file) => {
      // Check file size (50MB for videos, 5MB for images)
      const maxSize = file.type.startsWith('video/') ? 50 * 1024 * 1024 : 5 * 1024 * 1024;
      if (file.size > maxSize) {
        alert(`${file.name} is too large. Max size: ${file.type.startsWith('video/') ? '50MB' : '5MB'}`);
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
          setMediaPreviews([...mediaPreviews, ...newPreviews]);
          setMediaFiles([...mediaFiles, ...validFiles]);
        }
      };
      reader.readAsDataURL(file);
    });

    // Reset input
    e.target.value = '';
  };

  const handleRemoveMedia = (index) => {
    const newFiles = mediaFiles.filter((_, i) => i !== index);
    const newPreviews = mediaPreviews.filter((_, i) => i !== index);
    setMediaFiles(newFiles);
    setMediaPreviews(newPreviews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() && mediaFiles.length === 0) {
      return;
    }
    setIsSubmitting(true);
    await onSubmit(content, mediaFiles);
    setContent('');
    setMediaFiles([]);
    setMediaPreviews([]);
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
        
        {mediaPreviews.length > 0 && (
          <div className="grid grid-cols-2 gap-4 mb-4">
            {mediaPreviews.map((preview, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative"
              >
                {preview.type === 'video' ? (
                  <video
                    src={preview.preview}
                    controls
                    className="w-full rounded-xl object-cover max-h-96"
                  />
                ) : (
                  <img
                    src={preview.preview}
                    alt={`Preview ${index + 1}`}
                    className="w-full rounded-xl object-cover max-h-96"
                  />
                )}
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleRemoveMedia(index)}
                  className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                >
                  <X size={18} />
                </motion.button>
              </motion.div>
            ))}
          </div>
        )}

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
              disabled={isSubmitting}
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
              disabled={isSubmitting}
            />
          </label>
          {mediaFiles.length > 0 && (
            <span className="text-sm text-gray-500">{mediaFiles.length} file{mediaFiles.length > 1 ? 's' : ''} selected</span>
          )}
        </div>

        <motion.button
          type="submit"
          disabled={(!content.trim() && mediaFiles.length === 0) || isSubmitting}
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