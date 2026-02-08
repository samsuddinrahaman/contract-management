import { Router } from 'express';
import { contractController } from '../controllers/contract.controller.js';
import { validateRequest } from '../middleware/validate-request.js';
import { createContractSchema, updateContractStatusSchema, updateContractValuesSchema } from '../services/contract.service.js';

const router = Router();

router.get('/', contractController.getAll);
router.get('/:id', contractController.getById);
router.post('/', validateRequest(createContractSchema), contractController.create);
router.patch('/:id/status', validateRequest(updateContractStatusSchema), contractController.updateStatus);
router.patch('/:id/values', validateRequest(updateContractValuesSchema), contractController.updateValues);
router.delete('/:id', contractController.delete);
router.get('/:id/audit-logs', contractController.getAuditLogs);

export default router;
