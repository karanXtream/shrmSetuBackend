import { registerNormalUser } from './user.service.js';

/**
 * POST /user/register
 * Register a normal user
 */
export const registerUser = async (req, res) => {
  try {
    const { name, phoneNumber } = req.body;

    if (!name || !phoneNumber) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: name, phoneNumber',
      });
    }

    const user = await registerNormalUser(name, phoneNumber);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: user,
    });
  } catch (err) {
    console.error('User Controller Error:', err.message);
    const statusCode = err.message.includes('already registered') ? 409 : 500;
    res.status(statusCode).json({
      success: false,
      error: err.message,
    });
  }
};
