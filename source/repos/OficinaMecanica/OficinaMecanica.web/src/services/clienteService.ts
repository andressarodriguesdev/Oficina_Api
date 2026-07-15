import type { Cliente } from '../types';
import { apiClient } from './api';
import { MOCK_MODE } from './api';
import { mockClientes } from './mockData';


const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const clienteService = {
  async list(): Promise<Cliente[]> {
    if (MOCK_MODE) {
      await delay(200);
      return mockClientes;
    }
   const response = await apiClient.get<Cliente[]>('/clientes');

   return response.data;
  },

  async getById(id: string): Promise<Cliente> {
  if (MOCK_MODE) {
    await delay(200);

    const cliente = mockClientes.find(
      (c) => c.id === id
    );

    if (!cliente) {
      throw new Error('Cliente não encontrado');
    }

    return cliente;
  }

  const response = await apiClient.get<Cliente>(
    `/clientes/${id}`
  );

  return response.data;
},

  async create(data: Omit<Cliente, 'id'>): Promise<Cliente> {
  if (MOCK_MODE) {
    await delay(200);

    const novo: Cliente = {
      ...data,
      id: `c${Date.now()}`,
    };

    mockClientes.push(novo);
    return novo;
  }

  const response = await apiClient.post<Cliente>('/clientes', data);

  return response.data;
},

  async update(id: string, data: Partial<Cliente>): Promise<Cliente> {
    if (MOCK_MODE) {
      await delay(200);
      const idx = mockClientes.findIndex((c) => c.id === id);
      if (idx >= 0) mockClientes[idx] = { ...mockClientes[idx], ...data };
      return mockClientes[idx];
    }
    const response = await apiClient.put<Cliente>(`/clientes/${id}`, data);

    return response.data;

  },

  async remove(id: string): Promise<void> {
    if (MOCK_MODE) {
      await delay(200);
      const idx = mockClientes.findIndex((c) => c.id === id);
      if (idx >= 0) mockClientes.splice(idx, 1);
      return;
    }
   await apiClient.delete(`/clientes/${id}`);

  },
};
