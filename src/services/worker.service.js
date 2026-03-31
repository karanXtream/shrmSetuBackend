import Worker from '../models/Worker.js';
import User from '../models/User.js';

/**
 * WorkerProfile Service - All worker-specific operations
 */

/**
 * Create worker profile
 * @param {string} userId - User ObjectId (must be role: 'worker')
 * @param {object} profileData - { experienceYears, skills, bio, hourlyRate }
 * @returns {object} - Created worker profile with user data
 */
export const createWorkerProfile = async (userId, profileData) => {
  // Verify user exists and has worker role
  const user = await User.findById(userId);
  if (!user || user.role !== 'worker') {
    throw new Error('User must have worker role to create profile');
  }

  // Check if profile already exists
  const existingProfile = await Worker.findOne({ userId });
  if (existingProfile) {
    throw new Error('Worker profile already exists for this user');
  }

  // Create profile
  const workerProfile = await Worker.create({
    userId,
    experienceYears: profileData.experienceYears || 0,
    skills: profileData.skills || [],
    bio: profileData.bio,
    hourlyRate: profileData.hourlyRate,
    isAvailable: true,
  });

  // Populate user data
  await workerProfile.populate({
    path: 'userId',
    select: 'fullName phoneNumber email location isPhoneVerified',
  });

  return workerProfile;
};

/**
 * Get worker profile by user ID
 * @param {string} userId - User ObjectId
 * @returns {object} - Worker profile with user data
 */
export const getWorkerProfileByUserId = async (userId) => {
  return await Worker.findOne({ userId }).populate({
    path: 'userId',
    select: 'fullName phoneNumber email location isPhoneVerified',
  });
};

/**
 * Get worker profile by worker ID
 * @param {string} workerId - Worker profile ObjectId
 * @returns {object} - Worker profile with user data
 */
export const getWorkerProfileById = async (workerId) => {
  return await Worker.findById(workerId).populate({
    path: 'userId',
    select: 'fullName phoneNumber email location isPhoneVerified',
  });
};

/**
 * Update worker profile
 * @param {string} userId - User ObjectId
 * @param {object} updateData - Data to update
 * @returns {object} - Updated worker profile
 */
export const updateWorkerProfile = async (userId, updateData) => {
  const allowedFields = [
    'experienceYears',
    'skills',
    'bio',
    'hourlyRate',
    'isAvailable',
  ];
  const filteredUpdate = {};

  for (const field of allowedFields) {
    if (updateData[field] !== undefined) {
      filteredUpdate[field] = updateData[field];
    }
  }

  return await Worker.findOneAndUpdate(
    { userId },
    filteredUpdate,
    { new: true }
  ).populate({
    path: 'userId',
    select: 'fullName phoneNumber email location',
  });
};

/**
 * Update worker media
 * @param {string} userId - User ObjectId
 * @param {object} mediaData - { profilePhoto, shopPhotos, introductoryVideo }
 * @returns {object} - Updated worker profile
 */
export const updateWorkerMedia = async (userId, mediaData) => {
  const updateObject = { media: mediaData };

  return await Worker.findOneAndUpdate({ userId }, updateObject, {
    new: true,
  }).populate({
    path: 'userId',
    select: 'fullName phoneNumber email location',
  });
};

/**
 * Upload profile photo
 * @param {string} userId - User ObjectId
 * @param {string} photoUrl - Photo URL from S3/CDN
 * @returns {object} - Updated worker profile
 */
export const uploadProfilePhoto = async (userId, photoUrl) => {
  return await Worker.findOneAndUpdate(
    { userId },
    { 'media.profilePhoto': photoUrl },
    { new: true }
  );
};

/**
 * Add shop photo
 * @param {string} userId - User ObjectId
 * @param {string} photoUrl - Photo URL
 * @returns {object} - Updated worker profile
 */
export const addShopPhoto = async (userId, photoUrl) => {
  return await Worker.findOneAndUpdate(
    { userId },
    { $push: { 'media.shopPhotos': photoUrl } },
    { new: true }
  );
};

/**
 * Remove shop photo
 * @param {string} userId - User ObjectId
 * @param {string} photoUrl - Photo URL to remove
 * @returns {object} - Updated worker profile
 */
export const removeShopPhoto = async (userId, photoUrl) => {
  return await Worker.findOneAndUpdate(
    { userId },
    { $pull: { 'media.shopPhotos': photoUrl } },
    { new: true }
  );
};

/**
 * Upload introductory video
 * @param {string} userId - User ObjectId
 * @param {string} videoUrl - Video URL
 * @returns {object} - Updated worker profile
 */
export const uploadIntroVideo = async (userId, videoUrl) => {
  return await Worker.findOneAndUpdate(
    { userId },
    { 'media.introductoryVideo': videoUrl },
    { new: true }
  );
};

