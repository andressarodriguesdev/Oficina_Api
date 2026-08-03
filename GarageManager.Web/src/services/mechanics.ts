import { api } from './api';

export interface Mechanic {
  id: string;
  name: string;
  phone?: string;
  speciality?: string;
  isActive: boolean;
  workshopId: string;
}

export interface MechanicRequest {
  name: string;
  phone?: string;
  speciality?: string;
}

export async function listMechanics() {
  return await api.get<Mechanic[]>('/Mechanic');
}

export async function getMechanic(id: string) {
  return await api.get<Mechanic>(`/Mechanic/${id}`);
}

export async function createMechanic(data: MechanicRequest) {
  return await api.post<Mechanic>('/Mechanic', data);
}

export async function updateMechanic(
  id: string,
  data: MechanicRequest
) {
  return await api.put<Mechanic>(
    `/Mechanic/${id}`,
    data
  );
}

export async function deleteMechanic(id: string) {
  await api.delete(`/Mechanic/${id}`);
}

export async function deactivateMechanic(id: string) {
  return api.patch(`/Mechanic/${id}/deactivate`);
}

export async function reactivateMechanic(id: string) {
  return api.patch(`/Mechanic/${id}/reactivate`);
}
