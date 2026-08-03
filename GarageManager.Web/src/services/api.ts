/**
 * Simple HTTP client for the .NET API.
 *
 * Configure the base URL in the .env file:
 *   VITE_API_URL=https://localhost:5001/api
 *
 * All routes follow the REST pattern:
 *   GET    /customers            GET    /customers/{id}
 *   POST   /customers            PUT    /customers/{id}
 *   DELETE /customers/{id}
 *
 *   GET    /Vehicle              GET    /Vehicle/{id}
 *   POST   /Vehicle              PUT    /Vehicle/{id}
 *   DELETE /Vehicle/{id}
 *
 *   GET    /job-cards            GET    /job-cards/{id}
 *   POST   /job-cards            PUT    /job-cards/{id}
 *   DELETE /job-cards/{id}
 *   POST   /job-cards/{id}/send-for-approval
 *   POST   /job-cards/{id}/approve
 *   POST   /job-cards/{id}/decline
 *   POST   /job-cards/{id}/complete
 *   POST   /job-cards/{id}/cancel
 *   POST   /job-cards/{id}/reopen
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

  // When JWT auth is added in the future, just uncomment:
  // const token = localStorage.getItem('token');
  // if (token) headers['Authorization'] = `Bearer ${token}`;

  const response = await fetch(url, { ...options, headers });

  if (!response.ok) {
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
