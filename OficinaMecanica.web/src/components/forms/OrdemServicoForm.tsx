
import { type FormEvent, useState } from "react";
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
} from "../../types";
import {
  formatCurrency,
} from "../../utils/format";
import {
  adicionarItem,
  atualizarItem,
  removerItem,
  getOrdem,
} from "../../services/ordens";

export interface OrdemItemFormValue {
  id?: string;
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

  const [itens, setItens] = useState<OrdemItemFormValue[]>(
    initial?.itens && initial.itens.length > 0
      ? initial.itens
      : [
          {
            descricao: "",
            quantidade: 1,
            valorUnitario: 0,
            valorTotal: 0,
          },
        ],
  );

  const [clienteSelecionado, setClienteSelecionado] = useState(
    initial?.clienteId ?? "",
  );

  const [veiculoSelecionado, setVeiculoSelecionado] = useState(
    initial?.veiculoId ?? "",
  );

  const [mecanicoSelecionado, setMecanicoSelecionado] = useState(
    initial?.mecanicoId ?? "",
  );

  const [itemEditando, setItemEditando] = useState<string | null>(
    null,
  );

  const [itemForm, setItemForm] = useState({
    descricao: "",
    quantidade: 1,
    valorUnitario: 0,
  });

  const [itemSalvando, setItemSalvando] = useState(false);
  const [itemExcluindo, setItemExcluindo] = useState<string | null>(
    null,
  );

  const filteredVeiculos = clienteSelecionado
    ? veiculos.filter(
        (v) => v.clienteId === clienteSelecionado,
      )
    : [];

  // =========================================================
  // ITENS
  // =========================================================

  const abrirNovoItem = () => {
    setItemForm({
      descricao: "",
      quantidade: 1,
      valorUnitario: 0,
    });

    setItemEditando("novo");
  };

