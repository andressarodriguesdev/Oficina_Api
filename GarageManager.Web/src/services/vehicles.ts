import { api } from './api';
import type { Vehicle, Customer } from '../types';

export type VehicleWithCustomer = Vehicle & {
  customer?: Customer | null;
};

export async function listVehicles(): Promise<Vehicle[]> {
  return api.get<Vehicle[]>('/Vehicle');
}

export async function getVehicle(id: string): Promise<Vehicle | null> {
  return api.get<Vehicle>(`/Vehicle/${id}`);
}

export interface VehicleInput {
  registrationNumber: string;
  make: string;
  model: string;
  year: string;
  customerId: string;
}

export async function createVehicle(
  input: VehicleInput
): Promise<Vehicle> {
  return api.post<Vehicle>('/Vehicle', input);
}

export async function updateVehicle(
  id: string,
  input: Partial<VehicleInput>
): Promise<Vehicle> {
  return api.put<Vehicle>(`/Vehicle/${id}`, input);
}

export async function deleteVehicle(
  id: string
): Promise<void> {
  await api.delete(`/Vehicle/${id}`);
}

export async function deactivateVehicle(id: string): Promise<void> {
  await api.patch(`/Vehicle/${id}/deactivate`);
}

export async function reactivateVehicle(id: string): Promise<void> {
  await api.patch(`/Vehicle/${id}/reactivate`);
}
