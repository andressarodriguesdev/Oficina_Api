import { api } from './api';

export interface FinanceiroOrdem {
  id: string;
  cliente: string;
  veiculo: string;
  maoObra: number;
  pecas: number;
  total: number;
  status: number;
  data: string;
}

export interface FinanceiroResponse {
  totalFaturado: number;
  totalMaoObra: number;
  totalPecas: number;

  quantidadeOrdens: number;
  quantidadeConcluidas: number;
  quantidadePendentes: number;
  quantidadeCanceladas: number;

  totalPrevisto: number;

  ordens: FinanceiroOrdem[];
}


export async function obterFinanceiro(): Promise<FinanceiroResponse> {
  return api.get<FinanceiroResponse>('/financeiro');
}