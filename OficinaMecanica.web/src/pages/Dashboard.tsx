
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ClipboardList,
  Clock3,
  CheckCircle2,
  DollarSign,
  TrendingUp,
  Users,
  Car,
  ArrowUpRight,
  ArrowRight,
  Activity,
} from "lucide-react";

import { Card } from "../components/ui/Card";
import { StatusBadge } from "../components/ui/StatusBadge";
import { PageLoader } from "../components/ui/Spinner";
import { EmptyState } from "../components/ui/EmptyState";
import {
  listOrdens,
  type OrdemWithRelations,
} from "../services/ordens";
import { listClientes } from "../services/clientes";
import { listVeiculos } from "../services/veiculos";
import {
  formatCurrency,
  formatDate,
} from "../utils/format";
import { useToast } from "../components/ui/Toast";
import { Select } from "../components/ui/Select";

export function Dashboard() {
  const toast = useToast();

  const [ordens, setOrdens] = useState<
    OrdemWithRelations[]
  >([]);

  const [clientesCount, setClientesCount] =
    useState(0);

  const [veiculosCount, setVeiculosCount] =
    useState(0);

  const [loading, setLoading] =
    useState(true);

  const [periodo, setPeriodo] =
    useState("todos");

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const [
          os,
          clientes,
          veiculos,
        ] = await Promise.all([
          listOrdens(),
          listClientes(),
          listVeiculos(),
        ]);

        if (!active) return;

        setOrdens(os);
        setClientesCount(clientes.length);
        setVeiculosCount(veiculos.length);
      } catch (err) {
        toast.error(
          "Erro ao carregar dados do dashboard",
        );

        console.error(err);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    })();

    return () => {
      active = false;
    };
  }, [toast]);

  if (loading) {
    return (
      <PageLoader label="Carregando dashboard..." />
    );
  }

  const ordensFiltradas = ordens.filter((os) => {
    if (periodo === "todos") {
      return true;
    }

    const dataOS = new Date(os.dataCriacao);
    const hoje = new Date();

    const hojeSemHora = new Date(
      hoje.getFullYear(),
      hoje.getMonth(),
      hoje.getDate(),
    );

    const dataSemHora = new Date(
      dataOS.getFullYear(),
      dataOS.getMonth(),
      dataOS.getDate(),
    );

    if (periodo === "hoje") {
      return (
        dataSemHora.getTime() ===
        hojeSemHora.getTime()
      );
    }

    if (periodo === "7dias") {
      const limite = new Date(hojeSemHora);

      limite.setDate(
        limite.getDate() - 7,
      );

      return dataSemHora >= limite;
    }

    if (periodo === "30dias") {
      const limite = new Date(hojeSemHora);

      limite.setDate(
        limite.getDate() - 30,
      );

      return dataSemHora >= limite;
    }

    return true;
  });

  const abertas =
    ordensFiltradas.filter(
      (o) => o.status === 0,
    ).length;

  const aguardando =
    ordensFiltradas.filter(
      (o) => o.status === 1,
    ).length;

  const concluidas =
    ordensFiltradas.filter(
      (o) => o.status === 4,
    ).length;

  const faturamento = ordensFiltradas
    .filter((o) => o.status === 4)
    .reduce(
      (sum, o) =>
        sum + (Number(o.valorTotal) || 0),
      0,
    );

  const recentes = [...ordensFiltradas]
    .sort(
      (a, b) =>
        new Date(b.dataCriacao).getTime() -
        new Date(a.dataCriacao).getTime(),
    )
    .slice(0, 6);

  const periodoLabel =
    periodo === "hoje"
      ? "Hoje"
      : periodo === "7dias"
        ? "Últimos 7 dias"
        : periodo === "30dias"
          ? "Últimos 30 dias"
          : "Todo o período";

  return (
    <div className="space-y-8">
      {/* =====================================================
          CABEÇALHO
      ====================================================== */}
      <section
        className="
          relative
          overflow-hidden
          border-b
          border-[var(--app-border-subtle)]
          pb-7
        "
      >
        {/* detalhe gráfico */}
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
                  Visão operacional
                </span>
              </div>

             

              <p
                className="
                  mt-2
                  max-w-xl
                  text-sm
                  leading-6
                  text-[var(--app-text-muted)]
                "
              >
                Acompanhe o movimento da oficina,
                os serviços em andamento e o
                faturamento do período.
              </p>
            </div>

            <div
              className="
                flex
                items-center
                gap-2
                self-start
                sm:self-auto
              "
            >
              <div
                className="
                  flex
                  items-center
                  gap-2
                  border
                  border-[var(--app-border-subtle)]
                  bg-[var(--app-surface-raised)]
                  px-3
                  py-2
                  text-xs
                  font-semibold
                  text-[var(--app-text-secondary)]
                "
              >
                <Activity className="h-3.5 w-3.5 text-[var(--accent-text)]" />

                {periodoLabel}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          DESTAQUE FINANCEIRO
      ====================================================== */}
      <section>
        <div
          className="
            grid
            overflow-hidden
            border
            border-[var(--app-border)]
            bg-[var(--app-surface)]
            lg:grid-cols-[1.25fr_0.75fr]
          "
        >
          {/* faturamento */}
          <div
            className="
              relative
              min-h-[230px]
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
                bottom-[-90px]
                right-[-60px]
                h-64
                w-64
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
                    OS concluídas · {periodoLabel}
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
                  <DollarSign className="h-5 w-5" />
                </div>
              </div>

              <div className="mt-10">
                <p
                  className="
                    font-display
                    text-4xl
                    font-extrabold
                    tracking-[-0.04em]
                    text-[var(--app-text)]
                    sm:text-5xl
                  "
                >
                  {formatCurrency(faturamento)}
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

                    {concluidas} concluída
                    {concluidas !== 1 ? "s" : ""}
                  </span>

                  <Link
                    to="/financeiro"
                    className="
                      inline-flex
                      items-center
                      gap-1.5
                      text-xs
                      font-semibold
                      text-[var(--accent-text)]
                      transition-colors
                      hover:text-[var(--accent-text-hover)]
                    "
                  >
                    Ver financeiro

                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* resumo operacional */}
          <div className="grid grid-cols-2">
            <Link
              to="/ordens-servico"
              className="
                group
                border-b
                border-r
                border-[var(--app-border-subtle)]
                p-5
                transition-colors
                hover:bg-[var(--hover-bg)]
                lg:border-b-0
              "
            >
              <div className="flex h-full flex-col justify-between">
                <div
                  className="
                    flex
                    h-9
                    w-9
                    items-center
                    justify-center
                    rounded-lg
                    bg-[var(--hover-bg-soft)]
                    text-[var(--accent-text)]
                  "
                >
                  <ClipboardList className="h-4 w-4" />
                </div>

                <div className="mt-8">
                  <p
                    className="
                      font-display
                      text-3xl
                      font-bold
                      text-[var(--app-text)]
                    "
                  >
                    {abertas}
                  </p>

                  <p
                    className="
                      mt-1
                      text-[10px]
                      font-bold
                      uppercase
                      tracking-[0.14em]
                      text-[var(--app-text-muted)]
                    "
                  >
                    OS abertas
                  </p>
                </div>

                <ArrowUpRight
                  className="
                    mt-4
                    h-4
                    w-4
                    text-[var(--app-text-faint)]
                    transition-colors
                    group-hover:text-[var(--accent-text)]
                  "
                />
              </div>
            </Link>

            <Link
              to="/ordens-servico"
              className="
                group
                border-b
                border-[var(--app-border-subtle)]
                p-5
                transition-colors
                hover:bg-[var(--hover-bg)]
                lg:border-b-0
              "
            >
              <div className="flex h-full flex-col justify-between">
                <div
                  className="
                    flex
                    h-9
                    w-9
                    items-center
                    justify-center
                    rounded-lg
                    bg-amber-500/10
                    text-amber-500
                  "
                >
                  <Clock3 className="h-4 w-4" />
                </div>

                <div className="mt-8">
                  <p
                    className="
                      font-display
                      text-3xl
                      font-bold
                      text-[var(--app-text)]
                    "
                  >
                    {aguardando}
                  </p>

                  <p
                    className="
                      mt-1
                      text-[10px]
                      font-bold
                      uppercase
                      tracking-[0.14em]
                      text-[var(--app-text-muted)]
                    "
                  >
                    Aguardando
                  </p>
                </div>

                <ArrowUpRight
                  className="
                    mt-4
                    h-4
                    w-4
                    text-[var(--app-text-faint)]
                    transition-colors
                    group-hover:text-amber-500
                  "
                />
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* =====================================================
          INDICADORES
      ====================================================== */}
      <section>
        <div className="mb-3 flex items-center justify-between">
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
              Estrutura
            </p>

            <h2
              className="
                mt-1
                font-display
                text-base
                font-bold
                text-[var(--app-text)]
              "
            >
              Base operacional
            </h2>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <Link
            to="/clientes"
            className="group"
          >
            <Card
              hover
              className="
                relative
                overflow-hidden
                p-5
                transition-transform
                duration-200
                group-hover:-translate-y-0.5
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
                    text-[var(--app-text-secondary)]
                    transition-colors
                    group-hover:text-[var(--accent-text)]
                  "
                >
                  <Users className="h-5 w-5" />
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

              <div className="mt-8">
                <p
                  className="
                    font-display
                    text-3xl
                    font-bold
                    tracking-tight
                    text-[var(--app-text)]
                  "
                >
                  {clientesCount}
                </p>

                <p
                  className="
                    mt-1
                    text-xs
                    font-semibold
                    uppercase
                    tracking-[0.12em]
                    text-[var(--app-text-muted)]
                  "
                >
                  Clientes cadastrados
                </p>
              </div>
            </Card>
          </Link>

          <Link
            to="/veiculos"
            className="group"
          >
            <Card
              hover
              className="
                relative
                overflow-hidden
                p-5
                transition-transform
                duration-200
                group-hover:-translate-y-0.5
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
                    text-[var(--app-text-secondary)]
                    transition-colors
                    group-hover:text-[var(--accent-text)]
                  "
                >
                  <Car className="h-5 w-5" />
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

              <div className="mt-8">
                <p
                  className="
                    font-display
                    text-3xl
                    font-bold
                    tracking-tight
                    text-[var(--app-text)]
                  "
                >
                  {veiculosCount}
                </p>

                <p
                  className="
                    mt-1
                    text-xs
                    font-semibold
                    uppercase
                    tracking-[0.12em]
                    text-[var(--app-text-muted)]
                  "
                >
                  Veículos cadastrados
                </p>
              </div>
            </Card>
          </Link>

          <Link
            to="/ordens-servico"
            className="group"
          >
            <Card
              hover
              className="
                relative
                overflow-hidden
                p-5
                transition-transform
                duration-200
                group-hover:-translate-y-0.5
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
                    text-[var(--app-text-secondary)]
                    transition-colors
                    group-hover:text-[var(--accent-text)]
                  "
                >
                  <TrendingUp className="h-5 w-5" />
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

              <div className="mt-8">
                <p
                  className="
                    font-display
                    text-3xl
                    font-bold
                    tracking-tight
                    text-[var(--app-text)]
                  "
                >
                  {ordensFiltradas.length}
                </p>

                <p
                  className="
                    mt-1
                    text-xs
                    font-semibold
                    uppercase
                    tracking-[0.12em]
                    text-[var(--app-text-muted)]
                  "
                >
                  Ordens no período
                </p>
              </div>
            </Card>
          </Link>
        </div>
      </section>

      {/* =====================================================
          ORDENS RECENTES
      ====================================================== */}
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
                  Operação
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
                Ordens de Serviço Recentes
              </h2>

              <p
                className="
                  mt-1
                  text-sm
                  text-[var(--app-text-muted)]
                "
              >
                Acompanhe os serviços mais recentes
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="w-full sm:w-44">
                <Select
                  value={periodo}
                  onChange={(e) =>
                    setPeriodo(e.target.value)
                  }
                >
                  <option value="todos">
                    Todos
                  </option>

                  <option value="hoje">
                    Hoje
                  </option>

                  <option value="7dias">
                    Últimos 7 dias
                  </option>

                  <option value="30dias">
                    Últimos 30 dias
                  </option>
                </Select>
              </div>

              <Link
                to="/ordens-servico"
                className="
                  inline-flex
                  items-center
                  justify-center
                  gap-1.5
                  text-sm
                  font-semibold
                  text-[var(--accent-text)]
                  transition-colors
                  hover:text-[var(--accent-text-hover)]
                "
              >
                Ver todas

                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {recentes.length === 0 ? (
            <EmptyState
              icon={
                <ClipboardList className="h-7 w-7" />
              }
              title="Nenhuma ordem de serviço"
              description="Crie a primeira ordem de serviço para começar."
              action={
                <Link
                  to="/ordens-servico"
                  className="
                    inline-flex
                    items-center
                    gap-1.5
                    text-sm
                    font-semibold
                    text-[var(--accent-text)]
                    transition-colors
                    hover:text-[var(--accent-text-hover)]
                  "
                >
                  Criar OS

                  <ArrowRight className="h-4 w-4" />
                </Link>
              }
            />
          ) : (
            <div
              className="
                divide-y
                divide-[var(--app-border-subtle)]
              "
            >
              {recentes.map((os, index) => (
                <Link
                  key={os.id}
                  to={`/ordens-servico/${os.id}`}
                  className="
                    group
                    grid
                    grid-cols-[auto_1fr_auto]
                    items-center
                    gap-4
                    px-5
                    py-4
                    transition-colors
                    duration-200
                    hover:bg-[var(--hover-bg)]
                  "
                >
                  {/* índice */}
                  <div
                    className="
                      hidden
                      w-8
                      text-[10px]
                      font-bold
                      tabular-nums
                      text-[var(--app-text-faint)]
                      sm:block
                    "
                  >
                    {String(index + 1).padStart(
                      2,
                      "0",
                    )}
                  </div>

                  {/* informação */}
                  <div className="min-w-0">
                    <div className="flex min-w-0 items-center gap-2">
                      <p
                        className="
                          truncate
                          text-sm
                          font-semibold
                          text-[var(--app-text)]
                        "
                      >
                        OS #
                        {os.numero ??
                          os.id.substring(0, 6)}
                      </p>

                      <ArrowUpRight
                        className="
                          h-3.5
                          w-3.5
                          shrink-0
                          text-[var(--app-text-faint)]
                          opacity-0
                          transition-all
                          group-hover:text-[var(--accent-text)]
                          group-hover:opacity-100
                        "
                      />
                    </div>

                    <p
                      className="
                        mt-1
                        truncate
                        text-xs
                        text-[var(--app-text-muted)]
                      "
                    >
                      {os.cliente?.nome ?? "—"} ·{" "}
                      {os.veiculo
                        ? `${os.veiculo.marca} ${os.veiculo.modelo}`
                        : "—"}
                    </p>
                  </div>

                  {/* status / data */}
                  <div
                    className="
                      flex
                      shrink-0
                      items-center
                      gap-3
                    "
                  >
                    <span
                      className="
                        hidden
                        text-xs
                        tabular-nums
                        text-[var(--app-text-muted)]
                        md:block
                      "
                    >
                      {formatDate(os.dataCriacao)}
                    </span>

                    <StatusBadge
                      status={os.status}
                    />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </Card>
      </section>
    </div>
  );
}

