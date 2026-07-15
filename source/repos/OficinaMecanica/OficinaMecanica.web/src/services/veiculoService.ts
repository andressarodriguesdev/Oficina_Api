import type { Veiculo } from '../types';
import { apiClient } from './api';
import { MOCK_MODE } from './api';
import { mockVeiculos } from './mockData';

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const veiculoService = {
  async list(): Promise<Veiculo[]> {
    if (MOCK_MODE) {
      await delay(200);
      return mockVeiculos;
    }
    const response = await apiClient.get<Veiculo[]>('/Veiculo');

    return response.data;
  },

  async create(data: Omit<Veiculo, 'id'>): Promise<Veiculo> {
    if (MOCK_MODE) {
      await delay(200);
      const novo: Veiculo = { ...data, id: `v${Date.now()}` };
      mockVeiculos.push(novo);
      return novo;
    }
    const response = await apiClient.post<Veiculo>('/Veiculo', data);

    return response.data;
  },

  async update(id: string, data: Partial<Veiculo>): Promise<Veiculo> {
    if (MOCK_MODE) {
      await delay(200);
      const idx = mockVeiculos.findIndex((v) => v.id === id);
      if (idx >= 0) mockVeiculos[idx] = { ...mockVeiculos[idx], ...data };
      return mockVeiculos[idx];
    }
    const response = await apiClient.put<Veiculo>(`/Veiculo/${id}`, data);

    return response.data;
  },

  async remove(id: string): Promise<void> {
    if (MOCK_MODE) {
      await delay(200);
      const idx = mockVeiculos.findIndex((v) => v.id === id);
      if (idx >= 0) mockVeiculos.splice(idx, 1);
      return;
    }
    await apiClient.delete(`/Veiculo/${id}`);
  },
};
