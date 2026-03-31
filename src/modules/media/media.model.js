import Media from '../../models/Media.js';

/**
 * Create media
 */
export const createMedia = async (workerId, url, mediaType, title, description) => {
  return await Media.create({
    workerId,
    url,
    mediaType,
    title,
    description,
  });
};

/**
 * Get media by ID
 */
export const getMediaById = async (id) => {
  return await Media.findById(id);
};

/**
 * Get all media for a worker
 */
export const getMediaByWorkerId = async (workerId) => {
  return await Media.find({ workerId }).sort({ createdAt: -1 });
};

/**
 * Get public media
 */
export const getPublicMedia = async (workerId) => {
  return await Media.find({ workerId, isPublic: true }).sort({ createdAt: -1 });
};

/**
 * Update media
 */
export const updateMedia = async (id, updateData) => {
  return await Media.findByIdAndUpdate(id, updateData, {
    new: true,
  });
};

/**
 * Delete media
 */
export const deleteMedia = async (id) => {
  return await Media.findByIdAndDelete(id);
};

/**
 * Delete all media for a worker
 */
export const deleteWorkerMedias = async (workerId) => {
  return await Media.deleteMany({ workerId });
};

/**
 * Get media by type
 */
export const getMediaByType = async (workerId, mediaType) => {
  return await Media.find({ workerId, mediaType }).sort({ createdAt: -1 });
};
