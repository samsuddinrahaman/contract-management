import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/layout/Providers';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Contract Management Platform',
  description: 'Full-stack contract management system',
};

// verifying layout structure
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased min-h-screen bg-background text-foreground overflow-x-hidden`}>
        <Providers>
          <div className="relative flex min-h-screen flex-col">
            <div className="flex-1 flex">
              <Sidebar />
              <div className="flex-1 flex flex-col ml-64 transition-all duration-300">
                <Header />
                <main className="flex-1 p-6 w-full max-w-7xl mx-auto space-y-4">
                  {children}
                </main>
              </div>
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}
