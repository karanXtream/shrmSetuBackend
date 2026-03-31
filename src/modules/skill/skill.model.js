import Skill from '../../models/Skill.js';

/**
 * Create a new skill
 */
export const createSkill = async (name, description, category) => {
  return await Skill.create({
    name,
    description,
    category,
  });
};

/**
 * Get skill by ID
 */
export const getSkillById = async (id) => {
  return await Skill.findById(id);
};

/**
 * Get skill by name
 */
export const getSkillByName = async (name) => {
  return await Skill.findOne({ name });
};

/**
 * Get all skills
 */
export const getAllSkills = async (skip = 0, limit = 100) => {
  return await Skill.find()
    .skip(skip)
    .limit(limit)
    .sort({ name: 1 });
};

/**
 * Update skill by ID
 */
export const updateSkill = async (id, updateData) => {
  return await Skill.findByIdAndUpdate(id, updateData, {
    new: true,
  });
};

/**
 * Delete skill by ID
 */
export const deleteSkill = async (id) => {
  return await Skill.findByIdAndDelete(id);
};

/**
 * Get skills by category
 */
export const getSkillsByCategory = async (category) => {
  return await Skill.find({ category }).sort({ name: 1 });
};
