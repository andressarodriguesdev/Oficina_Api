
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  Users,
  Wrench,
  XCircle,
} from "lucide-react";

import { Card } from "../components/ui/Card";
import { PageLoader } from "../components/ui/Spinner";
import { Select } from "../components/ui/Select";
import { Button } from "../components/ui/Button";
import { StatusBadge } from "../components/ui/StatusBadge";

import {
  obterFinanceiro,
  type FinanceiroResponse,
} from "../services/financeiro";

import { formatCurrency } from "../utils/format";

export function Financeiro() {
  const navigate = useNavigate();

  const [dados, setDados] =
    useState<FinanceiroResponse | null>(null);

  const [ordenacao, setOrdenacao] =
    useState("recentes");

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
        return ordens.sort(
          (a, b) => b.total - a.total,
        );

      case "menorValor":
        return ordens.sort(
          (a, b) => a.total - b.total,
        );

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
    return (
      <PageLoader label="Carregando financeiro..." />
    );
  }

  return (
    <div className="space-y-8">
      {/* CABEÇALHO */}

      <section
        className="
          relative
          overflow-hidden
          border-b
          border-[var(--app-border-subtle)]
          pb-7
        "
      >
        <div
          className="
            pointer-events-none
            absolute
            -right-10
            -top-20
            h-48
            w-48
            rounded-full
            border
            border-[var(--app-border-subtle)]
          "
        />

        <div
          className="
            pointer-events-none
            absolute
            right-12
            -top-8
            h-24
            w-24
            rounded-full
            border
            border-[var(--app-border-subtle)]
          "
        />

        <div className="relative">
          <div className="mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/painel")}
              className="px-0"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar ao dashboard
            </Button>
          </div>

          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="mb-3 flex items-center gap-2">
                <span
                  className="
                    h-1.5
                    w-1.5
                    rounded-full
                    bg-[var(--accent)]
                  "
                />

                <span
                  className="
                    text-[10px]
                    font-bold
                    uppercase
                    tracking-[0.2em]
                    text-[var(--app-text-muted)]
                  "
                >
                  Gestão financeira
                </span>
              </div>

              <h1
                className="
                  font-display
                  text-3xl
                  font-extrabold
                  tracking-[-0.04em]
                  text-[var(--app-text)]
                  sm:text-4xl
                "
              >
                Financeiro
              </h1>

              <p
                className="
                  mt-2
                  max-w-xl
                  text-sm
                  leading-6
                  text-[var(--app-text-muted)]
                "
              >
                Acompanhe o faturamento realizado,
                os valores previstos e a composição
                financeira dos serviços.
              </p>
            </div>

            <div
              className="
                flex
                items-center
                gap-2
                self-start
                border
                border-[var(--app-border-subtle)]
                bg-[var(--app-surface-raised)]
                px-3
                py-2
              "
            >
              <CircleDollarSign
                className="
                  h-3.5
                  w-3.5
                  text-[var(--accent-text)]
                "
              />

              <span
                className="
                  text-xs
                  font-semibold
                  text-[var(--app-text-secondary)]
                "
              >
                Visão financeira
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* INDICADOR PRINCIPAL */}

      <section>
        <div
          className="
            grid
            overflow-hidden
            border
            border-[var(--app-border)]
            bg-[var(--app-surface)]
            lg:grid-cols-[1.35fr_0.65fr]
          "
        >
          {/* FATURADO */}

          <div
            className="
              relative
              min-h-[250px]
              overflow-hidden
              border-b
              border-[var(--app-border-subtle)]
              p-6
              sm:p-8
              lg:border-b-0
              lg:border-r
            "
          >
            <div
              className="
                pointer-events-none
                absolute
                -bottom-24
                -right-16
                h-72
                w-72
                rounded-full
                border
                border-[var(--app-border-subtle)]
              "
            />

            <div
              className="
                pointer-events-none
                absolute
                bottom-[-60px]
                right-[-4px]
                h-40
                w-40
                rounded-full
                border
                border-[var(--app-border-subtle)]
              "
            />

            <div className="relative flex h-full flex-col justify-between">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p
                    className="
                      text-[10px]
                      font-bold
                      uppercase
                      tracking-[0.18em]
                      text-[var(--app-text-muted)]
                    "
                  >
                    Faturamento realizado
                  </p>

                  <p
                    className="
                      mt-1
                      text-xs
                      text-[var(--app-text-faint)]
                    "
                  >
                    Serviços concluídos
                  </p>
                </div>

                <div
                  className="
                    flex
                    h-10
                    w-10
                    items-center
                    justify-center
                    rounded-xl
                    bg-[var(--hover-bg-soft)]
                    text-[var(--accent-text)]
                  "
                >
                  <BarChart3 className="h-5 w-5" />
                </div>
              </div>

              <div className="mt-10">
                <p
                  className="
                    font-display
                    text-4xl
                    font-extrabold
                    tracking-[-0.05em]
                    text-[var(--app-text)]
                    sm:text-5xl
                  "
                >
                  {formatCurrency(
                    dados.totalFaturado,
                  )}
                </p>

                <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2">
                  <span
                    className="
                      inline-flex
                      items-center
                      gap-1.5
                      text-xs
                      font-semibold
                      text-emerald-500
                    "
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />

                    {dados.quantidadeConcluidas}{" "}
                    OS concluída
                    {dados.quantidadeConcluidas !== 1
                      ? "s"
                      : ""}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* PREVISTO */}

          <div
            className="
              group
              p-6
              transition-colors
              hover:bg-[var(--hover-bg)]
              sm:p-8
            "
          >
            <div className="flex h-full flex-col justify-between">
              <div className="flex items-start justify-between">
                <div
                  className="
                    flex
                    h-10
                    w-10
                    items-center
                    justify-center
                    rounded-xl
                    bg-amber-500/10
                    text-amber-500
                  "
                >
                  <Clock3 className="h-5 w-5" />
                </div>

                <ArrowUpRight
                  className="
                    h-4
                    w-4
                    text-[var(--app-text-faint)]
                    transition-colors
                    group-hover:text-amber-500
                  "
                />
              </div>

              <div className="mt-10">
                <p
                  className="
                    text-[10px]
                    font-bold
                    uppercase
                    tracking-[0.18em]
                    text-[var(--app-text-muted)]
                  "
                >
                  Faturamento previsto
                </p>

                <p
                  className="
                    mt-2
                    font-display
                    text-3xl
                    font-extrabold
                    tracking-[-0.04em]
                    text-[var(--app-text)]
                  "
                >
                  {formatCurrency(
                    dados.totalPrevisto,
                  )}
                </p>

                <p
                  className="
                    mt-2
                    text-xs
                    text-[var(--app-text-muted)]
                  "
                >
                  {dados.quantidadePendentes} OS
                  pendente
                  {dados.quantidadePendentes !== 1
                    ? "s"
                    : ""}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* COMPOSIÇÃO FINANCEIRA */}

      <section>
        <div className="mb-4">
          <p
            className="
              text-[10px]
              font-bold
              uppercase
              tracking-[0.18em]
              text-[var(--app-text-muted)]
            "
          >
            Composição
          </p>

          <h2
            className="
              mt-1
              font-display
              text-lg
              font-bold
              text-[var(--app-text)]
            "
          >
            Estrutura do faturamento
          </h2>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          {/* MÃO DE OBRA */}

          <Card
            className="
              relative
              overflow-hidden
              p-5
            "
          >
            <div className="flex items-start justify-between">
              <div
                className="
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-xl
                  bg-[var(--app-surface-raised)]
                  text-[var(--accent-text)]
                "
              >
                <Wrench className="h-5 w-5" />
              </div>

              <span
                className="
                  text-[10px]
                  font-bold
                  uppercase
                  tracking-[0.14em]
                  text-[var(--app-text-faint)]
                "
              >
                Receita
              </span>
            </div>

            <div className="mt-8">
              <p
                className="
                  text-[10px]
                  font-bold
                  uppercase
                  tracking-[0.14em]
                  text-[var(--app-text-muted)]
                "
              >
                Mão de obra
              </p>

              <p
                className="
                  mt-2
                  font-display
                  text-2xl
                  font-bold
                  tracking-[-0.03em]
                  text-[var(--app-text)]
                "
              >
                {formatCurrency(
                  dados.totalMaoObra,
                )}
              </p>
            </div>
          </Card>

          {/* PEÇAS */}

          <Card
            className="
              relative
              overflow-hidden
              p-5
            "
          >
            <div className="flex items-start justify-between">
              <div
                className="
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-xl
                  bg-sky-500/10
                  text-sky-500
                "
              >
                <BarChart3 className="h-5 w-5" />
              </div>

              <span
                className="
                  text-[10px]
                  font-bold
                  uppercase
                  tracking-[0.14em]
                  text-[var(--app-text-faint)]
                "
              >
                Receita
              </span>
            </div>

            <div className="mt-8">
              <p
                className="
                  text-[10px]
                  font-bold
                  uppercase
                  tracking-[0.14em]
                  text-[var(--app-text-muted)]
                "
              >
                Peças
              </p>

              <p
                className="
                  mt-2
                  font-display
                  text-2xl
                  font-bold
                  tracking-[-0.03em]
                  text-[var(--app-text)]
                "
              >
                {formatCurrency(
                  dados.totalPecas,
                )}
              </p>
            </div>
          </Card>

          {/* CANCELADAS */}

          <Card
            className="
              relative
              overflow-hidden
              p-5
            "
          >
            <div className="flex items-start justify-between">
              <div
                className="
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-xl
                  bg-red-500/10
                  text-red-500
                "
              >
                <XCircle className="h-5 w-5" />
              </div>

              <span
                className="
                  text-[10px]
                  font-bold
                  uppercase
                  tracking-[0.14em]
                  text-[var(--app-text-faint)]
                "
              >
                Atenção
              </span>
            </div>

            <div className="mt-8">
              <p
                className="
                  text-[10px]
                  font-bold
                  uppercase
                  tracking-[0.14em]
                  text-[var(--app-text-muted)]
                "
              >
                Ordens canceladas
              </p>

              <p
                className="
                  mt-2
                  font-display
                  text-2xl
                  font-bold
                  tracking-[-0.03em]
                  text-[var(--app-text)]
                "
              >
                {dados.quantidadeCanceladas}
              </p>

              <p
                className="
                  mt-1
                  text-xs
                  text-[var(--app-text-muted)]
                "
              >
                Serviços cancelados
              </p>
            </div>
          </Card>
        </div>
      </section>

      {/* ORDENS DE SERVIÇO */}

      <section>
        <Card className="overflow-hidden">
          <div
            className="
              flex
              flex-col
              gap-5
              border-b
              border-[var(--app-border-subtle)]
              px-5
              py-5
              sm:flex-row
              sm:items-end
              sm:justify-between
            "
          >
            <div>
              <div className="flex items-center gap-2">
                <span
                  className="
                    h-1.5
                    w-1.5
                    rounded-full
                    bg-[var(--accent)]
                  "
                />

                <p
                  className="
                    text-[10px]
                    font-bold
                    uppercase
                    tracking-[0.18em]
                    text-[var(--app-text-muted)]
                  "
                >
                  Operação financeira
                </p>
              </div>

              <h2
                className="
                  mt-2
                  font-display
                  text-lg
                  font-bold
                  text-[var(--app-text)]
                "
              >
                Ordens de Serviço
              </h2>

              <p
                className="
                  mt-1
                  text-sm
                  text-[var(--app-text-muted)]
                "
              >
                Acompanhe valores, status e
                responsáveis pelos serviços.
              </p>
            </div>

            {dados.ordens.length > 0 && (
              <div className="w-full sm:w-52">
                <Select
                  value={ordenacao}
                  onChange={(e) =>
                    setOrdenacao(e.target.value)
                  }
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
            <div
              className="
                flex
                flex-col
                items-center
                justify-center
                px-6
                py-16
                text-center
              "
            >
              <div
                className="
                  flex
                  h-14
                  w-14
                  items-center
                  justify-center
                  rounded-2xl
                  bg-[var(--app-surface-raised)]
                  text-[var(--app-text-muted)]
                "
              >
                <BarChart3 className="h-6 w-6" />
              </div>

              <p
                className="
                  mt-4
                  text-sm
                  font-semibold
                  text-[var(--app-text)]
                "
              >
                Nenhuma ordem de serviço encontrada
              </p>

              <p
                className="
                  mt-1
                  text-xs
                  text-[var(--app-text-muted)]
                "
              >
                Os dados financeiros das OS aparecerão
                aqui.
              </p>
            </div>
          ) : (
            <div
              className="
                grid
                gap-px
                bg-[var(--app-border-subtle)]
                md:grid-cols-2
                xl:grid-cols-3
              "
            >
              {ordensOrdenadas.map((ordem) => (
                <div
                  key={ordem.id}
                  className="
                    group
                    cursor-pointer
                    bg-[var(--app-surface)]
                    p-5
                    transition-colors
                    hover:bg-[var(--hover-bg)]
                  "
                  onClick={() =>
                    navigate(
                      `/ordens-servico/${ordem.id}`,
                    )
                  }
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p
                        className="
                          text-[10px]
                          font-bold
                          uppercase
                          tracking-[0.14em]
                          text-[var(--app-text-muted)]
                        "
                      >
                        Ordem de Serviço
                      </p>

                      <p
                        className="
                          mt-1
                          font-mono
                          text-sm
                          font-bold
                          text-[var(--app-text)]
                        "
                      >
                        #
                        {ordem.id
                          .slice(0, 8)
                          .toUpperCase()}
                      </p>
                    </div>

                    <StatusBadge
                      status={ordem.status}
                    />
                  </div>

                  <div className="mt-6">
                    <div>
                      <p
                        className="
                          text-[10px]
                          font-bold
                          uppercase
                          tracking-[0.12em]
                          text-[var(--app-text-muted)]
                        "
                      >
                        Cliente
                      </p>

                      <p
                        className="
                          mt-1
                          truncate
                          text-sm
                          font-semibold
                          text-[var(--app-text)]
                        "
                      >
                        {ordem.cliente}
                      </p>
                    </div>

                    <div className="mt-4">
                      <p
                        className="
                          text-[10px]
                          font-bold
                          uppercase
                          tracking-[0.12em]
                          text-[var(--app-text-muted)]
                        "
                      >
                        Veículo
                      </p>

                      <p
                        className="
                          mt-1
                          truncate
                          text-sm
                          text-[var(--app-text-secondary)]
                        "
                      >
                        {ordem.veiculo}
                      </p>
                    </div>
                  </div>

                  <div
                    className="
                      mt-5
                      grid
                      grid-cols-2
                      gap-4
                      border-t
                      border-[var(--app-border-subtle)]
                      pt-4
                    "
                  >
                    <div>
                      <p
                        className="
                          text-[10px]
                          font-bold
                          uppercase
                          tracking-[0.12em]
                          text-[var(--app-text-muted)]
                        "
                      >
                        Mão de obra
                      </p>

                      <p
                        className="
                          mt-1
                          text-sm
                          font-semibold
                          tabular-nums
                          text-[var(--app-text)]
                        "
                      >
                        {formatCurrency(
                          ordem.maoObra,
                        )}
                      </p>
                    </div>

                    <div>
                      <p
                        className="
                          text-[10px]
                          font-bold
                          uppercase
                          tracking-[0.12em]
                          text-[var(--app-text-muted)]
                        "
                      >
                        Peças
                      </p>

                      <p
                        className="
                          mt-1
                          text-sm
                          font-semibold
                          tabular-nums
                          text-[var(--app-text)]
                        "
                      >
                        {formatCurrency(
                          ordem.pecas,
                        )}
                      </p>
                    </div>
                  </div>

                  <div
                    className="
                      mt-5
                      flex
                      items-end
                      justify-between
                      border-t
                      border-[var(--app-border-subtle)]
                      pt-4
                    "
                  >
                    <div>
                      <p
                        className="
                          text-[10px]
                          font-bold
                          uppercase
                          tracking-[0.12em]
                          text-[var(--app-text-muted)]
                        "
                      >
                        Total
                      </p>

                      <p
                        className="
                          mt-1
                          font-display
                          text-xl
                          font-bold
                          tracking-[-0.03em]
                          text-[var(--app-text)]
                        "
                      >
                        {formatCurrency(
                          ordem.total,
                        )}
                      </p>
                    </div>

                    <ArrowUpRight
                      className="
                        h-4
                        w-4
                        text-[var(--app-text-faint)]
                        transition-colors
                        group-hover:text-[var(--accent-text)]
                      "
                    />
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <span
                      className="
                        text-xs
                        tabular-nums
                        text-[var(--app-text-muted)]
                      "
                    >
                      {new Date(
                        ordem.data,
                      ).toLocaleDateString()}
                    </span>

                    <span
                      className="
                        text-xs
                        font-semibold
                        text-[var(--accent-text)]
                        transition-colors
                        group-hover:text-[var(--accent-text-hover)]
                      "
                    >
                      Ver OS
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </section>

      {/* PRODUTIVIDADE */}

      <section>
        <div className="mb-4">
          <div className="flex items-center gap-2">
            <span
              className="
                h-1.5
                w-1.5
                rounded-full
                bg-[var(--accent)]
              "
            />

            <p
              className="
                text-[10px]
                font-bold
                uppercase
                tracking-[0.18em]
                text-[var(--app-text-muted)]
              "
            >
              Performance
            </p>
          </div>

          <h2
            className="
              mt-2
              font-display
              text-lg
              font-bold
              text-[var(--app-text)]
            "
          >
            Produtividade por Mecânico
          </h2>

          <p
            className="
              mt-1
              text-sm
              text-[var(--app-text-muted)]
            "
          >
            Acompanhe desempenho e valores gerados
            por profissional.
          </p>
        </div>

        <Card className="overflow-hidden">
          {dados.produtividadeMecanicos.length === 0 ? (
            <div
              className="
                flex
                flex-col
                items-center
                justify-center
                px-6
                py-16
                text-center
              "
            >
              <div
                className="
                  flex
                  h-14
                  w-14
                  items-center
                  justify-center
                  rounded-2xl
                  bg-[var(--app-surface-raised)]
                  text-[var(--app-text-muted)]
                "
              >
                <Users className="h-6 w-6" />
              </div>

              <p
                className="
                  mt-4
                  text-sm
                  font-semibold
                  text-[var(--app-text)]
                "
              >
                Nenhum dado de produtividade
              </p>

              <p
                className="
                  mt-1
                  text-xs
                  text-[var(--app-text-muted)]
                "
              >
                Os indicadores aparecerão quando
                houver serviços atribuídos.
              </p>
            </div>
          ) : (
            <div
              className="
                grid
                gap-px
                bg-[var(--app-border-subtle)]
                md:grid-cols-2
                xl:grid-cols-3
              "
            >
              {dados.produtividadeMecanicos.map(
                (mecanico) => (
                  <div
                    key={mecanico.mecanicoId}
                    className="
                      group
                      cursor-pointer
                      bg-[var(--app-surface)]
                      p-5
                      transition-colors
                      hover:bg-[var(--hover-bg)]
                    "
                    onClick={() =>
                      navigate(
                        `/mecanicos/${mecanico.mecanicoId}`,
                      )
                    }
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p
                          className="
                            text-[10px]
                            font-bold
                            uppercase
                            tracking-[0.14em]
                            text-[var(--app-text-muted)]
                          "
                        >
                          Mecânico
                        </p>

                        <h3
                          className="
                            mt-1
                            font-display
                            text-lg
                            font-bold
                            tracking-[-0.02em]
                            text-[var(--app-text)]
                          "
                        >
                          {mecanico.nome}
                        </h3>
                      </div>

                      <ArrowUpRight
                        className="
                          h-4
                          w-4
                          text-[var(--app-text-faint)]
                          transition-colors
                          group-hover:text-[var(--accent-text)]
                        "
                      />
                    </div>

                    <div
                      className="
                        mt-6
                        grid
                        grid-cols-2
                        gap-4
                      "
                    >
                      <div>
                        <p
                          className="
                            text-[10px]
                            font-bold
                            uppercase
                            tracking-[0.12em]
                            text-[var(--app-text-muted)]
                          "
                        >
                          Ordens
                        </p>

                        <p
                          className="
                            mt-1
                            font-display
                            text-2xl
                            font-bold
                            tabular-nums
                            text-[var(--app-text)]
                          "
                        >
                          {mecanico.quantidadeOrdens}
                        </p>
                      </div>

                      <div>
                        <p
                          className="
                            text-[10px]
                            font-bold
                            uppercase
                            tracking-[0.12em]
                            text-[var(--app-text-muted)]
                          "
                        >
                          Concluídas
                        </p>

                        <p
                          className="
                            mt-1
                            font-display
                            text-2xl
                            font-bold
                            tabular-nums
                            text-[var(--app-text)]
                          "
                        >
                          {mecanico.quantidadeConcluidas}
                        </p>
                      </div>
                    </div>

                    <div
                      className="
                        mt-5
                        border-t
                        border-[var(--app-border-subtle)]
                        pt-4
                      "
                    >
                      <p
                        className="
                          text-[10px]
                          font-bold
                          uppercase
                          tracking-[0.12em]
                          text-[var(--app-text-muted)]
                        "
                      >
                        Mão de obra gerada
                      </p>

                      <p
                        className="
                          mt-1
                          font-display
                          text-xl
                          font-bold
                          tracking-[-0.03em]
                          text-[var(--app-text)]
                        "
                      >
                        {formatCurrency(
                          mecanico.totalMaoObra,
                        )}
                      </p>
                    </div>

                    <div
                      className="
                        mt-4
                        flex
                        items-center
                        justify-between
                      "
                    >
                      <span
                        className="
                          text-xs
                          text-[var(--app-text-muted)]
                        "
                      >
                        Ver detalhes
                      </span>

                      <ArrowRight
                        className="
                          h-4
                          w-4
                          text-[var(--app-text-faint)]
                          transition-all
                          group-hover:translate-x-0.5
                          group-hover:text-[var(--accent-text)]
                        "
                      />
                    </div>
                  </div>
                ),
              )}
            </div>
          )}
        </Card>
      </section>
    </div>
  );
}

