import express from 'express';
import * as workerController from '../controllers/worker.controller.js';

const router = express.Router();

/**
 * Worker Routes
 */

/**
 * POST /api/workers
 * Create worker profile
 * Body: { userId, experienceYears, skills, bio, hourlyRate }
 */
router.post('/', workerController.createProfile);

/**
 * GET /api/workers
 * Get all available workers (with pagination)
 * Query: { skip, limit }
 */
router.get('/', workerController.getAllWorkers);

/**
 * GET /api/workers/top
 * Get top-rated workers
 * Query: { limit }
 */
router.get('/top', workerController.getTopWorkers);

/**
 * GET /api/workers/search/:skill
 * Get workers by skill (with pagination)
 * Query: { skip, limit }
 */
router.get('/search/:skill', workerController.getWorkersBySkill);

/**
 * GET /api/workers/:userId
 * Get worker profile by user ID
 */
router.get('/:userId', workerController.getProfile);

/**
 * GET /api/workers/:userId/stats
 * Get worker statistics
 */
router.get('/:userId/stats', workerController.getWorkerStats);

/**
 * PATCH /api/workers/:userId
 * Update worker profile
 * Body: { experienceYears, skills, bio, hourlyRate, isAvailable }
 */
router.patch('/:userId', workerController.updateProfile);

/**
 * PATCH /api/workers/:userId/media
 * Update worker media (photos, video)
 * Body: { profilePhoto, shopPhotos, introductoryVideo }
 */
router.patch('/:userId/media', workerController.updateMedia);

/**
 * PATCH /api/workers/:userId/availability
 * Toggle worker availability
 * Body: { isAvailable }
 */
router.patch('/:userId/availability', workerController.toggleAvailability);

/**
 * POST /api/workers/:userId/photo
 * Upload profile photo
 * Body: { photoUrl }
 */
router.post('/:userId/photo', workerController.uploadProfilePhoto);

/**
 * POST /api/workers/:userId/shop-photo
 * Add shop photo
 * Body: { photoUrl }
 */
router.post('/:userId/shop-photo', workerController.addShopPhoto);

/**
 * DELETE /api/workers/:userId/shop-photo
 * Remove shop photo
 * Body: { photoUrl }
 */
router.delete('/:userId/shop-photo', workerController.removeShopPhoto);

/**
 * POST /api/workers/:userId/video
 * Upload introductory video
 * Body: { videoUrl }
 */
router.post('/:userId/video', workerController.uploadIntroVideo);

/**
 * POST /api/workers/:userId/skill
 * Add skill to worker
 * Body: { skill }
 */
router.post('/:userId/skill', workerController.addSkill);

/**
 * DELETE /api/workers/:userId/skill
 * Remove skill from worker
 * Body: { skill }
 */
router.delete('/:userId/skill', workerController.removeSkill);

/**
 * POST /api/workers/:userId/rating
 * Add rating to worker
 * Body: { rating (1-5) }
 */
router.post('/:userId/rating', workerController.addRating);

export default router;
