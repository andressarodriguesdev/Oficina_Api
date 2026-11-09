import { AlertTriangle, ArrowLeft, RefreshCw, ShieldAlert, SearchX } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Button } from './Button';
import { Card } from './Card';
import { EmptyState } from './EmptyState';
import { descreverErroOrdem } from '../../utils/ordemErro';

interface OrdemErroProps {
  error: unknown;
  onRetry?: () => void;
}

/**
 * Estado de erro das telas de OS: nunca deixa tela branca ou loading infinito,
 * sempre oferece uma saída (voltar à listagem e, quando faz sentido, tentar de novo).
 */
export function OrdemErro({ error, onRetry }: OrdemErroProps) {
  const info = descreverErroOrdem(error);

  const icon =
    info.tipo === 'acesso' ? (
      <ShieldAlert className="h-7 w-7" />
    ) : info.tipo === 'nao-encontrada' ? (
      <SearchX className="h-7 w-7" />
    ) : (
      <AlertTriangle className="h-7 w-7" />
    );

  return (
    <Card>
      <div role="alert">
        <EmptyState
          icon={icon}
          title={info.titulo}
          description={info.descricao}
          action={
            <div className="flex flex-wrap items-center justify-center gap-3">
              {info.podeTentarNovamente && onRetry && (
                <Button onClick={onRetry}>
                  <RefreshCw className="h-4 w-4" />
                  Tentar novamente
                </Button>
              )}

              <Link to="/ordens-servico">
                <Button variant="outline">
                  <ArrowLeft className="h-4 w-4" />
                  Voltar para a listagem
                </Button>
              </Link>
            </div>
          }
        />
      </div>
    </Card>
  );
}
