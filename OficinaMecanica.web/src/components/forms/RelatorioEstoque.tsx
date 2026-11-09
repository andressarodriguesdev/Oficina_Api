import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  AlertTriangle,
  ArrowLeft,
  Boxes,
  DollarSign,
  Download,
  Lock,
  PackageX,
} from "lucide-react";

import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { PageLoader } from "../ui/Spinner";
import { useToast } from "../ui/Toast";

import {
  obterRelatorioEstoque,
  type RelatorioEstoqueItem,
  type RelatorioEstoqueResponse,
  type SituacaoEstoque,
} from "../../services/pecas";

import { formatCurrency } from "../../utils/format";
import { ehMecanico } from "../../utils/session";

type Filtro = "todas" | "repor" | "semEstoque" | "reservadas";

const LABEL_SITUACAO: Record<SituacaoEstoque, string> = {
  Normal: "Normal",
  EstoqueBaixo: "Estoque baixo",
  SemEstoque: "Sem estoque",
};

const BADGE_SITUACAO: Record<SituacaoEstoque, string> = {
  Normal: "bg-emerald-500/10 text-emerald-500",
  EstoqueBaixo: "bg-amber-500/10 text-amber-500",
  SemEstoque: "bg-red-500/10 text-red-500",
};

// Peças que precisam de atenção aparecem primeiro.
const PESO_SITUACAO: Record<SituacaoEstoque, number> = {
  SemEstoque: 0,
  EstoqueBaixo: 1,
  Normal: 2,
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

function exportarCsv(itens: RelatorioEstoqueItem[]) {
  // Formato pensado para abrir direto no Excel em português (; e vírgula decimal).
  const numero = (n: number) => n.toFixed(2).replace(".", ",");
  const texto = (s: string) => `"${s.replace(/"/g, '""')}"`;

  const cabecalho = [
    "Peça",
    "Código",
    "Situação",
    "Estoque",
    "Reservado",
    "Disponível",
    "Mínimo",
    "Repor",
    ...(ehMecanico() ? [] : ["Custo unit."]),
    "Venda unit.",
    ...(ehMecanico() ? [] : ["Total custo", "Total venda"]),
  ];

  const linhas = itens.map((i) =>
    [
      texto(i.nome),
      texto(i.codigo ?? ""),
      LABEL_SITUACAO[i.situacao],
      i.quantidadeEstoque,
      i.quantidadeReservada,
      i.quantidadeDisponivel,
      i.estoqueMinimo,
      i.quantidadeParaRepor,
      ...(ehMecanico() ? [] : [numero(i.valorCusto)]),
      numero(i.valorVenda),
      ...(ehMecanico()
        ? []
        : [numero(i.valorTotalCusto), numero(i.valorTotalVenda)]),
    ].join(";"),
  );

  const csv = "\uFEFF" + [cabecalho.join(";"), ...linhas].join("\r\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = `relatorio-estoque-${new Date().toLocaleDateString("sv-SE")}.csv`;
  link.click();

  URL.revokeObjectURL(url);
}

interface KpiProps {
  icon: ReactNode;
  label: string;
  value: string | number;
  tom?: "alerta" | "perigo";
}

function Kpi({ icon, label, value, tom }: KpiProps) {
  const cor =
    tom === "perigo"
      ? "text-red-500"
      : tom === "alerta"
        ? "text-amber-500"
        : "text-[var(--accent-text)]";

  return (
    <Card className="p-5">
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--app-surface-raised)] ${cor}`}
      >
        {icon}
      </div>

      <p className="mt-5 font-display text-2xl font-bold tabular-nums tracking-[-0.04em] text-[var(--app-text)]">
        {value}
      </p>

      <p className="mt-1 text-xs font-semibold uppercase tracking-[0.1em] text-[var(--app-text-muted)]">
        {label}
      </p>
    </Card>
  );
}

interface RelatorioEstoqueProps {
  onVoltar: () => void;
}

export function RelatorioEstoque({ onVoltar }: RelatorioEstoqueProps) {
  const { error } = useToast();

  const [data, setData] = useState<RelatorioEstoqueResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const [incluirInativas, setIncluirInativas] = useState(false);
  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState<Filtro>("todas");

  const load = useCallback(async () => {
    setLoading(true);

    try {
      setData(await obterRelatorioEstoque(incluirInativas));
    } catch (err) {
      error("Não foi possível carregar o relatório de estoque.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [incluirInativas, error]);

  useEffect(() => {
    load();
  }, [load]);

  const itensFiltrados = useMemo(() => {
    if (!data) return [];

    const q = busca.trim().toLowerCase();

    return data.itens
      .filter((i) => {
        const passaBusca =
          !q ||
          i.nome.toLowerCase().includes(q) ||
          (i.codigo ?? "").toLowerCase().includes(q);

        const passaFiltro =
          filtro === "todas" ||
          (filtro === "repor" && i.situacao !== "Normal") ||
          (filtro === "semEstoque" && i.situacao === "SemEstoque") ||
          (filtro === "reservadas" && i.quantidadeReservada > 0);

        return passaBusca && passaFiltro;
      })
      .sort(
        (a, b) =>
          PESO_SITUACAO[a.situacao] - PESO_SITUACAO[b.situacao] ||
          a.nome.localeCompare(b.nome, "pt-BR"),
      );
  }, [data, busca, filtro]);

  const chips: { valor: Filtro; label: string; total?: number }[] = [
    { valor: "todas", label: "Todas", total: data?.resumo.totalPecas },
    { valor: "repor", label: "Precisam de reposição", total: data?.resumo.pecasParaRepor },
    { valor: "semEstoque", label: "Sem estoque", total: data?.resumo.pecasSemEstoque },
    { valor: "reservadas", label: "Com reserva", total: data?.resumo.pecasComReserva },
  ];

  return (
    <div className="space-y-8">
      {/* CABEÇALHO */}
      <section className="border-b border-[var(--app-border-subtle)] pb-7">
        <div className="mb-5">
          <Button variant="ghost" size="sm" className="px-0" onClick={onVoltar}>
            <ArrowLeft className="h-4 w-4" />
            Voltar para peças
          </Button>
        </div>

        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--app-text-muted)]">
              Estoque
            </p>

            <h1 className="mt-2 font-display text-3xl font-extrabold tracking-[-0.04em] text-[var(--app-text)] sm:text-4xl">
              Relatório de estoque
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-[var(--app-text-muted)]">
              Situação atual das peças: quanto há em estoque, o que está
              reservado em ordens de serviço e o que precisa ser reposto.
              {data &&
                ` Gerado em ${new Date(data.geradoEm).toLocaleString("pt-BR")}.`}
            </p>
          </div>

          <Button
            onClick={() => exportarCsv(itensFiltrados)}
            disabled={!data || itensFiltrados.length === 0}
          >
            <Download className="h-4 w-4" />
            Exportar CSV
          </Button>
        </div>
      </section>

      {loading && !data ? (
        <PageLoader />
      ) : data ? (
        <>
          {/* INDICADORES */}
          <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Kpi
              icon={<Boxes className="h-5 w-5" />}
              label={`Unidades em estoque · ${data.resumo.totalPecas} peças`}
              value={data.resumo.totalUnidadesEmEstoque}
            />

            <Kpi
              icon={<Lock className="h-5 w-5" />}
              label={`Reservadas · ${data.resumo.totalUnidadesDisponiveis} disponíveis`}
              value={data.resumo.totalUnidadesReservadas}
            />

            {!ehMecanico() && (
<Kpi
              icon={<DollarSign className="h-5 w-5" />}
              label={`Valor em estoque (custo) · venda ${formatCurrency(data.resumo.valorTotalVenda)}`}
              value={formatCurrency(data.resumo.valorTotalCusto)}
            />
)}

            <Kpi
              icon={<AlertTriangle className="h-5 w-5" />}
              label="Precisam de reposição"
              value={data.resumo.pecasParaRepor}
              tom={data.resumo.pecasParaRepor > 0 ? "alerta" : undefined}
            />

            <Kpi
              icon={<PackageX className="h-5 w-5" />}
              label="Sem estoque"
              value={data.resumo.pecasSemEstoque}
              tom={data.resumo.pecasSemEstoque > 0 ? "perigo" : undefined}
            />
          </section>

          {/* FILTROS */}
          <section className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <input
                type="search"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar por nome ou código"
                className={`${fieldClass} w-full sm:w-72`}
              />

              <label className="flex items-center gap-2 text-sm text-[var(--app-text-secondary)]">
                <input
                  type="checkbox"
                  checked={incluirInativas}
                  onChange={(e) => setIncluirInativas(e.target.checked)}
                />
                Incluir peças inativas
              </label>
            </div>

            <div className="flex flex-wrap gap-2">
              {chips.map((c) => {
                const ativo = filtro === c.valor;

                return (
                  <button
                    key={c.valor}
                    type="button"
                    onClick={() => setFiltro(c.valor)}
                    className={[
                      "rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
                      ativo
                        ? "border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent-text)]"
                        : "border-[var(--app-border-subtle)] text-[var(--app-text-muted)] hover:bg-[var(--hover-bg)]",
                    ].join(" ")}
                  >
                    {c.label}
                    {c.total !== undefined && ` (${c.total})`}
                  </button>
                );
              })}
            </div>

            <p className="text-xs text-[var(--app-text-muted)]">
              Reservado = unidades em ordens de serviço ativas (Aberta,
              Aguardando aprovação, Aprovada e Reaberta). Disponível = estoque
              menos reservado.
            </p>
          </section>

          {/* TABELA */}
          <Card className="overflow-hidden">
            {itensFiltrados.length === 0 ? (
              <p className="py-10 text-center text-sm text-[var(--app-text-muted)]">
                Nenhuma peça encontrada com esses filtros.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-[var(--app-border-subtle)] text-xs uppercase text-[var(--app-text-muted)]">
                      <th className="px-4 py-3 font-semibold">Peça</th>
                      <th className="px-3 py-3 font-semibold">Situação</th>
                      <th className="px-3 py-3 text-right font-semibold">Estoque</th>
                      <th className="px-3 py-3 text-right font-semibold">Reservado</th>
                      <th className="px-3 py-3 text-right font-semibold">Disponível</th>
                      <th className="px-3 py-3 text-right font-semibold">Mínimo</th>
                      <th className="px-3 py-3 text-right font-semibold">Repor</th>
                      <th className="px-4 py-3 text-right font-semibold">
                        {ehMecanico() ? "Venda unit." : "Total (custo)"}
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {itensFiltrados.map((i) => (
                      <tr
                        key={i.id}
                        className="border-b border-[var(--app-border-subtle)] text-[var(--app-text-secondary)] last:border-b-0"
                      >
                        <td className="px-4 py-3">
                          <p className="font-semibold text-[var(--app-text)]">
                            {i.nome}
                            {!i.ativa && (
                              <span className="ml-2 text-xs font-normal text-[var(--app-text-muted)]">
                                (inativa)
                              </span>
                            )}
                          </p>

                          {i.codigo && (
                            <p className="text-xs text-[var(--app-text-muted)]">
                              {i.codigo}
                            </p>
                          )}
                        </td>

                        <td className="whitespace-nowrap px-3 py-3">
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${BADGE_SITUACAO[i.situacao]}`}
                          >
                            {LABEL_SITUACAO[i.situacao]}
                          </span>
                        </td>

                        <td className="px-3 py-3 text-right font-semibold tabular-nums">
                          {i.quantidadeEstoque}
                        </td>

                        <td className="px-3 py-3 text-right tabular-nums">
                          {i.quantidadeReservada}
                        </td>

                        <td
                          className={`px-3 py-3 text-right tabular-nums ${
                            i.quantidadeDisponivel <= 0 ? "text-red-500" : ""
                          }`}
                        >
                          {i.quantidadeDisponivel}
                        </td>

                        <td className="px-3 py-3 text-right tabular-nums">
                          {i.estoqueMinimo}
                        </td>

                        <td className="px-3 py-3 text-right font-semibold tabular-nums">
                          {i.quantidadeParaRepor > 0 ? i.quantidadeParaRepor : "—"}
                        </td>

                        <td className="whitespace-nowrap px-4 py-3 text-right tabular-nums">
                          {formatCurrency(ehMecanico() ? i.valorVenda : i.valorTotalCusto)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </>
      ) : null}
    </div>
  );
}
