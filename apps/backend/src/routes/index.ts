import { Router } from 'express';
import blueprintRoutes from './blueprint.routes.js';
import contractRoutes from './contract.routes.js';

const router = Router();

router.use('/blueprints', blueprintRoutes);
router.use('/contracts', contractRoutes);

router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default router;
