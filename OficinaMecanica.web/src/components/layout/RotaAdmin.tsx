import { Navigate } from 'react-router-dom';
import type { ReactElement } from 'react';

import { ehMecanico } from '../../utils/session';

/**
 * Conveniência de interface: o mecânico que abrir uma tela de administração
 * volta para as ordens de serviço. A proteção real está na API (403).
 */
export function RotaAdmin({ children }: { children: ReactElement }) {
  if (ehMecanico()) {
    return <Navigate to="/ordens-servico" replace />;
  }

  return children;
}
