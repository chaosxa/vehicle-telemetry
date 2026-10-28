import { Router } from 'express';
import authRoutes from './auth.routes.js';
import readingsRoutes from './readings.routes.js';
import statsRoutes from './stats.routes.js';
import alertsRoutes from './alerts.routes.js';
import diagnosticsRoutes from './diagnostics.routes.js';
import faultsRoutes from './faults.routes.js';

const router = Router();

router.get('/health', (req, res) => res.json({ status: 'ok' }));

router.use('/auth', authRoutes);
router.use('/readings', readingsRoutes);
router.use('/stats', statsRoutes);
router.use('/alerts', alertsRoutes);
router.use('/diagnostics', diagnosticsRoutes);
router.use('/faults', faultsRoutes);

export default router;
