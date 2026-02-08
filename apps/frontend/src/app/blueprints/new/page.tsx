'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { Plus, X, GripVertical } from 'lucide-react';
import type { FieldType, BlueprintFieldInput } from '@/types';

const FIELD_TYPES: { value: FieldType; label: string }[] = [
  { value: 'TEXT', label: 'Text' },
  { value: 'DATE', label: 'Date' },
  { value: 'SIGNATURE', label: 'Signature' },
  { value: 'CHECKBOX', label: 'Checkbox' },
];

export default function NewBlueprintPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [fields, setFields] = useState<BlueprintFieldInput[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addField = () => {
    setFields([
      ...fields,
      {
        type: 'TEXT',
        label: '',
        positionX: 0,
        positionY: fields.length,
        required: false,
      },
    ]);
  };

  const updateField = (index: number, updates: Partial<BlueprintFieldInput>) => {
    const updated = [...fields];
    updated[index] = { ...updated[index], ...updates };
    setFields(updated);
  };

  const removeField = (index: number) => {
    setFields(fields.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error('Name is required');
      return;
    }

    if (fields.length === 0) {
      toast.error('At least one field is required');
      return;
    }

    const invalidFields = fields.filter(f => !f.label.trim());
    if (invalidFields.length > 0) {
      toast.error('All fields must have a label');
      return;
    }

    setIsSubmitting(true);

    try {
      await api.post('/blueprints', {
        name,
        description,
        fields: fields.map((f, i) => ({
          ...f,
          positionY: i,
        })),
      });
      toast.success('Blueprint created successfully');
      router.push('/blueprints');
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create blueprint');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">New Blueprint</h2>
        <p className="text-muted-foreground">
          Create a new contract template with custom fields
        </p>
      </div>

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
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Fields</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={addField}>
              <Plus className="mr-2 h-4 w-4" />
              Add Field
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {fields.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No fields added yet. Click "Add Field" to get started.
              </div>
            ) : (
              fields.map((field, index) => (
                <div
                  key={index}
                  className="flex items-start gap-4 p-4 border rounded-lg"
                >
                  <GripVertical className="h-5 w-5 text-muted-foreground mt-2" />
                  <div className="flex-1 space-y-3">
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <label className="text-xs font-medium mb-1 block">Label</label>
                        <Input
                          value={field.label}
                          onChange={(e) =>
                            updateField(index, { label: e.target.value })
                          }
                          placeholder="Field label"
                        />
                      </div>
                      <div className="w-40">
                        <label className="text-xs font-medium mb-1 block">Type</label>
                        <select
                          value={field.type}
                          onChange={(e) =>
                            updateField(index, { type: e.target.value as FieldType })
                          }
                          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                        >
                          {FIELD_TYPES.map((t) => (
                            <option key={t.value} value={t.value}>
                              {t.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id={`required-${index}`}
                        checked={field.required}
                        onChange={(e) =>
                          updateField(index, { required: e.target.checked })
                        }
                        className="rounded border-gray-300"
                      />
                      <label htmlFor={`required-${index}`} className="text-sm">
                        Required field
                      </label>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeField(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create Blueprint'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/blueprints')}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
