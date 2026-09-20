import { type FormEvent, useEffect, useState } from "react";

import {
  Plus,
  Trash2,
  Pencil,
  Check,
  X,
} from "lucide-react";

import { Input } from "../ui/Input";
import { Select } from "../ui/Select";
import { Textarea } from "../ui/Textarea";
import { Button } from "../ui/Button";

import type {
  Cliente,
  Veiculo,
  Mecanico,
  OrdemServicoItem,
  PecaDisponivelOrdemServico,
} from "../../types";

import { formatCurrency } from "../../utils/format";

import {
  adicionarItem,
  atualizarItem,
  removerItem,
  getOrdem,
} from "../../services/ordens";

import {
  listPecasDisponiveisParaOrdemServico,
} from "../../services/pecas";

import { ApiError } from "../../services/api";
import { useToast } from "../ui/Toast";

export interface OrdemItemFormValue {
  id?: string;
  pecaId?: string | null;
  descricao: string;
  quantidade: number;
  valorUnitario: number;
  valorTotal: number;
}

export interface OrdemFormValues {
  clienteId: string;
  veiculoId: string;
  mecanicoId: string;
  descricao: string;
  valorMaoObra: number;
  observacao: string;
  itens: OrdemItemFormValue[];
}

interface OrdemServicoFormProps {
  initial?: Partial<OrdemFormValues> & { id?: string };
  clientes: Cliente[];
  veiculos: Veiculo[];
  mecanico: Mecanico[];
  onSubmit: (v: OrdemFormValues) => void;
  onCancel: () => void;
  submitting?: boolean;
}

