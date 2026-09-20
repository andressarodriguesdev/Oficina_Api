
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Phone,
  Mail,
  Car,
  ClipboardList,
  Pencil,
  UserX,
  UserCheck,
  Plus,
  User,
  ArrowUpRight,
} from "lucide-react";

import { Card, CardHeader } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { PageLoader } from "../components/ui/Spinner";
import { EmptyState } from "../components/ui/EmptyState";
import { Modal } from "../components/ui/Modal";
import { useToast } from "../components/ui/Toast";

import {
  ClienteForm,
  type ClienteFormValues,
} from "../components/forms/ClienteForm";

import {
  getCliente,
  updateCliente,
  inativarCliente,
  reativarCliente,
  getHistoricoCliente,
} from "../services/clientes";

import type {
  ClienteDetalhado,
  VeiculoResumo,
  ClienteHistorico,
} from "../types";

import { initials, formatCurrency } from "../utils/format";
import { statusLabel } from "../utils/status";

export function ClienteDetalhes() {
  const { id } = useParams<{ id: string }>();
  const toast = useToast();

  const [cliente, setCliente] =
    useState<ClienteDetalhado | null>(null);

  const [veiculos, setVeiculos] =
    useState<VeiculoResumo[]>([]);

  const [historico, setHistorico] =
    useState<ClienteHistorico[]>([]);

  const quantidadeOS = historico.length;

  const totalPago = historico
    .filter((os) => os.statusAtual === 4)
    .reduce(
      (total, os) => total + os.valorTotal,
      0,
    );

  /*
   * Mantém somente as 10 OS mais recentes
   * para exibição na tela de detalhes.
   */
  const ultimasOS = historico
    .slice()
    .sort((a, b) => {
      const dataA =
        a.historicos[0]?.dataAlteracao;

      const dataB =
        b.historicos[0]?.dataAlteracao;

      return (
        new Date(dataB ?? 0).getTime() -
        new Date(dataA ?? 0).getTime()
      );
    })
    .slice(0, 10);

  const [loading, setLoading] =
    useState(true);

  const [editOpen, setEditOpen] =
    useState(false);

  const [submitting, setSubmitting] =
    useState(false);

  useEffect(() => {
    if (!id) return;

    (async () => {
      try {
        const detalhe = await getCliente(id);

        setCliente(detalhe);
        setVeiculos(detalhe?.veiculos ?? []);

        const historicoCliente =
          await getHistoricoCliente(id);

        setHistorico(historicoCliente);
      } catch (err) {
        toast.error("Erro ao carregar cliente");
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, [id, toast]);

  const handleEdit = async (
    values: ClienteFormValues,
  ) => {
    if (!id) return;

    setSubmitting(true);

    try {
      await updateCliente(id, values);

      toast.success(
        "Cliente atualizado com sucesso",
      );

      setEditOpen(false);

      const atualizado = await getCliente(id);

      setCliente(atualizado);
      setVeiculos(atualizado?.veiculos ?? []);
    } catch (err) {
      toast.error("Erro ao atualizar cliente");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleInativar = async () => {
    if (!id) return;

    try {
      await inativarCliente(id);

      toast.success(
        "Cliente inativado com sucesso",
      );

      const atualizado = await getCliente(id);

      setCliente(atualizado);
    } catch (err) {
      toast.error("Erro ao inativar cliente");
      console.error(err);
    }
  };

  const handleReativar = async () => {
    if (!id) return;

    try {
      await reativarCliente(id);

      toast.success(
        "Cliente reativado com sucesso",
      );

      const atualizado = await getCliente(id);

      setCliente(atualizado);
    } catch (err) {
      toast.error("Erro ao reativar cliente");
      console.error(err);
    }
  };

  if (loading) {
    return (
      <PageLoader label="Carregando cliente..." />
    );
  }

  if (!cliente) {
    return (
      <Card>
        <EmptyState
          icon={<User className="h-7 w-7" />}
          title="Cliente não encontrado"
          action={
            <Link to="/clientes">
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

  return (
    <div className="space-y-7">
      {/* =================================================
          HEADER
          ================================================= */}

      <section className="border-b border-[var(--app-border-subtle)] pb-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Link
              to="/clientes"
              className="
                mb-4
                inline-flex
                items-center
                gap-2
                text-xs
                font-semibold
                text-[var(--app-text-muted)]
                transition-colors
                hover:text-[var(--accent-text)]
              "
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Clientes
            </Link>

            <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--accent-text)]">
              Perfil do cliente
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <h1 className="font-display text-2xl font-black tracking-tight text-[var(--app-text)] sm:text-3xl">
                {cliente.nome}
              </h1>

              {cliente.ativo ? (
                <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-emerald-500 dark:text-emerald-300">
                  Ativo
                </span>
              ) : (
                <span className="rounded-full border border-red-500/20 bg-red-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-red-500 dark:text-red-300">
                  Inativo
                </span>
              )}
            </div>

            <p className="mt-2 text-sm text-[var(--app-text-muted)]">
              Dados cadastrais e histórico de atendimento.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditOpen(true)}
            >
              <Pencil className="h-4 w-4" />
              Editar
            </Button>

            {cliente.ativo ? (
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

      {/* =================================================
          CLIENT PROFILE
          ================================================= */}

      <Card className="p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
          <div
            className="
              flex
              h-16
              w-16
              shrink-0
              items-center
              justify-center
              rounded-2xl
              bg-[var(--app-surface-raised)]
              text-xl
              font-bold
              text-[var(--accent-text)]
            "
          >
            {initials(cliente.nome)}
          </div>

          <div className="min-w-0 flex-1">
            <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--app-text-faint)]">
              Informações de contato
            </p>

            <h2 className="font-display text-xl font-bold text-[var(--app-text)]">
              {cliente.nome}
            </h2>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div
                className="
                  flex
                  min-w-0
                  items-center
                  gap-2.5
                  text-sm
                  text-[var(--app-text-secondary)]
                "
              >
                <Phone className="h-4 w-4 shrink-0 text-[var(--app-text-muted)]" />

                <span className="truncate">
                  {cliente.telefone || "—"}
                </span>
              </div>

              <div
                className="
                  flex
                  min-w-0
                  items-center
                  gap-2.5
                  text-sm
                  text-[var(--app-text-secondary)]
                "
              >
                <Mail className="h-4 w-4 shrink-0 text-[var(--app-text-muted)]" />

                <span className="truncate">
                  {cliente.email || "—"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* =================================================
          SUMMARY
          ================================================= */}

      <div className="grid gap-px overflow-hidden border border-[var(--app-border-subtle)] bg-[var(--app-border-subtle)] lg:grid-cols-3">
        <div className="bg-[var(--app-surface)] p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--app-text-muted)]">
                Veículos
              </p>

              <p className="mt-2 font-display text-3xl font-black tracking-tight text-[var(--app-text)]">
                {veiculos.length}
              </p>

              <p className="mt-1 text-xs text-[var(--app-text-faint)]">
                cadastrados
              </p>
            </div>

            <div
              className="
                flex
                h-11
                w-11
                items-center
                justify-center
                rounded-xl
                bg-[var(--app-surface-raised)]
                text-[var(--accent-text)]
              "
            >
              <Car className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div className="bg-[var(--app-surface)] p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--app-text-muted)]">
                Ordens de serviço
              </p>

              <p className="mt-2 font-display text-3xl font-black tracking-tight text-[var(--app-text)]">
                {quantidadeOS}
              </p>

              <p className="mt-1 text-xs text-[var(--app-text-faint)]">
                atendimentos registrados
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-500/10 text-sky-500 dark:text-sky-400">
              <ClipboardList className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div className="bg-[var(--app-surface)] p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--app-text-muted)]">
                Total pago
              </p>

              <p className="mt-2 font-display text-2xl font-black tracking-tight text-[var(--app-text)] sm:text-3xl">
                {formatCurrency(totalPago)}
              </p>

              <p className="mt-1 text-xs text-[var(--app-text-faint)]">
                ordens concluídas
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500 dark:text-emerald-400">
              <ClipboardList className="h-5 w-5" />
            </div>
          </div>
        </div>
      </div>

      {/* =================================================
          VEHICLES
          ================================================= */}

      <Card>
        <CardHeader
          title="Veículos do cliente"
          subtitle={`${veiculos.length} veículo(s)`}
          action={
            <Link to="/veiculos">
              <Button variant="ghost" size="sm">
                <Plus className="h-4 w-4" />
                Novo
              </Button>
            </Link>
          }
        />

        {veiculos.length === 0 ? (
          <EmptyState
            icon={<Car className="h-7 w-7" />}
            title="Nenhum veículo"
            description="Este cliente ainda não possui veículos cadastrados."
            action={
              <Link to="/veiculos">
                <Button variant="outline" size="sm">
                  <Plus className="h-4 w-4" />
                  Cadastrar veículo
                </Button>
              </Link>
            }
          />
        ) : (
          <div className="divide-y divide-[var(--app-border-subtle)]">
            {veiculos.map((v) => (
              <Link
                key={v.id}
                to={`/veiculos/${v.id}`}
                className="
                  group
                  flex
                  items-center
                  justify-between
                  gap-4
                  px-5
                  py-4
                  transition-colors
                  hover:bg-[var(--hover-bg)]
                "
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div
                    className="
                      flex
                      h-10
                      w-10
                      shrink-0
                      items-center
                      justify-center
                      rounded-lg
                      bg-[var(--app-surface-raised)]
                      text-[var(--app-text-secondary)]
                      transition-colors
                      group-hover:text-[var(--accent-text)]
                    "
                  >
                    <Car className="h-5 w-5" />
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-[var(--app-text)]">
                      {v.marca} {v.modelo}
                    </p>

                    <p className="mt-0.5 text-xs text-[var(--app-text-muted)]">
                      {v.placa || "Sem placa"}
                    </p>
                  </div>
                </div>

                <ArrowUpRight className="h-4 w-4 shrink-0 text-[var(--app-text-faint)] transition-colors group-hover:text-[var(--accent-text)]" />
              </Link>
            ))}
          </div>
        )}
      </Card>

      {/* =================================================
          SERVICE HISTORY
          ================================================= */}

      <Card>
        <CardHeader
          title="Últimas Ordens de Serviço"
          subtitle={
            historico.length > 10
              ? `Exibindo as 10 mais recentes de ${historico.length} atendimento(s)`
              : `${historico.length} atendimento(s)`
          }
        />

        {historico.length === 0 ? (
          <EmptyState
            icon={
              <ClipboardList className="h-7 w-7" />
            }
            title="Nenhuma ordem de serviço"
            description="Este cliente ainda não possui ordens de serviço."
          />
        ) : (
          <div className="grid gap-px bg-[var(--app-border-subtle)] md:grid-cols-2">
            {ultimasOS.map((os) => {
              const ultimoHistorico =
                os.historicos[0];

              const statusAtual =
                ultimoHistorico?.novoStatus ?? 0;

              const dataUltimaAtualizacao =
                ultimoHistorico?.dataAlteracao;

              return (
                <Link
                  key={os.ordemServicoId}
                  to={`/ordens-servico/${os.ordemServicoId}`}
                  className="
                    group
                    bg-[var(--app-surface)]
                    p-5
                    transition-colors
                    hover:bg-[var(--app-surface-hover)]
                  "
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--app-text-faint)]">
                        Ordem de serviço
                      </p>

                      <p className="mt-1 font-display text-lg font-black text-[var(--app-text)]">
                        OS #{os.ordemServicoId.slice(-4)}
                      </p>
                    </div>

                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-500/10 text-sky-500 dark:text-sky-400">
                      <ClipboardList className="h-4 w-4" />
                    </div>
                  </div>

                  <div className="mt-5 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--app-text-faint)]">
                        Status
                      </p>

                      <p className="mt-1 text-sm font-semibold text-[var(--app-text-secondary)]">
                        {statusLabel(statusAtual)}
                      </p>
                    </div>

                    <ArrowUpRight className="h-4 w-4 text-[var(--app-text-faint)] transition-colors group-hover:text-[var(--accent-text)]" />
                  </div>

                  {dataUltimaAtualizacao && (
                    <div className="mt-5 border-t border-[var(--app-border-subtle)] pt-3">
                      <p className="text-xs text-[var(--app-text-muted)]">
                        Última atualização:{" "}
                        <span className="font-medium text-[var(--app-text-secondary)]">
                          {new Date(
                            dataUltimaAtualizacao,
                          ).toLocaleDateString(
                            "pt-BR",
                          )}
                        </span>
                      </p>
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </Card>

      {/* =================================================
          EDIT MODAL
          ================================================= */}

      <Modal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title="Editar cliente"
        description="Atualize os dados do cliente."
        size="lg"
      >
        <ClienteForm
          initial={cliente}
          onSubmit={handleEdit}
          onCancel={() => setEditOpen(false)}
          submitting={submitting}
        />
      </Modal>
    </div>
  );
}
