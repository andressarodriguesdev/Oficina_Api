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
  ArrowLeft,
} from "lucide-react";

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

      const valorTotal = Number((values.valorMaoObra + totalItens).toFixed(2));

      await createOrdem({
        clienteId: values.clienteId,
        veiculoId: values.veiculoId,
        mecanicoId: values.mecanicoId,
        descricao: values.descricao,
        valorMaoObra: values.valorMaoObra,
        valorTotal,
        observacao: values.observacao || null,
        itens: values.itens.filter((it) => it.descricao.trim() !== ""),
      });

      toast.success("Ordem de serviço criada com sucesso");

      setModalOpen(false);

      await load();
    } catch (err) {
      toast.error("Erro ao criar ordem de serviço");
      console.error(err);
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

  return (
    <div className="space-y-5">
      {/* CABEÇALHO */}
      <div className="flex items-center">
        <Button variant="ghost" size="sm" onClick={() => navigate("/painel")}>
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>
      </div>

      {/* FILTROS */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row">
          {/* BUSCA */}
          <div className="relative w-full sm:max-w-xs">
            <Search
              className="
                pointer-events-none
                absolute left-3 top-1/2
                h-4 w-4
                -translate-y-1/2
                text-ink-400
              "
            />

            <Input
              placeholder="Buscar OS..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="
                pl-9
                bg-ink-800
                border-ink-700
                text-white
                placeholder:text-ink-500
                focus:border-flame-500
                focus:ring-flame-500/20
              "
            />
          </div>

          {/* FILTRO */}
          <div className="w-full sm:w-52">
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="
                w-full
                bg-ink-800
                border-ink-700
                text-white
                focus:border-flame-500
                focus:ring-flame-500/20
              "
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

        <Button onClick={() => setModalOpen(true)}>
          <Plus className="h-4 w-4" />
          Nova OS
        </Button>
      </div>

      {/* CONTEÚDO */}
      {loading ? (
        <PageLoader label="Carregando ordens de serviço..." />
      ) : filtered.length === 0 ? (
        <Card>
          <EmptyState
            icon={<ClipboardList className="h-7 w-7" />}
            title={
              search || statusFilter
                ? "Nenhuma OS encontrada"
                : "Nenhuma ordem de serviço"
            }
            description={
              search || statusFilter
                ? "Tente outra busca."
                : "Crie a primeira ordem de serviço."
            }
            action={
              !search &&
              !statusFilter && (
                <Button onClick={() => setModalOpen(true)}>
                  <Plus className="h-4 w-4" />
                  Criar OS
                </Button>
              )
            }
          />
        </Card>
      ) : (
        <>
          {/* DESKTOP — MESMO PADRÃO DO DASHBOARD */}
          <div className="hidden lg:block">
            <Card>
              {/* CABEÇALHO DA LISTA */}
              <div className="border-b border-ink-700/60 px-5 py-4">
                <h3 className="font-display text-base font-bold text-white">
                  Ordens de Serviço
                </h3>

                <p className="mt-0.5 text-sm text-ink-400">
                  Acompanhe todas as ordens de serviço cadastradas
                </p>
              </div>

              {/* LISTA */}
              <div className="divide-y divide-ink-700/40">
                {filtered.map((os) => (
                  <div
                    key={os.id}
                    onClick={() => navigate(`/ordens-servico/${os.id}`)}
                    className="
                      flex
                      items-center
                      justify-between
                      gap-4
                      px-5
                      py-3.5
                      cursor-pointer
                      transition
                      hover:bg-ink-800/40
                    "
                  >
                    {/* OS + CLIENTE + VEÍCULO */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-3">
                        <Link
                          to={`/ordens-servico/${os.id}`}
                          onClick={(e) => e.stopPropagation()}
                          className="
                            shrink-0
                            font-mono
                            text-xs
                            font-semibold
                            text-flame-400
                            hover:text-flame-300
                          "
                        >
                          #{os.id.slice(0, 8).toUpperCase()}
                        </Link>

                        <span className="text-ink-700">·</span>

                        <p className="truncate text-sm font-semibold text-white">
                          {os.cliente?.nome ?? "Cliente não informado"}
                        </p>
                      </div>

                      <p className="mt-0.5 truncate text-xs text-ink-400">
                        {os.veiculo
                          ? `${os.veiculo.marca} ${os.veiculo.modelo}`
                          : "Veículo não informado"}

                        {os.veiculo?.placa && (
                          <>
                            {" · "}
                            {os.veiculo.placa}
                          </>
                        )}
                      </p>
                    </div>

                    {/* INFORMAÇÕES + AÇÕES */}
                    <div className="flex shrink-0 items-center gap-4">
                      <span className="hidden text-xs text-ink-400 xl:block">
                        {formatDate(os.dataCriacao)}
                      </span>

                      <span className="hidden text-sm font-semibold text-white xl:block">
                        {formatCurrency(os.valorTotal)}
                      </span>

                      <StatusBadge status={os.status} />

                      <div
                        className="flex items-center gap-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {/* VISUALIZAR */}
                        <Link
                          to={`/ordens-servico/${os.id}`}
                          className="
                            rounded-lg
                            p-2
                            text-ink-400
                            transition
                            hover:bg-ink-700
                            hover:text-sky-400
                          "
                          title="Visualizar"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>

                        {/* EDITAR */}
                        {os.status === 0 && (
                          <Link
                            to={`/ordens-servico/${os.id}/editar`}
                            className="
                              rounded-lg
                              p-2
                              text-ink-400
                              transition
                              hover:bg-ink-700
                              hover:text-flame-400
                            "
                            title="Editar"
                          >
                            <Pencil className="h-4 w-4" />
                          </Link>
                        )}

                        {/* ENVIAR PARA APROVAÇÃO */}
                        {os.status === 0 && (
                          <button
                            onClick={() => handleEnviarAprovacao(os)}
                            className="
                              rounded-lg
                              p-2
                              text-ink-400
                              transition
                              hover:bg-ink-700
                              hover:text-emerald-400
                            "
                            title="Enviar para aprovação"
                          >
                            <FileText className="h-4 w-4" />
                          </button>
                        )}

                        {/* EXCLUIR */}
                        <button
                          onClick={() => setToDelete(os)}
                          className="
                            rounded-lg
                            p-2
                            text-ink-400
                            transition
                            hover:bg-ink-700
                            hover:text-red-400
                          "
                          title="Excluir"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
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
                className="cursor-pointer p-4"
                onClick={() => navigate(`/ordens-servico/${os.id}`)}
              >
                <div className="flex items-start justify-between gap-3">
                  <Link
                    to={`/ordens-servico/${os.id}`}
                    onClick={(e) => e.stopPropagation()}
                    className="min-w-0"
                  >
                    <p className="font-mono text-xs font-bold text-flame-400">
                      #{os.id.slice(0, 8).toUpperCase()}
                    </p>

                    <p className="mt-1 truncate text-sm font-semibold text-white">
                      {os.cliente?.nome ?? "Cliente não informado"}
                    </p>
                  </Link>

                  <StatusBadge status={os.status} />
                </div>

                <div className="mt-4 space-y-2 border-t border-ink-700/40 pt-3">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs text-ink-400">Veículo</span>

                    <div className="min-w-0 text-right">
                      <p className="truncate text-sm text-ink-200">
                        {os.veiculo
                          ? `${os.veiculo.marca} ${os.veiculo.modelo}`
                          : "—"}
                      </p>

                      {os.veiculo?.placa && (
                        <p className="text-xs text-ink-400">
                          {os.veiculo.placa}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs text-ink-400">Data</span>

                    <span className="text-sm text-ink-300">
                      {formatDate(os.dataCriacao)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs text-ink-400">Valor</span>

                    <span className="text-sm font-bold text-white">
                      {formatCurrency(os.valorTotal)}
                    </span>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-end gap-1 border-t border-ink-700/40 pt-3">
                  {/* VISUALIZAR */}
                  <Link
                    to={`/ordens-servico/${os.id}`}
                    onClick={(e) => e.stopPropagation()}
                    className="
                      rounded-lg
                      p-2
                      text-ink-400
                      transition
                      hover:bg-ink-800
                      hover:text-sky-400
                    "
                    title="Visualizar"
                  >
                    <Eye className="h-4 w-4" />
                  </Link>

                  {/* EDITAR */}
                  {os.status === 0 && (
                    <Link
                      to={`/ordens-servico/${os.id}/editar`}
                      onClick={(e) => e.stopPropagation()}
                      className="
                        rounded-lg
                        p-2
                        text-ink-400
                        transition
                        hover:bg-ink-800
                        hover:text-flame-400
                      "
                      title="Editar"
                    >
                      <Pencil className="h-4 w-4" />
                    </Link>
                  )}

                  {/* ENVIAR PARA APROVAÇÃO */}
                  {os.status === 0 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEnviarAprovacao(os);
                      }}
                      className="
                        rounded-lg
                        p-2
                        text-ink-400
                        transition
                        hover:bg-ink-800
                        hover:text-emerald-400
                      "
                      title="Enviar para aprovação"
                    >
                      <FileText className="h-4 w-4" />
                    </button>
                  )}

                  {/* EXCLUIR */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setToDelete(os);
                    }}
                    className="
                      rounded-lg
                      p-2
                      text-ink-400
                      transition
                      hover:bg-ink-800
                      hover:text-red-400
                    "
                    title="Excluir"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
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