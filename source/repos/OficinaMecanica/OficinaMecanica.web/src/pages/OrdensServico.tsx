import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Plus,
  ClipboardList,
  Search,
  Pencil,
  Trash2,
  Eye,
  FileText,
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
import type { Cliente, Veiculo } from "../types";
import { formatDate, formatCurrency } from "../utils/format";
import {
  ALL_STATUSES,
  STATUS_LABEL,
  STATUS_TEXT_TO_NUMBER,
} from "../utils/status";
import { buildWhatsAppMessage, whatsappUrl } from "../utils/whatsapp";

export function OrdensServico() {
  const toast = useToast();
  const [ordens, setOrdens] = useState<OrdemWithRelations[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
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
      const [o, c, v] = await Promise.all([
        listOrdens(),
        listClientes(),
        listVeiculos(),
      ]);

      const ordensComRelacionamento = o.map((os) => ({
        ...os,
        cliente: c.find((cliente) => cliente.id === os.clienteId) ?? null,
        veiculo: v.find((veiculo) => veiculo.id === os.veiculoId) ?? null,
      }));

      setOrdens(ordensComRelacionamento);
      setClientes(c);
      setVeiculos(v);
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
      if (statusFilter && o.status !== Number(statusFilter)) return false;
      if (!q) return true;
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
        descricao: values.descricao,
        valorMaoObra: values.valorMaoObra,
        valorTotal: valorTotal,
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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row">
          <div className="relative w-full sm:max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
            <Input
              placeholder="Buscar OS..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="sm:w-52"
          >
            <option value="">Todos os status</option>
            {ALL_STATUSES.map((s) => (
              <option key={s} value={STATUS_TEXT_TO_NUMBER[s]}>
                {STATUS_LABEL[s]}
              </option>
            ))}
          </Select>
        </div>
        <Button onClick={() => setModalOpen(true)}>
          <Plus className="h-4 w-4" />
          Nova OS
        </Button>
      </div>

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
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-ink-700/60 text-left text-xs font-semibold uppercase tracking-wide text-ink-400">
                  <th className="px-5 py-3.5">OS</th>
                  <th className="px-5 py-3.5">Cliente</th>
                  <th className="px-5 py-3.5">Veículo</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Data</th>
                  <th className="px-5 py-3.5 text-right">Valor</th>
                  <th className="px-5 py-3.5 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-700/40">
                {filtered.map((os) => (
                  <tr key={os.id} className="transition hover:bg-ink-800/30">
                    <td className="px-5 py-3.5">
                      <Link
                        to={`/ordens-servico/${os.id}`}
                        className="font-mono text-xs font-semibold text-flame-400 hover:text-flame-300"
                      >
                        #{os.id.slice(0, 8).toUpperCase()}
                      </Link>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="text-sm font-medium text-white">
                        {os.cliente?.nome ?? "—"}
                      </p>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="text-sm text-ink-200">
                        {os.veiculo
                          ? `${os.veiculo.marca} ${os.veiculo.modelo}`
                          : "—"}
                      </p>
                      <p className="text-xs text-ink-400">
                        {os.veiculo?.placa ?? ""}
                      </p>
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={os.status} />
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="text-sm text-ink-300">
                        {formatDate(os.dataCriacao)}
                      </p>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <p className="text-sm font-semibold text-white">
                        {formatCurrency(os.valorTotal)}
                      </p>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          to={`/ordens-servico/${os.id}`}
                          className="rounded-lg p-2 text-ink-400 transition hover:bg-ink-700 hover:text-sky-400"
                          title="Visualizar"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>

                       {os.status === 0 && (
                        <Link to={`/ordens-servico/${os.id}/editar`}>
                          <Button variant="ghost">
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </Link>
                      )}
                        {os.status === 0 && (
                          <button
                            onClick={() => handleEnviarAprovacao(os)}
                            className="rounded-lg p-2 text-ink-400 transition hover:bg-ink-700 hover:text-emerald-400"
                            title="Enviar para aprovação"
                          >
                            <FileText className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => setToDelete(os)}
                          className="rounded-lg p-2 text-ink-400 transition hover:bg-ink-700 hover:text-red-400"
                          title="Excluir"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

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
          onSubmit={handleCreate}
          onCancel={() => setModalOpen(false)}
          submitting={submitting}
        />
      </Modal>
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
