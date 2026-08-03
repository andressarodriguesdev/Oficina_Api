import { api, setToken, clearToken } from './api';

/** Mirrors GarageManager.Domain.Constants.Roles. */
export const ROLE_PROPRIETOR = 'Proprietor';
export const ROLE_MECHANIC = 'Mechanic';

export type Role = typeof ROLE_PROPRIETOR | typeof ROLE_MECHANIC;

export interface CurrentUser {
  id: string;
  email: string;
  displayName: string;
  role: Role;
  mechanicId: string | null;
}

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export async function signIn(email: string, password: string): Promise<CurrentUser> {
  const response = await api.post<LoginResponse>('/auth/login', { email, password });

  setToken(response.accessToken);

  return getCurrentUser();
}

export async function getCurrentUser(): Promise<CurrentUser> {
  return api.get<CurrentUser>('/session/me');
}

export function signOut(): void {
  clearToken();
}
