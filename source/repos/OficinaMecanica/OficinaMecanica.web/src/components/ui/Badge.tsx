import type { ReactNode } from 'react';
import type { StatusTone } from '../../utils/status';

const toneClasses: Record<StatusTone, string> = {
  neutral: 'bg-ink-700/60 text-ink-200 border-ink-600/50',
  info: 'bg-sky-500/10 text-sky-300 border-sky-500/30',
  success: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
  warning: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
  danger: 'bg-red-500/10 text-red-300 border-red-500/30',
  accent: 'bg-flame-500/10 text-flame-400 border-flame-500/30',
};

export function Badge({ tone = 'neutral', children, className }: { tone?: StatusTone; children: ReactNode; className?: string }) {
  return <span className={['inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold', toneClasses[tone], className ?? ''].join(' ')}>{children}</span>;
}
