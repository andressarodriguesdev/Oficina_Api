import { api } from './api'; 
import type {  Veiculo, Cliente } from '../types';

export type VeiculoWithCliente = Veiculo & {
  cliente?: Cliente | null;
};

export async function listVeiculos(): Promise<Veiculo[]> {
  return api.get<Veiculo[]>('/veiculo');
}

export async function getVeiculo(id: string): Promise<Veiculo | null> {
  return api.get<Veiculo>(`/veiculo/${id}`);
}

export interface VeiculoInput {
  placa: string;
  marca: string;
  modelo: string;
  ano: string;
  clienteId: string;
}

export async function createVeiculo(
  input: VeiculoInput
): Promise<Veiculo> {
  return api.post<Veiculo>('/veiculo', input);
}

export async function updateVeiculo(
  id:string,
  input: Partial<VeiculoInput>
): Promise<Veiculo> {
  return api.put<Veiculo>(`/veiculo/${id}`, input);
}

export async function deleteVeiculo(
  id:string
): Promise<void> {
  await api.delete(`/veiculo/${id}`);
}
