import multer from 'multer';
import path from 'path';

/**
 * Multer configuration for memory storage (before S3 upload)
 * Files are stored in memory temporarily, then uploaded to S3
 */
const storage = multer.memoryStorage();

/**
 * File filter - validate file types
 */
const fileFilter = (req, file, cb) => {
  const allowedImageTypes = /jpeg|jpg|png|webp/;
  const allowedVideoTypes = /mp4|mov|avi|mkv/;
  
  const extname = path.extname(file.originalname).toLowerCase().slice(1);
  const mimeType = file.mimetype;

  // Check image files
  if (file.fieldname.includes('Photo') && allowedImageTypes.test(mimeType)) {
    return cb(null, true);
  }

  // Check video files
  if (file.fieldname.includes('Video') && allowedVideoTypes.test(mimeType)) {
    return cb(null, true);
  }

  cb(new Error(`Invalid file type for ${file.fieldname}. Only images (jpeg, jpg, png, webp) or videos (mp4, mov, avi, mkv) allowed`));
};

/**
 * Multer upload instance
 */
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB max file size
  },
});

/**
 * Validate uploaded files
 */
export const validateUploadedFiles = (req, res, next) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    // Files are optional for registration
    return next();
  }

  // Check file sizes
  Object.values(req.files).flat().forEach(file => {
    if (file.size > 100 * 1024 * 1024) {
      return res.status(400).json({
        success: false,
        message: `File ${file.originalname} exceeds 100MB limit`,
      });
    }
  });

  next();
};
