import { z } from 'zod';
import { ContractStatus } from '@prisma/client';
import { prisma } from '../config/database.js';
import { NotFoundError, ValidationError } from '../types/index.js';
import { isValidTransition, isTerminalStatus } from '../utils/lifecycle.js';

export const contractValueSchema = z.object({
  fieldId: z.string().uuid(),
  value: z.string().nullable(),
});

export const createContractSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required'),
    blueprintId: z.string().uuid(),
    values: z.array(contractValueSchema).default([]),
  }),
});

export const updateContractStatusSchema = z.object({
  body: z.object({
    status: z.nativeEnum(ContractStatus),
    reason: z.string().optional(),
  }),
  params: z.object({
    id: z.string().uuid(),
  }),
});

export const updateContractValuesSchema = z.object({
  body: z.object({
    values: z.array(contractValueSchema),
  }),
  params: z.object({
    id: z.string().uuid(),
  }),
});

export type CreateContractInput = z.infer<typeof createContractSchema>['body'];
export type UpdateContractStatusInput = z.infer<typeof updateContractStatusSchema>['body'];
export type UpdateContractValuesInput = z.infer<typeof updateContractValuesSchema>['body'];
export type ContractValueInput = z.infer<typeof contractValueSchema>;

export class ContractService {
  async findAll(filters?: { status?: ContractStatus; blueprintId?: string }) {
    return prisma.contract.findMany({
      where: {
        ...(filters?.status && { status: filters.status }),
        ...(filters?.blueprintId && { blueprintId: filters.blueprintId }),
      },
      include: {
        blueprint: {
          select: {
            id: true,
            name: true,
          },
        },
        values: {
          select: {
            id: true,
            fieldId: true,
            value: true,
          },
        },
        _count: {
          select: {
            values: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findById(id: string) {
    const contract = await prisma.contract.findUnique({
      where: { id },
      include: {
        blueprint: {
          include: {
            fields: {
              orderBy: {
                createdAt: 'asc',
              },
            },
          },
        },
        values: {
          select: {
            id: true,
            fieldId: true,
            value: true,
          },
        },
      },
    });

    if (!contract) {
      throw new NotFoundError('Contract');
    }

    return contract;
  }

  async create(data: CreateContractInput) {
    const blueprint = await prisma.blueprint.findUnique({
      where: { id: data.blueprintId },
      include: {
        fields: true,
      },
    });

    if (!blueprint) {
      throw new NotFoundError('Blueprint');
    }

    const fieldIds = new Set(blueprint.fields.map(f => f.id));
    const invalidValues = data.values.filter(v => !fieldIds.has(v.fieldId));
    
    if (invalidValues.length > 0) {
      throw new ValidationError(`Invalid field IDs: ${invalidValues.map(v => v.fieldId).join(', ')}`);
    }

    const requiredFields = blueprint.fields.filter(f => f.required);
    const providedValues = new Map(data.values.map(v => [v.fieldId, v.value]));
    
    const missingRequired = requiredFields.filter(f => {
      const value = providedValues.get(f.id);
      return !value || value.trim() === '';
    });

    if (missingRequired.length > 0) {
      throw new ValidationError(`Missing required fields: ${missingRequired.map(f => f.label).join(', ')}`);
    }

    return prisma.contract.create({
      data: {
        name: data.name,
        blueprintId: data.blueprintId,
        values: {
          create: data.values.map(v => ({
            fieldId: v.fieldId,
            value: v.value,
          })),
        },
      },
      include: {
        blueprint: {
          select: {
            id: true,
            name: true,
          },
        },
        values: true,
      },
    });
  }

  async updateStatus(id: string, data: UpdateContractStatusInput) {
    const contract = await this.findById(id);

    if (isTerminalStatus(contract.status)) {
      throw new ValidationError(`Cannot transition from terminal status: ${contract.status}`);
    }

    if (!isValidTransition(contract.status, data.status)) {
      throw new ValidationError(
        `Invalid transition from ${contract.status} to ${data.status}. Allowed transitions: ${this.getAllowedTransitions(contract.status).join(', ')}`
      );
    }

    const updated = await prisma.$transaction(async (tx) => {
      const contract = await tx.contract.update({
        where: { id },
        data: { status: data.status },
        include: {
          blueprint: {
            select: {
              id: true,
              name: true,
            },
          },
          values: true,
        },
      });

      await tx.contractAuditLog.create({
        data: {
          contractId: id,
          fromStatus: contract.status,
          toStatus: data.status,
          reason: data.reason,
        },
      });

      return contract;
    });

    return updated;
  }

  async updateValues(id: string, data: UpdateContractValuesInput) {
    const contract = await this.findById(id);

    if (isTerminalStatus(contract.status)) {
      throw new ValidationError('Cannot modify values of a locked or revoked contract');
    }

    const fieldIds = new Set(contract.blueprint.fields.map(f => f.id));
    const invalidValues = data.values.filter(v => !fieldIds.has(v.fieldId));
    
    if (invalidValues.length > 0) {
      throw new ValidationError(`Invalid field IDs: ${invalidValues.map(v => v.fieldId).join(', ')}`);
    }

    const requiredFields = contract.blueprint.fields.filter(f => f.required);
    const providedValues = new Map(data.values.map(v => [v.fieldId, v.value]));
    
    const missingRequired = requiredFields.filter(f => {
      const value = providedValues.get(f.id);
      return !value || value.trim() === '';
    });

    if (missingRequired.length > 0) {
      throw new ValidationError(`Missing required fields: ${missingRequired.map(f => f.label).join(', ')}`);
    }

    await prisma.$transaction(
      data.values.map(v =>
        prisma.contractValue.upsert({
          where: {
            contractId_fieldId: {
              contractId: id,
              fieldId: v.fieldId,
            },
          },
          update: {
            value: v.value,
          },
          create: {
            contractId: id,
            fieldId: v.fieldId,
            value: v.value,
          },
        })
      )
    );

    return this.findById(id);
  }

  async delete(id: string) {
    const contract = await this.findById(id);

    if (isTerminalStatus(contract.status)) {
      throw new ValidationError('Cannot delete a locked or revoked contract');
    }

    await prisma.contract.delete({
      where: { id },
    });

    return { success: true };
  }

  getAllowedTransitions(status: ContractStatus): ContractStatus[] {
    switch (status) {
      case ContractStatus.CREATED:
        return [ContractStatus.APPROVED, ContractStatus.REVOKED];
      case ContractStatus.APPROVED:
        return [ContractStatus.SENT, ContractStatus.REVOKED];
      case ContractStatus.SENT:
        return [ContractStatus.SIGNED, ContractStatus.REVOKED];
      case ContractStatus.SIGNED:
        return [ContractStatus.LOCKED];
      case ContractStatus.LOCKED:
      case ContractStatus.REVOKED:
        return [];
      default:
        return [];
    }
  }

  async getAuditLogs(contractId: string) {
    return prisma.contractAuditLog.findMany({
      where: { contractId },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}

export const contractService = new ContractService();
