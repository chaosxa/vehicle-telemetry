import { Router } from 'express';
import { listAlerts } from '../controllers/alerts.controller.js';
import { authenticate } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

const router = Router();

router.get('/', authenticate, asyncHandler(listAlerts));

export default router;
