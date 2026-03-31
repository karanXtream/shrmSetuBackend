import AWS from 'aws-sdk';
import dotenv from 'dotenv';

dotenv.config();

// Configure AWS SDK
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

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
    return result.Location; // Returns the S3 URL
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
    const key = fileUrl.split('.amazonaws.com/')[1];
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

export default s3;
