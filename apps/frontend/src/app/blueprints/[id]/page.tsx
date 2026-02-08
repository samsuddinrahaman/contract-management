import { api } from '@/lib/api';
import { Blueprint, ApiResponse } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { ArrowLeft, FileText, Edit, Trash2 } from 'lucide-react';

interface Props {
  params: Promise<{ id: string }>;
}

async function getBlueprint(id: string): Promise<Blueprint> {
  const response = await api.get<ApiResponse<Blueprint>>(`/blueprints/${id}`);
  return response.data;
}

function getFieldTypeColor(type: string): string {
  switch (type) {
    case 'TEXT':
      return 'bg-blue-100 text-blue-800';
    case 'DATE':
      return 'bg-green-100 text-green-800';
    case 'SIGNATURE':
      return 'bg-purple-100 text-purple-800';
    case 'CHECKBOX':
      return 'bg-orange-100 text-orange-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

export default async function BlueprintDetailPage({ params }: Props) {
  const { id } = await params;
  const blueprint = await getBlueprint(id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/blueprints">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">{blueprint.name}</h2>
            <p className="text-muted-foreground">
              Created {new Date(blueprint.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/blueprints/${id}/edit`}>
            <Button variant="outline">
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                {blueprint.description || 'No description provided'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Fields ({blueprint.fields.length})</CardTitle>
              <CardDescription>
                Fields that will be included in contracts created from this blueprint
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {blueprint.fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-muted-foreground font-mono">
                        {index + 1}
                      </span>
                      <div>
                        <p className="font-medium">{field.label}</p>
                        <p className="text-sm text-muted-foreground">
                          Position: ({field.positionX}, {field.positionY})
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getFieldTypeColor(field.type)}>
                        {field.type}
                      </Badge>
                      {field.required && (
                        <Badge variant="destructive">Required</Badge>
                      )}
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
              <CardTitle>Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Total Contracts</span>
                <span className="font-medium">{blueprint._count?.contracts || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Total Fields</span>
                <span className="font-medium">{blueprint.fields.length}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href={`/contracts/new?blueprint=${id}`} className="block">
                <Button className="w-full">
                  <FileText className="mr-2 h-4 w-4" />
                  Create Contract
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
