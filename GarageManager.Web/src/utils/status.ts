import type { JobCardStatus } from '../types';

export const STATUS_NUMBER_TO_TEXT: Record<number, JobCardStatus> = {
  0: 'Open', 1: 'AwaitingApproval', 2: 'Approved', 3: 'Declined',
  4: 'Completed', 5: 'Cancelled', 6: 'Reopened',
};

export const STATUS_TEXT_TO_NUMBER: Record<JobCardStatus, number> = {
  Open: 0, AwaitingApproval: 1, Approved: 2, Declined: 3,
  Completed: 4, Cancelled: 5, Reopened: 6,
};

export const STATUS_LABEL: Record<JobCardStatus, string> = {
  Open: 'Open', AwaitingApproval: 'Awaiting Approval', Approved: 'Approved',
  Declined: 'Declined', Completed: 'Completed', Cancelled: 'Cancelled', Reopened: 'Reopened',
};

export type StatusTone = 'neutral' | 'info' | 'success' | 'warning' | 'danger' | 'accent';

export const STATUS_TONE: Record<JobCardStatus, StatusTone> = {
  Open: 'neutral', AwaitingApproval: 'warning', Approved: 'success',
  Declined: 'danger', Completed: 'info', Cancelled: 'neutral', Reopened: 'accent',
};

export function statusFromNumber(n: number): JobCardStatus {
  return STATUS_NUMBER_TO_TEXT[n] ?? 'Open';
}
export function statusLabel(n: number | JobCardStatus): string {
  return typeof n === 'number' ? STATUS_LABEL[statusFromNumber(n)] : STATUS_LABEL[n];
}
export function statusTone(n: number | JobCardStatus): StatusTone {
  return typeof n === 'number' ? STATUS_TONE[statusFromNumber(n)] : STATUS_TONE[n];
}

export const ALL_STATUSES: JobCardStatus[] = [
  'Open', 'AwaitingApproval', 'Approved', 'Declined', 'Completed', 'Cancelled', 'Reopened',
];
