import { type FormEvent, useState } from "react";
import { Plus, Trash2, GripVertical } from "lucide-react";
import { Input } from "../ui/Input";
import { Select } from "../ui/Select";
import { Textarea } from "../ui/Textarea";
import { Button } from "../ui/Button";
import type { Cliente, Veiculo } from "../../types";
import { formatCurrency } from "../../utils/format";

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
  descricao: string;
  valorMaoObra: number;
  observacao: string;
  itens: OrdemItemFormValue[];
}

interface OrdemServicoFormProps {
  initial?: Partial<OrdemFormValues> & { id?: string };
  clientes: Cliente[];
  veiculos: Veiculo[];
  onSubmit: (v: OrdemFormValues) => void;
  onCancel: () => void;
  submitting?: boolean;
}

export function OrdemServicoForm({
  initial,
  clientes,
  veiculos,
  onSubmit,
  onCancel,
  submitting,
}: OrdemServicoFormProps) {
  const [itens, setItens] = useState<OrdemItemFormValue[]>(
    initial?.itens && initial.itens.length > 0
      ? initial.itens
      : [{ descricao: "", quantidade: 1, valorUnitario: 0, valorTotal: 0 }],
  );
  const [clienteSelecionado, setClienteSelecionado] = useState(
    initial?.clienteId ?? "",
  );

  const [veiculoSelecionado, setVeiculoSelecionado] = useState(
    initial?.veiculoId ?? "",
  );

  const filteredVeiculos = clienteSelecionado
    ? veiculos.filter((v) => v.clienteId === clienteSelecionado)
    : [];

  const updateItem = (
    index: number,
    field: keyof OrdemItemFormValue,
    value: string,
  ) => {
    setItens((prev) =>
      prev.map((item, i) => {
        if (i !== index) return item;

        const next = {
          ...item,
         [field]: field === 'descricao' ? value : Number(value),
        } as OrdemItemFormValue;

        if (field === "quantidade" || field === "valorUnitario") {
          next.valorTotal = Number(
            (
              (Number(next.quantidade) || 0) * (Number(next.valorUnitario) || 0)
            ).toFixed(2),
          );
        }

        return next;
      }),
    );
  };

  const addItem = () =>
    setItens((prev) => [
      ...prev,
      { descricao: "", quantidade: 1, valorUnitario: 0, valorTotal: 0 },
    ]);

  const removeItem = (index: number) =>
    setItens((prev) =>
      prev.length > 1 ? prev.filter((_, i) => i !== index) : prev,
    );

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const fd = new FormData(e.currentTarget);

    onSubmit({
      clienteId: String(fd.get("clienteId") ?? ""),
      veiculoId: String(fd.get("veiculoId") ?? ""),
      descricao: String(fd.get("descricao") ?? "").trim(),
      valorMaoObra: Number(fd.get("valorMaoObra") ?? 0) || 0,
      observacao: String(fd.get("observacao") ?? "").trim(),
      itens: itens.map((it) => ({
        id: it.id,
        descricao: it.descricao.trim(),
        quantidade: Number(it.quantidade) || 0,
        valorUnitario: Number(it.valorUnitario) || 0,
        valorTotal: Number(it.valorTotal) || 0,
      })),
    });
  };

  const totalItens = itens.reduce(
    (sum, it) => sum + (Number(it.valorTotal) || 0),
    0,
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <Select
          label="Cliente *"
          name="clienteId"
          value={clienteSelecionado}
          onChange={(e) => {
            setClienteSelecionado(e.target.value);
            setVeiculoSelecionado("");
          }}
          required
        >
          <option value="" disabled>
            Selecione um cliente
          </option>
          {clientes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nome}
            </option>
          ))}
        </Select>

        <Select
          label="Veículo *"
          name="veiculoId"
          value={veiculoSelecionado}
          onChange={(e) => setVeiculoSelecionado(e.target.value)}
          required
        >
          <option value="" disabled>
            Selecione um veículo
          </option>
          {filteredVeiculos.map((v) => (
            <option key={v.id} value={v.id}>
              {v.marca} {v.modelo} {v.placa ? `— ${v.placa}` : ""}
            </option>
          ))}
        </Select>
      </div>

      <Textarea
        label="Descrição do serviço *"
        name="descricao"
        defaultValue={initial?.descricao ?? ""}
        placeholder="Descreva o serviço a ser realizado..."
        required
      />

      <Input
        label="Valor da mão de obra (R$)"
        name="valorMaoObra"
        type="number"
        step="0.01"
        min="0"
        defaultValue={
          initial?.valorMaoObra && initial.valorMaoObra > 0
            ? initial.valorMaoObra
            : ""
        }
        placeholder="0,00"
      />

      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className="label-base mb-0">Peças / Itens do serviço</label>
          <Button type="button" size="sm" variant="outline" onClick={addItem}>
            <Plus className="h-4 w-4" />
            Adicionar item
          </Button>
        </div>

        <div className="space-y-2.5">
          {itens.map((item, index) => (
            <div
              key={index}
              className="grid grid-cols-12 items-end gap-2 rounded-xl border border-ink-700/60 bg-ink-800/40 p-3"
            >
              <div className="col-span-12 flex items-center gap-2 sm:col-span-5">
                <GripVertical className="h-4 w-4 shrink-0 text-ink-500" />
                <Input
                  aria-label="Descrição do item"
                  placeholder="Descrição da peça/serviço"
                  value={item.descricao}
                  onChange={(e) =>
                    updateItem(index, "descricao", e.target.value)
                  }
                />
              </div>

              <div className="col-span-4 sm:col-span-2">
                <Input
                  aria-label="Quantidade"
                  type="number"
                  step="0.01"
                  min="0"
                  value={item.quantidade === 0 ? '' : item.quantidade}
                  onChange={(e) =>
                    updateItem(index, "quantidade", e.target.value)
                  }
                />
              </div>

              <div className="col-span-4 sm:col-span-2">
                <Input
                  aria-label="Valor unitário"
                  type="number"
                  step="0.01"
                  min="0"
                  value={item.valorUnitario === 0 ? "" : item.valorUnitario}
                  onChange={(e) =>
                    updateItem(index, "valorUnitario", e.target.value)
                  }
                />
              </div>

              <div className="col-span-3 sm:col-span-2">
                <div className="label-base mb-1.5 text-right">Total</div>
                <div className="flex h-[42px] items-center justify-end rounded-xl border border-ink-700 bg-ink-900/50 px-3 text-sm font-semibold text-ink-200">
                  {formatCurrency(item.valorTotal)}
                </div>
              </div>

              <div className="col-span-1 flex justify-end">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeItem(index)}
                  disabled={itens.length === 1}
                  aria-label="Remover item"
                >
                  <Trash2 className="h-4 w-4 text-red-400" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        <p className="mt-2 text-xs text-ink-400">
          Total de itens: {formatCurrency(totalItens)} — O valor total da OS
          será calculado pelo backend.
        </p>
      </div>

      <Textarea
        label="Observação"
        name="observacao"
        defaultValue={initial?.observacao ?? ""}
        placeholder="Observações internas (opcional)"
      />

      <div className="flex justify-end gap-3 pt-2">
        <Button
          type="button"
          variant="ghost"
          onClick={onCancel}
          disabled={submitting}
        >
          Cancelar
        </Button>

        <Button type="submit" loading={submitting}>
          {initial?.id ? "Salvar alterações" : "Salvar OS"}
        </Button>
      </div>
    </form>
  );
}
