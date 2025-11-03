import Post from '../models/Post.js';
import User from '../models/User.js';
import cloudinary from '../config/cloudinary.js';

export const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    const postsWithLikeStatus = await Promise.all(posts.map(async (post) => {
      const postObj = post.toObject();
      // Ensure likes array exists and check if user liked
      if (post.likes && Array.isArray(post.likes) && post.likes.length > 0) {
        postObj.isLiked = post.likes.some(
          (likeId) => likeId.toString() === req.user._id.toString()
        );
        // Populate user information for likes (get last 4 most recent likes)
        const likeUserIds = post.likes.slice(-4).reverse(); // Get last 4 and reverse for most recent first
        const likeUsers = await User.find({ _id: { $in: likeUserIds } }).select('name profilePhoto');
        postObj.likedUsers = likeUsers.map(user => ({
          _id: user._id.toString(),
          name: user.name,
          profilePhoto: user.profilePhoto,
        }));
        postObj.totalLikes = post.likes.length;
      } else {
        postObj.isLiked = false;
        postObj.likes = [];
        postObj.likedUsers = [];
        postObj.totalLikes = 0;
      }
      // Ensure comments array exists
      if (!postObj.comments) {
        postObj.comments = [];
      }
      // Get user profile photo
      const user = await User.findById(post.userId).select('profilePhoto');
      if (user) {
        postObj.userProfilePhoto = user.profilePhoto;
      }
      return postObj;
    }));
    res.json(postsWithLikeStatus);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createPost = async (req, res) => {
  try {
    const { content } = req.body;

    if (!content || content.trim() === '') {
      return res.status(400).json({ message: 'Post content is required' });
    }

    // Process multiple media files via Cloudinary
    const media = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const mediaType = file.mimetype.startsWith('video/') ? 'video' : 'image';
        const uploadRes = await cloudinary.uploader.upload_stream
          ? await new Promise((resolve, reject) => {
              const stream = cloudinary.uploader.upload_stream(
                { resource_type: 'auto', folder: 'linkup/posts' },
                (error, result) => {
                  if (error) return reject(error);
                  resolve(result);
                }
              );
              stream.end(file.buffer);
            })
          : await cloudinary.uploader.upload(`data:${file.mimetype};base64,${file.buffer.toString('base64')}`, { resource_type: 'auto', folder: 'linkup/posts' });
        media.push({ type: mediaType, path: uploadRes.secure_url, publicId: uploadRes.public_id });
      }
    }

    // Keep backward compatibility with single image field (use first image URL)
    let imagePath = null;
    const firstImage = media.find(m => m.type === 'image');
    if (firstImage) {
      imagePath = firstImage.path;
    }

    const post = await Post.create({
      userId: req.user._id,
      username: req.user.name,
      content: content.trim(),
      image: imagePath, // Keep for backward compatibility
      media: media,
      likes: [],
      comments: [],
    });

    const postObj = post.toObject();
    postObj.isLiked = false;
    postObj.likedUsers = [];
    postObj.totalLikes = 0;
    res.status(201).json(postObj);
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ message: error.message });
  }
};

export const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (post.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this post' });
    }

    await Post.findByIdAndDelete(req.params.id);
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updatePost = async (req, res) => {
  try {
    const { content, deletedMedia, keepMedia } = req.body;
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (post.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to edit this post' });
    }

    if (!content || content.trim() === '') {
      return res.status(400).json({ message: 'Post content is required' });
    }

    post.content = content.trim();

    // Handle media updates
    let media = [];
    
    // Parse keepMedia if it's a JSON string
    let parsedKeepMedia = null;
    if (keepMedia) {
      try {
        parsedKeepMedia = typeof keepMedia === 'string' ? JSON.parse(keepMedia) : keepMedia;
      } catch (e) {
        // If parsing fails, treat as if keepMedia wasn't provided
        parsedKeepMedia = null;
      }
    }
    
    // Keep existing media if specified
    if (parsedKeepMedia && Array.isArray(parsedKeepMedia) && parsedKeepMedia.length > 0) {
      media = parsedKeepMedia.map(item => ({
        type: item.type,
        path: item.path,
      }));
    } else if (!parsedKeepMedia && post.media && Array.isArray(post.media)) {
      // If keepMedia not specified, keep all existing media
      media = [...post.media];
    }

    // Remove deleted media and delete from Cloudinary when possible
    if (deletedMedia && Array.isArray(deletedMedia)) {
      const toDelete = post.media.filter(pm => deletedMedia.includes(pm.path));
      for (const item of toDelete) {
        if (item.publicId) {
          try {
            await cloudinary.uploader.destroy(item.publicId, { resource_type: item.type === 'video' ? 'video' : 'image' });
          } catch (e) {
            console.error('Cloudinary destroy error:', e.message);
          }
        }
      }
      media = media.filter(item => !deletedMedia.includes(item.path));
    }

    // Add new media files via Cloudinary
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const mediaType = file.mimetype.startsWith('video/') ? 'video' : 'image';
        const uploadRes = await cloudinary.uploader.upload_stream
          ? await new Promise((resolve, reject) => {
              const stream = cloudinary.uploader.upload_stream(
                { resource_type: 'auto', folder: 'linkup/posts' },
                (error, result) => {
                  if (error) return reject(error);
                  resolve(result);
                }
              );
              stream.end(file.buffer);
            })
          : await cloudinary.uploader.upload(`data:${file.mimetype};base64,${file.buffer.toString('base64')}`, { resource_type: 'auto', folder: 'linkup/posts' });
        media.push({ type: mediaType, path: uploadRes.secure_url, publicId: uploadRes.public_id });
      }
    }

    post.media = media;

    // Update image field for backward compatibility (use first image)
    const firstImage = media.find(m => m.type === 'image');
    post.image = firstImage ? firstImage.path : null;

    const updatedPost = await post.save();
    
    // Get user profile photo for response
    const user = await User.findById(post.userId).select('profilePhoto');
    const postObj = updatedPost.toObject();
    if (user) {
      postObj.userProfilePhoto = user.profilePhoto;
    }
    postObj.isLiked = post.likes && post.likes.some(
      (likeId) => likeId.toString() === req.user._id.toString()
    );
    
    // Populate user information for likes
    if (post.likes && post.likes.length > 0) {
      const likeUserIds = post.likes.slice(-4).reverse();
      const likeUsers = await User.find({ _id: { $in: likeUserIds } }).select('name profilePhoto');
      postObj.likedUsers = likeUsers.map(user => ({
        _id: user._id.toString(),
        name: user.name,
        profilePhoto: user.profilePhoto,
      }));
      postObj.totalLikes = post.likes.length;
    } else {
      postObj.likedUsers = [];
      postObj.totalLikes = 0;
    }

    res.json(postObj);
  } catch (error) {
    console.error('Update post error:', error);
    res.status(500).json({ message: error.message });
  }
};

