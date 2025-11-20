const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const { Readable } = require('stream');

// Validate Cloudinary configuration
const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

if (!cloudName || !apiKey || !apiSecret) {
  console.warn('⚠️  Cloudinary configuration missing!');
  console.warn('   Please set the following environment variables:');
  console.warn('   - CLOUDINARY_CLOUD_NAME');
  console.warn('   - CLOUDINARY_API_KEY');
  console.warn('   - CLOUDINARY_API_SECRET');
  console.warn('   Image uploads will fail without these credentials.');
} else {
  console.log('✅ Cloudinary configuration found');
  console.log('   Cloud Name:', cloudName);
  console.log('   API Key:', apiKey ? `${apiKey.substring(0, 4)}...` : 'Not set');
}

// Get max file size from environment variable or default to 10MB
const MAX_FILE_SIZE = process.env.MAX_FILE_SIZE 
  ? parseInt(process.env.MAX_FILE_SIZE) 
  : 10 * 1024 * 1024; // Default 10MB, can be set via env variable (in bytes)

// Log file size limit
const maxSizeMB = MAX_FILE_SIZE / (1024 * 1024);
console.log(`📦 Max upload file size: ${maxSizeMB}MB`);

// Configure Cloudinary
cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
});

// Configure multer to use memory storage
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: {
    fileSize: MAX_FILE_SIZE, // Configurable via MAX_FILE_SIZE env variable (default: 10MB)
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  },
});

// Cloudinary free tier limit: 10MB (10,485,760 bytes)
const CLOUDINARY_MAX_SIZE = 10 * 1024 * 1024; // 10MB

// Helper function to upload image to Cloudinary
const uploadImage = (buffer, folder = 'veggie-store/products') => {
  return new Promise((resolve, reject) => {
    // Check if Cloudinary is configured
    if (!cloudName || !apiKey || !apiSecret) {
      return reject(new Error('Cloudinary is not configured. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET environment variables.'));
    }

    if (!buffer || buffer.length === 0) {
      return reject(new Error('Empty buffer provided for upload'));
    }

    const fileSizeMB = (buffer.length / (1024 * 1024)).toFixed(2);
    console.log(`☁️  Uploading image to Cloudinary folder: ${folder}`);
    console.log(`   Buffer size: ${buffer.length} bytes (${fileSizeMB} MB)`);

    // Check if file exceeds Cloudinary free tier limit
    if (buffer.length > CLOUDINARY_MAX_SIZE) {
      const errorMessage = `File size (${fileSizeMB}MB) exceeds Cloudinary free tier limit of 10MB. Please compress the image or upgrade your Cloudinary plan.`;
      console.error(`❌ ${errorMessage}`);
      return reject(new Error(errorMessage));
    }

    // Use eager transformations to compress and optimize the image
    // This helps reduce file size during upload
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: folder,
        // Use eager transformations for automatic compression
        eager: [
          {
            width: 1200,
            height: 1200,
            crop: 'limit',
            quality: 'auto:good', // Auto quality with good compression
            fetch_format: 'auto' // Auto format (webp if supported)
          }
        ],
        // Transformation for the main image
        transformation: [
          {
            width: 1200,
            height: 1200,
            crop: 'limit', // Maintain aspect ratio, limit dimensions
            quality: 'auto:good', // Auto quality with good compression
            fetch_format: 'auto' // Auto format (webp if supported)
          }
        ],
        // Resource type
        resource_type: 'image',
      },
      (error, result) => {
        if (error) {
          console.error('❌ Cloudinary upload_stream error:', error);
          
          // Provide helpful error messages
          if (error.message && error.message.includes('File size too large')) {
            const helpfulError = new Error(
              `Image file is too large (${fileSizeMB}MB). Cloudinary free tier allows maximum 10MB. ` +
              `Please compress your image before uploading or upgrade your Cloudinary plan. ` +
              `You can use online tools like TinyPNG or compress images using image editing software.`
            );
            helpfulError.http_code = 400;
            return reject(helpfulError);
          }
          
          reject(error);
        } else {
          if (result && result.secure_url) {
            console.log('✅ Cloudinary upload_stream success');
            console.log(`   URL: ${result.secure_url}`);
            console.log(`   Public ID: ${result.public_id}`);
            if (result.bytes) {
              const uploadedSizeMB = (result.bytes / (1024 * 1024)).toFixed(2);
              console.log(`   Uploaded size: ${result.bytes} bytes (${uploadedSizeMB} MB)`);
            }
          } else {
            console.error('❌ Cloudinary upload_stream: Invalid result', result);
            reject(new Error('Invalid response from Cloudinary: missing secure_url'));
          }
          resolve(result);
        }
      }
    );

    const readableStream = new Readable();
    readableStream.push(buffer);
    readableStream.push(null);
    readableStream.pipe(uploadStream);
  });
};

// Helper function to delete image from Cloudinary
const deleteImage = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Error deleting image from Cloudinary:', error);
    throw error;
  }
};

// Helper function to extract public_id from Cloudinary URL
const extractPublicId = (url) => {
  if (!url) return null;
  
  // Check if it's a Cloudinary URL
  if (!url.includes('cloudinary.com')) {
    return null; // Not a Cloudinary URL
  }
  
  // Extract public_id from Cloudinary URL
  // Format 1: https://res.cloudinary.com/{cloud_name}/image/upload/v{version}/{folder}/{public_id}.{ext}
  // Format 2: https://res.cloudinary.com/{cloud_name}/image/upload/v{version}/{public_id}.{ext}
  // Format 3: https://res.cloudinary.com/{cloud_name}/image/upload/{folder}/{public_id}.{ext}
  // Format 4: https://res.cloudinary.com/{cloud_name}/image/upload/{public_id}.{ext}
  
  let matches = url.match(/\/image\/upload\/v\d+\/(.+)\.(jpg|jpeg|png|gif|webp|svg)/i);
  if (matches && matches[1]) {
    return matches[1];
  }
  
  // Try without version number
  matches = url.match(/\/image\/upload\/(.+)\.(jpg|jpeg|png|gif|webp|svg)/i);
  if (matches && matches[1]) {
    return matches[1];
  }
  
  return null;
};

module.exports = {
  cloudinary,
  upload,
  uploadImage,
  deleteImage,
  extractPublicId,
};

