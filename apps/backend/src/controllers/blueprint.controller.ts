import { Request, Response, NextFunction } from 'express';
import { blueprintService, createBlueprintSchema, updateBlueprintSchema } from '../services/blueprint.service.js';
import { validateRequest } from '../middleware/validate-request.js';

export const blueprintController = {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const blueprints = await blueprintService.findAll();
      res.json({
        success: true,
        data: blueprints,
      });
    } catch (error) {
      next(error);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const blueprint = await blueprintService.findById(id);
      res.json({
        success: true,
        data: blueprint,
      });
    } catch (error) {
      next(error);
    }
  },

  async create(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const blueprint = await blueprintService.create(req.body);
      res.status(201).json({
        success: true,
        data: blueprint,
      });
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const blueprint = await blueprintService.update(id, req.body);
      res.json({
        success: true,
        data: blueprint,
      });
    } catch (error) {
      next(error);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await blueprintService.delete(id);
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },
};
