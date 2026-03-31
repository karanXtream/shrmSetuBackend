import { updateUserLocation, getUserLocation, removeUserLocation } from './location.service.js';

/**
 * POST /location/:userId
 * Add or update location for a user
 */
export const setLocation = async (req, res) => {
  try {
    const { userId } = req.params;
    const { latitude, longitude, areaName } = req.body;

    if (!userId || isNaN(userId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid user ID',
      });
    }

    if (latitude === undefined || longitude === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: latitude, longitude',
      });
    }

    const location = await updateUserLocation(
      parseInt(userId),
      latitude,
      longitude,
      areaName
    );

    res.status(201).json({
      success: true,
      message: 'Location updated successfully',
      data: location,
    });
  } catch (err) {
    console.error('Location Controller Error:', err.message);
    const statusCode = err.message.includes('not found') ? 404 : 400;
    res.status(statusCode).json({
      success: false,
      error: err.message,
    });
  }
};

/**
 * GET /location/:userId
 * Get location for a user
 */
export const getLocation = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId || isNaN(userId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid user ID',
      });
    }

    const location = await getUserLocation(parseInt(userId));

    res.status(200).json({
      success: true,
      data: location,
    });
  } catch (err) {
    console.error('Location Controller Error:', err.message);
    const statusCode = err.message.includes('not found') ? 404 : 500;
    res.status(statusCode).json({
      success: false,
      error: err.message,
    });
  }
};

/**
 * DELETE /location/:userId
 * Remove location for a user
 */
export const deleteLocationController = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId || isNaN(userId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid user ID',
      });
    }

    await removeUserLocation(parseInt(userId));

    res.status(200).json({
      success: true,
      message: 'Location deleted successfully',
    });
  } catch (err) {
    console.error('Location Controller Error:', err.message);
    const statusCode = err.message.includes('not found') ? 404 : 500;
    res.status(statusCode).json({
      success: false,
      error: err.message,
    });
  }
};
