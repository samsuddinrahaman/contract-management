'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { ArrowLeft, Plus, X, GripVertical } from 'lucide-react';
import type { FieldType, Blueprint } from '@/types';

const FIELD_TYPES: { value: FieldType; label: string }[] = [
  { value: 'TEXT', label: 'Text' },
  { value: 'DATE', label: 'Date' },
  { value: 'SIGNATURE', label: 'Signature' },
  { value: 'CHECKBOX', label: 'Checkbox' },
];

interface Props {
  params: Promise<{ id: string }>;
}

export default function EditBlueprintPage({ params }: Props) {
  const router = useRouter();
  const [id, setId] = useState<string>('');
  const [blueprint, setBlueprint] = useState<Blueprint | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasContracts, setHasContracts] = useState(false);

  useEffect(() => {
    const loadBlueprint = async () => {
      try {
        const resolvedParams = await params;
        setId(resolvedParams.id);
        const response = await api.get<{ success: boolean; data: Blueprint }>(`/blueprints/${resolvedParams.id}`);
        const data = response.data;
        setBlueprint(data);
        setName(data.name);
        setDescription(data.description || '');
        setHasContracts((data._count?.contracts || 0) > 0);
      } catch (error) {
        toast.error('Failed to load blueprint');
        router.push('/blueprints');
      } finally {
        setIsLoading(false);
      }
    };

    loadBlueprint();
  }, [params, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error('Name is required');
      return;
    }

    setIsSubmitting(true);

    try {
      await api.put(`/blueprints/${id}`, {
        name,
        description,
      });
      toast.success('Blueprint updated successfully');
      router.push(`/blueprints/${id}`);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update blueprint');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!blueprint) {
    return null;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Edit Blueprint</h2>
          <p className="text-muted-foreground">
            Update blueprint details
          </p>
        </div>
      </div>

      {hasContracts && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-800">
          <p className="text-sm">
            <strong>Note:</strong> This blueprint has active contracts. You can only update the name and description. Fields cannot be modified.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Blueprint Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Name</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter blueprint name"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Description</label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter description (optional)"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Fields ({blueprint.fields.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {hasContracts ? (
              <div className="space-y-3">
                {blueprint.fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="flex items-center justify-between p-4 border rounded-lg bg-muted"
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-muted-foreground font-mono">
                        {index + 1}
                      </span>
                      <div>
                        <p className="font-medium">{field.label}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge>{field.type}</Badge>
                      {field.required && (
                        <Badge variant="destructive">Required</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">
                Fields are editable when there are no contracts using this blueprint.
              </p>
            )}
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
