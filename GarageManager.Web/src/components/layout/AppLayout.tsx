import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

const titles: Record<string, { title: string; subtitle: string }> = {
  '/dashboard': { title: 'Dashboard', subtitle: 'Workshop overview' },
  '/customers': { title: 'Customers', subtitle: 'Manage the workshop customers' },
  '/vehicles': { title: 'Vehicles', subtitle: 'Manage registered vehicles' },
  '/job-cards': { title: 'Job Cards', subtitle: 'Full control over job cards' },
  '/mechanics': { title: 'Mechanics', subtitle: 'Manage the workshop mechanics' },
  '/finance': { title: 'Finance', subtitle: 'Track your finances' },
  '/settings': { title: 'Settings', subtitle: 'System preferences' },
};

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const matchKey = Object.keys(titles).sort((a, b) => b.length - a.length).find((key) => location.pathname === key || location.pathname.startsWith(key + '/')) ?? '/dashboard';
  const { title, subtitle } = titles[matchKey] ?? titles['/dashboard'];

  return (
    <div className="flex h-screen overflow-hidden bg-ink-950">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar title={title} subtitle={subtitle} onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto px-5 py-6 lg:px-8">
          <div className="mx-auto max-w-7xl"><Outlet /></div>
        </main>
      </div>
    </div>
  );
}
