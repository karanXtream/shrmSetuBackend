import { pool } from '../../config/db.js';
import { getUserById } from '../user/user.model.js';
import { upsertLocation as upsertLocationModel, getLocationByUserId, deleteLocation } from './location.model.js';

/**
 * Add or update location for a user
 */
export const updateUserLocation = async (userId, latitude, longitude, areaName) => {
  // Validate user exists
  const user = await getUserById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  // Validate coordinates
  if (latitude === undefined || latitude === null || isNaN(latitude)) {
    throw new Error('Invalid latitude');
  }
  if (longitude === undefined || longitude === null || isNaN(longitude)) {
    throw new Error('Invalid longitude');
  }

  const lat = parseFloat(latitude);
  const lng = parseFloat(longitude);

  // Validate latitude range
  if (lat < -90 || lat > 90) {
    throw new Error('Latitude must be between -90 and 90');
  }

  // Validate longitude range
  if (lng < -180 || lng > 180) {
    throw new Error('Longitude must be between -180 and 180');
  }

  const location = await upsertLocationModel(userId, lat, lng, areaName);

  return {
    id: location.id,
    userId: location.user_id,
    latitude: location.latitude,
    longitude: location.longitude,
    areaName: location.area_name,
    createdAt: location.created_at,
  };
};

/**
 * Get location for a user
 */
export const getUserLocation = async (userId) => {
  const user = await getUserById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  const location = await getLocationByUserId(userId);
  if (!location) {
    throw new Error('Location not found for this user');
  }

  return {
    id: location.id,
    userId: location.user_id,
    latitude: location.latitude,
    longitude: location.longitude,
    areaName: location.area_name,
    createdAt: location.created_at,
  };
};

/**
 * Remove location for a user
 */
export const removeUserLocation = async (userId) => {
  const user = await getUserById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  const deleted = await deleteLocation(userId);
  if (!deleted) {
    throw new Error('Location not found');
  }

  return { message: 'Location deleted successfully' };
};
