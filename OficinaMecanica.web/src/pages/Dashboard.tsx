import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ClipboardList,
  Clock,
  CheckCircle2,
  DollarSign,
  TrendingUp,
  Users,
  Car,
  ArrowRight,
} from "lucide-react";
import { Card } from "../components/ui/Card";
import { StatusBadge } from "../components/ui/StatusBadge";
import { PageLoader } from "../components/ui/Spinner";
import { EmptyState } from "../components/ui/EmptyState";
import { listOrdens, type OrdemWithRelations } from "../services/ordens";
import { listClientes } from "../services/clientes";
import { listVeiculos } from "../services/veiculos";
import { formatCurrency, formatDate } from "../utils/format";
import { useToast } from "../components/ui/Toast";
import { Select } from "../components/ui/Select";

export function Dashboard() {
  const toast = useToast();
  const [ordens, setOrdens] = useState<OrdemWithRelations[]>([]);
  const [clientesCount, setClientesCount] = useState(0);
  const [veiculosCount, setVeiculosCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [periodo, setPeriodo] = useState("todos");

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [os, clientes, veiculos] = await Promise.all([
          listOrdens(),
          listClientes(),
          listVeiculos(),
        ]);
        if (!active) return;
        setOrdens(os);
        setClientesCount(clientes.length);
        setVeiculosCount(veiculos.length);
      } catch (err) {
        toast.error("Erro ao carregar dados do dashboard");
        console.error(err);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [toast]);

  if (loading) return <PageLoader label="Carregando dashboard..." />;

  const ordensFiltradas = ordens.filter((os) => {
    if (periodo === "todos") return true;

    const dataOS = new Date(os.dataCriacao);
    const hoje = new Date();

    // zera horário para comparar apenas a data
    const hojeSemHora = new Date(
      hoje.getFullYear(),
      hoje.getMonth(),
      hoje.getDate(),
    );

    const dataSemHora = new Date(
      dataOS.getFullYear(),
      dataOS.getMonth(),
      dataOS.getDate(),
    );

    if (periodo === "hoje") {
      return dataSemHora.getTime() === hojeSemHora.getTime();
    }

    if (periodo === "7dias") {
      const limite = new Date(hojeSemHora);
      limite.setDate(limite.getDate() - 7);

      return dataSemHora >= limite;
    }

    if (periodo === "30dias") {
      const limite = new Date(hojeSemHora);
      limite.setDate(limite.getDate() - 30);

      return dataSemHora >= limite;
    }

    return true;
  });

  const abertas = ordensFiltradas.filter((o) => o.status === 0).length;

  const aguardando = ordensFiltradas.filter((o) => o.status === 1).length;

  const concluidas = ordensFiltradas.filter((o) => o.status === 4).length;

  const faturamento = ordensFiltradas
    .filter((o) => o.status === 4)
    .reduce((sum, o) => sum + (Number(o.valorTotal) || 0), 0);

  const recentes = [...ordensFiltradas]
    .sort(
      (a, b) =>
        new Date(b.dataCriacao).getTime() - new Date(a.dataCriacao).getTime(),
    )
    .slice(0, 6);

  const stats = [
    {
      label: "OS Abertas",
      value: abertas,
      icon: ClipboardList,
      tone: "text-flame-400",
      bg: "bg-flame-500/10",
      to: "/ordens-servico",
    },
    {
      label: "Aguardando Aprovação",
      value: aguardando,
      icon: Clock,
      tone: "text-amber-400",
      bg: "bg-amber-500/10",
      to: "/ordens-servico",
    },
    {
      label: "Concluídas",
      value: concluidas,
      icon: CheckCircle2,
      tone: "text-emerald-400",
      bg: "bg-emerald-500/10",
      to: "/ordens-servico",
    },
    {
      label: "Faturamento",
      value: formatCurrency(faturamento),
      icon: DollarSign,
      tone: "text-sky-400",
      bg: "bg-sky-500/10",
      to: "/financeiro",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => {
          const Icon = s.icon;

          return (
            <Link key={s.label} to={s.to} className="block">
              <Card hover className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">
                      {s.label}
                    </p>
                    <p className="mt-2 font-display text-2xl font-bold text-white">
                      {s.value}
                    </p>
                  </div>
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-xl ${s.bg}`}
                  >
                    <Icon className={`h-6 w-6 ${s.tone}`} />
                  </div>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          {
            label: "Clientes",
            value: clientesCount,
            icon: Users,
            tone: "text-ink-300",
            to: "/clientes",
          },
          {
            label: "Veículos",
            value: veiculosCount,
            icon: Car,
            tone: "text-ink-300",
            to: "/veiculos",
          },
          {
            label: "Total de OS",
            value: ordensFiltradas.length,
            icon: TrendingUp,
            tone: "text-ink-300",
            to: "/ordens-servico",
          },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <Link key={s.label} to={s.to} className="block">
              <Card hover className="p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-ink-800 text-ink-300">
                    <Icon className="h-5 w-5" />
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">
                      {s.label}
                    </p>

                    <p className="font-display text-xl font-bold text-white">
                      {s.value}
                    </p>
                  </div>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
      <Card>
        <div className="flex items-center justify-between border-b border-ink-700/60 px-5 py-4">
          <div>
            <h3 className="font-display text-base font-bold text-white">
              Ordens de Serviço Recentes
            </h3>

            <p className="mt-0.5 text-sm text-ink-400">
              Acompanhe os serviços mais recentes
            </p>
          </div>

          <div className="flex items-end gap-4">
            <div className="w-44">
              <Select
                value={periodo}
                onChange={(e) => setPeriodo(e.target.value)}
              >
                <option value="todos">Todos</option>
                <option value="hoje">Hoje</option>
                <option value="7dias">Últimos 7 dias</option>
                <option value="30dias">Últimos 30 dias</option>
              </Select>
            </div>

            <Link
              to="/ordens-servico"
              className="mb-2 inline-flex items-center gap-1.5 text-sm font-semibold text-flame-400 transition hover:text-flame-300"
            >
              Ver todas
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
        {recentes.length === 0 ? (
          <EmptyState
            icon={<ClipboardList className="h-7 w-7" />}
            title="Nenhuma ordem de serviço"
            description="Crie a primeira ordem de serviço para começar."
            action={
              <Link
                to="/ordens-servico"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-flame-400"
              >
                Criar OS <ArrowRight className="h-4 w-4" />
              </Link>
            }
          />
        ) : (
          <div className="divide-y divide-ink-700/40">
            {recentes.map((os) => (
              <Link
                key={os.id}
                to={`/ordens-servico/${os.id}`}
                className="flex items-center justify-between gap-4 px-5 py-3.5 transition hover:bg-ink-800/40"
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white">
                    OS #{os.numero ?? os.id.substring(0, 6)}
                  </p>

                  <p className="mt-0.5 truncate text-xs text-ink-400">
                    {os.cliente?.nome ?? "—"} ·{" "}
                    {os.veiculo
                      ? `${os.veiculo.marca} ${os.veiculo.modelo}`
                      : "—"}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <span className="hidden text-xs text-ink-400 sm:block">
                    {formatDate(os.dataCriacao)}
                  </span>
                  <StatusBadge status={os.status} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
