import { z } from 'zod';
import { FieldType } from '@prisma/client';
import { prisma } from '../config/database.js';
import { NotFoundError, ValidationError } from '../types/index.js';

export const blueprintFieldSchema = z.object({
  type: z.nativeEnum(FieldType),
  label: z.string().min(1, 'Label is required'),
  positionX: z.number().default(0),
  positionY: z.number().default(0),
  required: z.boolean().default(false),
});

export const createBlueprintSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required'),
    description: z.string().optional(),
    fields: z.array(blueprintFieldSchema).min(1, 'At least one field is required'),
  }),
});

export const updateBlueprintSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required').optional(),
    description: z.string().optional(),
    fields: z.array(blueprintFieldSchema).optional(),
  }),
  params: z.object({
    id: z.string().uuid(),
  }),
});

export type CreateBlueprintInput = z.infer<typeof createBlueprintSchema>['body'];
export type UpdateBlueprintInput = z.infer<typeof updateBlueprintSchema>['body'];
export type BlueprintFieldInput = z.infer<typeof blueprintFieldSchema>;

export class BlueprintService {
  async findAll() {
    return prisma.blueprint.findMany({
      include: {
        fields: {
          orderBy: {
            createdAt: 'asc',
          },
        },
        _count: {
          select: {
            contracts: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findById(id: string) {
    const blueprint = await prisma.blueprint.findUnique({
      where: { id },
      include: {
        fields: {
          orderBy: {
            createdAt: 'asc',
          },
        },
        _count: {
          select: {
            contracts: true,
          },
        },
      },
    });

    if (!blueprint) {
      throw new NotFoundError('Blueprint');
    }

    return blueprint;
  }

  async create(data: CreateBlueprintInput) {
    return prisma.blueprint.create({
      data: {
        name: data.name,
        description: data.description,
        fields: {
          create: data.fields.map(field => ({
            type: field.type,
            label: field.label,
            positionX: field.positionX,
            positionY: field.positionY,
            required: field.required,
          })),
        },
      },
      include: {
        fields: true,
      },
    });
  }

  async update(id: string, data: UpdateBlueprintInput) {
    const existing = await this.findById(id);

    const contractsCount = await prisma.contract.count({
      where: { blueprintId: id },
    });

    if (contractsCount > 0 && data.fields) {
      throw new ValidationError('Cannot modify fields on a blueprint that has contracts. Create a new blueprint instead.');
    }

    return prisma.blueprint.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        ...(data.fields && {
          fields: {
            deleteMany: {},
            create: data.fields.map(field => ({
              type: field.type,
              label: field.label,
              positionX: field.positionX,
              positionY: field.positionY,
              required: field.required,
            })),
          },
        }),
      },
      include: {
        fields: true,
      },
    });
  }

  async delete(id: string) {
    await this.findById(id);

    const contractsCount = await prisma.contract.count({
      where: { blueprintId: id },
    });

    if (contractsCount > 0) {
      throw new ValidationError('Cannot delete a blueprint that has contracts.');
    }

    await prisma.blueprint.delete({
      where: { id },
    });

    return { success: true };
  }
}

export const blueprintService = new BlueprintService();
