import User from '../../models/User.js';

/**
 * Get user by ID
 */
export const getUserById = async (id) => {
  return await User.findById(id).select('-password');
};

/**
 * Get user by phone number
 */
export const getUserByPhoneNumber = async (phoneNumber) => {
  return await User.findOne({ phone: phoneNumber }).select('-password');
};

/**
 * Create a new user
 */
export const createUser = async (name, phoneNumber, role = 'user') => {
  const newUser = await User.create({
    name,
    phone: phoneNumber,
    role,
  });
  return newUser.toObject();
};

/**
 * Update user by ID
 */
export const updateUser = async (id, updateData) => {
  return await User.findByIdAndUpdate(id, updateData, {
    new: true,
    select: '-password',
  });
};

/**
 * Delete user by ID
 */
export const deleteUser = async (id) => {
  return await User.findByIdAndDelete(id);
};

/**
 * Get user by email
 */
export const getUserByEmail = async (email) => {
  return await User.findOne({ email });
};

/**
 * Update user password
 */
export const updateUserPassword = async (id, password) => {
  return await User.findByIdAndUpdate(
    id,
    { password },
    { new: true, select: '-password' }
  );
};

/**
 * Verify OTP
 */
export const verifyOTP = async (id) => {
  return await User.findByIdAndUpdate(
    id,
    { isOtpVerified: true },
    { new: true }
  );
};

/**
 * Get all users (admin)
 */
export const getAllUsers = async (skip = 0, limit = 10) => {
  return await User.find()
    .select('-password')
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });
};
