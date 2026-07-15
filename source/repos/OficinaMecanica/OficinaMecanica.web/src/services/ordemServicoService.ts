import type { OrdemServico } from '../types';
import { apiClient } from './api';
import { MOCK_MODE } from './api';
import { mockOrdens } from './mockData';

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const ordemServicoService = {
  async list(): Promise<OrdemServico[]> {
    if (MOCK_MODE) {
      await delay(200);
      return mockOrdens;
    }
    return apiClient.get<OrdemServico[]>('/ordens-servico');
  },

  async getById(id: string): Promise<OrdemServico | undefined> {
    if (MOCK_MODE) {
      await delay(150);
      return mockOrdens.find((o) => o.id === id);
    }
    return apiClient.get<OrdemServico>(`/ordens-servico/${id}`);
  },

  async create(data: Omit<OrdemServico, 'id' | 'numero' | 'timeline'>): Promise<OrdemServico> {
    if (MOCK_MODE) {
      await delay(200);
      const numero = `OS-2025-${String(mockOrdens.length + 1).padStart(3, '0')}`;
      const nova: OrdemServico = {
        ...data,
        id: `os${Date.now()}`,
        numero,
        timeline: [
          {
            id: `t${Date.now()}`,
            status: 'aberta',
            label: 'OS Criada',
            timestamp: new Date().toISOString().slice(0, 16).replace('T', ' '),
            user: 'Sistema',
          },
        ],
      };
      mockOrdens.push(nova);
      return nova;
    }
    return apiClient.post<OrdemServico>('/ordens-servico', data);
  },

  async updateStatus(id: string, status: OrdemServico['status']): Promise<void> {
    if (MOCK_MODE) {
      await delay(150);
      const os = mockOrdens.find((o) => o.id === id);
      if (os) {
        os.status = status;
        os.timeline.push({
          id: `t${Date.now()}`,
          status,
          label: statusLabel(status),
          timestamp: new Date().toISOString().slice(0, 16).replace('T', ' '),
          user: 'Sistema',
        });
      }
      return;
    }
    return apiClient.put(`/ordens-servico/${id}/status`, { status });
  },
};

function statusLabel(status: OrdemServico['status']): string {
const labels: Record<OrdemServico['status'], string> = {
aberta: 'OS Criada',
aguardando_aprovacao: 'Enviada para aprovação',
aprovada: 'Aprovada',
recusada: 'Recusada',
concluida: 'Serviço concluído',
cancelada: 'OS Cancelada',
reaberta: 'OS Reaberta',
};

return labels[status];
}
