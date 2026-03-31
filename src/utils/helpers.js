/**
 * Utility functions for common operations
 */

/**
 * Format response object
 */
export const formatResponse = (success, message, data = null, error = null) => {
  return {
    success,
    ...(message && { message }),
    ...(data && { data }),
    ...(error && { error }),
  };
};

/**
 * Validate phone number
 * @param {string} phoneNumber - Phone number to validate
 * @returns {boolean} - True if valid
 */
export const isValidPhoneNumber = (phoneNumber) => {
  if (!phoneNumber || typeof phoneNumber !== 'string') {
    return false;
  }
  const cleaned = phoneNumber.replace(/\D/g, '');
  return cleaned.length >= 10 && cleaned.length <= 15;
};

/**
 * Validate coordinates
 * @param {number} latitude - Latitude value
 * @param {number} longitude - Longitude value
 * @returns {boolean} - True if valid coordinates
 */
export const isValidCoordinates = (latitude, longitude) => {
  const lat = parseFloat(latitude);
  const lng = parseFloat(longitude);

  if (isNaN(lat) || isNaN(lng)) {
    return false;
  }

  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
};

/**
 * Sanitize user input (trim and remove special characters)
 * @param {string} input - Input string
 * @returns {string} - Sanitized string
 */
export const sanitize = (input) => {
  if (typeof input !== 'string') {
    return input;
  }
  return input.trim();
};

/**
 * Check if value is empty
 * @param {any} value - Value to check
 * @returns {boolean} - True if empty
 */
export const isEmpty = (value) => {
  return (
    value === null ||
    value === undefined ||
    (typeof value === 'string' && value.trim() === '') ||
    (Array.isArray(value) && value.length === 0)
  );
};

/**
 * Format database timestamp to ISO string
 * @param {Date|string} timestamp - Timestamp from database
 * @returns {string} - ISO formatted timestamp
 */
export const formatTimestamp = (timestamp) => {
  if (!timestamp) return null;
  return new Date(timestamp).toISOString();
};

/**
 * Capitalize first letter
 * @param {string} str - String to capitalize
 * @returns {string} - Capitalized string
 */
export const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};
