'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { ArrowLeft, FileText, CheckCircle, Send, PenTool, Lock, Ban, Trash2 } from 'lucide-react';
import type { Contract, ContractStatus, BlueprintField, ContractValue } from '@/types';

interface Props {
  params: Promise<{ id: string }>;
}

const STATUS_COLORS: Record<string, string> = {
  CREATED: 'bg-gray-100 text-gray-800 border-gray-200',
  APPROVED: 'bg-green-100 text-green-800 border-green-200',
  SENT: 'bg-blue-100 text-blue-800 border-blue-200',
  SIGNED: 'bg-purple-100 text-purple-800 border-purple-200',
  LOCKED: 'bg-slate-100 text-slate-800 border-slate-200',
  REVOKE: 'bg-red-100 text-red-800 border-red-200',
};

const TRANSITIONS: { status: ContractStatus; label: string; icon: React.ReactNode; description: string }[] = [
  { status: 'APPROVED', label: 'Approve', icon: <CheckCircle className="h-4 w-4" />, description: 'Approve this contract for sending' },
  { status: 'SENT', label: 'Send', icon: <Send className="h-4 w-4" />, description: 'Send contract to parties for signing' },
  { status: 'SIGNED', label: 'Sign', icon: <PenTool className="h-4 w-4" />, description: 'Mark contract as signed' },
  { status: 'LOCKED', label: 'Lock', icon: <Lock className="h-4 w-4" />, description: 'Lock the final contract' },
  { status: 'REVOKE', label: 'Revoke', icon: <Ban className="h-4 w-4" />, description: 'Revoke this contract' },
];

export default function ContractDetailPage({ params }: Props) {
  const router = useRouter();
  const [contract, setContract] = useState<Contract | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTransition, setSelectedTransition] = useState<typeof TRANSITIONS[0] | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    const loadContract = async () => {
      try {
        const resolvedParams = await params;
        const response = await api.get<{ success: boolean; data: Contract }>(`/contracts/${resolvedParams.id}`);
        setContract(response.data);
      } catch (error) {
        toast.error('Failed to load contract');
        router.push('/contracts');
      } finally {
        setIsLoading(false);
      }
    };

    loadContract();
  }, [params, router]);

  const handleTransition = async () => {
    if (!contract || !selectedTransition) return;

    setIsTransitioning(true);
    try {
      const resolvedParams = await params;
      const response = await api.patch<{ success: boolean; data: Contract }>(
        `/contracts/${resolvedParams.id}/status`,
        { status: selectedTransition.status }
      );
      setContract(response.data);
      toast.success(`Contract ${selectedTransition.label.toLowerCase()} successfully`);
      setSelectedTransition(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update status');
    } finally {
      setIsTransitioning(false);
    }
  };

  const handleDelete = async () => {
    if (!contract) return;

    if (!confirm('Are you sure you want to delete this contract?')) return;

    try {
      const resolvedParams = await params;
      await api.delete(`/contracts/${resolvedParams.id}`);
      toast.success('Contract deleted successfully');
      router.push('/contracts');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete contract');
    }
  };

  const getFieldValue = (fieldId: string): string => {
    return contract?.values?.find((v) => v.fieldId === fieldId)?.value || '-';
  };

  const renderFieldValue = (field: BlueprintField, value: string) => {
    if (!value || value === '-') return <span className="text-muted-foreground">-</span>;

    switch (field.type) {
      case 'CHECKBOX':
        return value === 'true' ? (
          <Badge variant="default">Yes</Badge>
        ) : (
          <Badge variant="secondary">No</Badge>
        );
      case 'SIGNATURE':
        return value.startsWith('data:') ? (
          <img src={value} alt="Signature" className="max-h-20 border rounded" />
        ) : (
          <span className="text-muted-foreground italic">Not signed yet</span>
        );
      default:
        return value;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!contract) {
    return null;
  }

  const availableActions = contract.allowedActions || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">{contract.name}</h2>
            <p className="text-muted-foreground">
              {contract.blueprint?.name} • Created {new Date(contract.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Badge className={STATUS_COLORS[contract.status] || 'bg-gray-100 text-gray-800'}>
            {contract.status}
          </Badge>
          {!contract.isTerminal && (
            <Button variant="destructive" size="sm" onClick={handleDelete}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Field Values</CardTitle>
              <CardDescription>
                Values filled for this contract
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {contract.blueprint?.fields?.map((field) => (
                  <div
                    key={field.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{field.label}</p>
                      <p className="text-sm text-muted-foreground">{field.type}</p>
                    </div>
                    <div className="text-right">
                      {renderFieldValue(field, getFieldValue(field.id))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Lifecycle Actions</CardTitle>
              <CardDescription>
                Manage contract status transitions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {contract.isTerminal ? (
                <div className="text-center py-4 text-muted-foreground">
                  <Lock className="h-8 w-8 mx-auto mb-2" />
                  <p>This contract is {contract.status.toLowerCase()}</p>
                  <p className="text-sm">No further actions available</p>
                </div>
              ) : availableActions.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  <p>No actions available</p>
                </div>
              ) : (
                availableActions.map((action) => {
                  const transition = TRANSITIONS.find((t) => t.status === action);
                  if (!transition) return null;

                  return (
                    <Button
                      key={action}
                      variant={action === 'REVOKE' ? 'destructive' : 'outline'}
                      className="w-full justify-start"
                      onClick={() => setSelectedTransition(transition)}
                    >
                      {transition.icon}
                      <span className="ml-2">{transition.label}</span>
                    </Button>
                  );
                })
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contract Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <span className="font-medium">{contract.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Blueprint</span>
                <span className="font-medium">{contract.blueprint?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Created</span>
                <span className="font-medium">
                  {new Date(contract.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Last Updated</span>
                <span className="font-medium">
                  {new Date(contract.updatedAt).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Fields Filled</span>
                <span className="font-medium">
                  {contract.values?.filter((v) => v.value && v.value.trim() !== '').length || 0} /{' '}
                  {contract.blueprint?.fields?.length || 0}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={!!selectedTransition} onOpenChange={() => setSelectedTransition(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm {selectedTransition?.label}</DialogTitle>
            <DialogDescription>
              {selectedTransition?.description}. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedTransition(null)}>
              Cancel
            </Button>
            <Button
              variant={selectedTransition?.status === 'REVOKE' ? 'destructive' : 'default'}
              onClick={handleTransition}
              disabled={isTransitioning}
            >
              {isTransitioning ? 'Processing...' : `Confirm ${selectedTransition?.label}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
