import { api } from "./api";

export interface LoginRequest {
  email: string;
  senha: string;
}

export interface LoginResponse {
  mensagem: string;
  token?: string;
  usuarioId?: number;
  nome?: string;
  email?: string;

  requiresTwoFactor?: boolean;
  twoFactorToken?: string;
}

export interface VerifyTwoFactorResponse {
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
  return api.post<LoginResponse>("/Auth/login", {
    email,
    senha,
  });
}

export async function verificarTwoFactor(
  twoFactorToken: string,
  code: string,
): Promise<VerifyTwoFactorResponse> {
  return api.post<VerifyTwoFactorResponse>("/Auth/2fa/verify", {
    twoFactorToken,
    code,
  });
}