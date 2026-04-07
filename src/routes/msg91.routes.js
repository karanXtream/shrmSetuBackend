import express from 'express';
import * as msg91Controller from '../controllers/msg91.controller.js';

const router = express.Router();

/**
 * POST /api/msg91/verify-access-token
 * Body: { accessToken } or { "access-token": "..." }
 */
router.post('/verify-access-token', msg91Controller.verifyAccessToken);

/**
 * POST /api/msg91/send-otp
 * Body: { phoneNumber }
 */
router.post('/send-otp', msg91Controller.sendOtp);

/**
 * POST /api/msg91/verify-otp
 * Body: { phoneNumber, otp }
 */
router.post('/verify-otp', msg91Controller.verifyOtp);

export default router;
