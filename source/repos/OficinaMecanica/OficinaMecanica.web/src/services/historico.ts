import { api } from './api';
import type { HistoricoOrdemServico } from '../types';

export interface HistoricoWithRelations extends HistoricoOrdemServico {
  ordem?: {
    id: string;
    descricao: string;
    clienteId: string;
    veiculoId: string;
    cliente?: { id: string; nome: string } | null;
    veiculo?: { id: string; marca: string; modelo: string; placa: string | null } | null;
  } | null;
}

export async function listHistorico(filters?: {
  clienteId?: string;
  veiculoId?: string;
  status?: number;
  dataInicio?: string;
  dataFim?: string;
}): Promise<HistoricoWithRelations[]> {
  const params = new URLSearchParams();
  if (filters?.clienteId) params.set('clienteId', filters.clienteId);
  if (filters?.veiculoId) params.set('veiculoId', filters.veiculoId);
  if (filters?.status !== undefined) params.set('status', String(filters.status));
  if (filters?.dataInicio) params.set('dataInicio', filters.dataInicio);
  if (filters?.dataFim) params.set('dataFim', filters.dataFim);

  const query = params.toString();
  return api.get<HistoricoWithRelations[]>(`/historico${query ? `?${query}` : ''}`);
}
