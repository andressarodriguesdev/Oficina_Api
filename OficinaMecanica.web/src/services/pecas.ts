import { api } from "./api";

import type {
  Peca,
  PecaDisponivelOrdemServico,
} from "../types";

export interface CriarPecaInput {
  nome: string;
  codigo?: string;
  valorCusto: number;
  valorVenda: number;
  quantidadeEstoque: number;
  estoqueMinimo: number;
}

export interface AtualizarPecaInput {
  nome: string;
  codigo?: string;
  valorCusto: number;
  valorVenda: number;
  estoqueMinimo: number;
}

export async function listPecas(): Promise<Peca[]> {
  return api.get<Peca[]>("/pecas");
}

export async function listPecasDisponiveisParaOrdemServico(
  ordemId?: string,
): Promise<PecaDisponivelOrdemServico[]> {
  const query = ordemId
    ? `?ordemId=${encodeURIComponent(ordemId)}`
    : "";

  return api.get<PecaDisponivelOrdemServico[]>(
    `/pecas/disponiveis-ordem-servico${query}`,
  );
}

export async function getPeca(
  id: string,
): Promise<Peca | null> {
  return api.get<Peca>(`/pecas/${id}`);
}

export async function createPeca(
  input: CriarPecaInput,
): Promise<Peca> {
  return api.post<Peca>("/pecas", input);
}

export async function updatePeca(
  id: string,
  input: AtualizarPecaInput,
): Promise<Peca> {
  return api.put<Peca>(`/pecas/${id}`, input);
}

export async function ativarPeca(
  id: string,
): Promise<void> {
  await api.patch(`/pecas/${id}/ativar`);
}

export async function inativarPeca(
  id: string,
): Promise<void> {
  await api.patch(`/pecas/${id}/inativar`);
}

export async function ajustarEstoque(
  id: string,
  quantidade: number,
): Promise<Peca> {
  return api.patch<Peca>(
    `/pecas/${id}/estoque/ajustar`,
    quantidade,
  );
}

export async function excluirPeca(
  id: string,
): Promise<void> {
  await api.delete(`/pecas/${id}`);
}

export type TipoMovimentacaoEstoque =
  | "SaldoInicial"
  | "AjusteManual"
  | "SaidaOrdemServico"
  | "EstornoReabertura";

export interface MovimentacaoEstoque {
  id: string;
  tipo: TipoMovimentacaoEstoque;
  quantidade: number;
  quantidadeAnterior: number;
  quantidadePosterior: number;
  ordemServicoId?: string | null;
  motivo?: string | null;
  criadoEm: string;
}

export interface HistoricoEstoqueFiltro {
  de?: string;
  ate?: string;
  tipo?: TipoMovimentacaoEstoque | "";
}

export async function listarHistoricoEstoque(
  id: string,
  filtro: HistoricoEstoqueFiltro = {},
): Promise<MovimentacaoEstoque[]> {
  const params = new URLSearchParams();

  if (filtro.de) params.set("de", filtro.de);
  if (filtro.ate) params.set("ate", filtro.ate);
  if (filtro.tipo) params.set("tipo", filtro.tipo);

  const query = params.toString();

  return api.get<MovimentacaoEstoque[]>(
    `/pecas/${id}/estoque/historico${query ? `?${query}` : ""}`,
  );
}
