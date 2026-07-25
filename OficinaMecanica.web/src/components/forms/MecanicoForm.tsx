import { type FormEvent } from "react";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";
import type { mecanicos } from "../../types";

export interface MecanicosFormValues {
  nome: string;
  telefone: string;
  especialidade: string;
  oficinaId: string;
}

export function MecanicoForm({
  initial,
  onSubmit,
  onCancel,
  submitting,
}: {
  initial?: mecanicos | null;
  onSubmit: (v: MecanicosFormValues) => void;
  onCancel: () => void;
  submitting?: boolean;
}) {
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const fd = new FormData(e.currentTarget);

    onSubmit({
      nome: String(fd.get("nome") ?? "").trim(),
      telefone: String(fd.get("telefone") ?? "").trim(),
      especialidade: String(fd.get("especialidade") ?? "").trim(),
      oficinaId: "SEU_ID_FIXO_DA_OFICINA",
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Nome *"
        name="nome"
        defaultValue={initial?.nome ?? ""}
        placeholder="Nome completo do mecânico"
        required
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Telefone"
          name="telefone"
          defaultValue={initial?.telefone ?? ""}
          placeholder="(00) 00000-0000"
        />

        <Input
          label="Especialidade"
          name="especialidade"
          defaultValue={initial?.especialidade ?? ""}
          placeholder="Ex: Motor, Elétrica, Suspensão..."
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
          {initial ? "Salvar alterações" : "Cadastrar mecânico"}
        </Button>
      </div>
    </form>
  );
}