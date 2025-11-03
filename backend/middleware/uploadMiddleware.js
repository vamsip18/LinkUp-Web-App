import multer from 'multer';
import path from 'path';

// Use memory storage so we can stream files to Cloudinary
const storage = multer.memoryStorage();

// File filter - images and videos
const fileFilter = (req, file, cb) => {
  const allowedImageTypes = /jpeg|jpg|png|gif|webp/;
  const allowedVideoTypes = /mp4|mov|avi|mkv|webm/;
  const extname = path.extname(file.originalname).toLowerCase().replace('.', '');
  const mimetype = file.mimetype;

  const isImage = allowedImageTypes.test(extname) && mimetype.startsWith('image/');
  const isVideo = allowedVideoTypes.test(extname) && mimetype.startsWith('video/');

  if (isImage || isVideo) {
    return cb(null, true);
  } else {
    cb(new Error('Only image (jpeg, jpg, png, gif, webp) and video (mp4, mov, avi, mkv, webm) files are allowed'));
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit for videos
  },
  fileFilter: fileFilter,
});

export default upload;