export const getUserPosts = async (req, res) => {
  try {
    const posts = await Post.find({ userId: req.user._id }).sort({ createdAt: -1 });
    const user = await User.findById(req.user._id).select('profilePhoto');
    const postsWithLikeStatus = await Promise.all(posts.map(async (post) => {
      const postObj = post.toObject();
      // Ensure likes array exists and check if user liked
      if (post.likes && Array.isArray(post.likes) && post.likes.length > 0) {
        postObj.isLiked = post.likes.some(
          (likeId) => likeId.toString() === req.user._id.toString()
        );
        // Populate user information for likes (get last 4 most recent likes)
        const likeUserIds = post.likes.slice(-4).reverse(); // Get last 4 and reverse for most recent first
        const likeUsers = await User.find({ _id: { $in: likeUserIds } }).select('name profilePhoto');
        postObj.likedUsers = likeUsers.map(user => ({
          _id: user._id.toString(),
          name: user.name,
          profilePhoto: user.profilePhoto,
        }));
        postObj.totalLikes = post.likes.length;
      } else {
        postObj.isLiked = false;
        postObj.likes = [];
        postObj.likedUsers = [];
        postObj.totalLikes = 0;
      }
      // Ensure comments array exists
      if (!postObj.comments) {
        postObj.comments = [];
      }
      // Add user profile photo
      if (user) {
        postObj.userProfilePhoto = user.profilePhoto;
      }
      return postObj;
    }));
    res.json(postsWithLikeStatus);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const likePost = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: 'Post ID is required' });
    }

    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Initialize likes array if it doesn't exist (for older posts)
    if (!post.likes) {
      post.likes = [];
    }

    const userId = req.user._id;
    const isLiked = post.likes.some(
      (likeId) => likeId.toString() === userId.toString()
    );

    if (isLiked) {
      post.likes = post.likes.filter(
        (likeId) => likeId.toString() !== userId.toString()
      );
    } else {
      post.likes.push(userId);
    }

    await post.save();
    const postObj = post.toObject();
    postObj.isLiked = post.likes.some(
      (likeId) => likeId.toString() === userId.toString()
    );
    
    // Populate user information for likes
    if (post.likes && post.likes.length > 0) {
      const likeUserIds = post.likes.slice(-4).reverse(); // Get last 4 and reverse for most recent first
      const likeUsers = await User.find({ _id: { $in: likeUserIds } }).select('name profilePhoto');
      postObj.likedUsers = likeUsers.map(user => ({
        _id: user._id.toString(),
        name: user.name,
        profilePhoto: user.profilePhoto,
      }));
      postObj.totalLikes = post.likes.length;
    } else {
      postObj.likedUsers = [];
      postObj.totalLikes = 0;
    }
    
    res.json(postObj);
  } catch (error) {
    console.error('Like post error:', error);
    res.status(500).json({ message: error.message });
  }
};

export const addComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    if (!id) {
      return res.status(400).json({ message: 'Post ID is required' });
    }

    if (!content || content.trim() === '') {
      return res.status(400).json({ message: 'Comment content is required' });
    }

    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Initialize comments array if it doesn't exist (for older posts)
    if (!post.comments) {
      post.comments = [];
    }

    const comment = {
      userId: req.user._id,
      username: req.user.name,
      content: content.trim(),
    };

    post.comments.push(comment);
    await post.save();

    const postObj = post.toObject();
    // Initialize likes check if likes array doesn't exist
    if (post.likes && Array.isArray(post.likes) && post.likes.length > 0) {
      postObj.isLiked = post.likes.some(
        (likeId) => likeId.toString() === req.user._id.toString()
      );
      // Populate user information for likes
      const likeUserIds = post.likes.slice(-4).reverse();
      const likeUsers = await User.find({ _id: { $in: likeUserIds } }).select('name profilePhoto');
      postObj.likedUsers = likeUsers.map(user => ({
        _id: user._id.toString(),
        name: user.name,
        profilePhoto: user.profilePhoto,
      }));
      postObj.totalLikes = post.likes.length;
    } else {
      postObj.isLiked = false;
      postObj.likedUsers = [];
      postObj.totalLikes = 0;
    }
    res.status(201).json(postObj);
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ message: error.message });
  }
};
