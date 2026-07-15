import { useState, useRef, useEffect } from 'react';
import { Bell, ChevronDown, User, Settings, LogOut } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { mockNotifications } from '../../services/mockData';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  const { user, logout } = useAuth();
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const unreadCount = mockNotifications.filter((n) => !n.read).length;

  return (
    <header className="sticky top-0 z-30 bg-graphite-950/80 backdrop-blur-md border-b border-graphite-800 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-graphite-100">{title}</h2>
          {subtitle && <p className="text-sm text-graphite-400 mt-0.5">{subtitle}</p>}
        </div>

        <div className="flex items-center gap-3">
          {/* Notifications */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setNotifOpen((v) => !v)}
              className="relative p-2.5 rounded-lg hover:bg-graphite-800 text-graphite-300 hover:text-graphite-100 transition-colors"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-accent-500 ring-2 ring-graphite-950" />
              )}
            </button>

            {notifOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-graphite-850 rounded-xl border border-graphite-700 shadow-card-hover animate-slide-up overflow-hidden">
                <div className="px-4 py-3 border-b border-graphite-700 flex items-center justify-between">
                  <span className="font-semibold text-graphite-100">Notificações</span>
                  {unreadCount > 0 && (
                    <span className="text-xs bg-accent-500/10 text-accent-400 px-2 py-0.5 rounded-full">
                      {unreadCount} novas
                    </span>
                  )}
                </div>
                <div className="max-h-72 overflow-y-auto">
                  {mockNotifications.map((n) => (
                    <div
                      key={n.id}
                      className={`px-4 py-3 border-b border-graphite-800 hover:bg-graphite-800/50 transition-colors ${
                        !n.read ? 'bg-graphite-800/30' : ''
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <span
                          className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${
                            n.type === 'warning' ? 'bg-accent-400' : n.type === 'success' ? 'bg-emerald-400' : 'bg-steel-400'
                          }`}
                        />
                        <div>
                          <p className="text-sm font-medium text-graphite-100">{n.title}</p>
                          <p className="text-xs text-graphite-400 mt-0.5">{n.message}</p>
                          <p className="text-xs text-graphite-500 mt-1">{n.time}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Profile */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setProfileOpen((v) => !v)}
              className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-lg hover:bg-graphite-800 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-500 to-accent-700 flex items-center justify-center text-white font-semibold text-sm">
                {user?.name.split(' ').map((n) => n[0]).slice(0, 2).join('') ?? 'U'}
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-sm font-medium text-graphite-100 leading-tight">{user?.name}</p>
                <p className="text-xs text-graphite-400 capitalize">{user?.role}</p>
              </div>
              <ChevronDown size={16} className="text-graphite-400" />
            </button>

            {profileOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-graphite-850 rounded-xl border border-graphite-700 shadow-card-hover animate-slide-up overflow-hidden">
                <div className="px-4 py-3 border-b border-graphite-700">
                  <p className="text-sm font-medium text-graphite-100">{user?.name}</p>
                  <p className="text-xs text-graphite-400">{user?.email}</p>
                </div>
                <div className="py-1">
                  <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-graphite-300 hover:bg-graphite-800 hover:text-graphite-100 transition-colors">
                    <User size={16} /> Meu Perfil
                  </button>
                  <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-graphite-300 hover:bg-graphite-800 hover:text-graphite-100 transition-colors">
                    <Settings size={16} /> Configurações
                  </button>
                  <button
                    onClick={logout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    <LogOut size={16} /> Sair
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
