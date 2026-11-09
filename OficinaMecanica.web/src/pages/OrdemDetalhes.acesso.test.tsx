import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { ToastProvider } from '../components/ui/Toast';
import { ApiError } from '../services/api';
import { OrdemDetalhes } from './OrdemDetalhes';

vi.mock('../services/ordens', async (importOriginal) => {
  const original = await importOriginal<typeof import('../services/ordens')>();

  return {
    ...original,
    getOrdem: vi.fn(),
    getOrdemHistorico: vi.fn().mockResolvedValue([]),
  };
});

import { getOrdem } from '../services/ordens';

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

function renderPagina() {
  return render(
    <ToastProvider>
      <MemoryRouter initialEntries={['/ordens-servico/os-de-outro-mecanico']}>
        <Routes>
          <Route path="/ordens-servico/:id" element={<OrdemDetalhes />} />
        </Routes>
      </MemoryRouter>
    </ToastProvider>,
  );
}

describe('OrdemDetalhes - acesso negado', () => {
  it('403 na URL direta: mostra mensagem amigável e ação de voltar (sem tela branca/loading infinito)', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    vi.mocked(getOrdem).mockRejectedValue(new ApiError('Forbidden', 403));

    renderPagina();

    await waitFor(() =>
      expect(
        screen.getByText('Você só pode acessar ordens de serviço atribuídas a você.'),
      ).toBeTruthy(),
    );

    expect(screen.queryByText('Carregando ordem de serviço...')).toBeNull();
    expect(screen.getByText('Voltar para a listagem').closest('a')?.getAttribute('href')).toBe(
      '/ordens-servico',
    );
  });

  it('500: mostra mensagem amigável e permite tentar novamente', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    vi.mocked(getOrdem).mockRejectedValue(new ApiError('boom', 500));

    renderPagina();

    await waitFor(() => expect(screen.getByText('Tentar novamente')).toBeTruthy());
    expect(screen.getByText('Voltar para a listagem')).toBeTruthy();
  });
});
