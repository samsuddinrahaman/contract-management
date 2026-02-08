'use client';

import { FileText } from 'lucide-react';

export function Header() {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-6">
      <div className="flex flex-1 items-center gap-4">
        <h1 className="text-lg font-semibold">Contract Management Platform</h1>
      </div>
    </header>
  );
}
