import { api } from './api';

export interface FinanceJobCard {
  id: string;
  customer: string;
  vehicle: string;
  labour: number;
  parts: number;
  total: number;
  status: number;
  date: string;
}

export interface FinanceResponse {
  totalInvoiced: number;
  totalLabour: number;
  totalParts: number;

  jobCardCount: number;
  completedCount: number;
  pendingCount: number;
  cancelledCount: number;

  totalForecast: number;

  jobCards: FinanceJobCard[];
}

export async function getFinance(): Promise<FinanceResponse> {
  return api.get<FinanceResponse>('/finance');
}
