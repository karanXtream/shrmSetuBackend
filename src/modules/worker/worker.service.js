import { pool } from '../../config/db.js';
import { getUserByPhoneNumber } from '../user/user.model.js';
import {
  createWorkerProfile as createWorkerProfileModel,
  getWorkerWithDetails,
} from './worker.model.js';

/**
 * Register a worker (creates user + worker profile in a transaction)
 * @param {object} data - { name, phoneNumber, experienceYears, bio }
 * @returns {Promise<object>} - Created user and worker profile
 */
export const registerWorker = async ({ name, phoneNumber, experienceYears = 0, bio = null }) => {
  const client = await pool.connect();

  try {
    // Validate inputs
    if (!name || !phoneNumber) {
      throw new Error('Missing required fields: name, phoneNumber');
    }

    if (!phoneNumber || phoneNumber.length < 10) {
      throw new Error('Invalid phone number format');
    }

    if (name.trim().length === 0) {
      throw new Error('Name is required');
    }

    if (experienceYears && (typeof experienceYears !== 'number' || experienceYears < 0)) {
      throw new Error('Experience years must be a non-negative number');
    }

    // Start transaction
    await client.query('BEGIN');

    try {
      // Check if phone number already exists
      const existingUser = await getUserByPhoneNumber(phoneNumber);
      if (existingUser) {
        throw new Error('Phone number already registered');
      }

      // Create user with role 'worker'
      const userResult = await client.query(
        `INSERT INTO users (name, phone_number, role)
         VALUES ($1, $2, 'worker')
         RETURNING id, name, phone_number, role, created_at`,
        [name.trim(), phoneNumber]
      );

      const user = userResult.rows[0];

      // Create worker profile
      const workerProfile = await createWorkerProfileModel(
        client,
        user.id,
        experienceYears || 0,
        bio
      );

      // Commit transaction
      await client.query('COMMIT');

      return {
        user: {
          id: user.id,
          name: user.name,
          phoneNumber: user.phone_number,
          role: user.role,
          createdAt: user.created_at,
        },
        workerProfile: {
          id: workerProfile.id,
          userId: workerProfile.user_id,
          experienceYears: workerProfile.experience_years,
          bio: workerProfile.bio,
          isAvailable: workerProfile.is_available,
          createdAt: workerProfile.created_at,
        },
      };
    } catch (err) {
      // Rollback on error
      await client.query('ROLLBACK');
      throw err;
    }
  } finally {
    client.release();
  }
};

/**
 * Get worker details by user ID
 */
export const getWorkerDetails = async (userId) => {
  const worker = await getWorkerWithDetails(userId);

  if (!worker) {
    throw new Error('Worker not found');
  }

  return {
    user: {
      id: worker.id,
      name: worker.name,
      phoneNumber: worker.phone_number,
      role: worker.role,
      createdAt: worker.user_created_at,
    },
    workerProfile: {
      id: worker.worker_profile_id,
      userId: worker.id,
      experienceYears: worker.experience_years,
      bio: worker.bio,
      isAvailable: worker.is_available,
      createdAt: worker.worker_created_at,
    },
    location: worker.location_id
      ? {
          id: worker.location_id,
          latitude: worker.latitude,
          longitude: worker.longitude,
          areaName: worker.area_name,
        }
      : null,
  };
};