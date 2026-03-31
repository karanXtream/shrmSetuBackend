import { getUserByPhoneNumber, createUser } from './user.model.js';

/**
 * Register a normal user
 * @param {string} name - User's full name
 * @param {string} phoneNumber - User's phone number (unique)
 * @returns {Promise<object>} - Created user object
 */
export const registerNormalUser = async (name, phoneNumber) => {
  // Validate phone number format (basic validation)
  if (!phoneNumber || phoneNumber.length < 10) {
    throw new Error('Invalid phone number format');
  }

  // Check if phone number already exists
  const existingUser = await getUserByPhoneNumber(phoneNumber);
  if (existingUser) {
    throw new Error('Phone number already registered');
  }

  // Validate name
  if (!name || name.trim().length === 0) {
    throw new Error('Name is required');
  }

  // Create user with role 'user'
  const user = await createUser(name.trim(), phoneNumber, 'user');

  return {
    id: user.id,
    name: user.name,
    phoneNumber: user.phone_number,
    role: user.role,
    createdAt: user.created_at,
  };
};
