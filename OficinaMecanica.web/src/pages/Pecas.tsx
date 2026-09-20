import { useEffect, useMemo, useState, useCallback } from "react";

import {
  Plus,
  Search,
  Pencil,
  Package,
  PackageX,
  PackageCheck,
  AlertTriangle,
  Boxes,
  ArrowLeft,
  Tag,
  Trash2,
  PlusCircle,
  MinusCircle,
  History,
} from "lucide-react";

import { Link } from "react-router-dom";

import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Select } from "../components/ui/Select";
import { Modal } from "../components/ui/Modal";
import { EmptyState } from "../components/ui/EmptyState";
import { PageLoader } from "../components/ui/Spinner";
import { useToast } from "../components/ui/Toast";

import {
  PecaForm,
  type PecaFormValues,
} from "../components/forms/PecaForm";

import {
  listPecas,
  createPeca,
  updatePeca,
  ativarPeca,
  inativarPeca,
  ajustarEstoque,
  excluirPeca,
} from "../services/pecas";

import type { Peca } from "../types";
import { formatCurrency } from "../utils/format";
import { HistoricoEstoqueModal } from "../components/forms/HistoricoEstoqueModal";

export function Pecas() {
  const { error, success } = useToast();

  const [pecas, setPecas] = useState<Peca[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("todos");

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Peca | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // ============================================================
  // ESTOQUE
  // ============================================================

  const [estoqueEditando, setEstoqueEditando] = useState<string | null>(
    null,
  );

  const [quantidadeEstoque, setQuantidadeEstoque] = useState("");

  const [salvandoEstoque, setSalvandoEstoque] = useState(false);

  const [quantidadeAdicionar, setQuantidadeAdicionar] = useState("");

  const [adicionandoEstoque, setAdicionandoEstoque] = useState(false);

  const [historicoPeca, setHistoricoPeca] = useState<Peca | null>(null);

  const load = useCallback(async () => {
    setLoading(true);

    try {
      const data = await listPecas();
      setPecas(data);
    } catch (err) {
      error("Erro ao carregar peças");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [error]);

  useEffect(() => {
    load();
  }, [load]);

  const estoqueBaixo = (p: Peca) =>
    p.quantidadeEstoque <= p.estoqueMinimo;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    return pecas.filter((p) => {
      const matchesSearch =
        !q ||
        p.nome.toLowerCase().includes(q) ||
        (p.codigo ?? "").toLowerCase().includes(q);

      const matchesStatus =
        filtroStatus === "todos" ||
        (filtroStatus === "ativas" && p.ativa) ||
        (filtroStatus === "inativas" && !p.ativa) ||
        (filtroStatus === "estoqueBaixo" && estoqueBaixo(p));

      return matchesSearch && matchesStatus;
    });
  }, [pecas, search, filtroStatus]);

  // ============================================================
  // CADASTRO / EDIÇÃO
  // ============================================================

  const handleSubmit = async (values: PecaFormValues) => {
    setSubmitting(true);

    try {
      if (editing) {
        await updatePeca(editing.id, {
          nome: values.nome,
          codigo: values.codigo || undefined,
          valorCusto: values.valorCusto,
          valorVenda: values.valorVenda,
          estoqueMinimo: values.estoqueMinimo,
        });

        success("Peça atualizada com sucesso");
      } else {
        await createPeca({
          nome: values.nome,
          codigo: values.codigo || undefined,
          valorCusto: values.valorCusto,
          valorVenda: values.valorVenda,
          quantidadeEstoque: values.quantidadeEstoque,
          estoqueMinimo: values.estoqueMinimo,
        });

        success("Peça cadastrada com sucesso");
      }

      setModalOpen(false);
      setEditing(null);

      await load();
    } catch (err) {
      console.error(err);

      error(
        extrairMensagemErro(
          err,
          editing
            ? "Erro ao atualizar peça"
            : "Erro ao cadastrar peça",
        ),
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ============================================================
  // ATIVAR / INATIVAR
  // ============================================================

  const handleInativar = async (peca: Peca) => {
    try {
      await inativarPeca(peca.id);

      success("Peça inativada com sucesso");

      await load();
    } catch (err) {
      console.error(err);

      error(extrairMensagemErro(err, "Erro ao inativar peça"));
    }
  };

  const handleAtivar = async (peca: Peca) => {
    try {
      await ativarPeca(peca.id);

      success("Peça reativada com sucesso");

      await load();
    } catch (err) {
      console.error(err);

      error(extrairMensagemErro(err, "Erro ao reativar peça"));
    }
  };

  // ============================================================
  // MENSAGEM DE ERRO DA API
  // ============================================================

  const extrairMensagemErro = (
    err: unknown,
    mensagemPadrao: string,
  ): string => {
    if (err instanceof Error && err.message) {
      return err.message;
    }

    if (typeof err === "string" && err.trim()) {
      return err;
    }

    if (typeof err === "object" && err !== null) {
      const objeto = err as {
        message?: unknown;
        response?: {
          data?: {
            message?: unknown;
            title?: unknown;
            detail?: unknown;
          };
        };
      };

      const mensagemResponse = objeto.response?.data?.message;

      if (
        typeof mensagemResponse === "string" &&
        mensagemResponse.trim()
      ) {
        return mensagemResponse;
      }

      const detail = objeto.response?.data?.detail;

      if (typeof detail === "string" && detail.trim()) {
        return detail;
      }

      const title = objeto.response?.data?.title;

      if (typeof title === "string" && title.trim()) {
        return title;
      }

      if (
        typeof objeto.message === "string" &&
        objeto.message.trim()
      ) {
        return objeto.message;
      }
    }

    return mensagemPadrao;
  };

  // ============================================================
  // ESTOQUE — EDITAR QUANTIDADE FINAL
  // ============================================================

  const iniciarEdicaoEstoque = (peca: Peca) => {
    setEstoqueEditando(peca.id);
    setQuantidadeEstoque(String(peca.quantidadeEstoque));
    setQuantidadeAdicionar("");
  };

  const cancelarEdicaoEstoque = () => {
    setEstoqueEditando(null);
    setQuantidadeEstoque("");
    setQuantidadeAdicionar("");
  };

  const handleSalvarEstoque = async (peca: Peca) => {
    const quantidade = Number(quantidadeEstoque);

    if (!Number.isInteger(quantidade)) {
      error("Informe uma quantidade inteira para o estoque.");
      return;
    }

    if (quantidade < 0) {
      error("A quantidade em estoque não pode ser negativa.");
      return;
    }

    setSalvandoEstoque(true);

    try {
      const pecaAtualizada = await ajustarEstoque(
        peca.id,
        quantidade,
      );

      setPecas((atual) =>
        atual.map((item) =>
          item.id === pecaAtualizada.id
            ? pecaAtualizada
            : item,
        ),
      );

      success("Estoque ajustado com sucesso.");

      cancelarEdicaoEstoque();
    } catch (err) {
      console.error(err);

      /*
       * O backend valida:
       * - quantidade negativa
       * - quantidade abaixo das reservas das OS ativas
       *
       * A API devolve o erro para o frontend.
       * O backend continua executando normalmente.
       */
      error(
        extrairMensagemErro(
          err,
          "Não foi possível ajustar o estoque.",
        ),
      );
    } finally {
      setSalvandoEstoque(false);
    }
  };

  // ============================================================
  // ESTOQUE — ADICIONAR QUANTIDADE
  // ============================================================

  const handleAdicionarEstoque = async (peca: Peca) => {
    const quantidadeAdicionarNumero = Number(
      quantidadeAdicionar,
    );

    if (!Number.isInteger(quantidadeAdicionarNumero)) {
      error("Informe uma quantidade inteira para adicionar.");
      return;
    }

    if (quantidadeAdicionarNumero <= 0) {
      error("A quantidade adicionada deve ser maior que zero.");
      return;
    }

    const novaQuantidade =
      peca.quantidadeEstoque + quantidadeAdicionarNumero;

    setAdicionandoEstoque(true);

    try {
      const pecaAtualizada = await ajustarEstoque(
        peca.id,
        novaQuantidade,
      );

      setPecas((atual) =>
        atual.map((item) =>
          item.id === pecaAtualizada.id
            ? pecaAtualizada
            : item,
        ),
      );

      success(
        `${quantidadeAdicionarNumero} unidade(s) adicionada(s) ao estoque.`,
      );

      setQuantidadeAdicionar("");
      setEstoqueEditando(null);
    } catch (err) {
      console.error(err);

      error(
        extrairMensagemErro(
          err,
          "Não foi possível adicionar ao estoque.",
        ),
      );
    } finally {
      setAdicionandoEstoque(false);
    }
  };

  // ============================================================
  // ESTOQUE — ZERAR
  // ============================================================

  const handleZerarEstoque = async (peca: Peca) => {
    if (peca.quantidadeEstoque === 0) {
      error("Esta peça já está com o estoque zerado.");
      return;
    }

    const confirmar = window.confirm(
      `Deseja realmente zerar o estoque da peça "${peca.nome}"?`,
    );

    if (!confirmar) {
      return;
    }

    setSalvandoEstoque(true);

    try {
      const pecaAtualizada = await ajustarEstoque(
        peca.id,
        0,
      );

      setPecas((atual) =>
        atual.map((item) =>
          item.id === pecaAtualizada.id
            ? pecaAtualizada
            : item,
        ),
      );

      success("Estoque zerado com sucesso.");

      cancelarEdicaoEstoque();
    } catch (err) {
      console.error(err);

      /*
       * Se existirem peças reservadas em OS ativas,
       * o backend recusará o estoque 0 e devolverá
       * a mensagem explicando o motivo.
       */
      error(
        extrairMensagemErro(
          err,
          "Não foi possível zerar o estoque.",
        ),
      );
    } finally {
      setSalvandoEstoque(false);
    }
  };

  // ============================================================
  // EXCLUSÃO
  // ============================================================

  const handleExcluir = async (peca: Peca) => {
    const confirmar = window.confirm(
      `Deseja realmente excluir a peça "${peca.nome}"?`,
    );

    if (!confirmar) {
      return;
    }

    try {
      await excluirPeca(peca.id);

      setPecas((atual) =>
        atual.filter((item) => item.id !== peca.id),
      );

      success("Peça excluída com sucesso.");
    } catch (err) {
      console.error(err);

      /*
       * Se a peça já tiver sido utilizada em uma OS,
       * o backend retorna 409 e informa que ela não pode
       * ser excluída para preservar o histórico.
       */
      error(
        extrairMensagemErro(
          err,
          "Não foi possível excluir a peça.",
        ),
      );
    }
  };

  const totalAtivas = pecas.filter((p) => p.ativa).length;

  const totalEstoqueBaixo =
    pecas.filter(estoqueBaixo).length;

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
            <Link to="/painel">
              <Button
                variant="ghost"
                size="sm"
                className="px-0"
              >
                <ArrowLeft className="h-4 w-4" />
                Voltar ao painel
              </Button>
            </Link>
          </div>

          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
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
                Estoque
              </p>

              <h1
                className="
                  mt-2
                  font-display
                  text-3xl
                  font-extrabold
                  tracking-[-0.04em]
                  text-[var(--app-text)]
                  sm:text-4xl
                "
              >
                Peças
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
                Cadastre as peças utilizadas nas ordens de
                serviço, controle preços e acompanhe o estoque.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                onClick={() => {
                  setEditing(null);
                  setModalOpen(true);
                }}
              >
                <Plus className="h-4 w-4" />
                Nova peça
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* INDICADORES */}
      <section>
        <div className="grid gap-3 sm:grid-cols-3">
          <Card className="relative overflow-hidden p-5">
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
                <Boxes className="h-5 w-5" />
              </div>

              <span
                className="
                  text-[10px]
                  font-bold
                  uppercase
                  tracking-[0.12em]
                  text-[var(--app-text-faint)]
                "
              >
                Total
              </span>
            </div>

            <div className="mt-7">
              <p
                className="
                  font-display
                  text-3xl
                  font-bold
                  tabular-nums
                  tracking-[-0.04em]
                  text-[var(--app-text)]
                "
              >
                {pecas.length}
              </p>

              <p
                className="
                  mt-1
                  text-xs
                  font-semibold
                  uppercase
                  tracking-[0.1em]
                  text-[var(--app-text-muted)]
                "
              >
                Peças cadastradas
              </p>
            </div>
          </Card>

          <Card className="relative overflow-hidden p-5">
            <div className="flex items-start justify-between">
              <div
                className="
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-xl
                  bg-emerald-500/10
                  text-emerald-500
                "
              >
                <PackageCheck className="h-5 w-5" />
              </div>

              <span
                className="
                  text-[10px]
                  font-bold
                  uppercase
                  tracking-[0.12em]
                  text-[var(--app-text-faint)]
                "
              >
                Ativas
              </span>
            </div>

            <div className="mt-7">
              <p
                className="
                  font-display
                  text-3xl
                  font-bold
                  tabular-nums
                  tracking-[-0.04em]
                  text-[var(--app-text)]
                "
              >
                {totalAtivas}
              </p>

              <p
                className="
                  mt-1
                  text-xs
                  font-semibold
                  uppercase
                  tracking-[0.1em]
                  text-[var(--app-text-muted)]
                "
              >
                Peças disponíveis
              </p>
            </div>
          </Card>

          <Card className="relative overflow-hidden p-5">
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
                <AlertTriangle className="h-5 w-5" />
              </div>

              <span
                className="
                  text-[10px]
                  font-bold
                  uppercase
                  tracking-[0.12em]
                  text-[var(--app-text-faint)]
                "
              >
                Atenção
              </span>
            </div>

            <div className="mt-7">
              <p
                className="
                  font-display
                  text-3xl
                  font-bold
                  tabular-nums
                  tracking-[-0.04em]
                  text-[var(--app-text)]
                "
              >
                {totalEstoqueBaixo}
              </p>

              <p
                className="
                  mt-1
                  text-xs
                  font-semibold
                  uppercase
                  tracking-[0.1em]
                  text-[var(--app-text-muted)]
                "
              >
                Com estoque baixo
              </p>
            </div>
          </Card>
        </div>
      </section>

      {/* FILTROS */}
      <section>
        <div className="mb-4 flex items-end justify-between gap-4">
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
              Catálogo
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
              Peças da oficina
            </h2>
          </div>

          <span
            className="
              hidden
              text-xs
              font-medium
              text-[var(--app-text-muted)]
              sm:block
            "
          >
            {filtered.length} resultado(s)
          </span>
        </div>

        <div
          className="
            grid
            gap-3
            border-y
            border-[var(--app-border-subtle)]
            py-4
            lg:grid-cols-[minmax(0,1fr)_224px]
          "
        >
          <div className="relative">
            <Search
              className="
                pointer-events-none
                absolute
                left-3
                top-1/2
                h-4
                w-4
                -translate-y-1/2
                text-[var(--app-text-muted)]
              "
            />

            <Input
              placeholder="Buscar por nome ou código..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9"
            />
          </div>

          <Select
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value)}
            className="w-full"
          >
            <option value="todos">Todas as peças</option>
            <option value="ativas">Peças ativas</option>
            <option value="inativas">Peças inativas</option>
            <option value="estoqueBaixo">Estoque baixo</option>
          </Select>
        </div>
      </section>

      {/* CONTEÚDO */}
      {loading ? (
        <PageLoader label="Carregando peças..." />
      ) : filtered.length === 0 ? (
        <Card>
          <EmptyState
            icon={<Package className="h-7 w-7" />}
            title={
              search
                ? "Nenhuma peça encontrada"
                : "Nenhuma peça cadastrada"
            }
            description={
              search
                ? "Tente outra busca."
                : "Cadastre a primeira peça da oficina."
            }
            action={
              !search && (
                <Button
                  onClick={() => {
                    setEditing(null);
                    setModalOpen(true);
                  }}
                >
                  <Plus className="h-4 w-4" />
                  Cadastrar peça
                </Button>
              )
            }
          />
        </Card>
      ) : (
        <div
          className="
            grid
            grid-cols-1
            gap-3
            md:grid-cols-2
            xl:grid-cols-3
          "
        >
          {filtered.map((p) => (
            <Card
              key={p.id}
              className="
                group
                overflow-hidden
                p-0
              "
            >
              <div className="p-5">
                <div className="flex items-start gap-3.5">
                  <div
                    className="
                      flex
                      h-12
                      w-12
                      shrink-0
                      items-center
                      justify-center
                      rounded-2xl
                      bg-[var(--app-surface-raised)]
                      text-[var(--accent-text)]
                    "
                  >
                    <Package className="h-5 w-5" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex min-w-0 items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p
                          className="
                            truncate
                            font-display
                            text-sm
                            font-bold
                            text-[var(--app-text)]
                          "
                        >
                          {p.nome}
                        </p>

                        <p
                          className="
                            mt-1
                            flex
                            min-w-0
                            items-center
                            gap-1.5
                            truncate
                            text-xs
                            text-[var(--app-text-muted)]
                          "
                        >
                          <Tag className="h-3 w-3 shrink-0" />

                          <span className="truncate">
                            {p.codigo || "Sem código"}
                          </span>
                        </p>
                      </div>

                      {p.ativa ? (
                        <span
                          className="
                            shrink-0
                            inline-flex
                            items-center
                            gap-1.5
                            rounded-full
                            bg-emerald-500/10
                            px-2
                            py-1
                            text-[9px]
                            font-bold
                            uppercase
                            tracking-wide
                            text-emerald-500
                          "
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-current" />
                          Ativa
                        </span>
                      ) : (
                        <span
                          className="
                            shrink-0
                            inline-flex
                            items-center
                            gap-1.5
                            rounded-full
                            bg-red-500/10
                            px-2
                            py-1
                            text-[9px]
                            font-bold
                            uppercase
                            tracking-wide
                            text-red-500
                          "
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-current" />
                          Inativa
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* PREÇO E ESTOQUE */}
                <div
                  className="
                    mt-5
                    grid
                    grid-cols-2
                    gap-3
                    border-t
                    border-[var(--app-border-subtle)]
                    pt-4
                  "
                >
                  <div>
                    <p
                      className="
                        text-[9px]
                        font-bold
                        uppercase
                        tracking-[0.14em]
                        text-[var(--app-text-faint)]
                      "
                    >
                      Valor de venda
                    </p>

                    <p
                      className="
                        mt-0.5
                        text-sm
                        font-semibold
                        text-[var(--app-text-secondary)]
                      "
                    >
                      {formatCurrency(p.valorVenda)}
                    </p>
                  </div>

                  <div>
                    <p
                      className="
                        text-[9px]
                        font-bold
                        uppercase
                        tracking-[0.14em]
                        text-[var(--app-text-faint)]
                      "
                    >
                      Estoque
                    </p>

                    {estoqueEditando === p.id ? (
                      <div className="mt-1 space-y-2">
                        {/* AJUSTE FINAL */}
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            min={0}
                            step={1}
                            value={quantidadeEstoque}
                            onChange={(e) =>
                              setQuantidadeEstoque(
                                e.target.value,
                              )
                            }
                            className="h-8 w-20"
                            disabled={
                              salvandoEstoque ||
                              adicionandoEstoque
                            }
                          />

                          <button
                            type="button"
                            onClick={() =>
                              handleSalvarEstoque(p)
                            }
                            disabled={
                              salvandoEstoque ||
                              adicionandoEstoque
                            }
                            className="
                              rounded-lg
                              px-2
                              py-1
                              text-xs
                              font-semibold
                              text-[var(--accent-text)]
                              transition-colors
                              hover:bg-[var(--hover-bg)]
                              disabled:cursor-not-allowed
                              disabled:opacity-50
                            "
                          >
                            {salvandoEstoque
                              ? "..."
                              : "Salvar"}
                          </button>

                          <button
                            type="button"
                            onClick={cancelarEdicaoEstoque}
                            disabled={
                              salvandoEstoque ||
                              adicionandoEstoque
                            }
                            className="
                              rounded-lg
                              px-2
                              py-1
                              text-xs
                              font-semibold
                              text-[var(--app-text-muted)]
                              transition-colors
                              hover:bg-[var(--hover-bg)]
                              disabled:cursor-not-allowed
                              disabled:opacity-50
                            "
                          >
                            Cancelar
                          </button>
                        </div>

                        {/* ADICIONAR ESTOQUE */}
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            min={1}
                            step={1}
                            placeholder="+ quantidade"
                            value={quantidadeAdicionar}
                            onChange={(e) =>
                              setQuantidadeAdicionar(
                                e.target.value,
                              )
                            }
                            className="h-8 w-24"
                            disabled={
                              salvandoEstoque ||
                              adicionandoEstoque
                            }
                          />

                          <button
                            type="button"
                            onClick={() =>
                              handleAdicionarEstoque(p)
                            }
                            disabled={
                              salvandoEstoque ||
                              adicionandoEstoque
                            }
                            className="
                              inline-flex
                              items-center
                              gap-1
                              rounded-lg
                              px-2
                              py-1
                              text-xs
                              font-semibold
                              text-emerald-500
                              transition-colors
                              hover:bg-emerald-500/10
                              disabled:cursor-not-allowed
                              disabled:opacity-50
                            "
                          >
                            <PlusCircle className="h-3.5 w-3.5" />

                            {adicionandoEstoque
                              ? "..."
                              : "Adicionar"}
                          </button>
                        </div>

                        <div className="flex items-center justify-between">
                          <p
                            className="
                              text-[10px]
                              text-[var(--app-text-faint)]
                            "
                          >
                            Atual: {p.quantidadeEstoque}
                          </p>

                          {/* ZERAR ESTOQUE */}
                          <button
                            type="button"
                            onClick={() =>
                              handleZerarEstoque(p)
                            }
                            disabled={
                              salvandoEstoque ||
                              adicionandoEstoque ||
                              p.quantidadeEstoque === 0
                            }
                            className="
                              inline-flex
                              items-center
                              gap-1
                              rounded-lg
                              px-2
                              py-1
                              text-[10px]
                              font-semibold
                              text-red-500
                              transition-colors
                              hover:bg-red-500/10
                              disabled:cursor-not-allowed
                              disabled:opacity-40
                            "
                          >
                            <MinusCircle className="h-3.5 w-3.5" />
                            Zerar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-0.5 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            iniciarEdicaoEstoque(p)
                          }
                          title="Editar quantidade em estoque"
                          className={[
                            "flex",
                            "items-center",
                            "gap-1.5",
                            "text-sm",
                            "font-semibold",
                            "hover:underline",
                            estoqueBaixo(p)
                              ? "text-amber-500"
                              : "text-[var(--app-text-secondary)]",
                          ].join(" ")}
                        >
                          {p.quantidadeEstoque}

                          {estoqueBaixo(p) && (
                            <AlertTriangle className="h-3.5 w-3.5" />
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            iniciarEdicaoEstoque(p)
                          }
                          title="Gerenciar estoque"
                          className="
                            rounded-lg
                            p-1
                            text-[var(--app-text-muted)]
                            transition-colors
                            hover:bg-[var(--hover-bg)]
                            hover:text-[var(--accent-text)]
                          "
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* AÇÕES */}
              <div
                className="
                  flex
                  items-center
                  justify-between
                  border-t
                  border-[var(--app-border-subtle)]
                  bg-[var(--app-surface-raised)]
                  px-4
                  py-2.5
                "
              >
                <span
                  className="
                    text-xs
                    font-semibold
                    text-[var(--app-text-muted)]
                  "
                >
                  Custo: {formatCurrency(p.valorCusto)}
                </span>

                <div className="flex items-center gap-1">
                  {/* HISTÓRICO DE ESTOQUE */}
                  <button
                    type="button"
                    onClick={() => setHistoricoPeca(p)}
                    className="
                      rounded-lg
                      p-2
                      text-[var(--app-text-muted)]
                      transition-colors
                      duration-200
                      hover:bg-[var(--hover-bg)]
                      hover:text-[var(--accent-text)]
                      focus:outline-none
                      focus-visible:ring-2
                      focus-visible:ring-[var(--accent)]/40
                    "
                    title="Histórico de estoque"
                  >
                    <History className="h-4 w-4" />
                  </button>

                  {/* EDITAR */}
                  <button
                    type="button"
                    onClick={() => {
                      setEditing(p);
                      setModalOpen(true);
                    }}
                    className="
                      rounded-lg
                      p-2
                      text-[var(--app-text-muted)]
                      transition-colors
                      duration-200
                      hover:bg-[var(--hover-bg)]
                      hover:text-[var(--accent-text)]
                      focus:outline-none
                      focus-visible:ring-2
                      focus-visible:ring-[var(--accent)]/40
                    "
                    title="Editar"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>

                  {/* EXCLUIR */}
                  <button
                    type="button"
                    onClick={() => handleExcluir(p)}
                    className="
                      rounded-lg
                      p-2
                      text-[var(--app-text-muted)]
                      transition-colors
                      duration-200
                      hover:bg-red-500/10
                      hover:text-red-500
                      focus:outline-none
                      focus-visible:ring-2
                      focus-visible:ring-red-500/30
                    "
                    title="Excluir peça"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>

                  {/* ATIVAR / INATIVAR */}
                  {p.ativa ? (
                    <button
                      type="button"
                      onClick={() => handleInativar(p)}
                      className="
                        rounded-lg
                        p-2
                        text-[var(--app-text-muted)]
                        transition-colors
                        duration-200
                        hover:bg-red-500/10
                        hover:text-red-500
                        focus:outline-none
                        focus-visible:ring-2
                        focus-visible:ring-red-500/30
                      "
                      title="Inativar peça"
                    >
                      <PackageX className="h-4 w-4" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleAtivar(p)}
                      className="
                        rounded-lg
                        p-2
                        text-[var(--app-text-muted)]
                        transition-colors
                        duration-200
                        hover:bg-emerald-500/10
                        hover:text-emerald-500
                        focus:outline-none
                        focus-visible:ring-2
                        focus-visible:ring-emerald-500/30
                      "
                      title="Reativar peça"
                    >
                      <PackageCheck className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* MODAL */}
      <Modal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditing(null);
        }}
        title={editing ? "Editar peça" : "Cadastrar peça"}
        description={
          editing
            ? "Atualize os dados da peça."
            : "Preencha os dados da nova peça."
        }
        size="lg"
      >
        <PecaForm
          initial={editing}
          onSubmit={handleSubmit}
          onCancel={() => {
            setModalOpen(false);
            setEditing(null);
          }}
          submitting={submitting}
        />
      </Modal>

      {historicoPeca && (
        <HistoricoEstoqueModal
          key={historicoPeca.id}
          peca={historicoPeca}
          onClose={() => setHistoricoPeca(null)}
        />
      )}
    </div>
  );
}