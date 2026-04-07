import * as userService from '../services/user.service.js';
import { uploadToS3, getCloudFrontUrl } from '../config/aws.js';
import { validatePhoneNumber, validateEmail, validatePincode } from '../utils/validation.utils.js';

/**
 * Auth Controller - User registration and login
 */

/**
 * POST /api/auth/register
 * Register a new user (normal user or worker)
 */
export const register = async (req, res) => {
  try {
    const { fullName, phoneNumber, email, password, role, city, state, pincode, addressLine1, addressLine2, skills, education, yearsOfExperience } = req.body;
    const normalizedRole = role === 'work' ? 'worker' : role === 'hire' ? 'user' : role;

    // Validate required fields
    if (!fullName || !phoneNumber || !email || !password || !city || !state || !pincode || !addressLine1) {
      return res.status(400).json({
        success: false,
        message: 'Full name, phone number, email, password, city, state, pincode, and address line 1 are required',
      });
    }

    // Validate phone number
    if (!validatePhoneNumber(phoneNumber)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid phone number (must be 10 digits)',
      });
    }

    // Validate email
    if (!validateEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format',
      });
    }

    // Validate pincode
    if (!validatePincode(pincode)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid pincode (must be 6 digits)',
      });
    }

    // Upload files to S3
    let profilePhotoUrl = null;
    let shopPhotosUrls = [];
    let introVideoUrl = null;

    if (req.files) {
      try {
        // Upload profile photo
        if (req.files.profilePhoto && req.files.profilePhoto[0]) {
          const file = req.files.profilePhoto[0];
          profilePhotoUrl = await uploadToS3(
            file.buffer,
            file.originalname,
            file.mimetype
          );
        }

        // Upload shop photos
        if (req.files.shopPhotos && req.files.shopPhotos.length > 0) {
          for (const file of req.files.shopPhotos) {
            const url = await uploadToS3(
              file.buffer,
              file.originalname,
              file.mimetype
            );
            shopPhotosUrls.push(url);
          }
        }

        // Upload intro video
        if (req.files.introVideo && req.files.introVideo[0]) {
          const file = req.files.introVideo[0];
          introVideoUrl = await uploadToS3(
            file.buffer,
            file.originalname,
            file.mimetype
          );
        }
      } catch (uploadError) {
        return res.status(400).json({
          success: false,
          message: `File upload failed: ${uploadError.message}`,
        });
      }
    }

    // Register user with media URLs
    const user = await userService.registerUser({
      fullName,
      phoneNumber,
      email,
      password,
      role: normalizedRole || 'user',
      location: {
        city,
        state,
        pincode,
        addressLine1,
        addressLine2: addressLine2 || '',
      },
      media: {
        profilePhoto: profilePhotoUrl,
        shopPhotos: shopPhotosUrls,
        introductoryVideo: introVideoUrl,
      },
      // Worker-specific fields
      workerData: normalizedRole === 'worker' ? {
        education: education || '',
        experienceYears: yearsOfExperience || 0,
        skills: skills || [],
      } : null,
    });

    // Return CloudFront URLs for fast media delivery
    if (user && user.media) {
      user.media.profilePhoto = user.media.profilePhoto ? getCloudFrontUrl(user.media.profilePhoto) : null;
      user.media.shopPhotos = user.media.shopPhotos?.map(url => getCloudFrontUrl(url));
      user.media.introductoryVideo = user.media.introductoryVideo ? getCloudFrontUrl(user.media.introductoryVideo) : null;
    }

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: user,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * POST /api/auth/login
 * Login user with phone/email and password
 */
export const login = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email/Phone and password are required',
      });
    }

    const user = await userService.loginUser(identifier, password);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: user,
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * POST /api/auth/verify-phone
 * Verify phone number (mark as verified)
 */
export const verifyPhone = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required',
      });
    }

    const user = await userService.verifyPhoneNumber(userId);

    res.status(200).json({
      success: true,
      message: 'Phone number verified',
      data: user,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
