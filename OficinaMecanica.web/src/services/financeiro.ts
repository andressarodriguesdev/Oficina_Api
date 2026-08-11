import { api } from './api';

export interface FinanceiroOrdem {
   id: string;
  cliente: string;
  veiculo: string;
  mecanico: string;
  maoObra: number;
  pecas: number;
  total: number;
  status: number;
  data: string;
}

export interface ProdutividadeMecanico {
  nome: string;
  quantidadeOrdens: number;
  quantidadeConcluidas: number;
  totalMaoObra: number;
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

  produtividadeMecanicos: ProdutividadeMecanico[];
}


export async function obterFinanceiro(): Promise<FinanceiroResponse> {
  return api.get<FinanceiroResponse>('/financeiro');
}


