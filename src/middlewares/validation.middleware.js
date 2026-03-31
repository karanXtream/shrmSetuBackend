/**
 * Validation middleware for request body
 * Validates required fields
 */
export const validateRequest = (requiredFields) => {
  return (req, res, next) => {
    const missingFields = [];

    for (const field of requiredFields) {
      if (!req.body[field]) {
        missingFields.push(field);
      }
    }

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        error: `Missing required fields: ${missingFields.join(', ')}`,
      });
    }

    next();
  };
};

/**
 * Validate phone number format
 */
export const validatePhoneNumber = (req, res, next) => {
  const phoneNumber = req.body.phoneNumber || req.body.phone_number;

  if (!phoneNumber) {
    return next();
  }

  if (phoneNumber.length < 10 || phoneNumber.length > 15) {
    return res.status(400).json({
      success: false,
      error: 'Phone number must be between 10 and 15 digits',
    });
  }

  next();
};
