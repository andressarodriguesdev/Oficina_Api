import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { api, ApiError, MSG_REDE, MSG_SERVIDOR } from './api';

function jsonResponse(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('api (tratamento de erros HTTP)', () => {
  const assign = vi.fn();

  beforeEach(() => {
    localStorage.clear();
    assign.mockReset();
    vi.stubGlobal('location', { pathname: '/ordens-servico', assign });
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('403 vira ApiError com status 403 e a mensagem da API', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(403, { mensagem: 'sem acesso' })));

    await expect(api.get('/ordens-servico/x')).rejects.toMatchObject({
      name: 'ApiError',
      status: 403,
      message: 'sem acesso',
    });
    expect(assign).not.toHaveBeenCalled();
  });

  it('404 vira ApiError com status 404', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(404, { mensagem: 'nf' })));

    await expect(api.get('/ordens-servico/x')).rejects.toMatchObject({ status: 404 });
  });

  it('401 com sessão ativa limpa o token e redireciona ao login', async () => {
    localStorage.setItem('accessToken', 'jwt-expirado');
    localStorage.setItem('perfil', 'Mecanico');
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(401, {})));

    await expect(api.get('/ordens-servico')).rejects.toBeInstanceOf(ApiError);

    expect(localStorage.getItem('accessToken')).toBeNull();
    expect(localStorage.getItem('perfil')).toBeNull();
    expect(assign).toHaveBeenCalledWith('/login');
  });

  it('401 em /Auth/login (credenciais erradas) não derruba a sessão nem redireciona', async () => {
    localStorage.setItem('accessToken', 'qualquer');
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(401, { mensagem: 'E-mail ou senha inválidos.' })));

    await expect(api.post('/Auth/login', { email: 'a', senha: 'b' })).rejects.toMatchObject({
      status: 401,
      message: 'E-mail ou senha inválidos.',
    });
    expect(assign).not.toHaveBeenCalled();
  });

  it('500 sem corpo JSON usa mensagem amigável', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('<html>', { status: 502 })));

    await expect(api.get('/ordens-servico')).rejects.toMatchObject({ status: 502, message: MSG_SERVIDOR });
  });

  it('falha de rede vira ApiError status 0 com mensagem amigável', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));

    await expect(api.get('/ordens-servico')).rejects.toMatchObject({ status: 0, message: MSG_REDE });
  });
});
