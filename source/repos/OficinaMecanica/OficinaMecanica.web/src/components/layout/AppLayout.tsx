import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

const titles: Record<string, { title: string; subtitle: string }> = {
  '/': { title: 'Dashboard', subtitle: 'Visão geral da oficina' },
  '/clientes': { title: 'Clientes', subtitle: 'Gerencie os clientes da oficina' },
  '/veiculos': { title: 'Veículos', subtitle: 'Gerencie os veículos cadastrados' },
  '/ordens-servico': { title: 'Ordens de Serviço', subtitle: 'Controle completo das OS' },
  '/financeiro': { title: 'Financeiro', subtitle: 'Acompanhe suas finanças' },
  '/configuracoes': { title: 'Configurações', subtitle: 'Preferências do sistema' },
};

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const matchKey = Object.keys(titles).sort((a, b) => b.length - a.length).find((key) => location.pathname === key || location.pathname.startsWith(key + '/')) ?? '/';
  const { title, subtitle } = titles[matchKey] ?? titles['/'];

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
