import User from '../models/User.js';
import Post from '../models/Post.js';

export const uploadProfilePhoto = async (req, res) => {
  try {
    const userId = req.user._id;
    
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    const imagePath = `/uploads/${req.file.filename}`;
    
    const user = await User.findByIdAndUpdate(
      userId,
      { profilePhoto: imagePath },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      profilePhoto: user.profilePhoto,
    });
  } catch (error) {
    console.error('Upload profile photo error:', error);
    res.status(500).json({ message: error.message });
  }
};

export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      profilePhoto: user.profilePhoto,
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({ message: error.message });
  }
};

export const updateUsername = async (req, res) => {
  try {
    const { name } = req.body;
    const userId = req.user._id;

    if (!name || name.trim() === '') {
      return res.status(400).json({ message: 'Username is required' });
    }

    const trimmedName = name.trim();

    // Update user's name
    const user = await User.findByIdAndUpdate(
      userId,
      { name: trimmedName },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update username in all posts by this user
    await Post.updateMany(
      { userId: userId },
      { $set: { username: trimmedName } }
    );

    // Update username in all comments by this user
    await Post.updateMany(
      { 'comments.userId': userId },
      { $set: { 'comments.$[elem].username': trimmedName } },
      { arrayFilters: [{ 'elem.userId': userId }] }
    );

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      profilePhoto: user.profilePhoto,
    });
  } catch (error) {
    console.error('Update username error:', error);
    res.status(500).json({ message: error.message });
  }
};
