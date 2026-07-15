import {
  LayoutDashboard,
  Users,
  Car,
  ClipboardList,
  History,
  Settings,
  Wrench,
  Plus,
  LogOut,
} from 'lucide-react';
import type { Page } from '../hooks/useNavigation';
import type { ReactNode } from 'react';

interface SidebarProps {
  current: Page;
  onNavigate: (page: Page) => void;
  onLogout: () => void;
}

interface NavItem {
  page: Page;
  label: string;
  icon: ReactNode;
}

const navItems: NavItem[] = [
  { page: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
  { page: 'clientes', label: 'Clientes', icon: <Users size={20} /> },
  { page: 'veiculos', label: 'Veículos', icon: <Car size={20} /> },
  { page: 'os-nova', label: 'Ordens de Serviço', icon: <ClipboardList size={20} /> },
  { page: 'historico', label: 'Histórico', icon: <History size={20} /> },
];

export function Sidebar({ current, onNavigate, onLogout }: SidebarProps) {
  return (
    <aside className="w-64 bg-graphite-900 border-r border-graphite-800 flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-graphite-800">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-accent-500/10 border border-accent-500/20">
            <Wrench size={24} className="text-accent-500" />
          </div>
          <div>
            <h1 className="font-bold text-graphite-100 leading-tight">OficinaMecanica</h1>
            <p className="text-xs text-graphite-400">Sistema de Gestão</p>
          </div>
        </div>
      </div>

      {/* Quick action */}
      <div className="px-4 py-4">
        <button
          onClick={() => onNavigate('os-nova')}
          className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-accent-500 hover:bg-accent-600 text-white font-medium text-sm transition-all shadow-sm hover:shadow-glow"
        >
          <Plus size={18} />
          Nova OS
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = current === item.page || (item.page === 'os-nova' && current === 'os-detalhes');
          return (
            <button
              key={item.page}
              onClick={() => onNavigate(item.page)}
              className={`nav-link w-full ${isActive ? 'nav-link-active' : ''}`}
            >
              {item.icon}
              <span className="text-sm font-medium">{item.label}</span>
            </button>
          );
        })}
        <div className="pt-3 mt-3 border-t border-graphite-800">
          <button
            onClick={() => onNavigate('configuracoes')}
            className={`nav-link w-full ${current === 'configuracoes' ? 'nav-link-active' : ''}`}
          >
            <Settings size={20} />
            <span className="text-sm font-medium">Configurações</span>
          </button>
        </div>
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-graphite-800">
        <button onClick={onLogout} className="nav-link w-full text-graphite-400 hover:text-red-400">
          <LogOut size={20} />
          <span className="text-sm font-medium">Sair</span>
        </button>
      </div>
    </aside>
  );
}
