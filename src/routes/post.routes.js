import express from 'express';
import * as postController from '../controllers/post.controller.js';
import { upload } from '../middlewares/upload.middleware.js';

const router = express.Router();

/**
 * Post Routes - Job posting endpoints
 */

/**
 * POST /api/posts
 * Create a new job post
 * Body: { city, state, pin, address, requiredSkills[], expectedPrice, stayAvailable, foodAvailable, workPhotos[], userId }
 */
router.post('/', postController.createPost);

/**
 * POST /api/posts/upload
 * Upload job post images to S3
 * Multipart form with images in 'workPhotos' field
 * Returns array of S3 URLs
 */
router.post('/upload', upload.array('workPhotos', 5), postController.uploadPostImages);

/**
 * GET /api/posts
 * Get all posts with filtering and pagination
 * Query: { city, state, skill, status, skip, limit }
 */
router.get('/', postController.getAllPosts);

/**
 * GET /api/posts/:id
 * Get a single post by ID
 */
router.get('/:id', postController.getPostById);

/**
 * GET /api/posts/user/:userId
 * Get all posts by a specific user
 * Query: { status, skip, limit }
 */
router.get('/user/:userId', postController.getPostsByUserId);

/**
 * PATCH /api/posts/:id
 * Update a post
 * Body: { city, state, pin, address, requiredSkills[], expectedPrice, stayAvailable, foodAvailable, workPhotos[], status, userId }
 */
router.patch('/:id', postController.updatePost);

/**
 * DELETE /api/posts/:id
 * Delete a post
 */
router.delete('/:id', postController.deletePost);

/**
 * POST /api/posts/:id/apply
 * Apply for a job post as a worker
 * Body: { workerId }
 */
router.post('/:id/apply', postController.applyForPost);

/**
 * PATCH /api/posts/:id/applicant/:applicantId
 * Update applicant status (accept/reject)
 * Body: { status: 'pending' | 'accepted' | 'rejected', userId }
 */
router.patch('/:id/applicant/:applicantId', postController.updateApplicantStatus);

export default router;
