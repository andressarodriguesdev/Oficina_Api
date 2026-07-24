import { api } from './api';
import type { Cliente, OrdemServico, Veiculo ,ClienteDetalhado} from '../types';

export async function listClientes(): Promise<Cliente[]> {
  return api.get<Cliente[]>('/clientes');
}

export async function getCliente(id: string): Promise<ClienteDetalhado | null> {
  return api.get<ClienteDetalhado>(`/clientes/${id}`);
}

export async function getClienteVeiculos(clienteId: string): Promise<Veiculo[]> {
  return api.get<Veiculo[]>(`/clientes/${clienteId}/veiculos`);
}

export async function getClienteOrdens(clienteId: string): Promise<OrdemServico[]> {
  return api.get<OrdemServico[]>(`/clientes/${clienteId}/ordens-servico`);
}

// Campos enviados para o backend
export interface ClienteInput {
  nome: string;
  telefone: string;
  email: string;
  endereco: string;
}

export async function createCliente(input: ClienteInput): Promise<Cliente> {
  return api.post<Cliente>('/clientes', input);
}

export async function updateCliente(
  id: string,
  input: Partial<ClienteInput>
): Promise<Cliente> {
  return api.put<Cliente>(`/clientes/${id}`, input);
}

export async function deleteCliente(id: string): Promise<void> {
  await api.delete(`/clientes/${id}`);
}


