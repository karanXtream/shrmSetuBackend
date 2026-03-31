import express from 'express';
import { setLocation, getLocation, deleteLocationController } from './location.controller.js';

const router = express.Router();

router.post('/:userId', setLocation);
router.get('/:userId', getLocation);
router.delete('/:userId', deleteLocationController);

export default router;
