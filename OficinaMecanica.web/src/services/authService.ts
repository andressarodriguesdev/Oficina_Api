import { api } from './api';

export interface LoginRequest {
  email: string;
  senha: string;
}

export interface LoginResponse {
  mensagem: string;
  token: string;
  usuarioId: number;
  nome: string;
  email: string;
}

export async function login(
  email: string,
  senha: string,
): Promise<LoginResponse> {
  return api.post<LoginResponse>('/Auth/login', {
    email,
    senha,
  });
}