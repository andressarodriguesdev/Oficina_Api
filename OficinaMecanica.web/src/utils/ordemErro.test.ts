import { describe, expect, it } from 'vitest';

import { ApiError, MSG_ACESSO_OS, MSG_REDE } from '../services/api';
import { descreverErroOrdem } from './ordemErro';

describe('descreverErroOrdem', () => {
  it('403 -> mensagem de acesso a OS de terceiros, sem retry', () => {
    const info = descreverErroOrdem(new ApiError('qualquer coisa do servidor', 403));

    expect(info.tipo).toBe('acesso');
    expect(info.descricao).toBe(MSG_ACESSO_OS);
    expect(info.descricao).toBe('Você só pode acessar ordens de serviço atribuídas a você.');
    expect(info.podeTentarNovamente).toBe(false);
  });

  it('404 -> OS não encontrada/indisponível, sem retry', () => {
    const info = descreverErroOrdem(new ApiError('Ordem de serviço não encontrada.', 404));

    expect(info.tipo).toBe('nao-encontrada');
    expect(info.podeTentarNovamente).toBe(false);
  });

  it('401 -> sessão expirada', () => {
    expect(descreverErroOrdem(new ApiError('x', 401)).tipo).toBe('sessao');
  });

  it('erro de rede (status 0) -> mensagem amigável com retry', () => {
    const info = descreverErroOrdem(new ApiError(MSG_REDE, 0));

    expect(info.tipo).toBe('rede');
    expect(info.podeTentarNovamente).toBe(true);
  });

  it('500 e erros desconhecidos -> mensagem amigável com retry', () => {
    expect(descreverErroOrdem(new ApiError('boom', 500))).toMatchObject({
      tipo: 'servidor',
      podeTentarNovamente: true,
    });
    expect(descreverErroOrdem(new Error('inesperado'))).toMatchObject({
      tipo: 'servidor',
      podeTentarNovamente: true,
    });
  });
});
