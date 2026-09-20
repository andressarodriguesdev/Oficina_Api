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

export interface MensagemResponse {
  mensagem: string;
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

// Recuperação de senha: envia o código para o e-mail informado.
// A API responde sempre com a mesma mensagem, exista a conta ou não.
export async function solicitarRecuperacaoSenha(
  email: string,
): Promise<MensagemResponse> {
  return api.post<MensagemResponse>("/Auth/forgot-password", {
    email,
  });
}

// Recuperação de senha: confere o código e grava a nova senha.
export async function redefinirSenha(
  email: string,
  code: string,
  novaSenha: string,
): Promise<MensagemResponse> {
  return api.post<MensagemResponse>("/Auth/reset-password", {
    email,
    code,
    novaSenha,
  });
}