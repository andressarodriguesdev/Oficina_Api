/**
 * HTTP client simples para integração com API .NET.
 *
 * Configure a URL base no arquivo .env:
 *   VITE_API_URL=https://localhost:5001/api
 *
 * Todas as rotas seguem o padrão REST:
 *   GET    /clientes            GET    /clientes/{id}
 *   POST   /clientes             PUT    /clientes/{id}
 *   DELETE /clientes/{id}
 *
 *   GET    /veiculos             GET    /veiculos/{id}
 *   POST   /veiculos             PUT    /veiculos/{id}
 *   DELETE /veiculos/{id}
 *
 *   GET    /ordens-servico       GET    /ordens-servico/{id}
 *   POST   /ordens-servico       PUT    /ordens-servico/{id}
 *   DELETE /ordens-servico/{id}
 *   POST   /ordens-servico/{id}/enviar-aprovacao
 *   POST   /ordens-servico/{id}/aprovar
 *   POST   /ordens-servico/{id}/recusar
 *   POST   /ordens-servico/{id}/concluir
 *   POST   /ordens-servico/{id}/cancelar
 *   POST   /ordens-servico/{id}/reabrir
 *
 *   GET    /historico
 */

const BASE_URL = (import.meta.env.VITE_API_URL as string) || '/api';

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  responseType: 'json' | 'blob' = 'json',
): Promise<T> {
  const url = `${BASE_URL}${path}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) ?? {}),
  };

  // Quando tiver autenticação JWT no futuro, basta descomentar:
  // const token = localStorage.getItem('token');
  // if (token) headers['Authorization'] = `Bearer ${token}`;

  const response = await fetch(url, { ...options, headers });

  if (!response.ok) {
    let message = `Erro ${response.status}`;
    try {
      const body = await response.json();
      message = body.message ?? body.title ?? body.error ?? message;
    } catch {
      // resposta não-JSON
    }
    throw new ApiError(message, response.status);
  }

 if (response.status === 204) {
  return undefined as T;
}

if (responseType === 'blob') {
  return response.blob() as Promise<T>;
}

return response.json() as Promise<T>;

}
  export const api = {
  get: <T>(path: string,responseType: 'json' | 'blob' = 'json') =>
    request<T>( path,{ method: 'GET' },responseType),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'POST', body: body ? JSON.stringify(body) : undefined }),
  put: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'PUT', body: body ? JSON.stringify(body) : undefined }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
};
