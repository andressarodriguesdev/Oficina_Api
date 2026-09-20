import { useCallback, useEffect, useState } from "react";

import { Link, useNavigate, useParams } from "react-router-dom";

import { Card, CardHeader } from "../components/ui/Card";

import { Button } from "../components/ui/Button";

import { StatusBadge } from "../components/ui/StatusBadge";

import { PageLoader } from "../components/ui/Spinner";

import { EmptyState } from "../components/ui/EmptyState";

import { ConfirmDialog } from "../components/ui/ConfirmDialog";

import { Select } from "../components/ui/Select";

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

import { ApiError } from "../services/api";

import { listPecasDisponiveisParaOrdemServico } from "../services/pecas";

import type {
  OrdemServicoItem,
  HistoricoOrdemServico,
  PecaDisponivelOrdemServico,
} from "../types";

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

  const [pecas, setPecas] = useState<PecaDisponivelOrdemServico[]>([]);

  const [carregandoPecas, setCarregandoPecas] = useState(true);

  const [loading, setLoading] = useState(true);

  const [confirmDelete, setConfirmDelete] = useState(false);

  const [deleting, setDeleting] = useState(false);

  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const [itemEditando, setItemEditando] = useState<string | null>(null);

  const [itemForm, setItemForm] = useState({
    pecaId: "",
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

  useEffect(() => {
    const carregarPecas = async () => {
      if (!ordem?.id) return;

      try {
        setCarregandoPecas(true);

        const data = await listPecasDisponiveisParaOrdemServico(ordem.id);

        setPecas(data);
      } catch (error) {
        console.error(error);

        if (error instanceof ApiError) {
          toast.error(error.message);
        } else {
          toast.error("Erro ao carregar peças disponíveis");
        }
      } finally {
        setCarregandoPecas(false);
      }
    };

    carregarPecas();
  }, [ordem?.id, toast]);

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
      console.error(err);

      if (err instanceof ApiError) {
        toast.error(err.message);
      } else {
        toast.error(errorMsg);
      }
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

        window.open(whatsappUrl(ordem.cliente.telefone, msg), "_blank");
      }
    } catch (err) {
      console.error(err);

      if (err instanceof ApiError) {
        toast.error(err.message);
      } else {
        toast.error("Erro ao enviar para aprovação");
      }
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

      if (error instanceof ApiError) {
        toast.error(error.message);
      } else {
        toast.error("Erro ao cancelar a ordem");
      }
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

      if (error instanceof ApiError) {
        toast.error(error.message);
      } else {
        toast.error("Erro ao excluir a ordem de serviço");
      }
    } finally {
      setDeleting(false);

      setConfirmDelete(false);
    }
  };

  const handleReabrir = async () => {
    if (!ordem) return;

    const motivo = window.prompt("Informe o motivo da reabertura:");

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

      if (error instanceof ApiError) {
        toast.error(error.message);
      } else {
        toast.error("Erro ao reabrir OS");
      }
    } finally {
      setActionLoading(null);
    }
  };

  const abrirNovoItem = () => {
    setItemForm({
      pecaId: "",
      descricao: "",
      quantidade: 1,
      valorUnitario: 0,
    });

    setItemEditando("novo");
  };

  const selecionarPeca = (pecaId: string) => {
    const peca = pecas.find((item) => item.id === pecaId);

    if (!peca) {
      setItemForm((prev) => ({
        ...prev,
        pecaId: "",
        descricao: "",
        valorUnitario: 0,
      }));

      return;
    }

    setItemForm((prev) => ({
      ...prev,
      pecaId: peca.id,
      descricao: peca.nome,
      valorUnitario: Number(peca.valorVenda) || 0,
    }));
  };

  const abrirEdicaoItem = (item: OrdemServicoItem) => {
    setItemForm({
      pecaId: item.pecaId ?? "",
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

    if (!itemForm.pecaId) {
      toast.warning("Selecione uma peça do estoque");

      return;
    }

    if (itemForm.quantidade <= 0) {
      toast.warning("Quantidade deve ser maior que zero");

      return;
    }

    setItemSalvando(true);

    try {
      const payload = {
        pecaId: itemForm.pecaId || undefined,
        descricao: itemForm.descricao,
        quantidade: Number(itemForm.quantidade),
        valorUnitario: Number(itemForm.valorUnitario),
      };

      if (itemEditando === "novo") {
        await adicionarItem(ordem.id, payload);

        toast.success("Peça adicionada à ordem");
      } else if (itemEditando) {
        await atualizarItem(ordem.id, itemEditando, payload);

        toast.success("Peça atualizada");
      }

      setItemEditando(null);

      await load();
    } catch (err) {
      console.error(err);

      if (err instanceof ApiError) {
        toast.error(err.message);
      } else {
        toast.error("Erro ao salvar item");
      }
    } finally {
      setItemSalvando(false);
    }
  };

  const excluirItem = async (item: OrdemServicoItem) => {
    if (!ordem) return;

    if (!window.confirm(`Remover o item "${item.descricao}"?`)) {
      return;
    }

    setItemExcluindo(item.id);

    try {
      await removerItem(ordem.id, item.id);

      toast.success("Item removido");

      await load();
    } catch (err) {
      console.error(err);

      if (err instanceof ApiError) {
        toast.error(err.message);
      } else {
        toast.error("Erro ao remover item");
      }
    } finally {
      setItemExcluindo(null);
    }
  };

  if (loading) {
    return <PageLoader label="Carregando ordem de serviço..." />;
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

  const podeEditar = ordem.status === 0 || ordem.status === 1;

  const totalItens = itens.reduce(
    (total, item) =>
      total + Number(item.quantidade || 0) * Number(item.valorUnitario || 0),
    0,
  );

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
            -right-12
            -top-24
            h-56
            w-56
            rounded-full
            border
            border-[var(--app-border-subtle)]
          "
        />

        <div
          className="
            pointer-events-none
            absolute
            right-16
            -top-8
            h-28
            w-28
            rounded-full
            border
            border-[var(--app-border-subtle)]
          "
        />

        <div className="relative">
          <div className="mb-5">
            <Link to="/ordens-servico">
              <Button variant="ghost" size="sm" className="px-0">
                <ArrowLeft className="h-4 w-4" />
                Voltar às ordens
              </Button>
            </Link>
          </div>

          <div
            className="
              flex
              flex-col
              gap-6
              lg:flex-row
              lg:items-end
              lg:justify-between
            "
          >
            <div className="min-w-0">
              <div
                className="
                  mb-3
                  flex
                  flex-wrap
                  items-center
                  gap-3
                "
              >
                <p
                  className="
                    text-[10px]
                    font-bold
                    uppercase
                    tracking-[0.18em]
                    text-[var(--app-text-muted)]
                  "
                >
                  Ordem de serviço
                </p>

                <StatusBadge status={ordem.status} />
              </div>

              <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2">
                <h1
                  className="
                    font-mono
                    text-2xl
                    font-bold
                    tracking-[-0.04em]
                    text-[var(--app-text)]
                    sm:text-3xl
                  "
                >
                  #{ordem.id.slice(0, 8).toUpperCase()}
                </h1>

                <span
                  className="
                    text-sm
                    text-[var(--app-text-muted)]
                  "
                >
                  Criada em {formatDate(ordem.dataCriacao)}
                </span>
              </div>
            </div>

            <div
              className="
                grid
                grid-cols-1
                gap-2
                sm:flex
                sm:flex-wrap
              "
            >
              {podeEditar && (
                <Link to={`/ordens-servico/${ordem.id}/editar`}>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full sm:w-auto"
                  >
                    <Pencil className="h-4 w-4" />
                    Editar
                  </Button>
                </Link>
              )}

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
        </div>
      </section>

      {/* CONTEXTO DA OS */}
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
            Contexto
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
            Informações principais
          </h2>
        </div>

        <div
          className="
            grid
            gap-px
            overflow-hidden
            border
            border-[var(--app-border-subtle)]
            bg-[var(--app-border-subtle)]
            sm:grid-cols-2
            lg:grid-cols-4
          "
        >
          {/* CLIENTE */}
          <div className="bg-[var(--app-surface)] p-5">
            <div className="flex items-start gap-3">
              <div
                className="
                  flex
                  h-9
                  w-9
                  shrink-0
                  items-center
                  justify-center
                  rounded-xl
                  bg-sky-500/10
                  text-sky-500
                "
              >
                <User className="h-4 w-4" />
              </div>

              <div className="min-w-0">
                <p
                  className="
                    text-[9px]
                    font-bold
                    uppercase
                    tracking-[0.14em]
                    text-[var(--app-text-muted)]
                  "
                >
                  Cliente
                </p>

                <Link
                  to={`/clientes/${ordem.clienteId}`}
                  className="
                    mt-1
                    block
                    truncate
                    text-sm
                    font-semibold
                    text-[var(--app-text)]
                    transition-colors
                    hover:text-[var(--accent-text)]
                  "
                >
                  {ordem.cliente?.nome ?? "—"}
                </Link>
              </div>
            </div>
          </div>

          {/* VEÍCULO */}
          <div className="bg-[var(--app-surface)] p-5">
            <div className="flex items-start gap-3">
              <div
                className="
                  flex
                  h-9
                  w-9
                  shrink-0
                  items-center
                  justify-center
                  rounded-xl
                  bg-[var(--app-surface-raised)]
                  text-[var(--accent-text)]
                "
              >
                <Car className="h-4 w-4" />
              </div>

              <div className="min-w-0">
                <p
                  className="
                    text-[9px]
                    font-bold
                    uppercase
                    tracking-[0.14em]
                    text-[var(--app-text-muted)]
                  "
                >
                  Veículo
                </p>

                <Link
                  to={`/veiculos/${ordem.veiculoId}`}
                  className="
                    mt-1
                    block
                    truncate
                    text-sm
                    font-semibold
                    text-[var(--app-text)]
                    transition-colors
                    hover:text-[var(--accent-text)]
                  "
                >
                  {ordem.veiculo
                    ? `${ordem.veiculo.marca} ${ordem.veiculo.modelo}`
                    : "—"}

                  {ordem.veiculo?.placa ? ` — ${ordem.veiculo.placa}` : ""}
                </Link>
              </div>
            </div>
          </div>

          {/* MECÂNICO */}
          <div className="bg-[var(--app-surface)] p-5">
            <div className="flex items-start gap-3">
              <div
                className="
                  flex
                  h-9
                  w-9
                  shrink-0
                  items-center
                  justify-center
                  rounded-xl
                  bg-emerald-500/10
                  text-emerald-500
                "
              >
                <Wrench className="h-4 w-4" />
              </div>

              <div className="min-w-0">
                <p
                  className="
                    text-[9px]
                    font-bold
                    uppercase
                    tracking-[0.14em]
                    text-[var(--app-text-muted)]
                  "
                >
                  Mecânico
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
                  {ordem.mecanico?.nome ?? "—"}
                </p>
              </div>
            </div>
          </div>

          {/* STATUS */}
          <div className="bg-[var(--app-surface)] p-5">
            <div className="flex items-start gap-3">
              <div
                className="
                  flex
                  h-9
                  w-9
                  shrink-0
                  items-center
                  justify-center
                  rounded-xl
                  bg-violet-500/10
                  text-violet-500
                "
              >
                <ClipboardList className="h-4 w-4" />
              </div>

              <div className="min-w-0">
                <p
                  className="
                    text-[9px]
                    font-bold
                    uppercase
                    tracking-[0.14em]
                    text-[var(--app-text-muted)]
                  "
                >
                  Status atual
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
                  {statusLabel(status)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CONTEÚDO PRINCIPAL */}
      <div className="grid gap-5 lg:grid-cols-3">
        {/* COLUNA PRINCIPAL */}
        <div className="min-w-0 space-y-5 lg:col-span-2">
          {/* DESCRIÇÃO */}
          <Card>
            <CardHeader
              title="Descrição do serviço"
              subtitle="Detalhamento do atendimento"
            />

            <div className="px-5 py-5">
              <p
                className="
                  break-words
                  text-sm
                  leading-7
                  text-[var(--app-text-secondary)]
                "
              >
                {ordem.descricao || "Sem descrição"}
              </p>

              {ordem.observacao && (
                <div
                  className="
                    mt-5
                    border-l-2
                    border-[var(--accent)]
                    bg-[var(--app-surface-raised)]
                    px-4
                    py-3
                  "
                >
                  <p
                    className="
                      text-[9px]
                      font-bold
                      uppercase
                      tracking-[0.14em]
                      text-[var(--app-text-muted)]
                    "
                  >
                    Observação
                  </p>

                  <p
                    className="
                      mt-1.5
                      break-words
                      text-sm
                      leading-6
                      text-[var(--app-text-secondary)]
                    "
                  >
                    {ordem.observacao}
                  </p>
                </div>
              )}
            </div>
          </Card>

          {/* PEÇAS / ITENS */}
          <Card className="overflow-hidden">
            <div
              className="
                flex
                flex-col
                gap-3
                border-b
                border-[var(--app-border-subtle)]
                px-5
                py-4
                sm:flex-row
                sm:items-center
                sm:justify-between
              "
            >
              <div>
                <p
                  className="
                    font-display
                    text-base
                    font-bold
                    text-[var(--app-text)]
                  "
                >
                  Peças / Itens
                </p>

                <p
                  className="
                    mt-0.5
                    text-xs
                    text-[var(--app-text-muted)]
                  "
                >
                  {itens.length} item(s)
                </p>
              </div>

              {podeEditar && itemEditando === null && (
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

            {itens.length === 0 && itemEditando === null ? (
              <EmptyState
                icon={<Package className="h-7 w-7" />}
                title="Nenhum item"
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[680px]">
                  <thead>
                    <tr
                      className="
                        border-b
                        border-[var(--app-border-subtle)]
                        text-left
                        text-[10px]
                        font-bold
                        uppercase
                        tracking-[0.12em]
                        text-[var(--app-text-muted)]
                      "
                    >
                      <th className="px-5 py-3">Descrição</th>

                      <th className="px-5 py-3 text-right">Qtd</th>

                      <th className="px-5 py-3 text-right">Valor unit.</th>

                      <th className="px-5 py-3 text-right">Total</th>

                      {podeEditar && itemEditando === null && (
                        <th className="px-5 py-3 text-right">Ações</th>
                      )}
                    </tr>
                  </thead>

                  <tbody
                    className="
                      divide-y
                      divide-[var(--app-border-subtle)]
                    "
                  >
                    {/* NOVO ITEM */}
                    {itemEditando === "novo" && (
                      <tr className="bg-[var(--app-surface-raised)]">
                        <td className="px-5 py-2">
                          <Select
                            value={itemForm.pecaId}
                            onChange={(e) => selecionarPeca(e.target.value)}
                            disabled={carregandoPecas}
                          >
                            <option value="">
                              {carregandoPecas
                                ? "Carregando peças..."
                                : "Selecione uma peça"}
                            </option>

                            {pecas.map((peca) => (
                              <option key={peca.id} value={peca.id}>
                                {peca.nome}
                                {peca.codigo ? ` — ${peca.codigo}` : ""}
                                {" — Disponível: "}
                                {peca.quantidadeDisponivelParaOrdem}
                              </option>
                            ))}
                          </Select>
                        </td>

                        <td className="px-5 py-2">
                          <input
                            type="number"
                            min={1}
                            className="
                              w-20
                              rounded-lg
                              border
                              border-[var(--input-border)]
                              bg-[var(--input-bg)]
                              px-2
                              py-1.5
                              text-right
                              text-sm
                              text-[var(--input-text)]
                              outline-none
                              transition
                              focus:border-[var(--input-focus)]
                              focus:ring-2
                              focus:ring-[var(--input-focus)]/20
                            "
                            value={itemForm.quantidade}
                            onChange={(e) =>
                              setItemForm((f) => ({
                                ...f,
                                quantidade: Number(e.target.value),
                              }))
                            }
                          />
                        </td>

                        <td className="px-5 py-2">
                          <input
                            type="number"
                            min={0}
                            step="0.01"
                            className="
                              w-28
                              rounded-lg
                              border
                              border-[var(--input-border)]
                              bg-[var(--input-bg)]
                              px-2
                              py-1.5
                              text-right
                              text-sm
                              text-[var(--input-text)]
                              outline-none
                              transition
                              focus:border-[var(--input-focus)]
                              focus:ring-2
                              focus:ring-[var(--input-focus)]/20
                            "
                            value={itemForm.valorUnitario}
                            onChange={(e) =>
                              setItemForm((f) => ({
                                ...f,
                                valorUnitario: Number(e.target.value),
                              }))
                            }
                          />
                        </td>

                        <td
                          className="
                            px-5
                            py-2
                            text-right
                            text-sm
                            font-semibold
                            text-[var(--app-text)]
                          "
                        >
                          {formatCurrency(
                            itemForm.quantidade * itemForm.valorUnitario,
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
                              onClick={cancelarEdicaoItem}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )}

                    {/* ITENS */}
                    {itens.map((item) =>
                      itemEditando === item.id ? (
                        <tr
                          key={item.id}
                          className="bg-[var(--app-surface-raised)]"
                        >
                          <td className="px-5 py-2">
                            <Select
                              value={itemForm.pecaId}
                              onChange={(e) => selecionarPeca(e.target.value)}
                              disabled={carregandoPecas}
                            >
                              <option value="">
                                {carregandoPecas
                                  ? "Carregando peças..."
                                  : "Selecione uma peça"}
                              </option>

                              {pecas.map((peca) => (
                                <option key={peca.id} value={peca.id}>
                                  {peca.nome} — Estoque:{" "}
                                  {peca.quantidadeEstoque}
                                </option>
                              ))}
                            </Select>
                          </td>

                          <td className="px-5 py-2">
                            <input
                              type="number"
                              min={1}
                              className="
                                w-20
                                rounded-lg
                                border
                                border-[var(--input-border)]
                                bg-[var(--input-bg)]
                                px-2
                                py-1.5
                                text-right
                                text-sm
                                text-[var(--input-text)]
                                outline-none
                                transition
                                focus:border-[var(--input-focus)]
                                focus:ring-2
                                focus:ring-[var(--input-focus)]/20
                              "
                              value={itemForm.quantidade}
                              onChange={(e) =>
                                setItemForm((f) => ({
                                  ...f,
                                  quantidade: Number(e.target.value),
                                }))
                              }
                            />
                          </td>

                          <td className="px-5 py-2">
                            <input
                              type="number"
                              min={0}
                              step="0.01"
                              className="
                                w-28
                                rounded-lg
                                border
                                border-[var(--input-border)]
                                bg-[var(--input-bg)]
                                px-2
                                py-1.5
                                text-right
                                text-sm
                                text-[var(--input-text)]
                                outline-none
                                transition
                                focus:border-[var(--input-focus)]
                                focus:ring-2
                                focus:ring-[var(--input-focus)]/20
                              "
                              value={itemForm.valorUnitario}
                              onChange={(e) =>
                                setItemForm((f) => ({
                                  ...f,
                                  valorUnitario: Number(e.target.value),
                                }))
                              }
                            />
                          </td>

                          <td
                            className="
                              px-5
                              py-2
                              text-right
                              text-sm
                              font-semibold
                              text-[var(--app-text)]
                            "
                          >
                            {formatCurrency(
                              itemForm.quantidade * itemForm.valorUnitario,
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
                                onClick={cancelarEdicaoItem}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        <tr
                          key={item.id}
                          className="
                            transition-colors
                            duration-150
                            hover:bg-[var(--hover-bg)]
                          "
                        >
                          <td
                            className="
                              px-5
                              py-3
                              text-sm
                              font-medium
                              text-[var(--app-text)]
                            "
                          >
                            {item.descricao}
                          </td>

                          <td
                            className="
                              px-5
                              py-3
                              text-right
                              text-sm
                              tabular-nums
                              text-[var(--app-text-secondary)]
                            "
                          >
                            {item.quantidade}
                          </td>

                          <td
                            className="
                              px-5
                              py-3
                              text-right
                              text-sm
                              tabular-nums
                              text-[var(--app-text-secondary)]
                            "
                          >
                            {formatCurrency(item.valorUnitario)}
                          </td>

                          <td
                            className="
                              px-5
                              py-3
                              text-right
                              text-sm
                              font-semibold
                              tabular-nums
                              text-[var(--app-text)]
                            "
                          >
                            {formatCurrency(
                              item.quantidade * item.valorUnitario,
                            )}
                          </td>

                          {podeEditar && itemEditando === null && (
                            <td className="px-5 py-3">
                              <div className="flex justify-end gap-1">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => abrirEdicaoItem(item)}
                                  disabled={itemEditando !== null}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>

                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => excluirItem(item)}
                                  loading={itemExcluindo === item.id}
                                  disabled={itemEditando !== null}
                                >
                                  <Trash2 className="h-4 w-4 text-red-500" />
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

          {/* VALORES */}
          <Card>
            <CardHeader
              title="Valores"
              subtitle="Composição financeira da ordem"
            />

            <div className="space-y-3 px-5 py-5">
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm text-[var(--app-text-secondary)]">
                  Mão de obra
                </span>

                <span className="shrink-0 text-sm font-semibold tabular-nums text-[var(--app-text)]">
                  {formatCurrency(ordem.valorMaoObra)}
                </span>
              </div>

              <div className="flex items-center justify-between gap-4">
                <span className="text-sm text-[var(--app-text-secondary)]">
                  Peças / Itens
                </span>

                <span className="shrink-0 text-sm font-semibold tabular-nums text-[var(--app-text)]">
                  {formatCurrency(totalItens)}
                </span>
              </div>

              <div
                className="
                  mt-4
                  flex
                  items-end
                  justify-between
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
                      tracking-[0.14em]
                      text-[var(--app-text-muted)]
                    "
                  >
                    Total da ordem
                  </p>

                  <p
                    className="
                      mt-1
                      font-display
                      text-lg
                      font-bold
                      text-[var(--app-text)]
                    "
                  >
                    Valor total
                  </p>
                </div>

                <span
                  className="
                    shrink-0
                    font-display
                    text-2xl
                    font-bold
                    tabular-nums
                    tracking-[-0.03em]
                    text-[var(--accent-text)]
                  "
                >
                  {formatCurrency(ordem.valorTotal)}
                </span>
              </div>
            </div>
          </Card>
        </div>

        {/* COLUNA LATERAL */}
        <div className="min-w-0 space-y-5">
          {/* AÇÕES */}
          <Card>
            <CardHeader title="Ações" subtitle="Fluxo da ordem de serviço" />

            <div className="space-y-2 p-4">
              {status === "Aberta" && (
                <Button
                  className="w-full justify-start"
                  onClick={handleEnviarAprovacao}
                  loading={actionLoading === "enviar"}
                >
                  <Send className="h-4 w-4" />
                  Enviar para aprovação
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

              {(status === "Aprovada" || status === "Reaberta") && (
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
                  <div className="space-y-2 pt-2">
                    <label
                      className="
                        text-[10px]
                        font-bold
                        uppercase
                        tracking-[0.12em]
                        text-[var(--app-text-muted)]
                      "
                    >
                      Motivo do cancelamento
                    </label>

                    <textarea
                      className="
                        w-full
                        rounded-xl
                        border
                        border-[var(--input-border)]
                        bg-[var(--input-bg)]
                        p-3
                        text-sm
                        text-[var(--input-text)]
                        outline-none
                        transition
                        placeholder:text-[var(--input-placeholder)]
                        focus:border-[var(--input-focus)]
                        focus:ring-2
                        focus:ring-[var(--input-focus)]/20
                      "
                      rows={3}
                      value={motivoCancelamento}
                      onChange={(e) => setMotivoCancelamento(e.target.value)}
                      placeholder="Ex: Cliente desistiu do serviço"
                    />
                  </div>

                  <Button
                    variant="danger"
                    className="w-full justify-start"
                    onClick={handleCancelar}
                    loading={actionLoading === "cancelar"}
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

              <div className="my-3 border-t border-[var(--app-border-subtle)]" />

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

          {/* TIMELINE */}
          <Card>
            <CardHeader title="Timeline" subtitle="Histórico de status" />

            <div className="p-5">
              {historicos.length === 0 ? (
                <p className="text-sm text-[var(--app-text-muted)]">
                  Nenhum histórico registrado.
                </p>
              ) : (
                <ol
                  className="
                    relative
                    space-y-6
                    border-l
                    border-[var(--app-border)]
                    pl-6
                  "
                >
                  {[...historicos].reverse().map((h) => (
                    <li key={h.id} className="relative">
                      <span
                        className="
                          absolute
                          -left-[30px]
                          top-0.5
                          flex
                          h-4
                          w-4
                          items-center
                          justify-center
                          rounded-full
                          bg-[var(--app-surface)]
                        "
                      >
                        <span
                          className="
                            h-2.5
                            w-2.5
                            rounded-full
                            bg-[var(--accent)]
                            ring-4
                            ring-[var(--accent)]/15
                          "
                        />
                      </span>

                      <div className="flex flex-wrap items-center gap-2">
                        <StatusBadge status={h.novoStatus} />

                        {h.statusAnterior !== null && (
                          <span className="text-xs text-[var(--app-text-muted)]">
                            de{" "}
                            <span className="font-medium text-[var(--app-text-secondary)]">
                              {statusLabel(statusFromNumber(h.statusAnterior))}
                            </span>
                          </span>
                        )}
                      </div>

                      <p className="mt-1.5 text-[11px] tabular-nums text-[var(--app-text-faint)]">
                        {formatDate(h.dataAlteracao)}
                      </p>

                      {h.observacao && (
                        <p
                          className="
                            mt-2
                            break-words
                            text-sm
                            leading-6
                            text-[var(--app-text-secondary)]
                          "
                        >
                          {h.observacao}
                        </p>
                      )}
                    </li>
                  ))}
                </ol>
              )}
            </div>
          </Card>

          {/* DATAS IMPORTANTES */}
          {(ordem.dataEnvioAprovacao || ordem.dataConclusao) && (
            <Card className="p-5">
              <div className="mb-4">
                <p
                  className="
                    text-[10px]
                    font-bold
                    uppercase
                    tracking-[0.16em]
                    text-[var(--app-text-muted)]
                  "
                >
                  Marcos
                </p>

                <h3
                  className="
                    mt-1
                    font-display
                    text-base
                    font-bold
                    text-[var(--app-text)]
                  "
                >
                  Datas importantes
                </h3>
              </div>

              <div className="space-y-4">
                {ordem.dataEnvioAprovacao && (
                  <div className="flex items-start gap-3">
                    <div
                      className="
                        flex
                        h-8
                        w-8
                        shrink-0
                        items-center
                        justify-center
                        rounded-lg
                        bg-[var(--app-surface-raised)]
                        text-[var(--app-text-muted)]
                      "
                    >
                      <Clock className="h-4 w-4" />
                    </div>

                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--app-text-muted)]">
                        Envio para aprovação
                      </p>

                      <p className="mt-1 text-sm font-medium text-[var(--app-text-secondary)]">
                        {formatDate(ordem.dataEnvioAprovacao)}
                      </p>
                    </div>
                  </div>
                )}

                {ordem.dataConclusao && (
                  <div className="flex items-start gap-3">
                    <div
                      className="
                        flex
                        h-8
                        w-8
                        shrink-0
                        items-center
                        justify-center
                        rounded-lg
                        bg-emerald-500/10
                        text-emerald-500
                      "
                    >
                      <CheckCircle2 className="h-4 w-4" />
                    </div>

                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--app-text-muted)]">
                        Conclusão
                      </p>

                      <p className="mt-1 text-sm font-medium text-[var(--app-text-secondary)]">
                        {formatDate(ordem.dataConclusao)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* CONFIRMAÇÃO DE EXCLUSÃO */}
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
