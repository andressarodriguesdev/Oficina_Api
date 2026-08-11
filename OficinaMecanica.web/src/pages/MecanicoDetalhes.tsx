import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Phone,
  Wrench,
  User,
  ClipboardList,
  Building2,
} from "lucide-react";

import { Card, CardHeader } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { EmptyState } from "../components/ui/EmptyState";
import { PageLoader } from "../components/ui/Spinner";
import { useToast } from "../components/ui/Toast";

import { getMecanico } from "../services/mecanico";
import type { Mecanico } from "../types";

import { statusLabel } from "../utils/status";

import { initials, formatCurrency } from "../utils/format";

export function MecanicoDetalhes() {
  const { id } = useParams<{ id?: string }>();

  const toast = useToast();

  const [mecanico, setMecanico] = useState<Mecanico | null>(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const mecanicoId = id;

    async function load() {
      try {
        const data = await getMecanico(mecanicoId);

        setMecanico(data);
      } catch (err) {
        toast.error("Erro ao carregar mecânico");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [id, toast]);

  if (loading) {
    return <PageLoader label="Carregando mecânico..." />;
  }

  if (!mecanico) {
    return (
      <Card>
        <EmptyState
          icon={<User className="h-7 w-7" />}
          title="Mecânico não encontrado"
          action={
            <Link to="/mecanicos">
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

  return (
    <div className="space-y-5">
      <Link to="/mecanicos">
        <Button variant="ghost" size="sm">
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>
      </Link>

      {/* Dados principais */}

      <Card className="p-6">
        <div className="flex flex-col gap-5 sm:flex-row">
          <div
            className="
            flex h-16 w-16
            shrink-0
            items-center justify-center
            rounded-2xl
            bg-gradient-to-br
            from-ink-700
            to-ink-800
            text-xl
            font-bold
            text-flame-400
            "
          >
            {initials(mecanico.nome)}
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1
                className="
                font-display
                text-2xl
                font-bold
                text-white
                "
              >
                {mecanico.nome}
              </h1>

              {mecanico.ativo ? (
                <span
                  className="
                  rounded-full
                  bg-green-500/20
                  px-2 py-1
                  text-xs
                  font-semibold
                  text-green-400
                  "
                >
                  Ativo
                </span>
              ) : (
                <span
                  className="
                  rounded-full
                  bg-red-500/20
                  px-2 py-1
                  text-xs
                  font-semibold
                  text-red-400
                  "
                >
                  Inativo
                </span>
              )}
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="flex items-center gap-2 text-sm text-ink-300">
                <Phone className="h-4 w-4 text-ink-400" />

                {mecanico.telefone || "—"}
              </div>

              <div className="flex items-center gap-2 text-sm text-ink-300">
                <Wrench className="h-4 w-4 text-ink-400" />

                {mecanico.especialidade || "Sem especialidade"}
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Oficina */}

      <Card className="p-5">
        <div className="flex items-start gap-3">
          <div
            className="
            flex h-11 w-11
            items-center justify-center
            rounded-xl
            bg-ink-800
            text-flame-400
            "
          >
            <Building2 className="h-5 w-5" />
          </div>

          <div>
            <p className="text-xs font-semibold uppercase text-ink-400">
              Oficina
            </p>

            <p className="mt-1 font-display text-lg font-bold text-white">
              {mecanico.oficina?.nome || "—"}
            </p>

            <p className="text-sm text-ink-400">
              {mecanico.oficina?.telefone || "—"}
            </p>

            <p className="text-sm text-ink-400">
              {mecanico.oficina?.endereco || "—"}
            </p>
          </div>
        </div>
      </Card>

      {/* Resumo */}

      {/* Resumo */}

      <div className="grid gap-4 lg:grid-cols-4">
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-ink-800 text-flame-400">
              <ClipboardList className="h-5 w-5" />
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">
                Ordens realizadas
              </p>

              <p className="font-display text-xl font-bold text-white">
                {mecanico.quantidadeOrdensServico}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-ink-800 text-emerald-400">
              <ClipboardList className="h-5 w-5" />
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">
                Concluídas
              </p>

              <p className="font-display text-xl font-bold text-white">
                {mecanico.quantidadeConcluidas}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-ink-800 text-red-400">
              <ClipboardList className="h-5 w-5" />
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">
                Canceladas
              </p>

              <p className="font-display text-xl font-bold text-white">
                {mecanico.quantidadeCanceladas}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-ink-800 text-sky-400">
              <Wrench className="h-5 w-5" />
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">
                Mão de obra
              </p>

              <p className="font-display text-xl font-bold text-white">
                {formatCurrency(mecanico.totalMaoObra)}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Histórico de OS */}

      {/* Histórico de OS */}

      <Card>
        <CardHeader
          title="Histórico de ordens de serviço"
          subtitle={`${mecanico.ordensServico?.length ?? 0} ordem(ns)`}
        />

        {!mecanico.ordensServico || mecanico.ordensServico.length === 0 ? (
          <EmptyState
            icon={<ClipboardList className="h-7 w-7" />}
            title="Nenhuma ordem de serviço"
            description="Este mecânico ainda não possui serviços vinculados."
          />
        ) : (
          <div className="divide-y divide-ink-700/40">
            {[...mecanico.ordensServico]
              .sort(
                (a, b) =>
                  new Date(b.dataCriacao).getTime() -
                  new Date(a.dataCriacao).getTime(),
              )
              .map((os) => (
                <Link
                  key={os.ordemServicoId}
                  to={`/ordens-servico/${os.ordemServicoId}`}
                  className="
              block
              p-5
              transition
              hover:bg-ink-800/40
            "
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold text-white transition hover:text-flame-400">
                        {os.veiculo}
                      </p>

                      <p className="text-sm text-ink-400">
                        Cliente: {os.clienteNome}
                      </p>
                    </div>

                    <span className="font-display font-bold text-white">
                      {formatCurrency(os.valorMaoObra)}
                    </span>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-ink-400">
                    <span>OS #{os.ordemServicoId.slice(0, 4)}</span>

                    <span>{new Date(os.dataCriacao).toLocaleDateString()}</span>

                    <span>{statusLabel(os.status)}</span>

                    <span className="ml-auto font-semibold text-flame-400">
                      Ver OS →
                    </span>
                  </div>
                </Link>
              ))}
          </div>
        )}
      </Card>
    </div>
  );
}