  const abrirEdicaoItem = (item: OrdemItemFormValue) => {
    if (!item.id) return;

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
    if (!initial?.id) return;

    if (!itemForm.descricao.trim()) {
      return;
    }

    if (itemForm.quantidade <= 0) {
      return;
    }

    setItemSalvando(true);

    try {
      if (itemEditando === "novo") {
        await adicionarItem(initial.id, {
          descricao: itemForm.descricao.trim(),
          quantidade: Number(itemForm.quantidade),
          valorUnitario: Number(itemForm.valorUnitario),
        });
      } else if (itemEditando) {
        await atualizarItem(
          initial.id,
          itemEditando,
          {
            descricao: itemForm.descricao.trim(),
            quantidade: Number(itemForm.quantidade),
            valorUnitario: Number(itemForm.valorUnitario),
          },
        );
      }

      setItemEditando(null);

      // Busca novamente os itens diretamente do backend.
      const atualizada = await getOrdem(initial.id);

      if (atualizada) {
        setItens(atualizada.itens ?? []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setItemSalvando(false);
    }
  };

  const excluirItem = async (
    item: OrdemItemFormValue,
  ) => {
    if (!initial?.id || !item.id) return;

    if (
      !window.confirm(
        `Remover o item "${item.descricao}"?`,
      )
    ) {
      return;
    }

    setItemExcluindo(item.id);

    try {
      await removerItem(initial.id, item.id);

      const atualizada = await getOrdem(initial.id);

      if (atualizada) {
        setItens(atualizada.itens ?? []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setItemExcluindo(null);
    }
  };

  // =========================================================
  // ITENS - CADASTRO DE NOVA OS
  // =========================================================

  const atualizarItemNovo = (
    index: number,
    field: keyof OrdemItemFormValue,
    value: string,
  ) => {
    setItens((prev) =>
      prev.map((item, i) => {
        if (i !== index) return item;

        const next = {
          ...item,
          [field]:
            field === "descricao"
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
        descricao: "",
        quantidade: 1,
        valorUnitario: 0,
        valorTotal: 0,
      },
    ]);
  };

  const removerItemNovo = (index: number) => {
    setItens((prev) =>
      prev.length > 1
        ? prev.filter((_, i) => i !== index)
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

    const fd = new FormData(e.currentTarget);

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
        Number(fd.get("valorMaoObra") ?? 0) || 0,
      observacao: String(
        fd.get("observacao") ?? "",
      ).trim(),

      itens: itens
        .filter(
          (item) => item.descricao.trim() !== "",
        )
        .map((item) => ({
          id: item.id,
          descricao: item.descricao.trim(),
          quantidade:
            Number(item.quantidade) || 0,
          valorUnitario:
            Number(item.valorUnitario) || 0,
          valorTotal:
            Number(item.valorTotal) || 0,
        })),
    });
  };

  const totalItens = itens.reduce(
    (sum, item) =>
      sum + (Number(item.valorTotal) || 0),
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
          <option value="" disabled>
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
          <option value="" disabled>
            Selecione um veículo
          </option>

          {filteredVeiculos.map((veiculo) => (
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
          ))}
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
          <option value="" disabled>
            Selecione um mecânico
          </option>

          {mecanico
            .filter((m) => m.ativo)
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
                  <th className="px-5 py-3 text-right">
                    Ações
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-ink-700/40">
                {/* NOVO ITEM */}
                {itemEditando === "novo" && (
                  <tr className="bg-ink-800/30">
                    <td className="px-5 py-2">
                      <input
                        autoFocus
                        className="w-full rounded-lg border border-ink-700 bg-ink-900 px-2 py-1.5 text-sm text-white focus:border-flame-500 focus:outline-none"
                        value={
                          itemForm.descricao
                        }
                        onChange={(e) =>
                          setItemForm(
                            (form) => ({
                              ...form,
                              descricao:
                                e.target
                                  .value,
                            }),
                          )
                        }
                        placeholder="Descrição da peça"
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
                        onChange={(e) =>
                          setItemForm(
                            (form) => ({
                              ...form,
                              valorUnitario:
                                Number(
                                  e.target
                                    .value,
                                ),
                            }),
                          )
                        }
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
                  (item, index) =>
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
                          <input
                            autoFocus
                            className="w-full rounded-lg border border-ink-700 bg-ink-900 px-2 py-1.5 text-sm text-white focus:border-flame-500 focus:outline-none"
                            value={
                              itemForm.descricao
                            }
                            onChange={(e) =>
                              setItemForm(
                                (form) => ({
                                  ...form,
                                  descricao:
                                    e
                                      .target
                                      .value,
                                }),
                              )
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
                              setItemForm(
                                (form) => ({
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
                            onChange={(e) =>
                              setItemForm(
                                (form) => ({
                                  ...form,
                                  valorUnitario:
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
            {itens.map((item, index) => (
              <div
                key={index}
                className="grid grid-cols-12 items-end gap-2 rounded-xl border border-ink-700/60 bg-ink-800/40 p-3"
              >
                <div className="col-span-12 sm:col-span-5">
                  <Input
                    aria-label="Descrição do item"
                    placeholder="Descrição da peça/serviço"
                    value={
                      item.descricao
                    }
                    onChange={(e) =>
                      atualizarItemNovo(
                        index,
                        "descricao",
                        e.target.value,
                      )
                    }
                  />
                </div>

                <div className="col-span-4 sm:col-span-2">
                  <Input
                    aria-label="Quantidade"
                    type="number"
                    step="0.01"
                    min="0"
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
                    onChange={(e) =>
                      atualizarItemNovo(
                        index,
                        "valorUnitario",
                        e.target.value,
                      )
                    }
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
                      itens.length === 1
                    }
                    aria-label="Remover item"
                  >
                    <Trash2 className="h-4 w-4 text-red-400" />
                  </Button>
                </div>
              </div>
            ))}
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
            submitting || itemSalvando
          }
        >
          Cancelar
        </Button>

        <Button
          type="submit"
          loading={submitting}
          disabled={itemEditando !== null}
        >
          {initial?.id
            ? "Salvar alterações"
            : "Salvar OS"}
        </Button>
      </div>
    </form>
  );
}
