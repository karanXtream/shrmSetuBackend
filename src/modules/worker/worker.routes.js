import express from 'express';
import { registerWorkerController, getWorker } from './worker.controller.js';

const router = express.Router();

router.post('/register', registerWorkerController);
router.get('/:id', getWorker);

export default router;