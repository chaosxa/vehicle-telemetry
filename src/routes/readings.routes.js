import { Router } from 'express';
import { listReadings, latestReading } from '../controllers/readings.controller.js';
import { authenticate } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

const router = Router();
router.use(authenticate);

router.get('/', asyncHandler(listReadings));
router.get('/latest', asyncHandler(latestReading));

export default router;
