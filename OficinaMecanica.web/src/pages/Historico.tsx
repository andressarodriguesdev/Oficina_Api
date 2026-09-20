
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Link } from "react-router-dom";
import {
  History,
  X,
  ArrowUpRight,
  Activity,
  ListFilter,
} from "lucide-react";

import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Select } from "../components/ui/Select";
import { StatusBadge } from "../components/ui/StatusBadge";
import { EmptyState } from "../components/ui/EmptyState";
import { PageLoader } from "../components/ui/Spinner";
import { useToast } from "../components/ui/Toast";

import {
  listHistorico,
  type HistoricoWithRelations,
} from "../services/historico";

import { listClientes } from "../services/clientes";
import { listVeiculos } from "../services/veiculos";

import type {
  Cliente,
  Veiculo,
} from "../types";

import { formatDate } from "../utils/format";

import {
  ALL_STATUSES,
  STATUS_LABEL,
  STATUS_TEXT_TO_NUMBER,
} from "../utils/status";

export function Historico() {
  const toast = useToast();

  const [rows, setRows] =
    useState<HistoricoWithRelations[]>([]);

  const [clientes, setClientes] =
    useState<Cliente[]>([]);

  const [veiculos, setVeiculos] =
    useState<Veiculo[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [filters, setFilters] = useState({
    clienteId: "",
    veiculoId: "",
    status: "",
    dataInicio: "",
    dataFim: "",
  });

  const load = useCallback(async () => {
    setLoading(true);

    try {
      const data = await listHistorico({
        clienteId:
          filters.clienteId || undefined,

        veiculoId:
          filters.veiculoId || undefined,

        status: filters.status
          ? Number(filters.status)
          : undefined,

        dataInicio: filters.dataInicio
          ? new Date(
              filters.dataInicio,
            ).toISOString()
          : undefined,

        dataFim: filters.dataFim
          ? new Date(
              filters.dataFim + "T23:59:59",
            ).toISOString()
          : undefined,
      });

      setRows(data);
    } catch (err) {
      toast.error(
        "Erro ao carregar histórico",
      );

      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filters, toast]);

  useEffect(() => {
    (async () => {
      try {
        const [c, v] = await Promise.all([
          listClientes(),
          listVeiculos(),
        ]);

        setClientes(c);
        setVeiculos(v);
      } catch (err) {
        console.error(err);
      }
    })();
  }, []);

  useEffect(() => {
    const debounce = setTimeout(
      load,
      300,
    );

    return () =>
      clearTimeout(debounce);
  }, [load]);

  const filteredVeiculos = useMemo(
    () =>
      filters.clienteId
        ? veiculos.filter(
            (v) =>
              v.clienteId ===
              filters.clienteId,
          )
        : veiculos,
    [veiculos, filters.clienteId],
  );

  const hasFilters = Object.values(
    filters,
  ).some((v) => v !== "");

  const clearFilters = () => {
    setFilters({
      clienteId: "",
      veiculoId: "",
      status: "",
      dataInicio: "",
      dataFim: "",
    });
  };

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
              Rastreabilidade
            </span>
          </div>

          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
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
                Histórico
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
                Consulte as alterações de status
                das ordens de serviço e acompanhe
                a evolução de cada atendimento.
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
                sm:self-auto
              "
            >
              <Activity
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
                  tabular-nums
                  text-[var(--app-text-secondary)]
                "
              >
                {rows.length} registro
                {rows.length !== 1
                  ? "s"
                  : ""}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* FILTROS */}

      <section>
        <Card className="overflow-hidden">
          <div
            className="
              flex
              flex-col
              gap-4
              border-b
              border-[var(--app-border-subtle)]
              px-5
              py-4
              sm:flex-row
              sm:items-center
              sm:justify-between
            "
          >
            <div className="flex items-center gap-3">
              <div
                className="
                  flex
                  h-9
                  w-9
                  items-center
                  justify-center
                  rounded-xl
                  bg-[var(--app-surface-raised)]
                  text-[var(--accent-text)]
                "
              >
                <ListFilter className="h-4 w-4" />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h2
                    className="
                      font-display
                      text-sm
                      font-bold
                      text-[var(--app-text)]
                    "
                  >
                    Filtros
                  </h2>

                  {hasFilters && (
                    <span
                      className="
                        inline-flex
                        h-5
                        min-w-5
                        items-center
                        justify-center
                        rounded-full
                        bg-[var(--hover-bg-soft)]
                        px-1.5
                        text-[10px]
                        font-bold
                        text-[var(--accent-text)]
                      "
                    >
                      ativos
                    </span>
                  )}
                </div>

                <p
                  className="
                    mt-0.5
                    text-xs
                    text-[var(--app-text-muted)]
                  "
                >
                  Refine os registros por cliente,
                  veículo, status ou período.
                </p>
              </div>
            </div>

            {hasFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
              >
                <X className="h-3.5 w-3.5" />
                Limpar filtros
              </Button>
            )}
          </div>

          <div className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-5">
            <Select
              label="Cliente"
              value={filters.clienteId}
              onChange={(e) =>
                setFilters((f) => ({
                  ...f,
                  clienteId:
                    e.target.value,
                  veiculoId: "",
                }))
              }
            >
              <option value="">
                Todos
              </option>

              {clientes.map((c) => (
                <option
                  key={c.id}
                  value={c.id}
                >
                  {c.nome}
                </option>
              ))}
            </Select>

            <Select
              label="Veículo"
              value={filters.veiculoId}
              onChange={(e) =>
                setFilters((f) => ({
                  ...f,
                  veiculoId:
                    e.target.value,
                }))
              }
            >
              <option value="">
                Todos
              </option>

              {filteredVeiculos.map((v) => (
                <option
                  key={v.id}
                  value={v.id}
                >
                  {v.marca} {v.modelo}
                  {v.placa
                    ? ` — ${v.placa}`
                    : ""}
                </option>
              ))}
            </Select>

            <Select
              label="Status"
              value={filters.status}
              onChange={(e) =>
                setFilters((f) => ({
                  ...f,
                  status:
                    e.target.value,
                }))
              }
            >
              <option value="">
                Todos
              </option>

              {ALL_STATUSES.map((s) => (
                <option
                  key={s}
                  value={
                    STATUS_TEXT_TO_NUMBER[s]
                  }
                >
                  {STATUS_LABEL[s]}
                </option>
              ))}
            </Select>

            <Input
              label="Data início"
              type="date"
              value={filters.dataInicio}
              onChange={(e) =>
                setFilters((f) => ({
                  ...f,
                  dataInicio:
                    e.target.value,
                }))
              }
            />

            <Input
              label="Data fim"
              type="date"
              value={filters.dataFim}
              onChange={(e) =>
                setFilters((f) => ({
                  ...f,
                  dataFim:
                    e.target.value,
                }))
              }
            />
          </div>
        </Card>
      </section>

      {/* RESULTADOS */}

      <section>
        <div
          className="
            mb-4
            flex
            flex-col
            gap-3
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
                Linha do tempo
              </p>
            </div>

            <h2
              className="
                mt-1
                font-display
                text-lg
                font-bold
                text-[var(--app-text)]
              "
            >
              Alterações registradas
            </h2>
          </div>

          {!loading && rows.length > 0 && (
            <div
              className="
                flex
                items-center
                gap-2
                text-xs
                text-[var(--app-text-muted)]
              "
            >
              <History className="h-3.5 w-3.5" />

              <span>
                {rows.length} registro
                {rows.length !== 1
                  ? "s"
                  : ""}{" "}
                encontrado
                {rows.length !== 1
                  ? "s"
                  : ""}
              </span>
            </div>
          )}
        </div>

        {loading ? (
          <Card>
            <PageLoader label="Carregando histórico..." />
          </Card>
        ) : rows.length === 0 ? (
          <Card>
            <EmptyState
              icon={
                <History className="h-7 w-7" />
              }
              title="Nenhum registro no histórico"
              description="As mudanças de status das ordens de serviço aparecerão aqui."
            />
          </Card>
        ) : (
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr
                    className="
                      border-b
                      border-[var(--app-border-subtle)]
                      text-left
                      text-[10px]
                      font-bold
                      uppercase
                      tracking-[0.14em]
                      text-[var(--app-text-muted)]
                    "
                  >
                    <th className="px-5 py-4">
                      OS
                    </th>

                    <th className="px-5 py-4">
                      Cliente
                    </th>

                    <th className="px-5 py-4">
                      Status anterior
                    </th>

                    <th className="px-5 py-4">
                      Novo status
                    </th>

                    <th className="px-5 py-4">
                      Data
                    </th>

                    <th className="px-5 py-4">
                      Observação
                    </th>
                  </tr>
                </thead>

                <tbody
                  className="
                    divide-y
                    divide-[var(--app-border-subtle)]
                  "
                >
                  {rows.map((h) => (
                    <tr
                      key={h.id}
                      className="
                        group
                        transition-colors
                        duration-200
                        hover:bg-[var(--hover-bg)]
                      "
                    >
                      {/* OS */}

                      <td className="px-5 py-4">
                        {h.ordem?.id ? (
                          <Link
                            to={`/ordens-servico/${h.ordem.id}`}
                            className="
                              inline-flex
                              items-center
                              gap-1.5
                              font-mono
                              text-xs
                              font-bold
                              text-[var(--app-text)]
                              transition-colors
                              hover:text-[var(--accent-text)]
                            "
                          >
                            #
                            {h.ordem.id
                              .slice(0, 8)
                              .toUpperCase()}

                            <ArrowUpRight
                              className="
                                h-3
                                w-3
                                text-[var(--app-text-faint)]
                                transition-colors
                                group-hover:text-[var(--accent-text)]
                              "
                            />
                          </Link>
                        ) : (
                          <span
                            className="
                              text-xs
                              text-[var(--app-text-faint)]
                            "
                          >
                            —
                          </span>
                        )}
                      </td>

                      {/* CLIENTE */}

                      <td className="px-5 py-4">
                        <p
                          className="
                            max-w-[220px]
                            truncate
                            text-sm
                            font-semibold
                            text-[var(--app-text)]
                          "
                        >
                          {h.ordem?.cliente
                            ?.nome ?? "—"}
                        </p>
                      </td>

                      {/* STATUS ANTERIOR */}

                      <td className="px-5 py-4">
                        {h.statusAnterior !==
                        null ? (
                          <StatusBadge
                            status={
                              h.statusAnterior
                            }
                          />
                        ) : (
                          <span
                            className="
                              text-xs
                              text-[var(--app-text-faint)]
                            "
                          >
                            —
                          </span>
                        )}
                      </td>

                      {/* NOVO STATUS */}

                      <td className="px-5 py-4">
                        <StatusBadge
                          status={
                            h.novoStatus
                          }
                        />
                      </td>

                      {/* DATA */}

                      <td className="px-5 py-4">
                        <p
                          className="
                            whitespace-nowrap
                            text-sm
                            tabular-nums
                            text-[var(--app-text-secondary)]
                          "
                        >
                          {formatDate(
                            h.dataAlteracao,
                          )}
                        </p>
                      </td>

                      {/* OBSERVAÇÃO */}

                      <td className="px-5 py-4">
                        <p
                          className="
                            max-w-[320px]
                            truncate
                            text-sm
                            text-[var(--app-text-muted)]
                          "
                          title={
                            h.observacao ??
                            undefined
                          }
                        >
                          {h.observacao ?? "—"}
                        </p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </section>
    </div>
  );
}

