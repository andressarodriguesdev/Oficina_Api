import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { ApiError, MSG_REDE } from '../../services/api';
import { OrdemErro } from './OrdemErro';

afterEach(cleanup);

function renderErro(error: unknown, onRetry?: () => void) {
  return render(
    <MemoryRouter>
      <OrdemErro error={error} onRetry={onRetry} />
    </MemoryRouter>,
  );
}

describe('OrdemErro', () => {
  it('403: mostra a mensagem amigável e o link para voltar à listagem', () => {
    renderErro(new ApiError('Forbidden', 403), vi.fn());

    expect(
      screen.getByText('Você só pode acessar ordens de serviço atribuídas a você.'),
    ).toBeTruthy();

    const voltar = screen.getByText('Voltar para a listagem').closest('a');
    expect(voltar?.getAttribute('href')).toBe('/ordens-servico');

    expect(screen.queryByText('Tentar novamente')).toBeNull();
  });

  it('404: informa que a OS não foi encontrada ou não está disponível', () => {
    renderErro(new ApiError('nf', 404));

    expect(screen.getByText('Ordem de serviço não encontrada')).toBeTruthy();
    expect(screen.getByText('Voltar para a listagem')).toBeTruthy();
  });

  it('500 e rede: oferecem "Tentar novamente" que chama onRetry', () => {
    const onRetry = vi.fn();
    renderErro(new ApiError(MSG_REDE, 0), onRetry);

    fireEvent.click(screen.getByText('Tentar novamente'));

    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
