import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

export function validateRequest<T>(schema: ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const validated = schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      
      req.body = validated.body ?? req.body;
      req.query = validated.query ?? req.query;
      req.params = validated.params ?? req.params;
      
      next();
    } catch (error) {
      next(error);
    }
  };
}
