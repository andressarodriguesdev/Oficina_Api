import { ApiError, MSG_ACESSO_OS, MSG_REDE, MSG_SERVIDOR } from '../services/api';

export interface OrdemErroInfo {
  tipo: 'acesso' | 'nao-encontrada' | 'sessao' | 'rede' | 'servidor';
  titulo: string;
  descricao: string;
  podeTentarNovamente: boolean;
}

/** Traduz um erro da API em mensagem amigável para as telas de OS. */
export function descreverErroOrdem(error: unknown): OrdemErroInfo {
  const status = error instanceof ApiError ? error.status : -1;

  if (status === 403) {
    return {
      tipo: 'acesso',
      titulo: 'Acesso não permitido',
      descricao: MSG_ACESSO_OS,
      podeTentarNovamente: false,
    };
  }

  if (status === 404) {
    return {
      tipo: 'nao-encontrada',
      titulo: 'Ordem de serviço não encontrada',
      descricao:
        'A ordem de serviço não foi encontrada ou não está disponível para você.',
      podeTentarNovamente: false,
    };
  }

  if (status === 401) {
    return {
      tipo: 'sessao',
      titulo: 'Sessão expirada',
      descricao: 'Sua sessão expirou. Faça login novamente.',
      podeTentarNovamente: false,
    };
  }

  if (status === 0) {
    return {
      tipo: 'rede',
      titulo: 'Sem conexão com o servidor',
      descricao: MSG_REDE,
      podeTentarNovamente: true,
    };
  }

  return {
    tipo: 'servidor',
    titulo: 'Não foi possível carregar',
    descricao: MSG_SERVIDOR,
    podeTentarNovamente: true,
  };
}
