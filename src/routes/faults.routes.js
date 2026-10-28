import { Router } from 'express';
import { createFault, listFaults } from '../controllers/faults.controller.js';
import { authenticate } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

const router = Router();
router.use(authenticate);

router.post('/', asyncHandler(createFault));
router.get('/:vehicleId', asyncHandler(listFaults));

export default router;
