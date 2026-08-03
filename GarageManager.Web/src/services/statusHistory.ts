import { api } from './api';
import type { JobCardStatusChange } from '../types';

export interface StatusHistoryWithRelations extends JobCardStatusChange {
  jobCard?: {
    id: string;
    description: string;
    customerId: string;
    vehicleId: string;
    customer?: { id: string; name: string } | null;
    vehicle?: { id: string; make: string; model: string; registrationNumber: string | null } | null;
  } | null;
}

export async function listStatusHistory(filters?: {
  customerId?: string;
  vehicleId?: string;
  status?: number;
  startDate?: string;
  endDate?: string;
}): Promise<StatusHistoryWithRelations[]> {
  const params = new URLSearchParams();
  if (filters?.customerId) params.set('customerId', filters.customerId);
  if (filters?.vehicleId) params.set('vehicleId', filters.vehicleId);
  if (filters?.status !== undefined) params.set('status', String(filters.status));
  if (filters?.startDate) params.set('startDate', filters.startDate);
  if (filters?.endDate) params.set('endDate', filters.endDate);

  const query = params.toString();
  return api.get<StatusHistoryWithRelations[]>(`/status-history${query ? `?${query}` : ''}`);
}
