/**
 * Simple HTTP client for the .NET API.
 *
 * Configure the base URL in the .env file:
 *   VITE_API_URL=https://localhost:5001/api
 *
 * All routes follow the REST pattern:
 *   GET    /customers            GET    /customers/{id}
 *   POST   /customers            PUT    /customers/{id}
 *   PATCH  /customers/{id}/deactivate
 *
 *   GET    /Vehicle              GET    /Vehicle/{id}
 *   POST   /Vehicle              PUT    /Vehicle/{id}
 *   PATCH  /Vehicle/{id}/deactivate
 *
 *   GET    /job-cards            GET    /job-cards/{id}
 *   POST   /job-cards            PUT    /job-cards/{id}
 *   POST   /job-cards/{id}/send-for-approval
 *   POST   /job-cards/{id}/approve
 *   POST   /job-cards/{id}/decline
 *   POST   /job-cards/{id}/complete
 *   POST   /job-cards/{id}/cancel
 *   POST   /job-cards/{id}/reopen
 *
 * Records are never deleted — deactivating keeps the repair history intact.
 */

const BASE_URL = (import.meta.env.VITE_API_URL as string) || '/api';

const TOKEN_KEY = 'garagemanager.accessToken';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

/**
 * Called when the API rejects the stored token, so the app can send the user back to
 * the sign-in page from anywhere. Set by the auth provider.
 */
let onUnauthenticated: (() => void) | null = null;

export function setUnauthenticatedHandler(handler: (() => void) | null): void {
  onUnauthenticated = handler;
}

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

  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const response = await fetch(url, { ...options, headers });

  if (!response.ok) {
    // 401 means the token is missing or no longer good. 403 means it is fine but this
    // role may not do this — that is a message, not a sign-out.
    if (response.status === 401) {
      clearToken();
      onUnauthenticated?.();
    }

    let message = `Error ${response.status}`;
    try {
      const body = await response.json();
      message = body.message ?? body.title ?? body.error ?? message;
    } catch {
      // non-JSON response
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
    request<T>(path, { method: 'GET' }, responseType),

  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'POST', body: body ? JSON.stringify(body) : undefined }),

  put: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'PUT', body: body ? JSON.stringify(body) : undefined }),

  patch: <T>(path: string, body?: unknown) =>
    request<T>(
      path,
      { method: 'PATCH', body: body ? JSON.stringify(body) : undefined }
    ),

  delete: <T>(path: string) =>
    request<T>(path, { method: 'DELETE' }),
};
