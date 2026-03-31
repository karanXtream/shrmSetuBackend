import express from 'express';
import * as userController from '../controllers/user.controller.js';

const router = express.Router();

/**
 * User Routes
 */

/**
 * GET /api/users
 * Get all users (with pagination)
 * Query: { skip, limit }
 */
router.get('/', userController.getAllUsers);

/**
 * GET /api/users/workers/list
 * Get all worker users (with pagination)
 * Query: { skip, limit }
 */
router.get('/workers/list', userController.getWorkerUsers);

/**
 * GET /api/users/stats/count
 * Get user statistics (total users, workers, etc.)
 */
router.get('/stats/count', userController.getUserStats);

/**
 * GET /api/users/:id
 * Get user profile by ID
 */
router.get('/:id', userController.getProfile);

/**
 * PATCH /api/users/:id
 * Update user profile
 * Body: { fullName, email, location }
 */
router.patch('/:id', userController.updateProfile);

/**
 * PATCH /api/users/:id/location
 * Update user location
 * Body: { city, state, pincode, addressLine1, addressLine2 }
 */
router.patch('/:id/location', userController.updateLocation);

/**
 * PATCH /api/users/:id/password
 * Change user password
 * Body: { oldPassword, newPassword }
 */
router.patch('/:id/password', userController.changePassword);

/**
 * DELETE /api/users/:id
 * Deactivate user account
 */
router.delete('/:id', userController.deleteAccount);

export default router;
