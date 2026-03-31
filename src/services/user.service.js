import User from '../models/User.js';
import { hashPassword, comparePassword } from '../utils/auth.utils.js';
import { validateEmail, validatePhoneNumber } from '../utils/validation.utils.js';

/**
 * User Service - All user-related operations
 */

/**
 * Helper: Enhance user data with worker profile if user is a worker
 */
const enhanceUserWithWorkerData = async (user) => {
  if (!user) return null;

  // Convert to plain object if needed
  const userData = user.toObject ? user.toObject() : user;

  // If user is a worker, fetch and attach worker profile
  if (userData.role === 'worker') {
    const { default: WorkerProfile } = await import('../models/Worker.js');
    const workerProfile = await WorkerProfile.findOne({ userId: userData._id });
    
    if (workerProfile) {
      userData.workerProfile = workerProfile.toObject ? workerProfile.toObject() : workerProfile;
    }
  }

  return userData;
};

/**
 * Register a new user
 * @param {object} userData - { fullName, phoneNumber, email, password, role, location, media }
 * @returns {object} - Created user without passwordHash
 */
export const registerUser = async (userData) => {
  const { fullName, phoneNumber, email, password, role = 'user', location, media } = userData;

  // Validate inputs
  if (!fullName || !phoneNumber || !password) {
    throw new Error('Full name, phone number, and password are required');
  }

  if (!validatePhoneNumber(phoneNumber)) {
    throw new Error('Invalid phone number format (must be 10 digits)');
  }

  if (email && !validateEmail(email)) {
    throw new Error('Invalid email format');
  }

  // Check if user already exists
  const existingUser = await User.findOne({
    $or: [{ phoneNumber }, { email }],
  });

  if (existingUser) {
    throw new Error('User with this phone number or email already exists');
  }

  // Hash password
  const passwordHash = await hashPassword(password);

  // Create user with location
  const user = await User.create({
    fullName,
    phoneNumber,
    email,
    passwordHash,
    role,
    location: location || {},
  });

  // If user is worker, create worker profile with media
  if (role === 'worker' && media) {
    const { default: WorkerProfile } = await import('../../models/Worker.js');
    await WorkerProfile.create({
      userId: user._id,
      media: {
        profilePhoto: media.profilePhoto,
        shopPhotos: media.shopPhotos || [],
        introductoryVideo: media.introductoryVideo,
      },
    });
  }

  return user.toSafeJSON();
};

/**
 * Login user
 * @param {string} identifier - Phone number or email
 * @param {string} password - Plain text password
 * @returns {object} - User data without passwordHash
 */
export const loginUser = async (identifier, password) => {
  if (!identifier || !password) {
    throw new Error('Email/Phone and password are required');
  }

  // Find user by phone or email
  const user = await User.findOne({
    $or: [{ phoneNumber: identifier }, { email: identifier }],
  }).select('+passwordHash');

  if (!user) {
    throw new Error('User not found');
  }

  // Compare password
  const isPasswordValid = await comparePassword(password, user.passwordHash);
  if (!isPasswordValid) {
    throw new Error('Invalid password');
  }

  // Check if user is active
  if (!user.isActive) {
    throw new Error('User account is inactive');
  }

  // Enhance with worker profile data if applicable
  const enhancedUser = await enhanceUserWithWorkerData(user);
  return enhancedUser;
};

/**
 * Get user by ID with worker profile if applicable
 */
export const getUserById = async (userId) => {
  const user = await User.findById(userId).select('-passwordHash');
  return await enhanceUserWithWorkerData(user);
};

/**
 * Get user by phone number
 * @param {string} phoneNumber - Phone number
 * @returns {object} - User data with worker profile if applicable
 */
export const getUserByPhone = async (phoneNumber) => {
  const user = await User.findOne({ phoneNumber }).select('-passwordHash');
  return await enhanceUserWithWorkerData(user);
};

