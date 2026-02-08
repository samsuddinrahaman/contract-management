import { api } from '@/lib/api';
import { Contract, ApiResponse } from '@/types';

export async function getContracts(status?: string): Promise<Contract[]> {
  const endpoint = status ? `/contracts?status=${status}` : '/contracts';
  const response = await api.get<ApiResponse<Contract[]>>(endpoint);
  return response.data;
}

export async function getContract(id: string): Promise<Contract> {
  const response = await api.get<ApiResponse<Contract>>(`/contracts/${id}`);
  return response.data;
}
