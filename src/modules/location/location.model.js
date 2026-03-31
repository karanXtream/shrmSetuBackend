import Location from '../../models/Location.js';

/**
 * Get location by user ID
 */
export const getLocationByUserId = async (userId) => {
  return await Location.findOne({ userId });
};

/**
 * Create or update location for a user
 */
export const upsertLocation = async (userId, city, state, pin, addressLine1, addressLine2) => {
  return await Location.findOneAndUpdate(
    { userId },
    {
      userId,
      city,
      state,
      pin,
      addressLine1,
      addressLine2,
    },
    { upsert: true, new: true }
  );
};

/**
 * Delete location for a user
 */
export const deleteLocation = async (userId) => {
  return await Location.findOneAndDelete({ userId });
};

/**
 * Get location by ID
 */
export const getLocationById = async (id) => {
  return await Location.findById(id);
};

/**
 * Get all locations
 */
export const getAllLocations = async (skip = 0, limit = 10) => {
  return await Location.find()
    .skip(skip)
    .limit(limit)
    .populate('userId', 'name phone email');
};