/**
 * Get user by email
 * @param {string} email - Email address
 * @returns {object} - User data with worker profile if applicable
 */
export const getUserByEmail = async (email) => {
  const user = await User.findOne({ email }).select('-passwordHash');
  return await enhanceUserWithWorkerData(user);
};

/**
 * Update user profile
 * @param {string} userId - User ObjectId
 * @param {object} updateData - Data to update
 * @returns {object} - Updated user
 */
export const updateUserProfile = async (userId, updateData) => {
  // Prevent updating sensitive fields
  const allowedFields = ['fullName', 'email', 'location'];
  const filteredUpdate = {};

  for (const field of allowedFields) {
    if (updateData[field] !== undefined) {
      filteredUpdate[field] = updateData[field];
    }
  }

  return await User.findByIdAndUpdate(userId, filteredUpdate, {
    new: true,
    select: '-passwordHash',
  });
};

/**
 * Update location
 * @param {string} userId - User ObjectId
 * @param {object} locationData - { city, state, pincode, addressLine1, addressLine2 }
 * @returns {object} - Updated user
 */
export const updateUserLocation = async (userId, locationData) => {
  return await User.findByIdAndUpdate(
    userId,
    { location: locationData },
    { new: true, select: '-passwordHash', runValidators: true }
  );
};

/**
 * Update password
 * @param {string} userId - User ObjectId
 * @param {string} oldPassword - Current password
 * @param {string} newPassword - New password
 * @returns {object} - Updated user
 */
export const updatePassword = async (userId, oldPassword, newPassword) => {
  const user = await User.findById(userId).select('+passwordHash');

  if (!user) {
    throw new Error('User not found');
  }

  // Verify old password
  const isPasswordValid = await comparePassword(oldPassword, user.passwordHash);
  if (!isPasswordValid) {
    throw new Error('Current password is incorrect');
  }

  // Hash new password
  user.passwordHash = await hashPassword(newPassword);
  await user.save();

  return user.toSafeJSON();
};

/**
 * Verify phone number
 * @param {string} userId - User ObjectId
 * @returns {object} - Updated user
 */
export const verifyPhoneNumber = async (userId) => {
  return await User.findByIdAndUpdate(
    userId,
    { isPhoneVerified: true },
    { new: true, select: '-passwordHash' }
  );
};

/**
 * Get all users (admin)
 * @param {number} skip - Skip count for pagination
 * @param {number} limit - Limit for pagination
 * @returns {array} - Array of users
 */
export const getAllUsers = async (skip = 0, limit = 10) => {
  return await User.find({ isActive: true })
    .select('-passwordHash')
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });
};

/**
 * Get workers only
 * @param {number} skip - Skip count
 * @param {number} limit - Limit
 * @returns {array} - Array of worker users
 */
export const getWorkerUsers = async (skip = 0, limit = 10) => {
  return await User.find({ role: 'worker', isActive: true })
    .select('-passwordHash')
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });
};

/**
 * Deactivate user account
 * @param {string} userId - User ObjectId
 * @returns {object} - Deactivated user
 */
export const deactivateUser = async (userId) => {
  return await User.findByIdAndUpdate(
    userId,
    { isActive: false },
    { new: true, select: '-passwordHash' }
  );
};

/**
 * Delete user (soft delete by deactivating)
 * @param {string} userId - User ObjectId
 * @returns {object} - Deleted user
 */
export const deleteUserAccount = async (userId) => {
  return await deactivateUser(userId);
};

/**
 * Count users by role
 * @returns {object} - { totalUsers, totalWorkers, totalNormalUsers }
 */
export const countUsersByRole = async () => {
  const totalUsers = await User.countDocuments({ isActive: true });
  const totalWorkers = await User.countDocuments({ 
    role: 'worker', 
    isActive: true 
  });
  const totalNormalUsers = totalUsers - totalWorkers;

  return {
    totalUsers,
    totalWorkers,
    totalNormalUsers,
  };
};
