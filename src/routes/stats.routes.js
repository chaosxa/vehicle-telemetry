import { Router } from 'express';
import { readingStats } from '../controllers/readings.controller.js';
import { authenticate } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

const router = Router();

router.get('/', authenticate, asyncHandler(readingStats));

export default router;
