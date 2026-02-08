import { api } from '@/lib/api';
import { Blueprint, ApiResponse } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Plus, Palette } from 'lucide-react';

async function getBlueprints(): Promise<Blueprint[]> {
  const response = await api.get<ApiResponse<Blueprint[]>>('/blueprints');
  return response.data;
}

export default async function BlueprintsPage() {
  const blueprints = await getBlueprints();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Blueprints</h2>
          <p className="text-muted-foreground">
            Manage contract templates and field layouts
          </p>
        </div>
        <Link href="/blueprints/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Blueprint
          </Button>
        </Link>
      </div>

      {blueprints.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Palette className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">No blueprints yet</p>
            <p className="text-muted-foreground mb-4">
              Create your first blueprint to get started
            </p>
            <Link href="/blueprints/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Blueprint
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {blueprints.map((blueprint) => (
            <Link key={blueprint.id} href={`/blueprints/${blueprint.id}`}>
              <Card className="h-full hover:bg-accent transition-colors cursor-pointer">
                <CardHeader>
                  <CardTitle className="text-lg">{blueprint.name}</CardTitle>
                  <CardDescription>
                    {blueprint.description || 'No description'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>{blueprint.fields.length} fields</span>
                    <span>{blueprint._count?.contracts || 0} contracts</span>
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
