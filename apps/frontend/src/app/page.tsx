import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Blueprint, Contract, ApiResponse } from '@/types';
import { FileText, Palette, CheckCircle, Clock } from 'lucide-react';
import Link from 'next/link';

async function getStats() {
  const [blueprintsRes, contractsRes] = await Promise.all([
    api.get<ApiResponse<Blueprint[]>>('/blueprints'),
    api.get<ApiResponse<Contract[]>>('/contracts'),
  ]);

  const blueprints = blueprintsRes.data;
  const contracts = contractsRes.data;

  return {
    totalBlueprints: blueprints.length,
    totalContracts: contracts.length,
    pendingContracts: contracts.filter(c => c.status === 'CREATED').length,
    activeContracts: contracts.filter(c => ['APPROVED', 'SENT'].includes(c.status)).length,
    recentContracts: contracts.slice(0, 5),
  };
}

export default async function DashboardPage() {
  const stats = await getStats();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Overview of your contracts and blueprints
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Blueprints</CardTitle>
            <Palette className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalBlueprints}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Contracts</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalContracts}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingContracts}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeContracts}</div>
          </CardContent>
        </Card>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Recent Contracts</h3>
        {stats.recentContracts.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No contracts yet</p>
              <Link
                href="/contracts/new"
                className="mt-4 text-primary hover:underline"
              >
                Create your first contract
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {stats.recentContracts.map((contract) => (
              <Link
                key={contract.id}
                href={`/contracts/${contract.id}`}
                className="block"
              >
                <Card className="hover:bg-accent transition-colors">
                  <CardContent className="flex items-center justify-between py-4">
                    <div>
                      <p className="font-medium">{contract.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {contract.blueprint?.name}
                      </p>
                    </div>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${contract.status === 'CREATED'
                          ? 'bg-status-created/10 text-status-created ring-status-created/20'
                          : contract.status === 'APPROVED'
                            ? 'bg-status-approved/10 text-status-approved ring-status-approved/20'
                            : contract.status === 'SENT'
                              ? 'bg-status-sent/10 text-status-sent ring-status-sent/20'
                              : contract.status === 'SIGNED'
                                ? 'bg-status-signed/10 text-status-signed ring-status-signed/20'
                                : contract.status === 'LOCKED'
                                  ? 'bg-status-locked/10 text-status-locked ring-status-locked/20'
                                  : 'bg-status-revoked/10 text-status-revoked ring-status-revoked/20'
                        }`}
                    >
                      {contract.status}
                    </span>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
