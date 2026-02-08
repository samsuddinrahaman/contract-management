import { Badge } from '@/components/ui/badge';
import type { ContractStatus } from '@/types';

const STATUS_STYLES: Record<ContractStatus, string> = {
  CREATED: 'bg-gray-100 text-gray-800 border-gray-200',
  APPROVED: 'bg-green-100 text-green-800 border-green-200',
  SENT: 'bg-blue-100 text-blue-800 border-blue-200',
  SIGNED: 'bg-purple-100 text-purple-800 border-purple-200',
  LOCKED: 'bg-slate-100 text-slate-800 border-slate-200',
  REVOKE: 'bg-red-100 text-red-800 border-red-200',
};

interface StatusBadgeProps {
  status: ContractStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <Badge className={STATUS_STYLES[status] || 'bg-gray-100 text-gray-800'}>
      {status}
    </Badge>
  );
}
