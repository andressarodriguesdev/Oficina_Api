
import { api } from './api';
import type { Cliente, HistoricoOrdemServico, OrdemServico, OrdemServicoItem, Veiculo } from '../types';

export type OrdemWithRelations = OrdemServico & {
  cliente: Cliente | null;
  veiculo: Veiculo | null;
  mecanico: {
    id: string;
    nome: string;
    telefone?: string;
    especialidade?: string;
  } | null;
};

export async function listOrdens(): Promise<OrdemWithRelations[]> {
  return api.get<OrdemWithRelations[]>('/ordens-servico');
}

export async function getOrdem(id: string): Promise<OrdemWithRelations | null> {
  return api.get<OrdemWithRelations>(`/ordens-servico/${id}`);
}

export async function getOrdemItens(ordemId: string): Promise<OrdemServicoItem[]> {
  return api.get<OrdemServicoItem[]>(`/ordens-servico/${ordemId}/itens`);
}

export async function getOrdemHistorico(ordemId: string): Promise<HistoricoOrdemServico[]> {
  return api.get<HistoricoOrdemServico[]>(`/ordens-servico/${ordemId}/historico`);
}

export interface OrdemItemInput {
  descricao: string;
  quantidade: number;
  valorUnitario: number;
  valorTotal: number;
}

export interface CreateOrdemInput {
  clienteId: string;
  veiculoId: string;
  descricao: string;
  valorMaoObra: number;
  valorTotal: number;
  mecanicoId:string;
  observacao?: string | null;
  itens?: OrdemItemInput[];
}

export async function createOrdem(input: CreateOrdemInput): Promise<OrdemServico> {
  return api.post<OrdemServico>('/ordens-servico', input);
}

export async function updateOrdem(
  id: string,
  input: Partial<CreateOrdemInput>,
): Promise<void> {
  await api.put(`/ordens-servico/${id}`, input);
}

export async function deleteOrdem(id: string): Promise<void> {
  await api.delete(`/ordens-servico/${id}`);
}

// Transições de status — o backend deve implementar estas rotas
export async function enviarAprovacao(id: string): Promise<OrdemServico> {
  return api.post<OrdemServico>(`/ordens-servico/${id}/enviar-aprovacao`);
}

export async function aprovar(id: string): Promise<OrdemServico> {
  return api.post<OrdemServico>(`/ordens-servico/${id}/aprovar`);
}

export async function recusar(id: string): Promise<OrdemServico> {
  return api.post<OrdemServico>(`/ordens-servico/${id}/recusar`);
}

export async function concluir(id: string): Promise<OrdemServico> {
  return api.post<OrdemServico>(`/ordens-servico/${id}/concluir`);
}


export async function reabrir(
  id: string,
  input: { motivo: string }
): Promise<void> {
  return api.post(`/ordens-servico/${id}/reabrir`, input);
}
export interface CancelarOrdemInput {
  motivo: string;
}

export async function cancelar(
  id: string,
  input: CancelarOrdemInput,
): Promise<OrdemServico> {
  return api.post<OrdemServico>(`/ordens-servico/${id}/cancelar`, input);
}

export async function baixarPdf(id: string): Promise<Blob> {
  return api.get<Blob>(
    `/ordens-servico/${id}/pdf`,
    'blob'
  );
}

export async function gerarWhatsApp(id: string): Promise<string> {
  const response = await api.get<{ link: string }>(
    `/ordens-servico/${id}/whatsapp`
  );

  return response.link;
}

export interface OrdemServicoItemInput {
  descricao: string;
  quantidade: number;
  valorUnitario: number;
}

export async function adicionarItem(
  ordemId: string,
  input: OrdemServicoItemInput,
): Promise<void> {
  await api.post(`/ordens-servico/${ordemId}/itens`, input);
}

export async function atualizarItem(
  ordemId: string,
  itemId: string,
  input: OrdemServicoItemInput,
): Promise<void> {
  await api.put(`/ordens-servico/${ordemId}/itens/${itemId}`, input);
}

export async function removerItem(
  ordemId: string,
  itemId: string,
): Promise<void> {
  await api.delete(`/ordens-servico/${ordemId}/itens/${itemId}`);
}