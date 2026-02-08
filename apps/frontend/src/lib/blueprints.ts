import { api } from '@/lib/api';
import { Blueprint, Contract, ApiResponse } from '@/types';

export async function getBlueprints(): Promise<Blueprint[]> {
  const response = await api.get<ApiResponse<Blueprint[]>>('/blueprints');
  return response.data;
}

export async function getBlueprint(id: string): Promise<Blueprint> {
  const response = await api.get<ApiResponse<Blueprint>>(`/blueprints/${id}`);
  return response.data;
}
