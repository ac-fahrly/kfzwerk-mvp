import { Outlet } from 'react-router-dom';
import { MobileNav, Sidebar } from './sidebar';
import { Topbar } from './topbar';
import { Toaster } from '@/components/shared/toaster';

export function AppShell() {
  return (
    <div className="flex h-full min-h-screen">
      <Sidebar />
      <MobileNav />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main className="flex-1 overflow-y-auto bg-muted/20 p-4 md:p-6">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
      <Toaster />
    </div>
  );
}
