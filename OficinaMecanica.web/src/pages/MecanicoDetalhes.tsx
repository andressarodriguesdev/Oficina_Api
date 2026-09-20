
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Phone,
  Wrench,
  User,
  ClipboardList,
  Building2,
  CheckCircle2,
  XCircle,
  Activity,
} from "lucide-react";

import { Card, CardHeader } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { EmptyState } from "../components/ui/EmptyState";
import { PageLoader } from "../components/ui/Spinner";
import { useToast } from "../components/ui/Toast";

import { getMecanico } from "../services/mecanico";
import type { Mecanico } from "../types";

import { statusLabel } from "../utils/status";
import {
  initials,
  formatCurrency,
} from "../utils/format";

export function MecanicoDetalhes() {
  const { id } =
    useParams<{ id?: string }>();

  const toast = useToast();

  const [mecanico, setMecanico] =
    useState<Mecanico | null>(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    if (!id) return;

    const mecanicoId = id;

    async function load() {
      try {
        const data =
          await getMecanico(mecanicoId);

        setMecanico(data);
      } catch (err) {
        toast.error(
          "Erro ao carregar mecânico",
        );

        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [id, toast]);

  if (loading) {
    return (
      <PageLoader label="Carregando mecânico..." />
    );
  }

  if (!mecanico) {
    return (
      <Card>
        <EmptyState
          icon={
            <User className="h-7 w-7" />
          }
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
            -right-10
            -top-20
            h-48
            w-48
            rounded-full
            border
            border-[var(--app-border-subtle)]
          "
        />

        <div
          className="
            pointer-events-none
            absolute
            right-12
            -top-8
            h-24
            w-24
            rounded-full
            border
            border-[var(--app-border-subtle)]
          "
        />

        <div className="relative">
          <div className="mb-5">
            <Link to="/mecanicos">
              <Button
                variant="ghost"
                size="sm"
                className="px-0"
              >
                <ArrowLeft className="h-4 w-4" />
                Voltar aos mecânicos
              </Button>
            </Link>
          </div>

          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div
                className="
                  flex
                  h-16
                  w-16
                  shrink-0
                  items-center
                  justify-center
                  rounded-2xl
                  bg-[var(--app-surface-raised)]
                  font-display
                  text-xl
                  font-extrabold
                  tracking-tight
                  text-[var(--accent-text)]
                "
              >
                {initials(mecanico.nome)}
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h1
                    className="
                      font-display
                      text-3xl
                      font-extrabold
                      tracking-[-0.04em]
                      text-[var(--app-text)]
                      sm:text-4xl
                    "
                  >
                    {mecanico.nome}
                  </h1>

                  {mecanico.ativo ? (
                    <span
                      className="
                        inline-flex
                        items-center
                        gap-1.5
                        rounded-full
                        bg-emerald-500/10
                        px-2.5
                        py-1
                        text-[10px]
                        font-bold
                        uppercase
                        tracking-wide
                        text-emerald-500
                      "
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-current" />
                      Ativo
                    </span>
                  ) : (
                    <span
                      className="
                        inline-flex
                        items-center
                        gap-1.5
                        rounded-full
                        bg-red-500/10
                        px-2.5
                        py-1
                        text-[10px]
                        font-bold
                        uppercase
                        tracking-wide
                        text-red-500
                      "
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-current" />
                      Inativo
                    </span>
                  )}
                </div>

                <p
                  className="
                    mt-1
                    text-sm
                    text-[var(--app-text-muted)]
                  "
                >
                  {mecanico.especialidade ||
                    "Profissional da oficina"}
                </p>
              </div>
            </div>

            <div
              className="
                flex
                items-center
                gap-2
                self-start
                border
                border-[var(--app-border-subtle)]
                bg-[var(--app-surface-raised)]
                px-3
                py-2
                sm:self-auto
              "
            >
              <Activity
                className="
                  h-3.5
                  w-3.5
                  text-[var(--accent-text)]
                "
              />

              <span
                className="
                  text-xs
                  font-semibold
                  text-[var(--app-text-secondary)]
                "
              >
                Perfil profissional
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* DADOS PROFISSIONAIS */}

      <section>
        <div className="mb-4">
          <p
            className="
              text-[10px]
              font-bold
              uppercase
              tracking-[0.18em]
              text-[var(--app-text-muted)]
            "
          >
            Perfil
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
            Dados profissionais
          </h2>
        </div>

        <div className="grid gap-3 lg:grid-cols-[1.3fr_0.7fr]">
          {/* CONTATO */}

          <Card className="p-6">
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <div
                  className="
                    flex
                    h-9
                    w-9
                    items-center
                    justify-center
                    rounded-xl
                    bg-[var(--app-surface-raised)]
                    text-[var(--accent-text)]
                  "
                >
                  <Phone className="h-4 w-4" />
                </div>

                <p
                  className="
                    mt-4
                    text-[10px]
                    font-bold
                    uppercase
                    tracking-[0.14em]
                    text-[var(--app-text-muted)]
                  "
                >
                  Telefone
                </p>

                <p
                  className="
                    mt-1
                    text-sm
                    font-semibold
                    text-[var(--app-text)]
                  "
                >
                  {mecanico.telefone || "—"}
                </p>
              </div>

              <div>
                <div
                  className="
                    flex
                    h-9
                    w-9
                    items-center
                    justify-center
                    rounded-xl
                    bg-[var(--app-surface-raised)]
                    text-[var(--accent-text)]
                  "
                >
                  <Wrench className="h-4 w-4" />
                </div>

                <p
                  className="
                    mt-4
                    text-[10px]
                    font-bold
                    uppercase
                    tracking-[0.14em]
                    text-[var(--app-text-muted)]
                  "
                >
                  Especialidade
                </p>

                <p
                  className="
                    mt-1
                    text-sm
                    font-semibold
                    text-[var(--app-text)]
                  "
                >
                  {mecanico.especialidade ||
                    "Sem especialidade"}
                </p>
              </div>
            </div>
          </Card>

          {/* OFICINA */}

          <Card className="p-6">
            <div className="flex items-start gap-4">
              <div
                className="
                  flex
                  h-10
                  w-10
                  shrink-0
                  items-center
                  justify-center
                  rounded-xl
                  bg-[var(--app-surface-raised)]
                  text-[var(--accent-text)]
                "
              >
                <Building2 className="h-5 w-5" />
              </div>

              <div className="min-w-0">
                <p
                  className="
                    text-[10px]
                    font-bold
                    uppercase
                    tracking-[0.14em]
                    text-[var(--app-text-muted)]
                  "
                >
                  Oficina
                </p>

                <p
                  className="
                    mt-1
                    truncate
                    font-display
                    text-lg
                    font-bold
                    text-[var(--app-text)]
                  "
                >
                  {mecanico.oficina?.nome ||
                    "—"}
                </p>

                <div className="mt-2 space-y-0.5">
                  <p
                    className="
                      text-xs
                      text-[var(--app-text-muted)]
                    "
                  >
                    {mecanico.oficina?.telefone ||
                      "—"}
                  </p>

                  <p
                    className="
                      text-xs
                      leading-5
                      text-[var(--app-text-muted)]
                    "
                  >
                    {mecanico.oficina?.endereco ||
                      "—"}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* INDICADORES */}

      <section>
        <div className="mb-4">
          <p
            className="
              text-[10px]
              font-bold
              uppercase
              tracking-[0.18em]
              text-[var(--app-text-muted)]
            "
          >
            Desempenho
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
            Indicadores do profissional
          </h2>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {/* ORDENS */}

          <Card
            className="
              relative
              overflow-hidden
              p-5
            "
          >
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
                <ClipboardList className="h-5 w-5" />
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
                {mecanico.quantidadeOrdensServico}
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
                Ordens realizadas
              </p>
            </div>
          </Card>

          {/* CONCLUÍDAS */}

          <Card
            className="
              relative
              overflow-hidden
              p-5
            "
          >
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
                <CheckCircle2 className="h-5 w-5" />
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
                Finalizadas
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
                {mecanico.quantidadeConcluidas}
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
                Ordens concluídas
              </p>
            </div>
          </Card>

          {/* CANCELADAS */}

          <Card
            className="
              relative
              overflow-hidden
              p-5
            "
          >
            <div className="flex items-start justify-between">
              <div
                className="
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-xl
                  bg-red-500/10
                  text-red-500
                "
              >
                <XCircle className="h-5 w-5" />
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
                {mecanico.quantidadeCanceladas}
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
                Ordens canceladas
              </p>
            </div>
          </Card>

          {/* MÃO DE OBRA */}

          <Card
            className="
              relative
              overflow-hidden
              p-5
            "
          >
            <div className="flex items-start justify-between">
              <div
                className="
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-xl
                  bg-sky-500/10
                  text-sky-500
                "
              >
                <Wrench className="h-5 w-5" />
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
                Receita
              </span>
            </div>

            <div className="mt-7">
              <p
                className="
                  font-display
                  text-2xl
                  font-bold
                  tabular-nums
                  tracking-[-0.03em]
                  text-[var(--app-text)]
                "
              >
                {formatCurrency(
                  mecanico.totalMaoObra,
                )}
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
                Mão de obra gerada
              </p>
            </div>
          </Card>
        </div>
      </section>

      {/* HISTÓRICO */}

      <section>
        <Card className="overflow-hidden">
          <CardHeader
            title="Histórico de ordens de serviço"
            subtitle={`${mecanico.ordensServico?.length ?? 0} ordem(ns) vinculada(s)`}
          />

          {!mecanico.ordensServico ||
          mecanico.ordensServico.length === 0 ? (
            <EmptyState
              icon={
                <ClipboardList className="h-7 w-7" />
              }
              title="Nenhuma ordem de serviço"
              description="Este mecânico ainda não possui serviços vinculados."
            />
          ) : (
            <div
              className="
                divide-y
                divide-[var(--app-border-subtle)]
              "
            >
              {[...mecanico.ordensServico]
                .sort(
                  (a, b) =>
                    new Date(
                      b.dataCriacao,
                    ).getTime() -
                    new Date(
                      a.dataCriacao,
                    ).getTime(),
                )
                .map((os) => (
                  <Link
                    key={os.ordemServicoId}
                    to={`/ordens-servico/${os.ordemServicoId}`}
                    className="
                      group
                      block
                      px-5
                      py-5
                      transition-colors
                      duration-200
                      hover:bg-[var(--hover-bg)]
                    "
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p
                            className="
                              truncate
                              font-semibold
                              text-[var(--app-text)]
                              transition-colors
                              group-hover:text-[var(--accent-text)]
                            "
                          >
                            {os.veiculo}
                          </p>

                          <ArrowUpRight
                            className="
                              h-3.5
                              w-3.5
                              shrink-0
                              text-[var(--app-text-faint)]
                              opacity-0
                              transition-all
                              group-hover:text-[var(--accent-text)]
                              group-hover:opacity-100
                            "
                          />
                        </div>

                        <p
                          className="
                            mt-1
                            truncate
                            text-sm
                            text-[var(--app-text-muted)]
                          "
                        >
                          Cliente:{" "}
                          {os.clienteNome}
                        </p>
                      </div>

                      <div className="shrink-0">
                        <p
                          className="
                            font-display
                            text-lg
                            font-bold
                            tabular-nums
                            tracking-[-0.02em]
                            text-[var(--app-text)]
                          "
                        >
                          {formatCurrency(
                            os.valorMaoObra,
                          )}
                        </p>
                      </div>
                    </div>

                    <div
                      className="
                        mt-4
                        flex
                        flex-wrap
                        items-center
                        gap-x-4
                        gap-y-2
                        border-t
                        border-[var(--app-border-subtle)]
                        pt-3
                      "
                    >
                      <span
                        className="
                          font-mono
                          text-[10px]
                          font-semibold
                          text-[var(--app-text-faint)]
                        "
                      >
                        OS #
                        {os.ordemServicoId.slice(
                          0,
                          4,
                        )}
                      </span>

                      <span
                        className="
                          text-xs
                          tabular-nums
                          text-[var(--app-text-muted)]
                        "
                      >
                        {new Date(
                          os.dataCriacao,
                        ).toLocaleDateString()}
                      </span>

                      <span
                        className="
                          text-xs
                          font-medium
                          text-[var(--app-text-muted)]
                        "
                      >
                        {statusLabel(os.status)}
                      </span>

                      <span
                        className="
                          ml-auto
                          inline-flex
                          items-center
                          gap-1
                          text-xs
                          font-semibold
                          text-[var(--accent-text)]
                          transition-colors
                          group-hover:text-[var(--accent-text-hover)]
                        "
                      >
                        Ver OS
                        <ArrowRight className="h-3.5 w-3.5" />
                      </span>
                    </div>
                  </Link>
                ))}
            </div>
          )}
        </Card>
      </section>
    </div>
  );
}

