const TOKEN_KEY = 'accessToken';
const PERFIL_KEY = 'perfil';
const MECANICO_KEY = 'mecanicoId';
const EMAIL_KEY = 'usuarioEmail';

/**
 * Guarda a sessão após o login. Perfil e mecanicoId são apenas conveniência de
 * interface (pré-seleção e menus): a autorização real é feita pela API.
 */
export function salvarSessao(
  token: string,
  perfil?: string | null,
  mecanicoId?: string | null,
  email?: string | null,
): void {
  localStorage.setItem(TOKEN_KEY, token);

  if (email) localStorage.setItem(EMAIL_KEY, email);
  else localStorage.removeItem(EMAIL_KEY);

  if (perfil) localStorage.setItem(PERFIL_KEY, perfil);
  else localStorage.removeItem(PERFIL_KEY);

  if (mecanicoId) localStorage.setItem(MECANICO_KEY, mecanicoId);
  else localStorage.removeItem(MECANICO_KEY);
}

export function limparSessao(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(PERFIL_KEY);
  localStorage.removeItem(MECANICO_KEY);
  localStorage.removeItem(EMAIL_KEY);
}

/** Sessão inválida/expirada (401): limpa os dados e volta ao login. */
export function encerrarSessao(): void {
  limparSessao();

  if (window.location.pathname !== '/login') {
    window.location.assign('/login');
  }
}

export function ehMecanico(): boolean {
  return localStorage.getItem(PERFIL_KEY) === 'Mecanico';
}

export function getMecanicoIdLogado(): string | null {
  return localStorage.getItem(MECANICO_KEY);
}

/** E-mail de quem está logado (só para exibir no menu; a API não depende dele). */
export function getEmailLogado(): string | null {
  return localStorage.getItem(EMAIL_KEY);
}