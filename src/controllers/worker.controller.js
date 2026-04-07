import * as workerService from '../services/worker.service.js';

/**
 * Worker Controller - Worker profile operations
 */

/**
 * POST /api/workers
 * Create worker profile
 */
export const createProfile = async (req, res) => {
  try {
    const { userId } = req.body;
    const { experienceYears, skills, bio, hourlyRate, education } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required',
      });
    }

    const profileData = {
      experienceYears: Number(experienceYears) || 0,
      skills: Array.isArray(skills)
        ? skills
        : typeof skills === 'string' && skills.trim()
          ? skills.split(',').map((skill) => skill.trim()).filter(Boolean)
          : [],
      bio,
      hourlyRate,
      education: education || '',
    };

    const profile = await workerService.createWorkerProfile(userId, profileData);

    res.status(201).json({
      success: true,
      message: 'Worker profile created successfully',
      data: profile,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * GET /api/workers/:userId
 * Get worker profile by user ID
 */
export const getProfile = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required',
      });
    }

    const profile = await workerService.getWorkerProfileByUserId(userId);

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Worker profile not found',
      });
    }

    res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * PATCH /api/workers/:userId
 * Update worker profile
 */
export const updateProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const { experienceYears, skills, bio, hourlyRate, isAvailable, education } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required',
      });
    }

    const updateData = {};
    if (experienceYears !== undefined) updateData.experienceYears = Number(experienceYears) || 0;
    if (skills) {
      updateData.skills = Array.isArray(skills)
        ? skills
        : typeof skills === 'string' && skills.trim()
          ? skills.split(',').map((skill) => skill.trim()).filter(Boolean)
          : [];
    }
    if (bio) updateData.bio = bio;
    if (hourlyRate !== undefined) updateData.hourlyRate = hourlyRate;
    if (isAvailable !== undefined) updateData.isAvailable = isAvailable;
    if (education) updateData.education = education;

    const profile = await workerService.updateWorkerProfile(userId, updateData);

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: profile,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * PATCH /api/workers/:userId/media
 * Update worker media (photos, video)
 */
