export type FieldType = 'TEXT' | 'DATE' | 'SIGNATURE' | 'CHECKBOX';
export type ContractStatus = 'CREATED' | 'APPROVED' | 'SENT' | 'SIGNED' | 'LOCKED' | 'REVOKE';

export interface BlueprintFieldInput {
  type: FieldType;
  label: string;
  positionX: number;
  positionY: number;
  required: boolean;
}

export interface BlueprintField {
  id: string;
  blueprintId: string;
  type: FieldType;
  label: string;
  positionX: number;
  positionY: number;
  required: boolean;
  createdAt: string;
}

export interface Blueprint {
  id: string;
  name: string;
  description?: string;
  fields: BlueprintField[];
  createdAt: string;
  updatedAt: string;
  _count?: {
    contracts: number;
  };
}

export interface ContractValue {
  id: string;
  contractId: string;
  fieldId: string;
  value: string | null;
}

export interface Contract {
  id: string;
  name: string;
  blueprintId: string;
  status: ContractStatus;
  createdAt: string;
  updatedAt: string;
  blueprint?: {
    id: string;
    name: string;
    fields?: BlueprintField[];
  };
  values: ContractValue[];
  allowedActions?: ContractStatus[];
  isTerminal?: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: {
    message: string;
    code: string;
  };
}
