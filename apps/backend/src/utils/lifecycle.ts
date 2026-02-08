import { ContractStatus } from '@prisma/client';

export const VALID_TRANSITIONS: Record<ContractStatus, ContractStatus[]> = {
  [ContractStatus.CREATED]: [ContractStatus.APPROVED, ContractStatus.REVOKED],
  [ContractStatus.APPROVED]: [ContractStatus.SENT, ContractStatus.REVOKED],
  [ContractStatus.SENT]: [ContractStatus.SIGNED, ContractStatus.REVOKED],
  [ContractStatus.SIGNED]: [ContractStatus.LOCKED],
  [ContractStatus.LOCKED]: [],
  [ContractStatus.REVOKED]: [],
};

export function isValidTransition(
  current: ContractStatus,
  next: ContractStatus
): boolean {
  return VALID_TRANSITIONS[current]?.includes(next) ?? false;
}

export function getAllowedActions(status: ContractStatus): ContractStatus[] {
  return VALID_TRANSITIONS[status] ?? [];
}

export function isTerminalStatus(status: ContractStatus): boolean {
  return status === ContractStatus.LOCKED || status === ContractStatus.REVOKED;
}
