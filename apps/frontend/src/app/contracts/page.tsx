import { api } from '@/lib/api';
import { Contract, ApiResponse } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Plus, FileText } from 'lucide-react';

interface Props {
  searchParams: Promise<{ status?: string }>;
}

async function getContracts(status?: string): Promise<Contract[]> {
  const endpoint = status ? `/contracts?status=${status}` : '/contracts';
  const response = await api.get<ApiResponse<Contract[]>>(endpoint);
  return response.data;
}

function getStatusColor(status: string): string {
  switch (status) {
    case 'CREATED':
      return 'bg-status-created/10 text-status-created border-status-created/20';
    case 'APPROVED':
      return 'bg-status-approved/10 text-status-approved border-status-approved/20';
    case 'SENT':
      return 'bg-status-sent/10 text-status-sent border-status-sent/20';
    case 'SIGNED':
      return 'bg-status-signed/10 text-status-signed border-status-signed/20';
    case 'LOCKED':
      return 'bg-status-locked/10 text-status-locked border-status-locked/20';
    case 'REVOKE':
      return 'bg-status-revoked/10 text-status-revoked border-status-revoked/20';
    default:
      return 'bg-status-created/10 text-status-created border-status-created/20';
  }
}

export default async function ContractsPage({ searchParams }: Props) {
  const params = await searchParams;
  const contracts = await getContracts(params.status);
  const statuses = ['ALL', 'CREATED', 'APPROVED', 'SENT', 'SIGNED', 'LOCKED', 'REVOKE'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Contracts</h2>
          <p className="text-muted-foreground">
            Manage your contracts and track their lifecycle
          </p>
        </div>
        <Link href="/contracts/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Contract
          </Button>
        </Link>
      </div>

      <div className="flex flex-wrap gap-2">
        {statuses.map((status) => (
          <Link
            key={status}
            href={status === 'ALL' ? '/contracts' : `/contracts?status=${status}`}
          >
            <Badge
              variant={params.status === status || (status === 'ALL' && !params.status) ? 'default' : 'secondary'}
              className="cursor-pointer px-4 py-2"
            >
              {status}
            </Badge>
          </Link>
        ))}
      </div>

      {contracts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">No contracts yet</p>
            <p className="text-muted-foreground mb-4">
              Create your first contract to get started
            </p>
            <Link href="/contracts/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Contract
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {contracts.map((contract) => (
            <Link key={contract.id} href={`/contracts/${contract.id}`}>
              <Card className="hover:bg-accent transition-colors cursor-pointer">
                <CardContent className="flex items-center justify-between py-4">
                  <div>
                    <p className="font-medium">{contract.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {contract.blueprint?.name} • Created {new Date(contract.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge className={getStatusColor(contract.status)}>
                      {contract.status}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {contract.values?.length || 0} fields filled
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
