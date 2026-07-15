import type { OSStatus } from '../../types';

const statusConfig: Record<OSStatus, { label: string; classes: string; dot: string }> = {
  aberta: {
    label: 'Aberta',
    classes: 'bg-steel-500/10 text-steel-300 border-steel-500/20',
    dot: 'bg-steel-400',
  },
  aguardando_aprovacao: {
    label: 'Aguardando Aprovação',
    classes: 'bg-accent-500/10 text-accent-300 border-accent-500/20',
    dot: 'bg-accent-400',
  },
  aprovada: {
    label: 'Aprovada',
    classes: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
    dot: 'bg-emerald-400',
  },
  concluida: {
    label: 'Concluída',
    classes: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
    dot: 'bg-emerald-500',
  },
  cancelada: {
    label: 'Cancelada',
    classes: 'bg-red-500/10 text-red-300 border-red-500/20',
    dot: 'bg-red-400',
  },
};

export function StatusBadge({ status }: { status: OSStatus }) {
  const cfg = statusConfig[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${cfg.classes}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}
