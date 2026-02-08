'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { ArrowLeft, FileText } from 'lucide-react';
import type { Blueprint, BlueprintField } from '@/types';

interface FieldValue {
  fieldId: string;
  value: string;
}

export default function NewContractPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedBlueprint = searchParams.get('blueprint');

  const [blueprints, setBlueprints] = useState<Blueprint[]>([]);
  const [selectedBlueprint, setSelectedBlueprint] = useState<Blueprint | null>(null);
  const [name, setName] = useState('');
  const [values, setValues] = useState<FieldValue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadBlueprints = async () => {
      try {
        const response = await api.get<{ success: boolean; data: Blueprint[] }>('/blueprints');
        const data = response.data;
        setBlueprints(data);

        if (preselectedBlueprint) {
          const blueprint = data.find((b) => b.id === preselectedBlueprint);
          if (blueprint) {
            setSelectedBlueprint(blueprint);
            setValues(
              blueprint.fields.map((f) => ({
                fieldId: f.id,
                value: '',
              }))
            );
          }
        }
      } catch (error) {
        toast.error('Failed to load blueprints');
      } finally {
        setIsLoading(false);
      }
    };

    loadBlueprints();
  }, [preselectedBlueprint]);

  const handleBlueprintChange = (blueprintId: string) => {
    const blueprint = blueprints.find((b) => b.id === blueprintId);
    if (blueprint) {
      setSelectedBlueprint(blueprint);
      setValues(
        blueprint.fields.map((f) => ({
          fieldId: f.id,
          value: '',
        }))
      );
    }
  };

  const updateValue = (fieldId: string, value: string) => {
    setValues((prev) =>
      prev.map((v) => (v.fieldId === fieldId ? { ...v, value } : v))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error('Contract name is required');
      return;
    }

    if (!selectedBlueprint) {
      toast.error('Please select a blueprint');
      return;
    }

    // Check required fields
    const requiredFields = selectedBlueprint.fields.filter((f) => f.required);
    const missingRequired = requiredFields.filter((f) => {
      const value = values.find((v) => v.fieldId === f.id)?.value;
      return !value || value.trim() === '';
    });

    if (missingRequired.length > 0) {
      toast.error(`Please fill required fields: ${missingRequired.map((f) => f.label).join(', ')}`);
      return;
    }

    setIsSubmitting(true);

    try {
      await api.post('/contracts', {
        name,
        blueprintId: selectedBlueprint.id,
        values: values.filter((v) => v.value.trim() !== ''),
      });
      toast.success('Contract created successfully');
      router.push('/contracts');
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create contract');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderFieldInput = (field: BlueprintField) => {
    const value = values.find((v) => v.fieldId === field.id)?.value || '';

    switch (field.type) {
      case 'TEXT':
        return (
          <Input
            value={value}
            onChange={(e) => updateValue(field.id, e.target.value)}
            placeholder={`Enter ${field.label.toLowerCase()}`}
          />
        );
      case 'DATE':
        return (
          <Input
            type="date"
            value={value}
            onChange={(e) => updateValue(field.id, e.target.value)}
          />
        );
      case 'CHECKBOX':
        return (
          <input
            type="checkbox"
            checked={value === 'true'}
            onChange={(e) => updateValue(field.id, e.target.checked ? 'true' : 'false')}
            className="h-4 w-4 rounded border-gray-300"
          />
        );
      case 'SIGNATURE':
        return (
          <div className="border rounded-lg p-4 bg-gray-50">
            <p className="text-sm text-muted-foreground mb-2">
              Signature will be collected during the signing process
            </p>
            <Input
              value={value}
              onChange={(e) => updateValue(field.id, e.target.value)}
              placeholder="Signature placeholder"
              disabled
            />
          </div>
        );
      default:
        return (
          <Input
            value={value}
            onChange={(e) => updateValue(field.id, e.target.value)}
            placeholder={`Enter ${field.label.toLowerCase()}`}
          />
        );
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">New Contract</h2>
          <p className="text-muted-foreground">
            Create a new contract from a blueprint
          </p>
        </div>
      </div>

      {blueprints.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">No blueprints available</p>
            <p className="text-muted-foreground mb-4">
              Create a blueprint first to create contracts
            </p>
            <Button onClick={() => router.push('/blueprints/new')}>
              Create Blueprint
            </Button>
          </CardContent>
        </Card>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Contract Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Contract Name</label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter contract name"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Blueprint</label>
                <Select
                  value={selectedBlueprint?.id}
                  onValueChange={handleBlueprintChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a blueprint" />
                  </SelectTrigger>
                  <SelectContent>
                    {blueprints.map((blueprint) => (
                      <SelectItem key={blueprint.id} value={blueprint.id}>
                        {blueprint.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {selectedBlueprint && (
            <Card>
              <CardHeader>
                <CardTitle>Field Values</CardTitle>
                <CardDescription>
                  Fill in the values for {selectedBlueprint.fields.length} fields
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedBlueprint.fields.map((field) => (
                  <div key={field.id}>
                    <label className="text-sm font-medium mb-2 block">
                      {field.label}
                      {field.required && <span className="text-destructive ml-1">*</span>}
                    </label>
                    {renderFieldInput(field)}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          <div className="flex gap-4">
            <Button type="submit" disabled={isSubmitting || !selectedBlueprint}>
              {isSubmitting ? 'Creating...' : 'Create Contract'}
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
      )}
    </div>
  );
}