/**
 * Upload certificate
 * @param {string} userId - User ObjectId
 * @param {string} certificateUrl - Certificate file URL
 * @returns {object} - Updated worker profile
 */
export const uploadCertificate = async (userId, certificateUrl) => {
  return await Worker.findOneAndUpdate(
    { userId },
    {
      'certificate.fileUrl': certificateUrl,
      'certificate.verifiedAt': null,
    },
    { new: true }
  );
};

/**
 * Add skill to worker
 * @param {string} userId - User ObjectId
 * @param {string} skill - Skill name
 * @returns {object} - Updated worker profile
 */
export const addSkill = async (userId, skill) => {
  return await Worker.findOneAndUpdate(
    { userId },
    { $addToSet: { skills: skill } },
    { new: true }
  );
};

/**
 * Remove skill from worker
 * @param {string} userId - User ObjectId
 * @param {string} skill - Skill name to remove
 * @returns {object} - Updated worker profile
 */
export const removeSkill = async (userId, skill) => {
  return await Worker.findOneAndUpdate(
    { userId },
    { $pull: { skills: skill } },
    { new: true }
  );
};

/**
 * Toggle availability
 * @param {string} userId - User ObjectId
 * @param {boolean} isAvailable - Availability status
 * @returns {object} - Updated worker profile
 */
export const toggleAvailability = async (userId, isAvailable) => {
  return await Worker.findOneAndUpdate(
    { userId },
    { isAvailable },
    { new: true }
  );
};

/**
 * Get all available workers
 * @param {number} skip - Skip count
 * @param {number} limit - Limit
 * @returns {array} - Array of available workers
 */
export const getAvailableWorkers = async (skip = 0, limit = 10) => {
  return await Worker.find({ isAvailable: true })
    .skip(skip)
    .limit(limit)
    .populate({
      path: 'userId',
      select: 'fullName phoneNumber email location',
    })
    .sort({ 'rating.averageRating': -1 });
};

/**
 * Get workers by skill
 * @param {string} skill - Skill name
 * @param {number} skip - Skip count
 * @param {number} limit - Limit
 * @returns {array} - Array of workers with skill
 */
export const getWorkersBySkill = async (skill, skip = 0, limit = 10) => {
  return await Worker.find({
    skills: skill,
    isAvailable: true,
  })
    .skip(skip)
    .limit(limit)
    .populate({
      path: 'userId',
      select: 'fullName phoneNumber email location',
    })
    .sort({ 'rating.averageRating': -1 });
};

/**
 * Get top-rated workers (for homepage/recommendations)
 * @param {number} limit - Limit (default 5)
 * @returns {array} - Top workers
 */
export const getTopWorkers = async (limit = 5) => {
  return await Worker.find({ isVerified: true, isAvailable: true })
    .limit(limit)
    .populate({
      path: 'userId',
      select: 'fullName phoneNumber email location',
    })
    .sort({ 'rating.averageRating': -1 });
};

/**
 * Set worker verification and certificate
 * @param {string} userId - User ObjectId
 * @param {string} verifiedBy - Admin user ID
 * @returns {object} - Updated worker profile
 */
export const setWorkerVerified = async (userId, verifiedBy) => {
  return await Worker.findOneAndUpdate(
    { userId },
    {
      isVerified: true,
      'certificate.verifiedAt': new Date(),
      'certificate.verifiedBy': verifiedBy,
    },
    { new: true }
  );
};

/**
 * Update rating
 * @param {string} userId - User ObjectId
 * @param {number} newRating - New rating value (1-5)
 * @returns {object} - Updated worker profile
 */
export const updateRating = async (userId, newRating) => {
  const worker = await Worker.findOne({ userId });

  if (!worker) {
    throw new Error('Worker not found');
  }

  // Calculate average rating
  const currentTotal = worker.rating.averageRating * worker.rating.totalReviews;
  const newTotal = currentTotal + newRating;
  const newAverage = newTotal / (worker.rating.totalReviews + 1);

  return await Worker.findOneAndUpdate(
    { userId },
    {
      'rating.averageRating': parseFloat(newAverage.toFixed(2)),
      'rating.totalReviews': worker.rating.totalReviews + 1,
    },
    { new: true }
  );
};

/**
 * Get worker stats
 * @param {string} userId - User ObjectId
 * @returns {object} - Worker statistics
 */
export const getWorkerStats = async (userId) => {
  const worker = await Worker.findOne({ userId });

  if (!worker) {
    throw new Error('Worker not found');
  }

  return {
    profileId: worker._id,
    experienceYears: worker.experienceYears,
    skillsCount: worker.skills.length,
    isAvailable: worker.isAvailable,
    isVerified: worker.isVerified,
    rating: worker.rating,
    mediaCount: {
      profilePhoto: !!worker.media.profilePhoto ? 1 : 0,
      shopPhotos: worker.media.shopPhotos.length,
      introductoryVideo: !!worker.media.introductoryVideo ? 1 : 0,
    },
  };
};
