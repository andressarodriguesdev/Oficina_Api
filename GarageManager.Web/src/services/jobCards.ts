import { api } from './api';
import type { Customer, JobCardStatusChange, JobCard, Part, Vehicle, Mechanic } from '../types';

export type JobCardWithRelations = JobCard & { customer: Customer | null; vehicle: Vehicle | null; mechanic?: Mechanic | null };

export async function listJobCards(): Promise<JobCardWithRelations[]> {
  return api.get<JobCardWithRelations[]>('/job-cards');
}

export async function getJobCard(id: string): Promise<JobCardWithRelations | null> {
  return api.get<JobCardWithRelations>(`/job-cards/${id}`);
}

export async function getJobCardParts(jobCardId: string): Promise<Part[]> {
  return api.get<Part[]>(`/job-cards/${jobCardId}/parts`);
}

export async function getJobCardStatusHistory(jobCardId: string): Promise<JobCardStatusChange[]> {
  return api.get<JobCardStatusChange[]>(`/job-cards/${jobCardId}/status-history`);
}

export interface PartInput {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface CreateJobCardInput {
  customerId: string;
  vehicleId: string;
  description: string;
  labourCharge: number;
  totalAmount: number;
  mechanicId: string;
  parts?: PartInput[];
}

export async function createJobCard(input: CreateJobCardInput): Promise<JobCard> {
  return api.post<JobCard>('/job-cards', input);
}

export async function updateJobCard(
  id: string,
  input: Partial<Omit<CreateJobCardInput, 'parts'>>,
): Promise<JobCard> {
  return api.put<JobCard>(`/job-cards/${id}`, input);
}

export async function deleteJobCard(id: string): Promise<void> {
  await api.delete(`/job-cards/${id}`);
}

// Status transitions — implemented by the backend job card endpoints
export async function sendForApproval(id: string): Promise<JobCard> {
  return api.post<JobCard>(`/job-cards/${id}/send-for-approval`);
}

export async function approve(id: string): Promise<JobCard> {
  return api.post<JobCard>(`/job-cards/${id}/approve`);
}

export async function decline(id: string): Promise<JobCard> {
  return api.post<JobCard>(`/job-cards/${id}/decline`);
}

export async function complete(id: string): Promise<JobCard> {
  return api.post<JobCard>(`/job-cards/${id}/complete`);
}

export async function reopen(id: string): Promise<JobCard> {
  return api.post<JobCard>(`/job-cards/${id}/reopen`);
}

export interface CancelJobCardInput {
  reason: string;
}

export async function cancel(
  id: string,
  input: CancelJobCardInput,
): Promise<JobCard> {
  return api.post<JobCard>(`/job-cards/${id}/cancel`, input);
}

export async function downloadPdf(id: string): Promise<Blob> {
  return api.get<Blob>(
    `/job-cards/${id}/pdf`,
    'blob'
  );
}

export async function generateWhatsApp(id: string): Promise<string> {
  const response = await api.get<{ link: string }>(
    `/job-cards/${id}/whatsapp`
  );

  return response.link;
}
