import WorkerSkill from '../../models/WorkerSkill.js';

/**
 * Add skill to worker
 */
export const addSkillToWorker = async (workerId, skillId, proficiencyLevel, yearsOfExperience) => {
  return await WorkerSkill.create({
    workerId,
    skillId,
    proficiencyLevel,
    yearsOfExperience,
  });
};

/**
 * Get worker skills
 */
export const getWorkerSkills = async (workerId) => {
  return await WorkerSkill.find({ workerId })
    .populate('skillId', 'name description category')
    .sort({ createdAt: -1 });
};

/**
 * Get skill workers
 */
export const getSkillWorkers = async (skillId, proficiencyLevel = null) => {
  const query = { skillId };
  if (proficiencyLevel) {
    query.proficiencyLevel = proficiencyLevel;
  }
  
  return await WorkerSkill.find(query)
    .populate('workerId', 'yearsOfExperience')
    .populate({
      path: 'workerId',
      populate: {
        path: 'userId',
        select: 'name phone email profilePhoto',
      },
    });
};

/**
 * Update worker skill
 */
export const updateWorkerSkill = async (workerId, skillId, updateData) => {
  return await WorkerSkill.findOneAndUpdate(
    { workerId, skillId },
    updateData,
    { new: true }
  );
};

/**
 * Remove skill from worker
 */
export const removeSkillFromWorker = async (workerId, skillId) => {
  return await WorkerSkill.findOneAndDelete({ workerId, skillId });
};

/**
 * Remove all skills from worker
 */
export const removeAllWorkerSkills = async (workerId) => {
  return await WorkerSkill.deleteMany({ workerId });
};

/**
 * Check if worker has skill
 */
export const workerHasSkill = async (workerId, skillId) => {
  return await WorkerSkill.findOne({ workerId, skillId });
};

/**
 * Get worker skills count
 */
export const getWorkerSkillsCount = async (workerId) => {
  return await WorkerSkill.countDocuments({ workerId });
};
