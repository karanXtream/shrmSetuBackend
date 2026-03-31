import Worker from '../../models/Worker.js';
import User from '../../models/User.js';

/**
 * Get worker profile with user data and location
 */
export const getWorkerWithDetails = async (userId) => {
  return await Worker.findOne({ userId })
    .populate({
      path: 'userId',
      select: 'name phone email profilePhoto isOtpVerified',
    })
    .lean();
};

/**
 * Get worker profile by ID
 */
export const getWorkerProfileById = async (userId) => {
  return await Worker.findOne({ userId });
};

/**
 * Create worker profile
 */
export const createWorkerProfile = async (userId, yearsOfExperience, workCertificate) => {
  return await Worker.create({
    userId,
    yearsOfExperience,
    workCertificate,
  });
};

/**
 * Update worker profile
 */
export const updateWorkerProfile = async (userId, updateData) => {
  return await Worker.findOneAndUpdate(
    { userId },
    updateData,
    { upsert: true, new: true }
  );
};

/**
 * Delete worker profile
 */
export const deleteWorkerProfile = async (userId) => {
  return await Worker.findOneAndDelete({ userId });
};

/**
 * Get all workers
 */
export const getAllWorkers = async (skip = 0, limit = 10) => {
  return await Worker.find()
    .skip(skip)
    .limit(limit)
    .populate('userId', 'name phone email profilePhoto')
    .sort({ createdAt: -1 });
};

/**
 * Get workers by skill
 */
export const getWorkersBySkill = async (skillId, skip = 0, limit = 10) => {
  const WorkerSkill = (await import('../../models/WorkerSkill.js')).default;
  const workerIds = await WorkerSkill.find({ skillId }).distinct('workerId');
  
  return await Worker.find({ _id: { $in: workerIds } })
    .skip(skip)
    .limit(limit)
    .populate('userId', 'name phone email profilePhoto');
};
