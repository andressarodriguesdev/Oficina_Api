
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Car,
  Pencil,
  User,
  Calendar,
  Hash,
  UserX,
  UserCheck,
  ClipboardList,
  CheckCircle,
  DollarSign,
  Search,
  ArrowUpRight,
} from "lucide-react";

import { Card } from "../components/ui/Card";
import { formatCurrency } from "../utils/format";
import { Button } from "../components/ui/Button";
import { PageLoader } from "../components/ui/Spinner";
import { EmptyState } from "../components/ui/EmptyState";
import { Modal } from "../components/ui/Modal";
import { useToast } from "../components/ui/Toast";

import {
  VeiculoForm,
  type VeiculoFormValues,
} from "../components/forms/VeiculoForm";

import {
  getVeiculo,
  updateVeiculo,
  inativarVeiculo,
  reativarVeiculo,
} from "../services/veiculos";

import { listClientes } from "../services/clientes";

import type { Cliente, Veiculo } from "../types";

import { statusLabel } from "../utils/status";

export function VeiculoDetalhes() {
  const { id } = useParams<{ id: string }>();
  const toast = useToast();

  const [veiculo, setVeiculo] = useState<Veiculo | null>(null);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);

  const [editOpen, setEditOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [buscaOS, setBuscaOS] = useState("");

  useEffect(() => {
    if (!id) return;

    (async () => {
      try {
        const [v, c] = await Promise.all([
          getVeiculo(id),
          listClientes(),
        ]);

        setVeiculo(v);
        setClientes(c);
      } catch (err) {
        toast.error("Erro ao carregar veículo");
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, [id, toast]);

  const handleEdit = async (values: VeiculoFormValues) => {
    if (!id) return;

    setSubmitting(true);

    try {
      await updateVeiculo(id, {
        placa: values.placa,
        marca: values.marca,
        modelo: values.modelo,
        ano: values.ano,
      });

      toast.success("Veículo atualizado com sucesso");

      setEditOpen(false);

      const atualizado = await getVeiculo(id);
      setVeiculo(atualizado);
    } catch (err) {
      toast.error("Erro ao atualizar veículo");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleInativar = async () => {
    if (!id) return;

    try {
      await inativarVeiculo(id);

      toast.success("Veículo inativado com sucesso");

      const atualizado = await getVeiculo(id);
      setVeiculo(atualizado);
    } catch (err) {
      toast.error("Erro ao inativar veículo");
      console.error(err);
    }
  };

  const handleReativar = async () => {
    if (!id) return;

    try {
      await reativarVeiculo(id);

      toast.success("Veículo reativado com sucesso");

      const atualizado = await getVeiculo(id);
      setVeiculo(atualizado);
    } catch (err) {
      toast.error("Erro ao reativar veículo");
      console.error(err);
    }
  };

  if (loading) {
    return <PageLoader label="Carregando veículo..." />;
  }

  if (!veiculo) {
    return (
      <Card className="overflow-hidden">
        <EmptyState
          icon={<Car className="h-7 w-7" />}
          title="Veículo não encontrado"
          action={
            <Link to="/veiculos">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4" />
                Voltar
              </Button>
            </Link>
          }
        />
      </Card>
    );
  }

  const ordensServico = veiculo.ordensServico ?? [];

  const ordensConcluidas = ordensServico.filter(
    (os) => os.statusAtual === 4,
  );

  const ultimaVisita = [...ordensConcluidas].sort(
    (a, b) =>
      new Date(
        b.dataConclusao ?? b.dataCriacao,
      ).getTime() -
      new Date(
        a.dataConclusao ?? a.dataCriacao,
      ).getTime(),
  )[0];

  const diasSemVisita = ultimaVisita
    ? Math.floor(
        (Date.now() -
          new Date(
            ultimaVisita.dataConclusao ??
              ultimaVisita.dataCriacao,
          ).getTime()) /
          (1000 * 60 * 60 * 24),
      )
    : null;

  const busca = buscaOS.trim().toLowerCase();

  const ordensFiltradas = busca
    ? ordensServico.filter((os) => {
        const numeroOS =
          os.ordemServicoId.toLowerCase();

        const status = statusLabel(
          os.statusAtual,
        ).toLowerCase();

        return (
          numeroOS.includes(busca) ||
          status.includes(busca)
        );
      })
    : ordensServico.slice(0, 10);

  const cliente = clientes.find(
    (c) => c.id === veiculo.clienteId,
  );

  const info = [
    {
      icon: Hash,
      label: "Marca",
      value: veiculo.marca,
    },
    {
      icon: Car,
      label: "Modelo",
      value: veiculo.modelo,
    },
    {
      icon: Calendar,
      label: "Ano",
      value: veiculo.ano ?? "—",
    },
    {
      icon: Hash,
      label: "Placa",
      value: veiculo.placa || "—",
    },
  ];

  const totalGasto = ordensConcluidas.reduce(
    (total, os) => total + os.valorTotal,
    0,
  );

  return (
    <div className="space-y-7">
      {/* CABEÇALHO */}
      <section className="border-b border-[var(--app-border-subtle)] pb-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Link
              to="/veiculos"
              className="mb-4 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--app-text-muted)] transition-colors hover:text-[var(--accent-text)]"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Veículos
            </Link>

            <div className="flex flex-wrap items-center gap-3">
              <h1 className="font-display text-3xl font-bold tracking-tight text-[var(--app-text)] sm:text-4xl">
                {veiculo.marca} {veiculo.modelo}
              </h1>

              <span
                className={[
                  "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold",
                  veiculo.ativo
                    ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-500"
                    : "border-red-500/25 bg-red-500/10 text-red-500",
                ].join(" ")}
              >
                {veiculo.ativo
                  ? "Ativo"
                  : "Inativo"}
              </span>
            </div>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--app-text-muted)]">
              Informações do veículo, histórico de
              atendimentos e relacionamento com o
              proprietário.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditOpen(true)}
            >
              <Pencil className="h-4 w-4" />
              Editar
            </Button>

            {veiculo.ativo ? (
              <Button
                variant="danger"
                size="sm"
                onClick={handleInativar}
              >
                <UserX className="h-4 w-4" />
                Inativar
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={handleReativar}
              >
                <UserCheck className="h-4 w-4" />
                Reativar
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* IDENTIDADE DO VEÍCULO */}
      <Card className="overflow-hidden">
        <div className="grid lg:grid-cols-[auto_minmax(0,1fr)]">
          <div className="flex min-h-44 items-center justify-center border-b border-[var(--app-border-subtle)] bg-[var(--app-surface-raised)] px-8 py-8 lg:min-h-full lg:w-48 lg:border-b-0 lg:border-r">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] text-[var(--accent-text)]">
              <Car className="h-10 w-10" />
            </div>
          </div>

          <div className="p-5 sm:p-6 lg:p-7">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--app-text-faint)]">
                  Identificação
                </p>

                <p className="mt-1 font-mono text-xs text-[var(--app-text-muted)]">
                  VEÍCULO /{" "}
                  {veiculo.id
                    .slice(0, 8)
                    .toUpperCase()}
                </p>
              </div>

              {veiculo.placa && (
                <span className="rounded-md border border-[var(--app-border)] bg-[var(--app-surface-raised)] px-3 py-1.5 font-mono text-sm font-bold tracking-widest text-[var(--app-text)]">
                  {veiculo.placa}
                </span>
              )}
            </div>

            <div className="grid gap-px overflow-hidden rounded-xl border border-[var(--app-border-subtle)] bg-[var(--app-border-subtle)] sm:grid-cols-2 lg:grid-cols-4">
              {info.map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.label}
                    className="bg-[var(--app-surface)] px-4 py-4"
                  >
                    <Icon className="h-4 w-4 text-[var(--app-text-muted)]" />

                    <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--app-text-faint)]">
                      {item.label}
                    </p>

                    <p className="mt-1 text-sm font-semibold text-[var(--app-text)]">
                      {item.value}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </Card>

      {/* MÉTRICAS */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--app-text-faint)]">
            Histórico operacional
          </p>

          <span className="font-mono text-[10px] text-[var(--app-text-faint)]">
            MÉTRICAS
          </span>
        </div>

        <div className="grid gap-px overflow-hidden rounded-xl border border-[var(--app-border-subtle)] bg-[var(--app-border-subtle)] sm:grid-cols-3">
          <div className="bg-[var(--app-surface)] p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--app-text-faint)]">
                  Ordens de serviço
                </p>

                <p className="mt-2 font-display text-3xl font-bold text-[var(--app-text)]">
                  {ordensServico.length}
                </p>
              </div>

              <ClipboardList className="h-5 w-5 text-sky-400" />
            </div>
          </div>

          <div className="bg-[var(--app-surface)] p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--app-text-faint)]">
                  Concluídas
                </p>

                <p className="mt-2 font-display text-3xl font-bold text-[var(--app-text)]">
                  {ordensConcluidas.length}
                </p>
              </div>

              <CheckCircle className="h-5 w-5 text-emerald-400" />
            </div>
          </div>

          <div className="bg-[var(--app-surface)] p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--app-text-faint)]">
                  Total gasto
                </p>

                <p className="mt-2 font-display text-2xl font-bold text-[var(--app-text)]">
                  {formatCurrency(totalGasto)}
                </p>
              </div>

              <DollarSign className="h-5 w-5 text-emerald-400" />
            </div>
          </div>
        </div>
      </section>

      {/* CONTEXTO */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* ÚLTIMA VISITA */}
        <Card className="p-5 sm:p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-amber-500/20 bg-amber-500/10 text-amber-400">
              <Calendar className="h-5 w-5" />
            </div>

            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--app-text-faint)]">
                Última visita
              </p>

              {ultimaVisita ? (
                <>
                  <p className="mt-2 font-display text-xl font-bold text-[var(--app-text)]">
                    {diasSemVisita === 0
                      ? "Hoje"
                      : `Há ${diasSemVisita} dias`}
                  </p>

                  <p className="mt-1 text-sm text-[var(--app-text-muted)]">
                    Última OS concluída em{" "}
                    {new Date(
                      ultimaVisita.dataConclusao ??
                        ultimaVisita.dataCriacao,
                    ).toLocaleDateString(
                      "pt-BR",
                    )}
                  </p>
                </>
              ) : (
                <p className="mt-2 text-sm text-[var(--app-text-muted)]">
                  Nenhuma OS concluída encontrada.
                </p>
              )}
            </div>
          </div>
        </Card>

        {/* CLIENTE */}
        <Card className="p-5 sm:p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-sky-500/20 bg-sky-500/10 text-sky-400">
              <User className="h-5 w-5" />
            </div>

            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--app-text-faint)]">
                Cliente proprietário
              </p>

              {cliente ? (
                <Link
                  to={`/clientes/${cliente.id}`}
                  className="mt-2 flex items-center gap-2 font-display text-xl font-bold text-[var(--app-text)] transition-colors hover:text-[var(--accent-text)]"
                >
                  <span className="truncate">
                    {cliente.nome}
                  </span>

                  <ArrowUpRight className="h-4 w-4 shrink-0 text-[var(--app-text-muted)]" />
                </Link>
              ) : (
                <p className="mt-2 font-display text-xl font-bold text-[var(--app-text-muted)]">
                  Sem proprietário
                </p>
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* ORDENS DE SERVIÇO */}
      <Card className="overflow-hidden">
        <div className="border-b border-[var(--app-border-subtle)] px-5 py-5 sm:px-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--accent-text)]">
                Rastreamento
              </p>

              <h2 className="mt-1 font-display text-xl font-bold text-[var(--app-text)]">
                Ordens de serviço
              </h2>

              <p className="mt-1 text-sm text-[var(--app-text-muted)]">
                {ordensServico.length}{" "}
                {ordensServico.length === 1
                  ? "atendimento registrado"
                  : "atendimentos registrados"}
              </p>
            </div>

            {ordensServico.length > 10 && (
              <div className="relative w-full sm:w-72">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--app-text-muted)]" />

                <input
                  type="text"
                  value={buscaOS}
                  onChange={(e) =>
                    setBuscaOS(e.target.value)
                  }
                  placeholder="Buscar OS ou status..."
                  className="input-base w-full pl-9"
                />
              </div>
            )}
          </div>
        </div>

        {ordensServico.length === 0 ? (
          <EmptyState
            icon={<ClipboardList className="h-7 w-7" />}
            title="Nenhuma ordem de serviço"
            description="Este veículo ainda não possui ordens de serviço."
          />
        ) : ordensFiltradas.length === 0 ? (
          <EmptyState
            icon={<Search className="h-7 w-7" />}
            title="Nenhuma OS encontrada"
            description="Tente pesquisar por outro número de OS ou status."
          />
        ) : (
          <div className="grid gap-px bg-[var(--app-border-subtle)] sm:grid-cols-2">
            {ordensFiltradas.map((os) => (
              <Link
                key={os.ordemServicoId}
                to={`/ordens-servico/${os.ordemServicoId}`}
                className="group bg-[var(--app-surface)] p-5 transition-colors hover:bg-[var(--hover-bg)]"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-mono text-xs font-bold text-[var(--accent-text)]">
                        OS #
                        {os.ordemServicoId.slice(-4)}
                      </p>

                      <ArrowUpRight className="h-3.5 w-3.5 text-[var(--app-text-faint)] transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[var(--app-text-muted)]" />
                    </div>

                    <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--app-text-faint)]">
                      Status
                    </p>

                    <p className="mt-1 text-sm font-semibold text-[var(--app-text)]">
                      {statusLabel(os.statusAtual)}
                    </p>
                  </div>

                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[var(--app-border)] bg-[var(--app-surface-raised)] text-sky-400 transition-colors group-hover:border-sky-400/30">
                    <ClipboardList className="h-5 w-5" />
                  </div>
                </div>

                <div className="mt-6 flex items-end justify-between gap-4 border-t border-[var(--app-border-subtle)] pt-4">
                  <div>
                    {os.dataConclusao ? (
                      <>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--app-text-faint)]">
                          Conclusão
                        </p>

                        <p className="mt-1 text-xs text-[var(--app-text-muted)]">
                          {new Date(
                            os.dataConclusao,
                          ).toLocaleDateString(
                            "pt-BR",
                          )}
                        </p>
                      </>
                    ) : (
                      <p className="text-xs text-[var(--app-text-faint)]">
                        Atendimento em andamento
                      </p>
                    )}
                  </div>

                  <p className="font-display text-lg font-bold text-emerald-400">
                    {formatCurrency(
                      os.valorTotal,
                    )}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}

        {ordensServico.length > 10 && !buscaOS && (
          <div className="border-t border-[var(--app-border-subtle)] px-5 py-3">
            <p className="text-center text-xs text-[var(--app-text-faint)]">
              Exibindo as 10 ordens mais recentes.
              Use a busca para encontrar outras OS.
            </p>
          </div>
        )}
      </Card>

      {/* MODAL DE EDIÇÃO */}
      <Modal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title="Editar veículo"
        description="Atualize os dados do veículo."
        size="lg"
      >
        <VeiculoForm
          initial={veiculo}
          clientes={clientes}
          onSubmit={handleEdit}
          onCancel={() => setEditOpen(false)}
          submitting={submitting}
        />
      </Modal>
    </div>
  );
}

