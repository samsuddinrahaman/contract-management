import { Router } from 'express';
import { blueprintController } from '../controllers/blueprint.controller.js';
import { validateRequest } from '../middleware/validate-request.js';
import { createBlueprintSchema, updateBlueprintSchema } from '../services/blueprint.service.js';

const router = Router();

router.get('/', blueprintController.getAll);
router.get('/:id', blueprintController.getById);
router.post('/', validateRequest(createBlueprintSchema), blueprintController.create);
router.put('/:id', validateRequest(updateBlueprintSchema), blueprintController.update);
router.delete('/:id', blueprintController.delete);

export default router;
