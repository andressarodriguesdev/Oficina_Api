
import { useState, type FormEvent } from "react";

import { Input } from "../ui/Input";

import { Button } from "../ui/Button";

import type { Peca } from "../../types";

export interface PecaFormValues {
  nome: string;
  codigo: string;
  valorCusto: number;
  valorVenda: number;
  quantidadeEstoque: number;
  estoqueMinimo: number;
}

export function PecaForm({
  initial,
  onSubmit,
  onCancel,
  submitting,
}: {
  initial?: Peca | null;
  onSubmit: (v: PecaFormValues) => void;
  onCancel: () => void;
  submitting?: boolean;
}) {
  const modoEdicao = Boolean(initial);

  const [errors, setErrors] = useState({
    nome: "",
    valorCusto: "",
    valorVenda: "",
    quantidadeEstoque: "",
    estoqueMinimo: "",
  });

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const fd = new FormData(e.currentTarget);

    const nome = String(fd.get("nome") ?? "").trim();

    const codigo = String(fd.get("codigo") ?? "").trim();

    const valorCustoTexto = String(
      fd.get("valorCusto") ?? "",
    ).trim();

    const valorVendaTexto = String(
      fd.get("valorVenda") ?? "",
    ).trim();

    const quantidadeEstoqueTexto = String(
      fd.get("quantidadeEstoque") ?? "",
    ).trim();

    const estoqueMinimoTexto = String(
      fd.get("estoqueMinimo") ?? "",
    ).trim();

    const novosErros = {
      nome: "",
      valorCusto: "",
      valorVenda: "",
      quantidadeEstoque: "",
      estoqueMinimo: "",
    };

    if (!nome) {
      novosErros.nome = "Informe o nome da peça.";
    }

    if (!valorCustoTexto) {
      novosErros.valorCusto = "Informe o valor de custo.";
    }

    if (!valorVendaTexto) {
      novosErros.valorVenda = "Informe o valor de venda.";
    }

    if (!modoEdicao && !quantidadeEstoqueTexto) {
      novosErros.quantidadeEstoque =
        "Informe a quantidade em estoque.";
    }

    if (!estoqueMinimoTexto) {
      novosErros.estoqueMinimo =
        "Informe o estoque mínimo.";
    }

    const valorCusto = Number(valorCustoTexto);

    const valorVenda = Number(valorVendaTexto);

    const quantidadeEstoque = modoEdicao
      ? (initial?.quantidadeEstoque ?? 0)
      : Number(quantidadeEstoqueTexto);

    const estoqueMinimo = Number(estoqueMinimoTexto);

    if (
      valorCustoTexto &&
      (!Number.isFinite(valorCusto) || valorCusto <= 0)
    ) {
      novosErros.valorCusto =
        "Informe um valor de custo maior que zero.";
    }

    if (
      valorVendaTexto &&
      (!Number.isFinite(valorVenda) || valorVenda <= 0)
    ) {
      novosErros.valorVenda =
        "Informe um valor de venda maior que zero.";
    }

    if (
      !modoEdicao &&
      quantidadeEstoqueTexto &&
      (!Number.isFinite(quantidadeEstoque) ||
        quantidadeEstoque < 0)
    ) {
      novosErros.quantidadeEstoque =
        "Informe uma quantidade válida.";
    }

    if (
      estoqueMinimoTexto &&
      (!Number.isFinite(estoqueMinimo) || estoqueMinimo < 0)
    ) {
      novosErros.estoqueMinimo =
        "Informe um estoque mínimo válido.";
    }

    setErrors(novosErros);

    const possuiErros = Object.values(novosErros).some(
      (erro) => erro !== "",
    );

    if (possuiErros) {
      return;
    }

    onSubmit({
      nome,
      codigo,
      valorCusto,
      valorVenda,
      quantidadeEstoque,
      estoqueMinimo,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Nome *"
        name="nome"
        defaultValue={initial?.nome ?? ""}
        placeholder="Ex: Filtro de óleo"
        error={errors.nome}
      />

      <Input
        label="Código"
        name="codigo"
        defaultValue={initial?.codigo ?? ""}
        placeholder="Código interno ou do fabricante"
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Valor de custo *"
          name="valorCusto"
          type="number"
          min={0}
          step="0.01"
          defaultValue={initial?.valorCusto ?? ""}
          placeholder="0,00"
          error={errors.valorCusto}
        />

        <Input
          label="Valor de venda *"
          name="valorVenda"
          type="number"
          min={0}
          step="0.01"
          defaultValue={initial?.valorVenda ?? ""}
          placeholder="0,00"
          error={errors.valorVenda}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Quantidade em estoque *"
          name="quantidadeEstoque"
          type="number"
          min={0}
          step="1"
          defaultValue={initial?.quantidadeEstoque ?? ""}
          disabled={modoEdicao}
          hint={
            modoEdicao
              ? "O estoque é ajustado automaticamente pelo uso em ordens de serviço."
              : undefined
          }
          error={errors.quantidadeEstoque}
        />

        <Input
          label="Estoque mínimo *"
          name="estoqueMinimo"
          type="number"
          min={0}
          step="1"
          defaultValue={initial?.estoqueMinimo ?? ""}
          hint="Usado para alertar quando o estoque estiver baixo."
          error={errors.estoqueMinimo}
        />
      </div>

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
          {modoEdicao ? "Salvar alterações" : "Cadastrar peça"}
        </Button>
      </div>
    </form>
  );
}
