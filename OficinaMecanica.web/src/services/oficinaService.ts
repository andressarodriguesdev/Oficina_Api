import { api } from './api';

export interface CriarOficinaRequest {
  nome: string;
  telefone: string;
  endereco: string;
  logotipo?: string;
}

export interface OficinaResponse {
  id: string;
  usuarioId: number;
  nome: string;
  telefone: string;
  endereco: string;
  logotipo?: string | null;
}

export async function criarOficina(
  dados: CriarOficinaRequest
): Promise<OficinaResponse> {
  return await api.post<OficinaResponse>('/oficinas', dados);
}

export async function obterMinhaOficina(): Promise<OficinaResponse> {
  return await api.get<OficinaResponse>('/oficinas/minha-oficina');
}