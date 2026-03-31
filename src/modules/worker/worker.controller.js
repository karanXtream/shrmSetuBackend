import { registerWorker, getWorkerDetails } from './worker.service.js';

/**
 * POST /worker/register
 * Register a worker (creates user + worker profile)
 */
export const registerWorkerController = async (req, res) => {
  try {
    const { name, phoneNumber, experienceYears, bio } = req.body;

    if (!name || !phoneNumber) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: name, phoneNumber',
      });
    }

    const result = await registerWorker({
      name,
      phoneNumber,
      experienceYears: experienceYears || 0,
      bio,
    });

    res.status(201).json({
      success: true,
      message: 'Worker registered successfully',
      data: result,
    });
  } catch (err) {
    console.error('Worker Controller Error:', err.message);
    const statusCode = err.message.includes('already registered') ? 409 : 500;
    res.status(statusCode).json({
      success: false,
      error: err.message,
    });
  }
};

/**
 * GET /worker/:id
 * Get worker details with user info and location
 */
export const getWorker = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid worker ID',
      });
    }

    const worker = await getWorkerDetails(parseInt(id));

    res.status(200).json({
      success: true,
      data: worker,
    });
  } catch (err) {
    console.error('Worker Controller Error:', err.message);
    const statusCode = err.message.includes('not found') ? 404 : 500;
    res.status(statusCode).json({
      success: false,
      error: err.message,
    });
  }
};