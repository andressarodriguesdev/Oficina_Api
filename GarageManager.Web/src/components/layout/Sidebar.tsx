import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Car, ClipboardList, DollarSignIcon, Settings, Wrench, X, WrenchIcon, LogOut } from 'lucide-react';
import { useAuth } from '../../auth/AuthProvider';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/customers', label: 'Customers', icon: Users },
  { to: '/vehicles', label: 'Vehicles', icon: Car },
  { to: '/job-cards', label: 'Job Cards', icon: ClipboardList },
  { to: '/mechanics', label: 'Mechanics', icon: WrenchIcon },
  { to: '/finance', label: 'Finance', icon: DollarSignIcon, proprietorOnly: true },
  { to: '/settings', label: 'Settings', icon: Settings },

];

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) return '?';

  return (parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase();
}

export function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { user, isProprietor, signOut } = useAuth();
  const visibleNavItems = navItems.filter((item) => isProprietor || !item.proprietorOnly);

  return (
    <>
      {open && <div className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden" onClick={onClose} />}
      <aside className={[
        'fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-ink-700/60 bg-ink-900/95 backdrop-blur transition-transform duration-300 lg:static lg:translate-x-0',
        open ? 'translate-x-0' : '-translate-x-full',
      ].join(' ')}>
        <div className="flex items-center justify-between gap-2 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-flame-500 to-flame-600 shadow-glow">
              <Wrench className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="font-display text-lg font-extrabold leading-tight text-white">GarageManager</p>
              <p className="text-xs font-medium text-ink-400">Admin Panel</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-ink-400 transition hover:bg-ink-800 hover:text-white lg:hidden">
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {visibleNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink key={item.to} to={item.to} end={item.end} onClick={onClose} className={({ isActive }) => [
                'group flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-all duration-150',
                isActive ? 'bg-flame-500/10 text-flame-400 shadow-[inset_0_0_0_1px_rgba(249,115,22,0.25)]' : 'text-ink-300 hover:bg-ink-800 hover:text-white',
              ].join(' ')}>
                <Icon className="h-5 w-5 shrink-0" />
                {item.label}
              </NavLink>
            );
          })}
        </nav>
        <div className="border-t border-ink-700/60 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ink-700 text-sm font-bold text-ink-200">
              {initialsOf(user?.displayName ?? '')}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-white">{user?.displayName}</p>
              <p className="truncate text-xs text-ink-400">{user?.role}</p>
            </div>
            <button
              onClick={signOut}
              title="Sign out"
              aria-label="Sign out"
              className="rounded-lg p-1.5 text-ink-400 transition hover:bg-ink-800 hover:text-white"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
