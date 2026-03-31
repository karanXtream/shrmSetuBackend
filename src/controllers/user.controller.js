import * as userService from '../services/user.service.js';
import { validatePasswordStrength } from '../utils/auth.utils.js';
import { validatePhoneNumber, validateEmail } from '../utils/validation.utils.js';

/**
 * User Controller - User profile operations
 */

/**
 * GET /api/users/:id
 * Get user profile by ID
 */
export const getProfile = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required',
      });
    }

    const user = await userService.getUserById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * PATCH /api/users/:id
 * Update user profile
 */
export const updateProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const { fullName, email, location } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required',
      });
    }

    // Validate email if provided
    if (email && !validateEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format',
      });
    }

    const updateData = {};
    if (fullName) updateData.fullName = fullName;
    if (email) updateData.email = email;
    if (location) updateData.location = location;

    const user = await userService.updateUserProfile(id, updateData);

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
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
 * PATCH /api/users/:id/location
 * Update user location
 */
export const updateLocation = async (req, res) => {
  try {
    const { id } = req.params;
    const { city, state, pincode, addressLine1, addressLine2 } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required',
      });
    }

    const locationData = {
      city,
      state,
      pincode,
      addressLine1,
      addressLine2,
    };

    const user = await userService.updateUserLocation(id, locationData);

    res.status(200).json({
      success: true,
      message: 'Location updated successfully',
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
 * PATCH /api/users/:id/password
 * Change user password
 */
export const changePassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { oldPassword, newPassword } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required',
      });
    }

    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Old password and new password are required',
      });
    }

    // Validate new password strength
    const passwordValidation = validatePasswordStrength(newPassword);
    if (!passwordValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'New password is not strong enough',
        errors: passwordValidation.errors,
      });
    }

    const user = await userService.updatePassword(id, oldPassword, newPassword);

    res.status(200).json({
      success: true,
      message: 'Password changed successfully',
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
 * GET /api/users
 * Get all users (admin)
 */
export const getAllUsers = async (req, res) => {
  try {
    const { skip = 0, limit = 10 } = req.query;

    const users = await userService.getAllUsers(
      parseInt(skip),
      parseInt(limit)
    );

    res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * GET /api/users/workers/list
 * Get all worker users
 */
export const getWorkerUsers = async (req, res) => {
  try {
    const { skip = 0, limit = 10 } = req.query;

    const workers = await userService.getWorkerUsers(
      parseInt(skip),
      parseInt(limit)
    );

    res.status(200).json({
      success: true,
      data: workers,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * DELETE /api/users/:id
 * Deactivate user account
 */
export const deleteAccount = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required',
      });
    }

    const user = await userService.deactivateUser(id);

    res.status(200).json({
      success: true,
      message: 'Account deactivated successfully',
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
 * GET /api/users/stats/count
 * Get user statistics
 */
export const getUserStats = async (req, res) => {
  try {
    const stats = await userService.countUsersByRole();

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
