import Post from '../models/Post.js';
import User from '../models/User.js';

export const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    const postsWithLikeStatus = await Promise.all(posts.map(async (post) => {
      const postObj = post.toObject();
      // Ensure likes array exists and check if user liked
      if (post.likes && Array.isArray(post.likes)) {
        postObj.isLiked = post.likes.some(
          (likeId) => likeId.toString() === req.user._id.toString()
        );
      } else {
        postObj.isLiked = false;
        postObj.likes = [];
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

    // Get image path if uploaded
    let imagePath = null;
    if (req.file) {
      imagePath = `/uploads/${req.file.filename}`;
    }

    const post = await Post.create({
      userId: req.user._id,
      username: req.user.name,
      content: content.trim(),
      image: imagePath,
      likes: [],
      comments: [],
    });

    const postObj = post.toObject();
    postObj.isLiked = false;
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
    const { content } = req.body;
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
    const updatedPost = await post.save();
    res.json(updatedPost);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getUserPosts = async (req, res) => {
  try {
    const posts = await Post.find({ userId: req.user._id }).sort({ createdAt: -1 });
    const user = await User.findById(req.user._id).select('profilePhoto');
    const postsWithLikeStatus = posts.map(post => {
      const postObj = post.toObject();
      // Ensure likes array exists and check if user liked
      if (post.likes && Array.isArray(post.likes)) {
        postObj.isLiked = post.likes.some(
          (likeId) => likeId.toString() === req.user._id.toString()
        );
      } else {
        postObj.isLiked = false;
        postObj.likes = [];
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
    });
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
    if (post.likes && Array.isArray(post.likes)) {
      postObj.isLiked = post.likes.some(
        (likeId) => likeId.toString() === req.user._id.toString()
      );
    } else {
      postObj.isLiked = false;
    }
    res.status(201).json(postObj);
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ message: error.message });
  }
};
