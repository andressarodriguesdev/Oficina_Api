
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Card } from "../components/ui/Card";
import { PageLoader } from "../components/ui/Spinner";
import { Select } from "../components/ui/Select";

import {
  obterFinanceiro,
  type FinanceiroResponse,
} from "../services/financeiro";

import { StatusBadge } from "../components/ui/StatusBadge";

import { formatCurrency } from "../utils/format";

export function Financeiro() {
  const navigate = useNavigate();

  const [dados, setDados] = useState<FinanceiroResponse | null>(null);

  const [ordenacao, setOrdenacao] = useState("recentes");

  useEffect(() => {
    async function carregar() {
      const response = await obterFinanceiro();

      setDados(response);
    }

    carregar();
  }, []);

  const ordensOrdenadas = useMemo(() => {
    if (!dados) return [];

    const ordens = [...dados.ordens];

    switch (ordenacao) {
      case "maiorValor":
        return ordens.sort((a, b) => b.total - a.total);

      case "menorValor":
        return ordens.sort((a, b) => a.total - b.total);

      case "recentes":
      default:
        return ordens.sort(
          (a, b) =>
            new Date(b.data).getTime() -
            new Date(a.data).getTime(),
        );
    }
  }, [dados, ordenacao]);

  if (!dados) {
    return <PageLoader label="Carregando financeiro..." />;
  }

  return (
    <div className="space-y-5">
      {/* INDICADORES */}

      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
        <Card className="p-5">
          <p className="text-sm text-ink-400">Faturado</p>

          <strong className="text-2xl text-white">
            {formatCurrency(dados.totalFaturado)}
          </strong>

          <p className="mt-2 text-xs text-ink-400">
            {dados.quantidadeConcluidas} OS concluídas
          </p>
        </Card>

        <Card className="p-5">
          <p className="text-sm text-ink-400">Previsto</p>

          <strong className="text-2xl text-white">
            {formatCurrency(dados.totalPrevisto)}
          </strong>

          <p className="mt-2 text-xs text-ink-400">
            {dados.quantidadePendentes} OS pendentes
          </p>
        </Card>

        <Card className="p-5">
          <p className="text-sm text-ink-400">Canceladas</p>

          <strong className="text-2xl text-white">
            {dados.quantidadeCanceladas}
          </strong>

          <p className="mt-2 text-xs text-ink-400">
            Ordens canceladas
          </p>
        </Card>

        <Card className="p-5">
          <p className="text-sm text-ink-400">Mão de obra</p>

          <strong className="text-2xl text-white">
            {formatCurrency(dados.totalMaoObra)}
          </strong>
        </Card>

        <Card className="p-5">
          <p className="text-sm text-ink-400">Peças</p>

          <strong className="text-2xl text-white">
            {formatCurrency(dados.totalPecas)}
          </strong>
        </Card>
      </div>

      {/* RESUMO DAS ORDENS DE SERVIÇO */}

      <Card className="overflow-hidden">
        <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-display text-lg font-bold text-white">
              Resumo das Ordens de Serviço
            </h2>

            <p className="mt-1 text-sm text-ink-400">
              Acompanhe valores, status e responsáveis pelos serviços.
            </p>
          </div>

          {dados.ordens.length > 0 && (
            <div className="w-full sm:w-52">
              <Select
                value={ordenacao}
                onChange={(e) => setOrdenacao(e.target.value)}
              >
                <option value="recentes">
                  Mais recentes
                </option>

                <option value="maiorValor">
                  Maior valor
                </option>

                <option value="menorValor">
                  Menor valor
                </option>
              </Select>
            </div>
          )}
        </div>

        {ordensOrdenadas.length === 0 ? (
          <div className="p-5">
            <p className="text-sm text-ink-400">
              Nenhuma ordem de serviço encontrada.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 p-5 md:grid-cols-2 xl:grid-cols-3">
            {ordensOrdenadas.map((ordem) => (
              <Card
                key={ordem.id}
                className="
                  cursor-pointer
                  p-5
                  transition
                  hover:border-flame-500/40
                  hover:bg-ink-800/40
                "
                onClick={() =>
                  navigate(`/ordens-servico/${ordem.id}`)
                }
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">
                      Ordem de Serviço
                    </p>

                    <p className="mt-1 font-mono text-sm font-bold text-white">
                      #{ordem.id.slice(0, 8).toUpperCase()}
                    </p>
                  </div>

                  <StatusBadge status={ordem.status} />
                </div>

                <div className="mt-5 space-y-3">
                  <div>
                    <p className="text-xs uppercase text-ink-400">
                      Cliente
                    </p>

                    <p className="text-sm font-semibold text-white">
                      {ordem.cliente}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs uppercase text-ink-400">
                      Veículo
                    </p>

                    <p className="text-sm text-ink-200">
                      {ordem.veiculo}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 border-t border-ink-700/50 pt-3">
                    <div>
                      <p className="text-xs uppercase text-ink-400">
                        Mão de obra
                      </p>

                      <p className="text-sm font-semibold text-white">
                        {formatCurrency(ordem.maoObra)}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs uppercase text-ink-400">
                        Peças
                      </p>

                      <p className="text-sm font-semibold text-white">
                        {formatCurrency(ordem.pecas)}
                      </p>
                    </div>
                  </div>

                  <div
                    className="
                      flex
                      items-center
                      justify-between
                      rounded-xl
                      bg-ink-800/60
                      px-4
                      py-3
                    "
                  >
                    <span className="text-sm text-ink-300">
                      Total
                    </span>

                    <span className="font-display text-lg font-bold text-flame-400">
                      {formatCurrency(ordem.total)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-xs text-ink-400">
                      {new Date(ordem.data).toLocaleDateString()}
                    </span>

                    <span
                      className="
                        text-sm
                        font-semibold
                        text-flame-400
                        hover:text-flame-300
                      "
                    >
                      Ver OS →
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Card>

      {/* PRODUTIVIDADE DOS MECÂNICOS */}

      <Card className="overflow-hidden">
        <div className="p-5">
          <h2 className="font-display text-lg font-bold text-white">
            Produtividade por Mecânico
          </h2>

          <p className="mt-1 text-sm text-ink-400">
            Acompanhe desempenho e valores gerados por profissional.
          </p>
        </div>

        {dados.produtividadeMecanicos.length === 0 ? (
          <div className="p-5">
            <p className="text-sm text-ink-400">
              Nenhum dado de produtividade encontrado.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 p-5 md:grid-cols-2 xl:grid-cols-3">
            {dados.produtividadeMecanicos.map((mecanico) => (
              <Card
                key={mecanico.mecanicoId}
                className="
                  cursor-pointer
                  p-5
                  transition
                  hover:border-flame-500/40
                  hover:bg-ink-800/40
                "
                onClick={() =>
                  navigate(`/mecanicos/${mecanico.mecanicoId}`)
                }
              >
                <div>
                  <p className="text-xs uppercase text-ink-400">
                    Mecânico
                  </p>

                  <h3 className="mt-1 font-display text-lg font-bold text-white">
                    {mecanico.nome}
                  </h3>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs uppercase text-ink-400">
                      Ordens
                    </p>

                    <p className="text-xl font-bold text-white">
                      {mecanico.quantidadeOrdens}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs uppercase text-ink-400">
                      Concluídas
                    </p>

                    <p className="text-xl font-bold text-white">
                      {mecanico.quantidadeConcluidas}
                    </p>
                  </div>
                </div>

                <div
                  className="
                    mt-4
                    rounded-xl
                    bg-ink-800/60
                    px-4
                    py-3
                  "
                >
                  <p className="text-xs uppercase text-ink-400">
                    Mão de obra gerada
                  </p>

                  <p className="mt-1 font-display text-lg font-bold text-flame-400">
                    {formatCurrency(mecanico.totalMaoObra)}
                  </p>
                </div>

                <div className="mt-4 text-right">
                  <span className="text-sm font-semibold text-flame-400">
                    Ver mecânico →
                  </span>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

