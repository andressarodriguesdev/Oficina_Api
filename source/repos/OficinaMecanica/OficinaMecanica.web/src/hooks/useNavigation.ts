import { useState, useCallback } from 'react';

export type Page =
  | 'dashboard'
  | 'clientes'
  | 'cliente-detalhes'
  | 'veiculos'
  | 'os-nova'
  | 'os-detalhes'
  | 'historico'
  | 'configuracoes';

export function useNavigation(initial: Page = 'dashboard') {
  const [page, setPage] = useState<Page>(initial);
  const [params, setParams] = useState<Record<string, string>>({});

  const navigate = useCallback((next: Page, p: Record<string, string> = {}) => {
    setPage(next);
    setParams(p);
  }, []);

  return { page, params, navigate };
}
