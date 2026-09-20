import { api } from './api';

export interface CriarOficinaRequest {
  nome: string;
  razaoSocial: string;
  cnpj: string;
  inscricaoEstadual: string;
  telefone: string;
  email: string;

  cep: string;
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  uf: string;

  endereco: string;
  logotipo?: string;
}

export interface AtualizarOficinaRequest {
  nome: string;
  razaoSocial: string;
  cnpj: string;
  inscricaoEstadual: string;
  telefone: string;
  email: string;

  cep: string;
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  uf: string;

  endereco: string;
  logotipo?: string;
}

export interface OficinaResponse {
  id: string;
  usuarioId: number;

  nome: string;
  razaoSocial: string;
  cnpj: string;
  inscricaoEstadual: string;
  telefone: string;
  email: string;

  cep: string;
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  uf: string;

  endereco: string;
  logotipo?: string | null;
}

export async function criarOficina(
  dados: CriarOficinaRequest,
): Promise<OficinaResponse> {
  return await api.post<OficinaResponse>(
    '/oficinas',
    dados,
  );
}

export async function obterMinhaOficina(): Promise<OficinaResponse> {
  return await api.get<OficinaResponse>(
    '/oficinas/minha-oficina',
  );
}

export async function atualizarOficina(
  id: string,
  dados: AtualizarOficinaRequest,
): Promise<OficinaResponse> {
  return await api.put<OficinaResponse>(
    `/oficinas/${id}`,
    dados,
  );
}