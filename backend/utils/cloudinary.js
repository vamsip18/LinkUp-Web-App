import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadToCloudinary = (buffer, folder, filename, mimetype) => {
  return new Promise((resolve, reject) => {
    const resourceType = mimetype && mimetype.startsWith('video/') ? 'video' : 'image';
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'auto',
        folder,
        public_id: filename,
        overwrite: true,
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    uploadStream.end(buffer);
  });
};

export const deleteFromCloudinary = async (publicId, type) => {
  if (!publicId) return;
  const resourceType = type === 'video' ? 'video' : 'image';
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
  } catch (e) {
    // Swallow deletion errors to avoid breaking user flows
    console.error('Cloudinary delete error:', e.message);
  }
};

export default cloudinary;


