import AWS from 'aws-sdk';
import dotenv from 'dotenv';

dotenv.config();

const CLOUDFRONT_DOMAIN = process.env.CLOUDFRONT_DOMAIN;

// Configure AWS SDK
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

/**
 * Convert S3 URL to CloudFront URL for fast CDN access
 * @param {string} s3Url - S3 URL
 * @returns {string} - CloudFront URL or S3 URL if CloudFront not configured
 */
const getCloudFrontUrl = (s3Url) => {
  if (!s3Url || !CLOUDFRONT_DOMAIN) return s3Url;
  try {
    const key = s3Url.split('.amazonaws.com/')[1];
    return key ? `https://${CLOUDFRONT_DOMAIN}/${key}` : s3Url;
  } catch (error) {
    return s3Url;
  }
};

/**
 * Upload file to S3
 * @param {Buffer} fileBuffer - File buffer from multer
 * @param {string} fileName - Original filename
 * @param {string} mimeType - File MIME type
 * @returns {Promise<string>} - S3 file URL
 */
export const uploadToS3 = async (fileBuffer, fileName, mimeType) => {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(7);
  const key = `uploads/${timestamp}-${randomString}-${fileName}`;

  const params = {
    Bucket: process.env.AWS_S3_BUCKET,
    Key: key,
    Body: fileBuffer,
    ContentType: mimeType,
    // ACL removed - bucket has ACLs disabled
  };

  try {
    const result = await s3.upload(params).promise();
    // Return CloudFront URL for fast media delivery
    return getCloudFrontUrl(result.Location) || result.Location;
  } catch (error) {
    throw new Error(`S3 upload failed: ${error.message}`);
  }
};

/**
 * Delete file from S3
 * @param {string} fileUrl - S3 file URL
 * @returns {Promise<boolean>}
 */
export const deleteFromS3 = async (fileUrl) => {
  if (!fileUrl) return false;

  try {
    // Handle both S3 and CloudFront URLs
    let key = fileUrl.split('.amazonaws.com/')[1] || fileUrl.split(`${CLOUDFRONT_DOMAIN}/`)[1];
    await s3.deleteObject({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key,
    }).promise();
    return true;
  } catch (error) {
    console.error(`S3 delete failed: ${error.message}`);
    return false;
  }
};

export { getCloudFrontUrl };

export default s3;
