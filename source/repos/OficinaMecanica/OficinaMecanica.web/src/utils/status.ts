import type { OSStatus } from '../types';

export const STATUS_NUMBER_TO_TEXT: Record<number, OSStatus> = {
  0: 'Aberta', 1: 'AguardandoAprovacao', 2: 'Aprovada', 3: 'Recusada',
  4: 'Concluida', 5: 'Cancelada', 6: 'Reaberta',
};

export const STATUS_TEXT_TO_NUMBER: Record<OSStatus, number> = {
  Aberta: 0, AguardandoAprovacao: 1, Aprovada: 2, Recusada: 3,
  Concluida: 4, Cancelada: 5, Reaberta: 6,
};

export const STATUS_LABEL: Record<OSStatus, string> = {
  Aberta: 'Aberta', AguardandoAprovacao: 'Aguardando Aprovação', Aprovada: 'Aprovada',
  Recusada: 'Recusada', Concluida: 'Concluída', Cancelada: 'Cancelada', Reaberta: 'Reaberta',
};

export type StatusTone = 'neutral' | 'info' | 'success' | 'warning' | 'danger' | 'accent';

export const STATUS_TONE: Record<OSStatus, StatusTone> = {
  Aberta: 'neutral', AguardandoAprovacao: 'warning', Aprovada: 'success',
  Recusada: 'danger', Concluida: 'info', Cancelada: 'neutral', Reaberta: 'accent',
};

export function statusFromNumber(n: number): OSStatus {
  return STATUS_NUMBER_TO_TEXT[n] ?? 'Aberta';
}
export function statusLabel(n: number | OSStatus): string {
  return typeof n === 'number' ? STATUS_LABEL[statusFromNumber(n)] : STATUS_LABEL[n];
}
export function statusTone(n: number | OSStatus): StatusTone {
  return typeof n === 'number' ? STATUS_TONE[statusFromNumber(n)] : STATUS_TONE[n];
}

export const ALL_STATUSES: OSStatus[] = [
  'Aberta', 'AguardandoAprovacao', 'Aprovada', 'Recusada', 'Concluida', 'Cancelada', 'Reaberta',
];
