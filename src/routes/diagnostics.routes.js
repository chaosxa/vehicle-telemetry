import { Router } from 'express';
import { lookupCode } from '../controllers/diagnostics.controller.js';

const router = Router();

// Public: anyone can look up what a fault code means.
router.get('/:code', lookupCode);

export default router;