export const updateMedia = async (req, res) => {
  try {
    const { userId } = req.params;
    const { profilePhoto, shopPhotos, introductoryVideo } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required',
      });
    }

    const mediaData = {
      profilePhoto,
      shopPhotos: shopPhotos || [],
      introductoryVideo,
    };

    const profile = await workerService.updateWorkerMedia(userId, mediaData);

    res.status(200).json({
      success: true,
      message: 'Media updated successfully',
      data: profile,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * POST /api/workers/:userId/photo
 * Upload profile photo
 */
export const uploadProfilePhoto = async (req, res) => {
  try {
    const { userId } = req.params;
    const { photoUrl } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required',
      });
    }

    if (!photoUrl) {
      return res.status(400).json({
        success: false,
        message: 'Photo URL is required',
      });
    }

    const profile = await workerService.uploadProfilePhoto(userId, photoUrl);

    res.status(200).json({
      success: true,
      message: 'Profile photo updated',
      data: profile,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * POST /api/workers/:userId/shop-photo
 * Add shop photo
 */
export const addShopPhoto = async (req, res) => {
  try {
    const { userId } = req.params;
    const { photoUrl } = req.body;

    if (!userId || !photoUrl) {
      return res.status(400).json({
        success: false,
        message: 'User ID and photo URL are required',
      });
    }

    const profile = await workerService.addShopPhoto(userId, photoUrl);

    res.status(200).json({
      success: true,
      message: 'Shop photo added',
      data: profile,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * DELETE /api/workers/:userId/shop-photo
 * Remove shop photo
 */
export const removeShopPhoto = async (req, res) => {
  try {
    const { userId } = req.params;
    const { photoUrl } = req.body;

    if (!userId || !photoUrl) {
      return res.status(400).json({
        success: false,
        message: 'User ID and photo URL are required',
      });
    }

    const profile = await workerService.removeShopPhoto(userId, photoUrl);

    res.status(200).json({
      success: true,
      message: 'Shop photo removed',
      data: profile,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * POST /api/workers/:userId/video
 * Upload introductory video
 */
export const uploadIntroVideo = async (req, res) => {
  try {
    const { userId } = req.params;
    const { videoUrl } = req.body;

    if (!userId || !videoUrl) {
      return res.status(400).json({
        success: false,
        message: 'User ID and video URL are required',
      });
    }

    const profile = await workerService.uploadIntroVideo(userId, videoUrl);

    res.status(200).json({
      success: true,
      message: 'Introductory video uploaded',
      data: profile,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * POST /api/workers/:userId/skill
 * Add skill to worker
 */
export const addSkill = async (req, res) => {
  try {
    const { userId } = req.params;
    const { skill } = req.body;

    if (!userId || !skill) {
      return res.status(400).json({
        success: false,
        message: 'User ID and skill are required',
      });
    }

    const profile = await workerService.addSkill(userId, skill);

    res.status(200).json({
      success: true,
      message: 'Skill added',
      data: profile,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * DELETE /api/workers/:userId/skill
 * Remove skill from worker
 */
export const removeSkill = async (req, res) => {
  try {
    const { userId } = req.params;
    const { skill } = req.body;

    if (!userId || !skill) {
      return res.status(400).json({
        success: false,
        message: 'User ID and skill are required',
      });
    }

    const profile = await workerService.removeSkill(userId, skill);

    res.status(200).json({
      success: true,
      message: 'Skill removed',
      data: profile,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * PATCH /api/workers/:userId/availability
 * Toggle worker availability
 */
export const toggleAvailability = async (req, res) => {
  try {
    const { userId } = req.params;
    const { isAvailable } = req.body;

    if (!userId || isAvailable === undefined) {
      return res.status(400).json({
        success: false,
        message: 'User ID and availability status are required',
      });
    }

    const profile = await workerService.toggleAvailability(userId, isAvailable);

    res.status(200).json({
      success: true,
      message: 'Availability updated',
      data: profile,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * DELETE /api/workers/:userId
 * Delete worker profile and associated user account (cascading delete)
 */
export const deleteProfile = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required',
      });
    }

    const result = await workerService.deleteWorkerProfile(userId);

    res.status(200).json({
      success: true,
      message: result.message,
      data: result,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * GET /api/workers?skip=0&limit=10
 * Get all available workers with pagination
 */
export const getAllWorkers = async (req, res) => {
  try {
    const { skip = 0, limit = 10 } = req.query;

    const workers = await workerService.getAvailableWorkers(
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
 * GET /api/workers/search/:skill?skip=0&limit=10
 * Get workers by skill
 */
export const getWorkersBySkill = async (req, res) => {
  try {
    const { skill } = req.params;
    const { skip = 0, limit = 10 } = req.query;

    if (!skill) {
      return res.status(400).json({
        success: false,
        message: 'Skill is required',
      });
    }

    const workers = await workerService.getWorkersBySkill(
      skill,
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
 * GET /api/workers/top?limit=5
 * Get top-rated workers
 */
export const getTopWorkers = async (req, res) => {
  try {
    const { limit = 5 } = req.query;

    const workers = await workerService.getTopWorkers(parseInt(limit));

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
 * POST /api/workers/:userId/rating
 * Add rating to worker
 */
export const addRating = async (req, res) => {
  try {
    const { userId } = req.params;
    const { rating } = req.body;

    if (!userId || !rating) {
      return res.status(400).json({
        success: false,
        message: 'User ID and rating are required',
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5',
      });
    }

    const profile = await workerService.updateRating(userId, rating);

    res.status(200).json({
      success: true,
      message: 'Rating added successfully',
      data: profile,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * GET /api/workers/:userId/stats
 * Get worker statistics
 */
export const getWorkerStats = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required',
      });
    }

    const stats = await workerService.getWorkerStats(userId);

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
