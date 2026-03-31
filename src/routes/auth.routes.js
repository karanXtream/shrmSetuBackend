import express from 'express';
import * as authController from '../controllers/auth.controller.js';
import { upload } from '../middlewares/upload.middleware.js';

const router = express.Router();

/**
 * Authentication Routes
 */

/**
 * POST /api/auth/register
 * Register with file uploads to S3
 * Form data fields:
 * - fullName (required), phoneNumber (required, 10 digits)
 * - email (required), password (required, min 8 chars with uppercase, lowercase, number, special char)
 * - role (optional, 'user' or 'worker')
 * - city (required), state (required), pincode (required, 6 digits)
 * - addressLine1 (required), addressLine2 (optional)
 * - profilePhoto (file, optional, max 1)
 * - shopPhotos (files, optional, max 5)
 * - introVideo (file, optional, max 1)
 */
router.post(
  '/register',
  upload.fields([
    { name: 'profilePhoto', maxCount: 1 },
    { name: 'shopPhotos', maxCount: 5 },
    { name: 'introVideo', maxCount: 1 },
  ]),
  authController.register
);

/**
 * POST /api/auth/login
 * Login user with phone/email and password
 * Body: { identifier (phone/email), password }
 */
router.post('/login', authController.login);

/**
 * POST /api/auth/verify-phone
 * Verify phone number
 * Body: { userId }
 */
router.post('/verify-phone', authController.verifyPhone);

export default router;
