import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Plus,
  ClipboardList,
  Search,
  Pencil,
  Trash2,
  Eye,
  FileText,
  ArrowUpRight,
} from "lucide-react";
import { ApiError } from "../services/api";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Select } from "../components/ui/Select";
import { StatusBadge } from "../components/ui/StatusBadge";
import { Modal } from "../components/ui/Modal";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { EmptyState } from "../components/ui/EmptyState";
import { PageLoader } from "../components/ui/Spinner";
import { useToast } from "../components/ui/Toast";

import {
  OrdemServicoForm,
  type OrdemFormValues,
} from "../components/forms/OrdemServicoForm";

import {
  listOrdens,
  createOrdem,
  deleteOrdem,
  enviarAprovacao,
  type OrdemWithRelations,
} from "../services/ordens";

import { listClientes } from "../services/clientes";
import { listVeiculos } from "../services/veiculos";
import { listMecanico } from "../services/mecanico";

import type { Cliente, Veiculo, Mecanico } from "../types";

import { formatDate, formatCurrency } from "../utils/format";

import {
  ALL_STATUSES,
  STATUS_LABEL,
  STATUS_TEXT_TO_NUMBER,
} from "../utils/status";

import { buildWhatsAppMessage, whatsappUrl } from "../utils/whatsapp";

export function OrdensServico() {
  const toast = useToast();
  const navigate = useNavigate();

  const [ordens, setOrdens] = useState<OrdemWithRelations[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [mecanicos, setMecanicos] = useState<Mecanico[]>([]);

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [toDelete, setToDelete] = useState<OrdemWithRelations | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);

    try {
      const [o, c, v, m] = await Promise.all([
        listOrdens(),
        listClientes(),
        listVeiculos(),
        listMecanico(),
      ]);

      const ordensComRelacionamento = o.map((os) => ({
        ...os,
        cliente: c.find((cliente) => cliente.id === os.clienteId) ?? null,
        veiculo: v.find((veiculo) => veiculo.id === os.veiculoId) ?? null,
        mecanico: m.find((mecanico) => mecanico.id === os.mecanicoId) ?? null,
      }));

      setOrdens(ordensComRelacionamento);
      setClientes(c);
      setVeiculos(v);
      setMecanicos(m);
    } catch (err) {
      toast.error("Erro ao carregar ordens de serviço");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    return ordens.filter((o) => {
      if (statusFilter && o.status !== Number(statusFilter)) {
        return false;
      }

      if (!q) {
        return true;
      }

      return (
        o.descricao.toLowerCase().includes(q) ||
        (o.cliente?.nome ?? "").toLowerCase().includes(q) ||
        (o.veiculo ? `${o.veiculo.marca} ${o.veiculo.modelo}` : "")
          .toLowerCase()
          .includes(q) ||
        (o.veiculo?.placa ?? "").toLowerCase().includes(q)
      );
    });
  }, [ordens, search, statusFilter]);