export function OrdemServicoForm({
  initial,
  clientes,
  veiculos,
  mecanico,
  onSubmit,
  onCancel,
  submitting,
}: OrdemServicoFormProps) {
  const modoEdicao = Boolean(initial?.id);
  const toast = useToast();

  const [pecas, setPecas] = useState<
    PecaDisponivelOrdemServico[]
  >([]);

  const [carregandoPecas, setCarregandoPecas] =
    useState(true);

  const [itens, setItens] = useState<
    OrdemItemFormValue[]
  >(
    initial?.itens && initial.itens.length > 0
      ? initial.itens.map((item) => ({
          id: item.id,
          pecaId: item.pecaId ?? "",
          descricao: item.descricao,
          quantidade: item.quantidade,
          valorUnitario: item.valorUnitario,
          valorTotal: item.valorTotal,
        }))
      : [
          {
            pecaId: "",
            descricao: "",
            quantidade: 1,
            valorUnitario: 0,
            valorTotal: 0,
          },
        ],
  );

  const [clienteSelecionado, setClienteSelecionado] =
    useState(initial?.clienteId ?? "");

  const [veiculoSelecionado, setVeiculoSelecionado] =
    useState(initial?.veiculoId ?? "");

  const [mecanicoSelecionado, setMecanicoSelecionado] =
    useState(initial?.mecanicoId ?? "");

  const [itemEditando, setItemEditando] =
    useState<string | null>(null);

  const [itemForm, setItemForm] = useState({
    pecaId: "",
    descricao: "",
    quantidade: 1,
    valorUnitario: 0,
  });

  const [itemSalvando, setItemSalvando] =
    useState(false);

  const [itemExcluindo, setItemExcluindo] =
    useState<string | null>(null);

  const filteredVeiculos = clienteSelecionado
    ? veiculos.filter(
        (veiculo) =>
          veiculo.clienteId === clienteSelecionado,
      )
    : [];

  // =========================================================
  // MENSAGEM DE ERRO DA API
  // =========================================================

  const obterMensagemErro = (
    err: unknown,
    mensagemPadrao: string,
  ) => {
    if (err instanceof ApiError && err.message) {
      return err.message;
    }

    if (err instanceof Error && err.message) {
      return err.message;
    }

    return mensagemPadrao;
  };

  // =========================================================
  // CARREGAR PEÇAS DISPONÍVEIS
  // =========================================================

  useEffect(() => {
    const carregarPecas = async () => {
      try {
        setCarregandoPecas(true);

        const data =
          await listPecasDisponiveisParaOrdemServico(
            initial?.id,
          );

        setPecas(data);
      } catch (err) {
        console.error(
          "Erro ao carregar peças:",
          err,
        );

        toast.error(
          obterMensagemErro(
            err,
            "Não foi possível carregar as peças.",
          ),
        );
      } finally {
        setCarregandoPecas(false);
      }
    };

    carregarPecas();
  }, [initial?.id]);

  // =========================================================
  // SELECIONAR PEÇA - NOVA OS
  // =========================================================

  const selecionarPecaNovo = (
    index: number,
    pecaId: string,
  ) => {
    const peca = pecas.find(
      (item) => item.id === pecaId,
    );

    setItens((prev) =>
      prev.map((item, i) => {
        if (i !== index) {
          return item;
        }

        if (!peca) {
          return {
            ...item,
            pecaId: "",
            descricao: "",
            valorUnitario: 0,
            valorTotal: 0,
          };
        }

        const quantidade =
          Number(item.quantidade) || 1;

        const valorUnitario =
          Number(peca.valorVenda) || 0;

        return {
          ...item,
          pecaId: peca.id,
          descricao: peca.nome,
          valorUnitario,
          valorTotal: Number(
            (
              quantidade * valorUnitario
            ).toFixed(2),
          ),
        };
      }),
    );
  };

  // =========================================================
  // ITENS - EDIÇÃO
  // =========================================================

  const abrirNovoItem = () => {
    setItemForm({
      pecaId: "",
      descricao: "",
      quantidade: 1,
      valorUnitario: 0,
    });

    setItemEditando("novo");
  };

  const abrirEdicaoItem = (
    item: OrdemItemFormValue,
  ) => {
    if (!item.id) {
      return;
    }

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

  const selecionarPecaEdicao = (
    pecaId: string,
  ) => {
    const peca = pecas.find(
      (item) => item.id === pecaId,
    );

    if (!peca) {
      setItemForm((form) => ({
        ...form,
        pecaId: "",
        descricao: "",
        valorUnitario: 0,
      }));

      return;
    }

    setItemForm((form) => ({
      ...form,
      pecaId: peca.id,
      descricao: peca.nome,
      valorUnitario: peca.valorVenda,
    }));
  };

  // =========================================================
  // SALVAR ITEM NA OS EXISTENTE
  // =========================================================

  const salvarItem = async () => {
    if (!initial?.id) {
      return;
    }

    if (!itemForm.pecaId) {
      toast.error("Selecione uma peça.");
      return;
    }

    if (!itemForm.descricao.trim()) {
      toast.error(
        "Informe uma peça para o item.",
      );

      return;
    }

    if (itemForm.quantidade <= 0) {
      toast.error(
        "A quantidade deve ser maior que zero.",
      );

      return;
    }

    setItemSalvando(true);

    try {
      if (itemEditando === "novo") {
        await adicionarItem(initial.id, {
          pecaId:
            itemForm.pecaId || undefined,

          descricao:
            itemForm.descricao.trim(),

          quantidade:
            Number(itemForm.quantidade),

          valorUnitario:
            Number(itemForm.valorUnitario),
        });
      } else if (itemEditando) {
        await atualizarItem(
          initial.id,
          itemEditando,
          {
            pecaId:
              itemForm.pecaId || undefined,

            descricao:
              itemForm.descricao.trim(),

            quantidade:
              Number(itemForm.quantidade),

            valorUnitario:
              Number(itemForm.valorUnitario),
          },
        );
      }

      const atualizada = await getOrdem(
        initial.id,
      );

      if (atualizada) {
        setItens(
          (atualizada.itens ?? []).map(
            (item: OrdemServicoItem) => ({
              id: item.id,
              pecaId: item.pecaId ?? "",
              descricao: item.descricao,
              quantidade: item.quantidade,
              valorUnitario:
                item.valorUnitario,
              valorTotal: item.valorTotal,
            }),
          ),
        );
      }

      setItemEditando(null);

      toast.success(
        itemEditando === "novo"
          ? "Peça adicionada à ordem de serviço."
          : "Peça atualizada na ordem de serviço.",
      );
    } catch (err) {
      console.error(
        "Erro ao salvar item:",
        err,
      );

      toast.error(
        obterMensagemErro(
          err,
          "Não foi possível salvar o item.",
        ),
      );
    } finally {
      setItemSalvando(false);
    }
  };

  // =========================================================
  // EXCLUIR ITEM
  // =========================================================

  const excluirItem = async (
    item: OrdemItemFormValue,
  ) => {
    if (!initial?.id || !item.id) {
      return;
    }

    if (
      !window.confirm(
        `Remover o item "${item.descricao}"?`,
      )
    ) {
      return;
    }

    setItemExcluindo(item.id);

    try {
      await removerItem(
        initial.id,
        item.id,
      );

      const atualizada = await getOrdem(
        initial.id,
      );

      if (atualizada) {
        setItens(
          (atualizada.itens ?? []).map(
            (item: OrdemServicoItem) => ({
              id: item.id,
              pecaId: item.pecaId ?? "",
              descricao: item.descricao,
              quantidade: item.quantidade,
              valorUnitario:
                item.valorUnitario,
              valorTotal: item.valorTotal,
            }),
          ),
        );
      }

      toast.success(
        "Peça removida da ordem de serviço.",
      );
    } catch (err) {
      console.error(
        "Erro ao excluir item:",
        err,
      );

      toast.error(
        obterMensagemErro(
          err,
          "Não foi possível remover o item.",
        ),
      );
    } finally {
      setItemExcluindo(null);
    }
  };

  // =========================================================
  // ITENS - NOVA OS
  // =========================================================

  const atualizarItemNovo = (
    index: number,
    field: keyof OrdemItemFormValue,
    value: string,
  ) => {
    setItens((prev) =>
      prev.map((item, i) => {
        if (i !== index) {
          return item;
        }

        const next = {
          ...item,
          [field]:
            field === "descricao" ||
            field === "pecaId"
              ? value
              : Number(value),
        } as OrdemItemFormValue;

        if (
          field === "quantidade" ||
          field === "valorUnitario"
        ) {
          next.valorTotal = Number(
            (
              (Number(next.quantidade) || 0) *
              (Number(next.valorUnitario) || 0)
            ).toFixed(2),
          );
        }

        return next;
      }),
    );
  };

  const adicionarItemNovo = () => {
    setItens((prev) => [
      ...prev,
      {
        pecaId: "",
        descricao: "",
        quantidade: 1,
        valorUnitario: 0,
        valorTotal: 0,
      },
    ]);
  };

  const removerItemNovo = (
    index: number,
  ) => {
    setItens((prev) =>
      prev.length > 1
        ? prev.filter(
            (_, i) => i !== index,
          )
        : prev,
    );
  };

  // =========================================================
  // SUBMIT DA OS
  // =========================================================

  const handleSubmit = (
    e: FormEvent<HTMLFormElement>,
  ) => {
    e.preventDefault();

    const fd = new FormData(
      e.currentTarget,
    );

    const itensValidos = itens
      .filter(
        (item) =>
          item.descricao.trim() !== "",
      )
      .map((item) => ({
        id: item.id,
        pecaId:
          item.pecaId || undefined,
        descricao:
          item.descricao.trim(),
        quantidade:
          Number(item.quantidade) || 0,
        valorUnitario:
          Number(item.valorUnitario) || 0,
        valorTotal:
          Number(item.valorTotal) || 0,
      }));

    const itemSemPeca =
      itensValidos.find(
        (item) => !item.pecaId,
      );

    if (itemSemPeca) {
      toast.error(
        `Selecione uma peça para o item "${itemSemPeca.descricao}".`,
      );

      return;
    }

    const quantidadeInvalida =
      itensValidos.find(
        (item) => item.quantidade <= 0,
      );

    if (quantidadeInvalida) {
      toast.error(
        `A quantidade da peça "${quantidadeInvalida.descricao}" deve ser maior que zero.`,
      );

      return;
    }

    onSubmit({
      clienteId: String(
        fd.get("clienteId") ?? "",
      ),

      veiculoId: String(
        fd.get("veiculoId") ?? "",
      ),

      mecanicoId: String(
        fd.get("mecanicoId") ?? "",
      ),

      descricao: String(
        fd.get("descricao") ?? "",
      ).trim(),

      valorMaoObra:
        Number(
          fd.get("valorMaoObra") ?? 0,
        ) || 0,

      observacao: String(
        fd.get("observacao") ?? "",
      ).trim(),

      itens: itensValidos,
    });
  };

  const totalItens = itens.reduce(
    (sum, item) =>
      sum +
      (Number(item.valorTotal) || 0),
    0,
  );

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5"
    >
      {/* =====================================================
          CLIENTE / VEÍCULO / MECÂNICO
      ===================================================== */}

      <div className="grid gap-4 sm:grid-cols-2">
        <Select
          label="Cliente *"
          name="clienteId"
          value={clienteSelecionado}
          onChange={(e) => {
            setClienteSelecionado(
              e.target.value,
            );

            setVeiculoSelecionado("");
          }}
          required
        >
          <option
            value=""
            disabled
          >
            Selecione um cliente
          </option>

          {clientes.map((cliente) => (
            <option
              key={cliente.id}
              value={cliente.id}
            >
              {cliente.nome}
            </option>
          ))}
        </Select>

        <Select
          label="Veículo *"
          name="veiculoId"
          value={veiculoSelecionado}
          onChange={(e) =>
            setVeiculoSelecionado(
              e.target.value,
            )
          }
          required
        >
          <option
            value=""
            disabled
          >
            Selecione um veículo
          </option>

          {filteredVeiculos.map(
            (veiculo) => (
              <option
                key={veiculo.id}
                value={veiculo.id}
              >
                {veiculo.marca}{" "}
                {veiculo.modelo}
                {veiculo.placa
                  ? ` — ${veiculo.placa}`
                  : ""}
              </option>
            ),
          )}
        </Select>

        <Select
          label="Mecânico *"
          name="mecanicoId"
          value={mecanicoSelecionado}
          onChange={(e) =>
            setMecanicoSelecionado(
              e.target.value,
            )
          }
          required
        >
          <option
            value=""
            disabled
          >
            Selecione um mecânico
          </option>

          {mecanico
            .filter(
              (m) => m.ativo,
            )
            .map((m) => (
              <option
                key={m.id}
                value={m.id}
              >
                {m.nome}
                {m.especialidade
                  ? ` - ${m.especialidade}`
                  : ""}
              </option>
            ))}
        </Select>
      </div>

      {/* =====================================================
          DESCRIÇÃO
      ===================================================== */}

      <Textarea
        label="Descrição do serviço *"
        name="descricao"
        defaultValue={
          initial?.descricao ?? ""
        }
        placeholder="Descreva o serviço a ser realizado..."
        required
      />

      {/* =====================================================
          MÃO DE OBRA
      ===================================================== */}

      <Input
        label="Valor da mão de obra (R$)"
        name="valorMaoObra"
        type="number"
        step="0.01"
        min="0"
        defaultValue={
          initial?.valorMaoObra &&
          initial.valorMaoObra > 0
            ? initial.valorMaoObra
            : ""
        }
        placeholder="0,00"
      />

      {/* =====================================================
          PEÇAS / ITENS
      ===================================================== */}

      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className="label-base mb-0">
            Peças / Itens do serviço
          </label>

          {modoEdicao ? (
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={abrirNovoItem}
              disabled={
                itemEditando !== null ||
                itemSalvando
              }
            >
              <Plus className="h-4 w-4" />
              Adicionar item
            </Button>
          ) : (
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={
                adicionarItemNovo
              }
              disabled={carregandoPecas}
            >
              <Plus className="h-4 w-4" />
              Adicionar item
            </Button>
          )}
        </div>

        {/* ===================================================
            MODO EDIÇÃO
        =================================================== */}

        {modoEdicao ? (
          <div className="overflow-x-auto rounded-xl border border-ink-700/60">
            <table className="w-full">
              <thead>
                <tr className="border-b border-ink-700/60 text-left text-xs font-semibold uppercase tracking-wide text-ink-400">
                  <th className="px-5 py-3">
                    Peça
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

                  <th className="px-5 py-3 text-right">
                    Ações
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-ink-700/40">
                {/* NOVO ITEM */}

                {itemEditando ===
                  "novo" && (
                  <tr className="bg-ink-800/30">
                    <td className="px-5 py-2">
                      <Select
                        value={
                          itemForm.pecaId
                        }
                        onChange={(e) =>
                          selecionarPecaEdicao(
                            e.target.value,
                          )
                        }
                        disabled={
                          carregandoPecas ||
                          itemSalvando
                        }
                      >
                        <option value="">
                          {carregandoPecas
                            ? "Carregando peças..."
                            : "Selecione uma peça"}
                        </option>

                        {pecas.map(
                          (peca) => (
                            <option
                              key={peca.id}
                              value={peca.id}
                            >
                              {peca.nome}
                              {peca.codigo
                                ? ` — ${peca.codigo}`
                                : ""}
                              {" — Disponível: "}
                              {
                                peca.quantidadeDisponivelParaOrdem
                              }
                            </option>
                          ),
                        )}
                      </Select>

                      {itemForm.pecaId && (
                        <p className="mt-1 text-xs text-ink-400">
                          {itemForm.descricao}
                        </p>
                      )}
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
                          setItemForm(
                            (form) => ({
                              ...form,
                              quantidade:
                                Number(
                                  e.target
                                    .value,
                                ),
                            }),
                          )
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
                        readOnly
                      />
                    </td>

                    <td className="px-5 py-2 text-right text-sm font-semibold text-white">
                      {formatCurrency(
                        Number(
                          itemForm.quantidade,
                        ) *
                          Number(
                            itemForm.valorUnitario,
                          ),
                      )}
                    </td>

                    <td className="px-5 py-2">
                      <div className="flex justify-end gap-1">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={
                            salvarItem
                          }
                          loading={
                            itemSalvando
                          }
                        >
                          <Check className="h-4 w-4" />
                        </Button>

                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={
                            cancelarEdicaoItem
                          }
                          disabled={
                            itemSalvando
                          }
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                )}

                {/* ITENS EXISTENTES */}

                {itens.map(
                  (
                    item,
                    index,
                  ) =>
                    itemEditando ===
                    item.id ? (
                      <tr
                        key={
                          item.id ??
                          index
                        }
                        className="bg-ink-800/30"
                      >
                        <td className="px-5 py-2">
                          <Select
                            value={
                              itemForm.pecaId
                            }
                            onChange={(e) =>
                              selecionarPecaEdicao(
                                e.target
                                  .value,
                              )
                            }
                            disabled={
                              carregandoPecas ||
                              itemSalvando
                            }
                          >
                            <option value="">
                              {carregandoPecas
                                ? "Carregando peças..."
                                : "Selecione uma peça"}
                            </option>

                            {pecas.map(
                              (peca) => (
                                <option
                                  key={
                                    peca.id
                                  }
                                  value={
                                    peca.id
                                  }
                                >
                                  {peca.nome}
                                  {peca.codigo
                                    ? ` — ${peca.codigo}`
                                    : ""}
                                  {" — Disponível: "}
                                  {
                                    peca.quantidadeDisponivelParaOrdem
                                  }
                                </option>
                              ),
                            )}
                          </Select>
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
                              setItemForm(
                                (
                                  form,
                                ) => ({
                                  ...form,
                                  quantidade:
                                    Number(
                                      e
                                        .target
                                        .value,
                                    ),
                                }),
                              )
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
                            readOnly
                          />
                        </td>

                        <td className="px-5 py-2 text-right text-sm font-semibold text-white">
                          {formatCurrency(
                            Number(
                              itemForm.quantidade,
                            ) *
                              Number(
                                itemForm.valorUnitario,
                              ),
                          )}
                        </td>

                        <td className="px-5 py-2">
                          <div className="flex justify-end gap-1">
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={
                                salvarItem
                              }
                              loading={
                                itemSalvando
                              }
                            >
                              <Check className="h-4 w-4" />
                            </Button>

                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              onClick={
                                cancelarEdicaoItem
                              }
                              disabled={
                                itemSalvando
                              }
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      <tr
                        key={
                          item.id ??
                          index
                        }
                      >
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
                            Number(
                              item.quantidade,
                            ) *
                              Number(
                                item.valorUnitario,
                              ),
                          )}
                        </td>

                        <td className="px-5 py-3">
                          <div className="flex justify-end gap-1">
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              onClick={() =>
                                abrirEdicaoItem(
                                  item,
                                )
                              }
                              disabled={
                                itemEditando !==
                                  null ||
                                itemSalvando
                              }
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>

                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              onClick={() =>
                                excluirItem(
                                  item,
                                )
                              }
                              loading={
                                itemExcluindo ===
                                item.id
                              }
                              disabled={
                                itemEditando !==
                                  null ||
                                itemSalvando
                              }
                            >
                              <Trash2 className="h-4 w-4 text-red-400" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ),
                )}
              </tbody>
            </table>
          </div>
        ) : (
          /* =================================================
             CADASTRO DE NOVA OS
          ================================================= */

          <div className="space-y-2.5">
            {itens.map(
              (item, index) => {
                const pecaSelecionada =
                  pecas.find(
                    (peca) =>
                      peca.id ===
                      item.pecaId,
                  );

                return (
                  <div
                    key={index}
                    className="grid grid-cols-12 items-end gap-2 rounded-xl border border-ink-700/60 bg-ink-800/40 p-3"
                  >
                    <div className="col-span-12 sm:col-span-5">
                      <Select
                        label="Peça"
                        value={
                          item.pecaId ??
                          ""
                        }
                        onChange={(e) =>
                          selecionarPecaNovo(
                            index,
                            e.target.value,
                          )
                        }
                        disabled={
                          carregandoPecas
                        }
                      >
                        <option value="">
                          {carregandoPecas
                            ? "Carregando peças..."
                            : "Selecione uma peça"}
                        </option>

                        {pecas.map(
                          (peca) => (
                            <option
                              key={
                                peca.id
                              }
                              value={
                                peca.id
                              }
                            >
                              {peca.nome}
                              {peca.codigo
                                ? ` — ${peca.codigo}`
                                : ""}
                              {" — Disponível: "}
                              {
                                peca.quantidadeDisponivelParaOrdem
                              }
                            </option>
                          ),
                        )}
                      </Select>

                      {pecaSelecionada && (
                        <p className="mt-1 text-xs text-ink-400">
                          Código:{" "}
                          {pecaSelecionada.codigo ||
                            "Sem código"}{" "}
                          · Disponível:{" "}
                          {
                            pecaSelecionada.quantidadeDisponivelParaOrdem
                          }
                        </p>
                      )}
                    </div>

                    <div className="col-span-4 sm:col-span-2">
                      <Input
                        label="Quantidade"
                        aria-label="Quantidade"
                        type="number"
                        step="1"
                        min="1"
                        value={
                          item.quantidade ===
                          0
                            ? ""
                            : item.quantidade
                        }
                        onChange={(e) =>
                          atualizarItemNovo(
                            index,
                            "quantidade",
                            e.target.value,
                          )
                        }
                      />
                    </div>

                    <div className="col-span-4 sm:col-span-2">
                      <Input
                        label="Valor unitário"
                        aria-label="Valor unitário"
                        type="number"
                        step="0.01"
                        min="0"
                        value={
                          item.valorUnitario ===
                          0
                            ? ""
                            : item.valorUnitario
                        }
                        readOnly
                      />
                    </div>

                    <div className="col-span-3 sm:col-span-2">
                      <div className="label-base mb-1.5 text-right">
                        Total
                      </div>

                      <div className="flex h-[42px] items-center justify-end rounded-xl border border-ink-700 bg-ink-900/50 px-3 text-sm font-semibold text-ink-200">
                        {formatCurrency(
                          item.valorTotal,
                        )}
                      </div>
                    </div>

                    <div className="col-span-1 flex justify-end">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          removerItemNovo(
                            index,
                          )
                        }
                        disabled={
                          itens.length ===
                          1
                        }
                        aria-label="Remover item"
                      >
                        <Trash2 className="h-4 w-4 text-red-400" />
                      </Button>
                    </div>
                  </div>
                );
              },
            )}
          </div>
        )}

        <p className="mt-2 text-xs text-ink-400">
          Total de itens:{" "}
          {formatCurrency(totalItens)} —
          O valor total da OS será
          calculado pelo backend.
        </p>
      </div>

      {/* =====================================================
          OBSERVAÇÃO
      ===================================================== */}

      <Textarea
        label="Observação"
        name="observacao"
        defaultValue={
          initial?.observacao ?? ""
        }
        placeholder="Observações internas (opcional)"
      />

      {/* =====================================================
          AÇÕES
      ===================================================== */}

      <div className="flex justify-end gap-3 pt-2">
        <Button
          type="button"
          variant="ghost"
          onClick={onCancel}
          disabled={
            submitting ||
            itemSalvando
          }
        >
          Cancelar
        </Button>

        <Button
          type="submit"
          loading={submitting}
          disabled={
            itemEditando !== null
          }
        >
          {initial?.id
            ? "Salvar alterações"
            : "Salvar OS"}
        </Button>
      </div>
    </form>
  );
}