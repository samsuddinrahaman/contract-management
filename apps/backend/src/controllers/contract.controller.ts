import { Request, Response, NextFunction } from 'express';
import { ContractStatus } from '@prisma/client';
import { 
  contractService, 
  createContractSchema, 
  updateContractStatusSchema,
  updateContractValuesSchema 
} from '../services/contract.service.js';
import { getAllowedActions, isTerminalStatus } from '../utils/lifecycle.js';

export const contractController = {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { status, blueprintId } = req.query;
      
      const filters = {
        ...(status && { status: status as ContractStatus }),
        ...(blueprintId && { blueprintId: blueprintId as string }),
      };

      const contracts = await contractService.findAll(
        Object.keys(filters).length > 0 ? filters : undefined
      );
      
      res.json({
        success: true,
        data: contracts,
      });
    } catch (error) {
      next(error);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const contract = await contractService.findById(id);
      const allowedActions = getAllowedActions(contract.status);
      
      res.json({
        success: true,
        data: {
          ...contract,
          allowedActions,
          isTerminal: isTerminalStatus(contract.status),
        },
      });
    } catch (error) {
      next(error);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const contract = await contractService.create(req.body);
      res.status(201).json({
        success: true,
        data: contract,
      });
    } catch (error) {
      next(error);
    }
  },

  async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const contract = await contractService.updateStatus(id, req.body);
      const allowedActions = getAllowedActions(contract.status);
      
      res.json({
        success: true,
        data: {
          ...contract,
          allowedActions,
          isTerminal: isTerminalStatus(contract.status),
        },
      });
    } catch (error) {
      next(error);
    }
  },

  async updateValues(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const contract = await contractService.updateValues(id, req.body);
      const allowedActions = getAllowedActions(contract.status);
      
      res.json({
        success: true,
        data: {
          ...contract,
          allowedActions,
          isTerminal: isTerminalStatus(contract.status),
        },
      });
    } catch (error) {
      next(error);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await contractService.delete(id);
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  async getAuditLogs(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const logs = await contractService.getAuditLogs(id);
      res.json({
        success: true,
        data: logs,
      });
    } catch (error) {
      next(error);
    }
  },
};