const handleCreate = async (values: OrdemFormValues) => {
  setSubmitting(true);

  try {
    const totalItens = values.itens.reduce(
      (s, it) => s + (it.valorTotal || 0),
      0,
    );

    const valorTotal = Number(
      (values.valorMaoObra + totalItens).toFixed(2),
    );

    await createOrdem({
      clienteId: values.clienteId,
      veiculoId: values.veiculoId,
      mecanicoId: values.mecanicoId,
      descricao: values.descricao,
      valorMaoObra: values.valorMaoObra,
      valorTotal,
      observacao: values.observacao || null,
      itens: values.itens.filter(
        (it) => it.descricao.trim() !== "",
      ),
    });

    toast.success(
      "Ordem de serviço criada com sucesso",
    );

    setModalOpen(false);

    await load();
  } catch (err) {
    console.error(
      "Erro ao criar ordem de serviço:",
      err,
    );

    if (err instanceof ApiError) {
      toast.error(err.message);
    } else if (
      err instanceof Error &&
      err.message
    ) {
      toast.error(err.message);
    } else {
      toast.error(
        "Erro ao criar ordem de serviço",
      );
    }
  } finally {
    setSubmitting(false);
  }
};

  const handleDelete = async () => {
    if (!toDelete) return;

    setDeleting(true);

    try {
      await deleteOrdem(toDelete.id);

      toast.success("Ordem de serviço excluída com sucesso");

      setToDelete(null);

      await load();
    } catch (err) {
      toast.error("Erro ao excluir ordem de serviço");
      console.error(err);
    } finally {
      setDeleting(false);
    }
  };

  const handleEnviarAprovacao = async (os: OrdemWithRelations) => {
    try {
      await enviarAprovacao(os.id);

      toast.success("OS enviada para aprovação");

      await load();

      if (os.cliente?.telefone) {
        const fresh = (await listOrdens()).find((o) => o.id === os.id) ?? os;

        const msg = buildWhatsAppMessage(fresh, os.cliente, os.veiculo);

        window.open(whatsappUrl(os.cliente.telefone, msg), "_blank");
      }
    } catch (err) {
      toast.error("Erro ao enviar para aprovação");
      console.error(err);
    }
  };

  const hasFilters = Boolean(search.trim() || statusFilter);

  return (
    <div className="space-y-7">
      {/* CABEÇALHO EDITORIAL */}
      <section className="border-b border-[var(--app-border-subtle)] pb-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent-text)]">
              <ClipboardList className="h-3.5 w-3.5" />
              Operação
            </div>

            <h1 className="font-display text-3xl font-bold tracking-tight text-[var(--app-text)] sm:text-4xl">
              Ordens de serviço
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--app-text-muted)]">
              Controle os atendimentos, acompanhe o status das OS e mantenha o
              histórico da oficina organizado.
            </p>
          </div>

          <Button onClick={() => setModalOpen(true)}>
            <Plus className="h-4 w-4" />
            Nova OS
          </Button>
        </div>
      </section>

      {/* CONTROLES */}
      <section className="border-b border-[var(--app-border-subtle)] pb-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-1 flex-col gap-3 sm:flex-row">
            <div className="relative w-full sm:max-w-sm">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--app-text-muted)]" />

              <Input
                placeholder="Buscar cliente, veículo ou OS..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            <div className="w-full sm:w-56">
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full"
              >
                <option value="">Todos os status</option>

                {ALL_STATUSES.map((s) => (
                  <option key={s} value={STATUS_TEXT_TO_NUMBER[s]}>
                    {STATUS_LABEL[s]}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-[var(--app-text-muted)]">
            <span className="font-mono text-sm font-semibold text-[var(--app-text)]">
              {filtered.length}
            </span>
            <span>
              {filtered.length === 1
                ? "ordem encontrada"
                : "ordens encontradas"}
            </span>
          </div>
        </div>
      </section>

      {/* CONTEÚDO */}
      {loading ? (
        <PageLoader label="Carregando ordens de serviço..." />
      ) : filtered.length === 0 ? (
        <Card className="overflow-hidden">
          <EmptyState
            icon={<ClipboardList className="h-7 w-7" />}
            title={
              hasFilters ? "Nenhuma OS encontrada" : "Nenhuma ordem de serviço"
            }
            description={
              hasFilters
                ? "Ajuste os filtros ou tente outra busca."
                : "Crie a primeira ordem de serviço da oficina."
            }
            action={
              !hasFilters ? (
                <Button onClick={() => setModalOpen(true)}>
                  <Plus className="h-4 w-4" />
                  Criar OS
                </Button>
              ) : undefined
            }
          />
        </Card>
      ) : (
        <>
          {/* DESKTOP */}
          <div className="hidden lg:block">
            <Card className="overflow-hidden">
              {/* CABEÇALHO DA LISTA */}
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-6 border-b border-[var(--app-border-subtle)] px-5 py-4">
                <div>
                  <h2 className="font-display text-base font-bold text-[var(--app-text)]">
                    Atendimentos registrados
                  </h2>

                  <p className="mt-0.5 text-sm text-[var(--app-text-muted)]">
                    Histórico operacional da oficina
                  </p>
                </div>

                <span className="font-mono text-xs text-[var(--app-text-faint)]">
                  {filtered.length.toString().padStart(2, "0")} REGISTROS
                </span>
              </div>

              {/* LISTA */}
              <div className="divide-y divide-[var(--app-border-subtle)]">
                {filtered.map((os) => (
                  <div
                    key={os.id}
                    onClick={() => navigate(`/ordens-servico/${os.id}`)}
                    className="group grid cursor-pointer grid-cols-[minmax(0,1fr)_auto] items-center gap-6 px-5 py-4 transition-colors hover:bg-[var(--hover-bg)]"
                  >
                    {/* IDENTIDADE */}
                    <div className="min-w-0">
                      <div className="flex items-center gap-3">
                        <Link
                          to={`/ordens-servico/${os.id}`}
                          onClick={(e) => e.stopPropagation()}
                          className="shrink-0 font-mono text-xs font-semibold text-[var(--accent-text)] transition-colors hover:text-[var(--accent-text-hover)]"
                        >
                          #{os.id.slice(0, 8).toUpperCase()}
                        </Link>

                        <span className="text-[var(--app-text-faint)]">/</span>

                        <p className="truncate text-sm font-semibold text-[var(--app-text)]">
                          {os.cliente?.nome ?? "Cliente não informado"}
                        </p>
                      </div>

                      <div className="mt-1 flex min-w-0 items-center gap-2 text-xs text-[var(--app-text-muted)]">
                        <span className="truncate">
                          {os.veiculo
                            ? `${os.veiculo.marca} ${os.veiculo.modelo}`
                            : "Veículo não informado"}
                        </span>

                        {os.veiculo?.placa && (
                          <>
                            <span className="text-[var(--app-text-faint)]">
                              ·
                            </span>

                            <span className="font-mono">
                              {os.veiculo.placa}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* META */}
                    <div className="flex shrink-0 items-center gap-5">
                      <div className="hidden text-right xl:block">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--app-text-faint)]">
                          Abertura
                        </p>

                        <p className="mt-0.5 text-xs text-[var(--app-text-muted)]">
                          {formatDate(os.dataCriacao)}
                        </p>
                      </div>

                      <div className="hidden min-w-24 text-right xl:block">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--app-text-faint)]">
                          Valor
                        </p>

                        <p className="mt-0.5 text-sm font-bold text-[var(--app-text)]">
                          {formatCurrency(os.valorTotal)}
                        </p>
                      </div>

                      <StatusBadge status={os.status} />

                      <div
                        className="flex items-center gap-0.5"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Link
                          to={`/ordens-servico/${os.id}`}
                          className="rounded-lg p-2 text-[var(--app-text-muted)] transition hover:bg-[var(--app-surface-raised)] hover:text-sky-400"
                          title="Visualizar"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>

                        {os.status === 1 && (
                          <Link
                            to={`/ordens-servico/${os.id}/editar`}
                            className="rounded-lg p-2 text-[var(--app-text-muted)] transition hover:bg-[var(--app-surface-raised)] hover:text-[var(--accent-text)]"
                            title="Editar"
                          >
                            <Pencil className="h-4 w-4" />
                          </Link>
                        )}

                        {os.status === 0 && (
                          <button
                            onClick={() => handleEnviarAprovacao(os)}
                            className="rounded-lg p-2 text-[var(--app-text-muted)] transition hover:bg-[var(--app-surface-raised)] hover:text-emerald-400"
                            title="Enviar para aprovação"
                          >
                            <FileText className="h-4 w-4" />
                          </button>
                        )}

                        <button
                          onClick={() => setToDelete(os)}
                          className="rounded-lg p-2 text-[var(--app-text-muted)] transition hover:bg-[var(--app-surface-raised)] hover:text-red-400"
                          title="Excluir"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>

                        <Link
                          to={`/ordens-servico/${os.id}`}
                          className="ml-1 hidden rounded-lg p-2 text-[var(--app-text-faint)] transition group-hover:text-[var(--app-text-muted)] 2xl:block"
                          title="Abrir OS"
                        >
                          <ArrowUpRight className="h-4 w-4" />
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* MOBILE / TABLET */}
          <div className="grid gap-3 sm:grid-cols-2 lg:hidden">
            {filtered.map((os) => (
              <Card
                key={os.id}
                hover
                className="cursor-pointer overflow-hidden"
                onClick={() => navigate(`/ordens-servico/${os.id}`)}
              >
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <Link
                      to={`/ordens-servico/${os.id}`}
                      onClick={(e) => e.stopPropagation()}
                      className="min-w-0"
                    >
                      <p className="font-mono text-xs font-bold text-[var(--accent-text)]">
                        #{os.id.slice(0, 8).toUpperCase()}
                      </p>

                      <p className="mt-1 truncate text-sm font-semibold text-[var(--app-text)]">
                        {os.cliente?.nome ?? "Cliente não informado"}
                      </p>
                    </Link>

                    <StatusBadge status={os.status} />
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-[var(--app-border-subtle)] bg-[var(--app-border-subtle)]">
                    <div className="bg-[var(--app-surface-raised)] px-3 py-3">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--app-text-faint)]">
                        Veículo
                      </p>

                      <p className="mt-1 truncate text-sm text-[var(--app-text-secondary)]">
                        {os.veiculo
                          ? `${os.veiculo.marca} ${os.veiculo.modelo}`
                          : "—"}
                      </p>

                      {os.veiculo?.placa && (
                        <p className="mt-0.5 font-mono text-[10px] text-[var(--app-text-muted)]">
                          {os.veiculo.placa}
                        </p>
                      )}
                    </div>

                    <div className="bg-[var(--app-surface-raised)] px-3 py-3">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--app-text-faint)]">
                        Valor
                      </p>

                      <p className="mt-1 text-sm font-bold text-[var(--app-text)]">
                        {formatCurrency(os.valorTotal)}
                      </p>

                      <p className="mt-0.5 text-[10px] text-[var(--app-text-muted)]">
                        {formatDate(os.dataCriacao)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-0.5 border-t border-[var(--app-border-subtle)] px-3 py-2">
                  <Link
                    to={`/ordens-servico/${os.id}`}
                    onClick={(e) => e.stopPropagation()}
                    className="rounded-lg p-2 text-[var(--app-text-muted)] transition hover:bg-[var(--hover-bg)] hover:text-sky-400"
                    title="Visualizar"
                  >
                    <Eye className="h-4 w-4" />
                  </Link>

                  {os.status === 0 && (
                    <Link
                      to={`/ordens-servico/${os.id}/editar`}
                      onClick={(e) => e.stopPropagation()}
                      className="rounded-lg p-2 text-[var(--app-text-muted)] transition hover:bg-[var(--hover-bg)] hover:text-[var(--accent-text)]"
                      title="Editar"
                    >
                      <Pencil className="h-4 w-4" />
                    </Link>
                  )}

                  {os.status === 0 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEnviarAprovacao(os);
                      }}
                      className="rounded-lg p-2 text-[var(--app-text-muted)] transition hover:bg-[var(--hover-bg)] hover:text-emerald-400"
                      title="Enviar para aprovação"
                    >
                      <FileText className="h-4 w-4" />
                    </button>
                  )}

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setToDelete(os);
                    }}
                    className="rounded-lg p-2 text-[var(--app-text-muted)] transition hover:bg-[var(--hover-bg)] hover:text-red-400"
                    title="Excluir"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>

                  <Link
                    to={`/ordens-servico/${os.id}`}
                    onClick={(e) => e.stopPropagation()}
                    className="ml-1 rounded-lg p-2 text-[var(--app-text-faint)] transition hover:bg-[var(--hover-bg)] hover:text-[var(--app-text)]"
                    title="Abrir OS"
                  >
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* MODAL NOVA OS */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Nova ordem de serviço"
        description="Preencha os dados da OS."
        size="xl"
      >
        <OrdemServicoForm
          clientes={clientes}
          veiculos={veiculos}
          mecanico={mecanicos}
          onSubmit={handleCreate}
          onCancel={() => setModalOpen(false)}
          submitting={submitting}
        />
      </Modal>

      {/* CONFIRMAÇÃO DE EXCLUSÃO */}
      <ConfirmDialog
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Excluir ordem de serviço"
        message="Tem certeza que deseja excluir esta ordem de serviço?"
      />
    </div>
  );
}
