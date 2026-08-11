import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Card, CardHeader } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { StatusBadge } from "../components/ui/StatusBadge";
import { PageLoader } from "../components/ui/Spinner";
import { EmptyState } from "../components/ui/EmptyState";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { useToast } from "../components/ui/Toast";
import {
  ArrowLeft,
  Pencil,
  FileDown,
  MessageCircle,
  Send,
  Check,
  X,
  CheckCircle2,
  XCircle,
  RotateCcw,
  ClipboardList,
  User,
  Car,
  Wrench,
  Package,
  Clock,
  Plus,
  Trash2,
} from "lucide-react";
import {
  getOrdem,
  getOrdemHistorico,
  enviarAprovacao,
  aprovar,
  recusar,
  concluir,
  cancelar,
  reabrir,
  deleteOrdem,
  baixarPdf,
  gerarWhatsApp,
  adicionarItem,
  atualizarItem,
  removerItem,
  type OrdemWithRelations,
} from "../services/ordens";
import type { OrdemServicoItem, HistoricoOrdemServico } from "../types";
import { formatCurrency, formatDate } from "../utils/format";
import { statusFromNumber, statusLabel } from "../utils/status";
import { buildWhatsAppMessage, whatsappUrl } from "../utils/whatsapp";

export function OrdemDetalhes() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();

  const [ordem, setOrdem] = useState<OrdemWithRelations | null>(null);
  const [itens, setItens] = useState<OrdemServicoItem[]>([]);
  const [historicos, setHistoricos] = useState<HistoricoOrdemServico[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const [itemEditando, setItemEditando] = useState<string | null>(null);
  const [itemForm, setItemForm] = useState({
    descricao: "",
    quantidade: 1,
    valorUnitario: 0,
  });

  const [itemSalvando, setItemSalvando] = useState(false);
  const [itemExcluindo, setItemExcluindo] = useState<string | null>(null);
  const [motivoCancelamento, setMotivoCancelamento] = useState("");

  const load = useCallback(async () => {
    if (!id) return;

    try {
      const [o, hist] = await Promise.all([
        getOrdem(id),
        getOrdemHistorico(id),
      ]);

      setOrdem(o);
      setItens(o?.itens ?? []);
      setHistoricos(hist);
    } catch (err) {
      toast.error("Erro ao carregar ordem de serviço");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [id, toast]);

  useEffect(() => {
    load();
  }, [load]);

  const runAction = async (
    key: string,
    fn: (id: string) => Promise<unknown>,
    successMsg: string,
    errorMsg: string,
  ) => {
    if (!id) return;

    setActionLoading(key);

    try {
      await fn(id);
      toast.success(successMsg);
      await load();
    } catch (err) {
      toast.error(errorMsg);
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleEnviarAprovacao = async () => {
    if (!id || !ordem) return;

    setActionLoading("enviar");

    try {
      await enviarAprovacao(id);
      toast.success("OS enviada para aprovação");

      await load();

      if (ordem.cliente?.telefone) {
        const fresh = await getOrdem(id);

        const msg = buildWhatsAppMessage(
          fresh ?? ordem,
          ordem.cliente,
          ordem.veiculo,
        );

        window.open(
          whatsappUrl(ordem.cliente.telefone, msg),
          "_blank",
        );
      }
    } catch (err) {
      toast.error("Erro ao enviar para aprovação");
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleWhatsApp = async () => {
    if (!ordem) return;

    try {
      const link = await gerarWhatsApp(ordem.id);
      window.open(link, "_blank");
    } catch (error) {
      console.error(error);
      toast.error("Erro ao gerar WhatsApp");
    }
  };

  const handlePdf = async () => {
    if (!ordem) return;

    try {
      toast.info("Gerando PDF...");

      const blob = await baixarPdf(ordem.id);
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");

      link.href = url;
      link.download = `OS-${ordem.id.slice(0, 8)}.pdf`;

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);

      toast.success("PDF gerado com sucesso!");
    } catch (error) {
      console.error(error);
      toast.error("Erro ao gerar PDF");
    }
  };

  const handleCancelar = async () => {
    if (!ordem) return;

    if (!motivoCancelamento.trim()) {
      toast.warning("Informe o motivo do cancelamento");
      return;
    }

    setActionLoading("cancelar");

    try {
      await cancelar(ordem.id, {
        motivo: motivoCancelamento,
      });

      toast.success("Ordem cancelada com sucesso");
      setMotivoCancelamento("");

      await load();
    } catch (error) {
      console.error(error);
      toast.error("Erro ao cancelar a ordem");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async () => {
    if (!ordem) return;

    setDeleting(true);

    try {
      await deleteOrdem(ordem.id);

      toast.success("Ordem de serviço excluída com sucesso");
      navigate("/ordens-servico");
    } catch (error) {
      console.error(error);
      toast.error("Erro ao excluir a ordem de serviço");
    } finally {
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  const handleReabrir = async () => {
    if (!ordem) return;

    const motivo = window.prompt(
      "Informe o motivo da reabertura:",
    );

    if (!motivo?.trim()) {
      toast.warning("Informe o motivo da reabertura");
      return;
    }

    setActionLoading("reabrir");

    try {
      await reabrir(ordem.id, {
        motivo,
      });

      toast.success("OS reaberta com sucesso");
      await load();
    } catch (error) {
      console.error(error);
      toast.error("Erro ao reabrir OS");
    } finally {
      setActionLoading(null);
    }
  };

  const abrirNovoItem = () => {
    setItemForm({
      descricao: "",
      quantidade: 1,
      valorUnitario: 0,
    });

    setItemEditando("novo");
  };

  const abrirEdicaoItem = (item: OrdemServicoItem) => {
    setItemForm({
      descricao: item.descricao,
      quantidade: item.quantidade,
      valorUnitario: item.valorUnitario,
    });

    setItemEditando(item.id);
  };

  const cancelarEdicaoItem = () => {
    setItemEditando(null);
  };

  const salvarItem = async () => {
    if (!ordem) return;

    if (!itemForm.descricao.trim()) {
      toast.warning("Informe a descrição do item");
      return;
    }

    if (itemForm.quantidade <= 0) {
      toast.warning("Quantidade deve ser maior que zero");
      return;
    }

    setItemSalvando(true);

    try {
      if (itemEditando === "novo") {
        await adicionarItem(ordem.id, itemForm);
        toast.success("Item adicionado");
      } else if (itemEditando) {
        await atualizarItem(
          ordem.id,
          itemEditando,
          itemForm,
        );

        toast.success("Item atualizado");
      }

      setItemEditando(null);
      await load();
    } catch (err) {
      toast.error("Erro ao salvar item");
      console.error(err);
    } finally {
      setItemSalvando(false);
    }
  };

  const excluirItem = async (item: OrdemServicoItem) => {
    if (!ordem) return;

    if (
      !window.confirm(
        `Remover o item "${item.descricao}"?`,
      )
    ) {
      return;
    }

    setItemExcluindo(item.id);

    try {
      await removerItem(ordem.id, item.id);

      toast.success("Item removido");
      await load();
    } catch (err) {
      toast.error("Erro ao remover item");
      console.error(err);
    } finally {
      setItemExcluindo(null);
    }
  };

  if (loading) {
    return (
      <PageLoader label="Carregando ordem de serviço..." />
    );
  }

  if (!ordem) {
    return (
      <Card>
        <EmptyState
          icon={<ClipboardList className="h-7 w-7" />}
          title="Ordem de serviço não encontrada"
          action={
            <Link to="/ordens-servico">
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

  const status = statusFromNumber(ordem.status);
  const isAberta = ordem.status === 0;

  const totalItens = itens.reduce(
    (total, item) =>
      total +
      Number(item.quantidade || 0) *
        Number(item.valorUnitario || 0),
    0,
  );

  return (
    <div className="space-y-5">
      {/* Cabeçalho */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link to="/ordens-servico">
          <Button
            variant="ghost"
            size="sm"
            className="w-full sm:w-auto"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
        </Link>

        <div className="grid grid-cols-1 gap-2 sm:flex sm:flex-wrap">
          <Link
            to={`/ordens-servico/${ordem.id}/editar`}
            className="w-full sm:w-auto"
          >
            <Button
              variant="outline"
              size="sm"
              className="w-full sm:w-auto"
              disabled={ordem.status !== 0}
            >
              <Pencil className="h-4 w-4" />
              Editar
            </Button>
          </Link>

          <Button
            variant="outline"
            size="sm"
            className="w-full sm:w-auto"
            onClick={handlePdf}
          >
            <FileDown className="h-4 w-4" />
            Gerar PDF
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="w-full sm:w-auto"
            onClick={handleWhatsApp}
          >
            <MessageCircle className="h-4 w-4" />
            WhatsApp
          </Button>
        </div>
      </div>

      {/* Resumo da OS */}
      <Card className="p-4 sm:p-6">
        <div className="flex flex-col gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <h2 className="font-mono text-lg font-bold text-white sm:text-xl">
                OS #{ordem.id.slice(0, 8).toUpperCase()}
              </h2>

              <StatusBadge status={ordem.status} />
            </div>

            <p className="mt-1 text-sm text-ink-400">
              Criada em {formatDate(ordem.dataCriacao)}
            </p>
          </div>

          {/* Informações principais */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {/* Cliente */}
            <div className="flex min-w-0 items-center gap-3 rounded-xl border border-ink-700/50 bg-ink-800/40 px-4 py-3">
              <User className="h-5 w-5 shrink-0 text-sky-400" />

              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">
                  Cliente
                </p>

                <Link
                  to={`/clientes/${ordem.clienteId}`}
                  className="block truncate text-sm font-semibold text-white hover:text-flame-400"
                >
                  {ordem.cliente?.nome ?? "—"}
                </Link>
              </div>
            </div>

            {/* Veículo */}
            <div className="flex min-w-0 items-center gap-3 rounded-xl border border-ink-700/50 bg-ink-800/40 px-4 py-3">
              <Car className="h-5 w-5 shrink-0 text-flame-400" />

              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">
                  Veículo
                </p>

                <Link
                  to={`/veiculos/${ordem.veiculoId}`}
                  className="block truncate text-sm font-semibold text-white hover:text-flame-400"
                >
                  {ordem.veiculo
                    ? `${ordem.veiculo.marca} ${ordem.veiculo.modelo}`
                    : "—"}

                  {ordem.veiculo?.placa
                    ? ` — ${ordem.veiculo.placa}`
                    : ""}
                </Link>
              </div>
            </div>

            {/* Mecânico */}
            <div className="flex min-w-0 items-center gap-3 rounded-xl border border-ink-700/50 bg-ink-800/40 px-4 py-3">
              <Wrench className="h-5 w-5 shrink-0 text-emerald-400" />

              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">
                  Mecânico
                </p>

                <p className="truncate text-sm font-semibold text-white">
                  {ordem.mecanico?.nome ?? "—"}
                </p>
              </div>
            </div>

            {/* Status */}
            <div className="flex min-w-0 items-center gap-3 rounded-xl border border-ink-700/50 bg-ink-800/40 px-4 py-3">
              <ClipboardList className="h-5 w-5 shrink-0 text-violet-400" />

              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">
                  Status atual
                </p>

                <p className="truncate text-sm font-semibold text-white">
                  {statusLabel(status)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Conteúdo principal */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Coluna principal */}
        <div className="min-w-0 space-y-4 lg:col-span-2">
          {/* Descrição */}
          <Card>
            <CardHeader title="Descrição do serviço" />

            <div className="px-4 py-4 sm:px-5">
              <p className="break-words text-sm leading-relaxed text-ink-200">
                {ordem.descricao || "Sem descrição"}
              </p>

              {ordem.observacao && (
                <div className="mt-4 rounded-xl border border-ink-700/50 bg-ink-800/40 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">
                    Observação
                  </p>

                  <p className="mt-1 break-words text-sm text-ink-200">
                    {ordem.observacao}
                  </p>
                </div>
              )}
            </div>
          </Card>

          {/* Peças / Itens */}
          <Card>
            <div className="flex flex-col gap-3 px-4 pt-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
              <CardHeader
                title="Peças / Itens"
                subtitle={`${itens.length} item(s)`}
              />

              {isAberta && itemEditando === null && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full sm:w-auto"
                  onClick={abrirNovoItem}
                >
                  <Plus className="h-4 w-4" />
                  Adicionar item
                </Button>
              )}
            </div>

            {itens.length === 0 &&
            itemEditando === null ? (
              <EmptyState
                icon={<Package className="h-7 w-7" />}
                title="Nenhum item"
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[680px]">
                  <thead>
                    <tr className="border-b border-ink-700/60 text-left text-xs font-semibold uppercase tracking-wide text-ink-400">
                      <th className="px-5 py-3">
                        Descrição
                      </th>

                      <th className="px-5 py-3 text-right">
                        Qtd
                      </th>

                      <th className="px-5 py-3 text-right">
                        Valor unit.
                      </th>

                      <th className="px-5 py-3 text-right">
                        Total
                      </th>

                      {isAberta && (
                        <th className="px-5 py-3 text-right">
                          Ações
                        </th>
                      )}
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-ink-700/40">
                    {/* Novo item */}
                    {itemEditando === "novo" && (
                      <tr className="bg-ink-800/30">
                        <td className="px-5 py-2">
                          <input
                            autoFocus
                            className="w-full rounded-lg border border-ink-700 bg-ink-900 px-2 py-1.5 text-sm text-white focus:border-flame-500 focus:outline-none"
                            value={itemForm.descricao}
                            onChange={(e) =>
                              setItemForm((f) => ({
                                ...f,
                                descricao: e.target.value,
                              }))
                            }
                            placeholder="Descrição da peça"
                          />
                        </td>

                        <td className="px-5 py-2">
                          <input
                            type="number"
                            min={1}
                            className="w-20 rounded-lg border border-ink-700 bg-ink-900 px-2 py-1.5 text-right text-sm text-white focus:border-flame-500 focus:outline-none"
                            value={itemForm.quantidade}
                            onChange={(e) =>
                              setItemForm((f) => ({
                                ...f,
                                quantidade: Number(
                                  e.target.value,
                                ),
                              }))
                            }
                          />
                        </td>

                        <td className="px-5 py-2">
                          <input
                            type="number"
                            min={0}
                            step="0.01"
                            className="w-28 rounded-lg border border-ink-700 bg-ink-900 px-2 py-1.5 text-right text-sm text-white focus:border-flame-500 focus:outline-none"
                            value={itemForm.valorUnitario}
                            onChange={(e) =>
                              setItemForm((f) => ({
                                ...f,
                                valorUnitario: Number(
                                  e.target.value,
                                ),
                              }))
                            }
                          />
                        </td>

                        <td className="px-5 py-2 text-right text-sm font-semibold text-white">
                          {formatCurrency(
                            itemForm.quantidade *
                              itemForm.valorUnitario,
                          )}
                        </td>

                        <td className="px-5 py-2">
                          <div className="flex justify-end gap-1">
                            <Button
                              size="sm"
                              variant="success"
                              onClick={salvarItem}
                              loading={itemSalvando}
                            >
                              <Check className="h-4 w-4" />
                            </Button>

                            <Button
                              size="sm"
                              variant="outline"
                              onClick={
                                cancelarEdicaoItem
                              }
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )}

                    {/* Itens */}
                    {itens.map((item) =>
                      itemEditando === item.id ? (
                        <tr
                          key={item.id}
                          className="bg-ink-800/30"
                        >
                          <td className="px-5 py-2">
                            <input
                              autoFocus
                              className="w-full rounded-lg border border-ink-700 bg-ink-900 px-2 py-1.5 text-sm text-white focus:border-flame-500 focus:outline-none"
                              value={itemForm.descricao}
                              onChange={(e) =>
                                setItemForm((f) => ({
                                  ...f,
                                  descricao:
                                    e.target.value,
                                }))
                              }
                            />
                          </td>

                          <td className="px-5 py-2">
                            <input
                              type="number"
                              min={1}
                              className="w-20 rounded-lg border border-ink-700 bg-ink-900 px-2 py-1.5 text-right text-sm text-white focus:border-flame-500 focus:outline-none"
                              value={
                                itemForm.quantidade
                              }
                              onChange={(e) =>
                                setItemForm((f) => ({
                                  ...f,
                                  quantidade: Number(
                                    e.target.value,
                                  ),
                                }))
                              }
                            />
                          </td>

                          <td className="px-5 py-2">
                            <input
                              type="number"
                              min={0}
                              step="0.01"
                              className="w-28 rounded-lg border border-ink-700 bg-ink-900 px-2 py-1.5 text-right text-sm text-white focus:border-flame-500 focus:outline-none"
                              value={
                                itemForm.valorUnitario
                              }
                              onChange={(e) =>
                                setItemForm((f) => ({
                                  ...f,
                                  valorUnitario: Number(
                                    e.target.value,
                                  ),
                                }))
                              }
                            />
                          </td>

                          <td className="px-5 py-2 text-right text-sm font-semibold text-white">
                            {formatCurrency(
                              itemForm.quantidade *
                                itemForm.valorUnitario,
                            )}
                          </td>

                          <td className="px-5 py-2">
                            <div className="flex justify-end gap-1">
                              <Button
                                size="sm"
                                variant="success"
                                onClick={salvarItem}
                                loading={itemSalvando}
                              >
                                <Check className="h-4 w-4" />
                              </Button>

                              <Button
                                size="sm"
                                variant="outline"
                                onClick={
                                  cancelarEdicaoItem
                                }
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        <tr key={item.id}>
                          <td className="px-5 py-3 text-sm text-white">
                            {item.descricao}
                          </td>

                          <td className="px-5 py-3 text-right text-sm text-ink-200">
                            {item.quantidade}
                          </td>

                          <td className="px-5 py-3 text-right text-sm text-ink-200">
                            {formatCurrency(
                              item.valorUnitario,
                            )}
                          </td>

                          <td className="px-5 py-3 text-right text-sm font-semibold text-white">
                            {formatCurrency(
                              item.quantidade *
                                item.valorUnitario,
                            )}
                          </td>

                          {isAberta && (
                            <td className="px-5 py-3">
                              <div className="flex justify-end gap-1">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() =>
                                    abrirEdicaoItem(item)
                                  }
                                  disabled={
                                    itemEditando !== null
                                  }
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>

                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() =>
                                    excluirItem(item)
                                  }
                                  loading={
                                    itemExcluindo ===
                                    item.id
                                  }
                                  disabled={
                                    itemEditando !== null
                                  }
                                >
                                  <Trash2 className="h-4 w-4 text-red-400" />
                                </Button>
                              </div>
                            </td>
                          )}
                        </tr>
                      ),
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          {/* Valores */}
          <Card>
            <CardHeader title="Valores" />

            <div className="space-y-3 px-4 py-4 sm:px-5">
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm text-ink-300">
                  Mão de obra
                </span>

                <span className="shrink-0 text-sm font-semibold text-white">
                  {formatCurrency(ordem.valorMaoObra)}
                </span>
              </div>

              <div className="flex items-center justify-between gap-4">
                <span className="text-sm text-ink-300">
                  Peças/Itens
                </span>

                <span className="shrink-0 text-sm font-semibold text-white">
                  {formatCurrency(totalItens)}
                </span>
              </div>

              <div className="flex items-center justify-between gap-4 border-t border-ink-700/60 pt-3">
                <span className="font-display text-base font-bold text-white">
                  Valor total
                </span>

                <span className="shrink-0 font-display text-xl font-bold text-flame-400">
                  {formatCurrency(ordem.valorTotal)}
                </span>
              </div>
            </div>
          </Card>
        </div>

        {/* Coluna lateral */}
        <div className="min-w-0 space-y-4">
          {/* Ações */}
          <Card>
            <CardHeader
              title="Ações"
              subtitle="Fluxo da ordem de serviço"
            />

            <div className="space-y-2 p-4">
              {status === "Aberta" && (
                <Button
                  className="w-full justify-start"
                  onClick={handleEnviarAprovacao}
                  loading={actionLoading === "enviar"}
                >
                  <Send className="h-4 w-4" />
                  Enviar para Aprovação
                </Button>
              )}

              {status === "AguardandoAprovacao" && (
                <>
                  <Button
                    variant="success"
                    className="w-full justify-start"
                    onClick={() =>
                      runAction(
                        "aprovar",
                        aprovar,
                        "OS aprovada",
                        "Erro ao aprovar OS",
                      )
                    }
                    loading={actionLoading === "aprovar"}
                  >
                    <Check className="h-4 w-4" />
                    Aprovar
                  </Button>

                  <Button
                    variant="danger"
                    className="w-full justify-start"
                    onClick={() =>
                      runAction(
                        "recusar",
                        recusar,
                        "OS recusada",
                        "Erro ao recusar OS",
                      )
                    }
                    loading={actionLoading === "recusar"}
                  >
                    <X className="h-4 w-4" />
                    Recusar
                  </Button>
                </>
              )}

              {(status === "Aprovada" ||
                status === "Reaberta") && (
                <Button
                  variant="success"
                  className="w-full justify-start"
                  onClick={() =>
                    runAction(
                      "concluir",
                      concluir,
                      "OS concluída",
                      "Erro ao concluir OS",
                    )
                  }
                  loading={actionLoading === "concluir"}
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Concluir
                </Button>
              )}

              {(status === "Aprovada" ||
                status === "AguardandoAprovacao" ||
                status === "Recusada") && (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-ink-200">
                      Motivo do cancelamento
                    </label>

                    <textarea
                      className="w-full rounded-lg border border-ink-700 bg-ink-900 p-3 text-sm text-white focus:border-flame-500 focus:outline-none"
                      rows={3}
                      value={motivoCancelamento}
                      onChange={(e) =>
                        setMotivoCancelamento(
                          e.target.value,
                        )
                      }
                      placeholder="Ex: Cliente desistiu do serviço"
                    />
                  </div>

                  <Button
                    variant="danger"
                    className="w-full justify-start"
                    onClick={handleCancelar}
                    loading={
                      actionLoading === "cancelar"
                    }
                  >
                    <XCircle className="h-4 w-4" />
                    Cancelar
                  </Button>
                </>
              )}

              {(status === "Concluida" ||
                status === "Cancelada" ||
                status === "Recusada") && (
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={handleReabrir}
                  loading={actionLoading === "reabrir"}
                >
                  <RotateCcw className="h-4 w-4" />
                  Reabrir
                </Button>
              )}

              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={handleWhatsApp}
              >
                <MessageCircle className="h-4 w-4" />
                Enviar WhatsApp
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={handlePdf}
              >
                <FileDown className="h-4 w-4" />
                Gerar PDF
              </Button>
            </div>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader
              title="Timeline"
              subtitle="Histórico de status"
            />

            <div className="p-4 sm:p-5">
              {historicos.length === 0 ? (
                <p className="text-sm text-ink-400">
                  Nenhum histórico registrado.
                </p>
              ) : (
                <ol className="relative space-y-5 border-l border-ink-700/60 pl-5">
                  {[...historicos]
                    .reverse()
                    .map((h) => (
                      <li
                        key={h.id}
                        className="relative"
                      >
                        <span className="absolute -left-[26px] top-0.5 flex h-3 w-3 items-center justify-center">
                          <span className="h-3 w-3 rounded-full bg-flame-500 ring-4 ring-flame-500/20" />
                        </span>

                        <div className="flex flex-wrap items-center gap-2">
                          <StatusBadge
                            status={h.novoStatus}
                          />

                          {h.statusAnterior !== null && (
                            <span className="text-xs text-ink-400">
                              de{" "}
                              <span className="font-medium text-ink-300">
                                {statusLabel(
                                  statusFromNumber(
                                    h.statusAnterior,
                                  ),
                                )}
                              </span>
                            </span>
                          )}
                        </div>

                        <p className="mt-1 text-xs text-ink-400">
                          {formatDate(h.dataAlteracao)}
                        </p>

                        {h.observacao && (
                          <p className="mt-1 break-words text-sm text-ink-200">
                            {h.observacao}
                          </p>
                        )}
                      </li>
                    ))}
                </ol>
              )}
            </div>
          </Card>

          {/* Datas importantes */}
          {(ordem.dataEnvioAprovacao ||
            ordem.dataConclusao) && (
            <Card className="p-4 sm:p-5">
              <div className="space-y-3 text-sm">
                {ordem.dataEnvioAprovacao && (
                  <div className="flex items-start gap-2 text-ink-300">
                    <Clock className="mt-0.5 h-4 w-4 shrink-0 text-ink-400" />

                    <span className="break-words">
                      Enviado em:{" "}
                      {formatDate(
                        ordem.dataEnvioAprovacao,
                      )}
                    </span>
                  </div>
                )}

                {ordem.dataConclusao && (
                  <div className="flex items-start gap-2 text-ink-300">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />

                    <span className="break-words">
                      Concluído em:{" "}
                      {formatDate(
                        ordem.dataConclusao,
                      )}
                    </span>
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Confirmação de exclusão */}
      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Excluir ordem de serviço"
        message="Tem certeza que deseja excluir esta ordem de serviço?"
      />
    </div>
  );
}