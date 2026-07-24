import { Menu, Search, Bell } from 'lucide-react';

interface TopbarProps { title: string; subtitle?: string; onMenuClick: () => void; actions?: React.ReactNode; }

export function Topbar({ title, subtitle, onMenuClick, actions }: TopbarProps) {
  return (
    <header className="sticky top-0 z-20 border-b border-ink-700/60 bg-ink-950/80 backdrop-blur">
      <div className="flex items-center justify-between gap-4 px-5 py-4 lg:px-8">
        <div className="flex items-center gap-3">
          <button onClick={onMenuClick} className="rounded-lg p-2 text-ink-300 transition hover:bg-ink-800 hover:text-white lg:hidden">
            <Menu className="h-5 w-5" />
          </button>
          <div>
            <h1 className="font-display text-xl font-bold text-white lg:text-2xl">{title}</h1>
            {subtitle && <p className="hidden text-sm text-ink-400 sm:block">{subtitle}</p>}
          </div>
        </div>
        <div className="flex items-center gap-2 lg:gap-3">
          {actions}
          <div className="relative hidden md:block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
            <input type="text" placeholder="Buscar..." className="h-10 w-56 rounded-xl border border-ink-700 bg-ink-800/70 pl-9 pr-3 text-sm text-ink-100 placeholder-ink-400 transition focus:border-flame-500 focus:outline-none focus:ring-2 focus:ring-flame-500/20" />
          </div>
          <button className="relative rounded-xl border border-ink-700 bg-ink-800/70 p-2.5 text-ink-300 transition hover:bg-ink-700 hover:text-white">
            <Bell className="h-5 w-5" />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-flame-500" />
          </button>
        </div>
      </div>
    </header>
  );
}
