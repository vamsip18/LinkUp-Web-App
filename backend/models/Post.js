import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

const postSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: [true, 'Post content is required'],
    trim: true,
  },
  image: {
    type: String,
    default: null,
  },
  media: [{
    type: {
      type: String,
      enum: ['image', 'video'],
      required: true,
    },
    path: {
      type: String,
      required: true,
    },
    publicId: {
      type: String,
      default: null,
    },
  }],
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  comments: [commentSchema],
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

const Post = mongoose.model('Post', postSchema);

export default Post;
