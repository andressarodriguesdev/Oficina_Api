import { useCallback, useEffect, useState } from "react";
import { MinusCircle, PlusCircle } from "lucide-react";

import { Modal } from "../ui/Modal";
import { useToast } from "../ui/Toast";

import {
  listarHistoricoEstoque,
  type MovimentacaoEstoque,
  type TipoMovimentacaoEstoque,
} from "../../services/pecas";

import type { Peca } from "../../types";

const LABEL_TIPO: Record<TipoMovimentacaoEstoque, string> = {
  SaldoInicial: "Saldo inicial",
  AjusteManual: "Ajuste manual",
  SaidaOrdemServico: "Saída por OS",
  EstornoReabertura: "Estorno (reabertura)",
};

const fieldClass = `
  rounded-lg
  border
  border-[var(--app-border-subtle)]
  bg-[var(--app-surface-raised)]
  px-3
  py-2
  text-sm
  text-[var(--app-text-secondary)]
  focus:outline-none
  focus-visible:ring-2
  focus-visible:ring-[var(--accent)]/40
`;

// Mesmo formato usado nas mensagens de erro do backend: "OS #A1B2C3D4"
function formatarOrigem(m: MovimentacaoEstoque): string {
  if (m.ordemServicoId) {
    return `OS #${m.ordemServicoId.slice(0, 8).toUpperCase()}`;
  }

  return m.motivo ?? "—";
}

interface HistoricoEstoqueModalProps {
  peca: Peca;
  onClose: () => void;
}

export function HistoricoEstoqueModal({
  peca,
  onClose,
}: HistoricoEstoqueModalProps) {
  const { error } = useToast();

  const [itens, setItens] = useState<MovimentacaoEstoque[]>([]);
  const [loading, setLoading] = useState(true);

  const [de, setDe] = useState("");
  const [ate, setAte] = useState("");
  const [tipo, setTipo] = useState<TipoMovimentacaoEstoque | "">("");

  const load = useCallback(async () => {
    setLoading(true);

    try {
      const data = await listarHistoricoEstoque(peca.id, {
        de,
        ate,
        tipo,
      });

      setItens(data);
    } catch (err) {
      error("Não foi possível carregar o histórico de estoque.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [peca.id, de, ate, tipo, error]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <Modal
      open
      onClose={onClose}
      title="Histórico de estoque"
      description={`${peca.nome}${
        peca.codigo ? ` · ${peca.codigo}` : ""
      }`}
      size="lg"
    >
      {/* FILTROS */}
      <div className="mb-4 flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1 text-xs font-semibold text-[var(--app-text-muted)]">
          De
          <input
            type="date"
            value={de}
            onChange={(e) => setDe(e.target.value)}
            className={fieldClass}
          />
        </label>

        <label className="flex flex-col gap-1 text-xs font-semibold text-[var(--app-text-muted)]">
          Até
          <input
            type="date"
            value={ate}
            onChange={(e) => setAte(e.target.value)}
            className={fieldClass}
          />
        </label>

        <label className="flex flex-col gap-1 text-xs font-semibold text-[var(--app-text-muted)]">
          Tipo
          <select
            value={tipo}
            onChange={(e) =>
              setTipo(e.target.value as TipoMovimentacaoEstoque | "")
            }
            className={fieldClass}
          >
            <option value="">Todos</option>
            {Object.entries(LABEL_TIPO).map(([valor, label]) => (
              <option key={valor} value={valor}>
                {label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* LISTA */}
      {loading ? (
        <p className="py-8 text-center text-sm text-[var(--app-text-muted)]">
          Carregando histórico...
        </p>
      ) : itens.length === 0 ? (
        <p className="py-8 text-center text-sm text-[var(--app-text-muted)]">
          Nenhuma movimentação encontrada.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--app-border-subtle)] text-xs uppercase text-[var(--app-text-muted)]">
                <th className="px-2 py-2 font-semibold">Data</th>
                <th className="px-2 py-2 font-semibold">Tipo</th>
                <th className="px-2 py-2 font-semibold">Origem</th>
                <th className="px-2 py-2 text-right font-semibold">
                  Variação
                </th>
                <th className="px-2 py-2 text-right font-semibold">
                  Saldo
                </th>
              </tr>
            </thead>

            <tbody>
              {itens.map((m) => {
                const entrada = m.quantidade > 0;

                return (
                  <tr
                    key={m.id}
                    className="border-b border-[var(--app-border-subtle)] text-[var(--app-text-secondary)]"
                  >
                    <td className="whitespace-nowrap px-2 py-2">
                      {new Date(m.criadoEm).toLocaleString("pt-BR")}
                    </td>

                    <td className="whitespace-nowrap px-2 py-2">
                      {LABEL_TIPO[m.tipo] ?? m.tipo}
                    </td>

                    <td className="px-2 py-2">{formatarOrigem(m)}</td>

                    <td
                      className={[
                        "whitespace-nowrap",
                        "px-2",
                        "py-2",
                        "text-right",
                        "font-semibold",
                        entrada ? "text-emerald-500" : "text-red-500",
                      ].join(" ")}
                    >
                      <span className="inline-flex items-center gap-1">
                        {entrada ? (
                          <PlusCircle className="h-3.5 w-3.5" />
                        ) : (
                          <MinusCircle className="h-3.5 w-3.5" />
                        )}
                        {entrada ? `+${m.quantidade}` : m.quantidade}
                      </span>
                    </td>

                    <td className="whitespace-nowrap px-2 py-2 text-right">
                      {m.quantidadeAnterior} → {m.quantidadePosterior}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </Modal>
  );
}
