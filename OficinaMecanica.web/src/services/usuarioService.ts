import { api } from "./api";
import type { UsuarioCadastro } from "../types";

export interface CadastroResponse {
  requiresEmailVerification: boolean;
  verificationToken: string;
  mensagem: string;
}

export async function cadastrarUsuario(
  dados: UsuarioCadastro,
): Promise<CadastroResponse> {
  return api.post<CadastroResponse>("/Auth/register", dados);
}

export interface VerificarEmailResponse {
  mensagem: string;
}

export async function verificarEmail(
  verificationToken: string,
  code: string,
): Promise<VerificarEmailResponse> {
  return api.post<VerificarEmailResponse>(
    "/Auth/register/verify",
    {
      twoFactorToken: verificationToken,
      code,
    },
  );
}