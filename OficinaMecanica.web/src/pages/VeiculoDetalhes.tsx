import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Car,
  Pencil,
  User,
  Calendar,
  Hash,
  UserX,
  UserCheck,
  ClipboardList,
  CheckCircle,
  DollarSign,
  Search,
} from "lucide-react";

import { Card } from "../components/ui/Card";
import { formatCurrency } from "../utils/format";
import { Button } from "../components/ui/Button";
import { PageLoader } from "../components/ui/Spinner";
import { EmptyState } from "../components/ui/EmptyState";
import { Modal } from "../components/ui/Modal";
import { useToast } from "../components/ui/Toast";

import {
  VeiculoForm,
  type VeiculoFormValues,
} from "../components/forms/VeiculoForm";

import {
  getVeiculo,
  updateVeiculo,
  inativarVeiculo,
  reativarVeiculo,
} from "../services/veiculos";

import { listClientes } from "../services/clientes";

import type { Cliente, Veiculo } from "../types";

import { statusLabel } from "../utils/status";

export function VeiculoDetalhes() {
  const { id } = useParams<{ id: string }>();
  const toast = useToast();

  const [veiculo, setVeiculo] = useState<Veiculo | null>(null);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);

  const [editOpen, setEditOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Filtro das OS
  const [buscaOS, setBuscaOS] = useState("");

  useEffect(() => {
    if (!id) return;

    (async () => {
      try {
        const [v, c] = await Promise.all([
          getVeiculo(id),
          listClientes(),
        ]);

        setVeiculo(v);
        setClientes(c);
      } catch (err) {
        toast.error("Erro ao carregar veículo");
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, [id, toast]);

  const handleEdit = async (values: VeiculoFormValues) => {
    if (!id) return;

    setSubmitting(true);

    try {
      await updateVeiculo(id, {
        placa: values.placa,
        marca: values.marca,
        modelo: values.modelo,
        ano: values.ano,
      });

      toast.success("Veículo atualizado com sucesso");

      setEditOpen(false);

      const atualizado = await getVeiculo(id);
      setVeiculo(atualizado);
    } catch (err) {
      toast.error("Erro ao atualizar veículo");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleInativar = async () => {
    if (!id) return;

    try {
      await inativarVeiculo(id);

      toast.success("Veículo inativado com sucesso");

      const atualizado = await getVeiculo(id);
      setVeiculo(atualizado);
    } catch (err) {
      toast.error("Erro ao inativar veículo");
      console.error(err);
    }
  };

  const handleReativar = async () => {
    if (!id) return;

    try {
      await reativarVeiculo(id);

      toast.success("Veículo reativado com sucesso");

      const atualizado = await getVeiculo(id);
      setVeiculo(atualizado);
    } catch (err) {
      toast.error("Erro ao reativar veículo");
      console.error(err);
    }
  };

  if (loading) {
    return <PageLoader label="Carregando veículo..." />;
  }

  if (!veiculo) {
    return (
      <Card>
        <EmptyState
          icon={<Car className="h-7 w-7" />}
          title="Veículo não encontrado"
          action={
            <Link to="/veiculos">
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

  const ordensServico = veiculo.ordensServico ?? [];

  const ordensConcluidas = ordensServico.filter(
    (os) => os.statusAtual === 4,
  );

  const ultimaVisita = [...ordensConcluidas].sort(
    (a, b) =>
      new Date(
        b.dataConclusao ?? b.dataCriacao,
      ).getTime() -
      new Date(
        a.dataConclusao ?? a.dataCriacao,
      ).getTime(),
  )[0];

  const diasSemVisita = ultimaVisita
    ? Math.floor(
        (Date.now() -
          new Date(
            ultimaVisita.dataConclusao ??
              ultimaVisita.dataCriacao,
          ).getTime()) /
          (1000 * 60 * 60 * 24),
      )
    : null;

  /*
   * Se tiver mais de 10 OS, mostramos inicialmente somente as 10.
   * Quando o usuário pesquisar, mostramos os resultados filtrados.
   */
  const busca = buscaOS.trim().toLowerCase();

const ordensFiltradas = busca
  ? ordensServico.filter((os) => {
      const numeroOS = os.ordemServicoId.toLowerCase();
      const status = statusLabel(os.statusAtual).toLowerCase();

      return (
        numeroOS.includes(busca) ||
        status.includes(busca)
      );
    })
  : ordensServico.slice(0, 10);

  const cliente = clientes.find(
    (c) => c.id === veiculo.clienteId,
  );

  const info = [
    {
      icon: Hash,
      label: "Marca",
      value: veiculo.marca,
    },
    {
      icon: Car,
      label: "Modelo",
      value: veiculo.modelo,
    },
    {
      icon: Calendar,
      label: "Ano",
      value: veiculo.ano ?? "—",
    },
    {
      icon: Hash,
      label: "Placa",
      value: veiculo.placa || "—",
    },
  ];

  return (
    <div className="space-y-5">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between gap-3">
        <Link to="/veiculos">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
        </Link>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setEditOpen(true)}
          >
            <Pencil className="h-4 w-4" />
            Editar
          </Button>

          {veiculo.ativo ? (
            <Button
              variant="danger"
              size="sm"
              onClick={handleInativar}
            >
              <UserX className="h-4 w-4" />
              Inativar
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={handleReativar}
            >
              <UserCheck className="h-4 w-4" />
              Reativar
            </Button>
          )}
        </div>
      </div>

      {/* Informações do veículo */}
      <Card className="p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-ink-700 to-ink-800 text-flame-400">
            <Car className="h-8 w-8" />
          </div>

          <div className="flex-1">
            <h2 className="font-display text-2xl font-bold text-white">
              {veiculo.marca} {veiculo.modelo}
            </h2>

            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {info.map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.label}
                    className="flex items-center gap-2.5 rounded-xl border border-ink-700/50 bg-ink-800/40 px-3.5 py-3"
                  >
                    <Icon className="h-4 w-4 shrink-0 text-ink-400" />

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">
                        {item.label}
                      </p>

                      <p className="text-sm font-semibold text-white">
                        {item.value}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </Card>

      {/* Última visita */}
      <Card className="p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-ink-800 text-amber-400">
            <Calendar className="h-5 w-5" />
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">
              Última visita
            </p>

            {ultimaVisita ? (
              <>
                <p className="mt-1 font-display text-lg font-bold text-white">
                  {diasSemVisita === 0
                    ? "Hoje"
                    : `Há ${diasSemVisita} dias`}
                </p>

                <p className="mt-1 text-sm text-ink-300">
                  Última OS concluída em{" "}
                  {new Date(
                    ultimaVisita.dataConclusao ??
                      ultimaVisita.dataCriacao,
                  ).toLocaleDateString("pt-BR")}
                </p>
              </>
            ) : (
              <p className="mt-1 text-sm text-ink-400">
                Nenhuma OS concluída encontrada.
              </p>
            )}
          </div>
        </div>
      </Card>

      {/* Cliente */}
      <Card className="p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-ink-800 text-sky-400">
            <User className="h-5 w-5" />
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">
              Cliente proprietário
            </p>

            {cliente ? (
              <Link
                to={`/clientes/${cliente.id}`}
                className="font-display text-lg font-bold text-white transition hover:text-flame-400"
              >
                {cliente.nome}
              </Link>
            ) : (
              <p className="font-display text-lg font-bold text-ink-400">
                Sem proprietário
              </p>
            )}
          </div>
        </div>
      </Card>

      {/* Resumo */}
      <Card className="p-5">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-ink-800 text-sky-400">
              <ClipboardList className="h-5 w-5" />
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">
                Ordens de Serviço
              </p>

              <p className="font-display text-xl font-bold text-white">
                {ordensServico.length}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-ink-800 text-emerald-400">
              <CheckCircle className="h-5 w-5" />
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">
                Concluídas
              </p>

              <p className="font-display text-xl font-bold text-white">
                {ordensConcluidas.length}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-ink-800 text-emerald-400">
              <DollarSign className="h-5 w-5" />
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">
                Total gasto
              </p>

              <p className="font-display text-xl font-bold text-white">
                {formatCurrency(
                  ordensConcluidas.reduce(
                    (total, os) =>
                      total + os.valorTotal,
                    0,
                  ),
                )}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Ordens de Serviço */}
      <Card>
        <div className="border-b border-ink-700/40 px-5 py-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="font-display text-lg font-bold text-white">
                Ordens de Serviço
              </h3>

              <p className="mt-1 text-sm text-ink-400">
                {ordensServico.length} atendimento(s)
              </p>
            </div>

            {ordensServico.length > 10 && (
              <div className="relative w-full sm:w-72">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />

                <input
                  type="text"
                  value={buscaOS}
                  onChange={(e) =>
                    setBuscaOS(e.target.value)
                  }
                  placeholder="Buscar OS ou status..."
                  className="w-full rounded-xl border border-ink-700 bg-ink-800 py-2.5 pl-9 pr-3 text-sm text-white outline-none transition placeholder:text-ink-500 focus:border-sky-400"
                />
              </div>
            )}
          </div>
        </div>

        {ordensServico.length === 0 ? (
          <EmptyState
            icon={<ClipboardList className="h-7 w-7" />}
            title="Nenhuma ordem de serviço"
            description="Este veículo ainda não possui ordens de serviço."
          />
        ) : ordensFiltradas.length === 0 ? (
          <EmptyState
            icon={<Search className="h-7 w-7" />}
            title="Nenhuma OS encontrada"
            description="Tente pesquisar por outro número de OS ou status."
          />
        ) : (
          <div className="grid gap-4 p-5 md:grid-cols-2">
            {ordensFiltradas.map((os) => (
              <Link
                key={os.ordemServicoId}
                to={`/ordens-servico/${os.ordemServicoId}`}
                className="block"
              >
                <Card className="bg-ink-800/40 p-5 transition hover:bg-ink-700/50 hover:ring-1 hover:ring-sky-400/30">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-lg font-bold text-white">
                        OS #{os.ordemServicoId.slice(-4)}
                      </p>

                      <p className="mt-2 text-sm text-ink-300">
                        Status:{" "}
                        <span className="font-semibold text-white">
                          {statusLabel(os.statusAtual)}
                        </span>
                      </p>
                    </div>

                    <ClipboardList className="h-6 w-6 text-sky-400" />
                  </div>

                  {os.dataConclusao && (
                    <p className="mt-4 text-xs text-ink-400">
                      Concluída em{" "}
                      {new Date(
                        os.dataConclusao,
                      ).toLocaleDateString("pt-BR")}
                    </p>
                  )}

                  <p className="mt-2 text-sm font-semibold text-emerald-400">
                    {formatCurrency(os.valorTotal)}
                  </p>
                </Card>
              </Link>
            ))}
          </div>
        )}

        {ordensServico.length > 10 && !buscaOS && (
          <div className="border-t border-ink-700/40 px-5 py-3">
            <p className="text-center text-xs text-ink-500">
              Exibindo as 10 ordens mais recentes. Use a
              busca para encontrar outras OS.
            </p>
          </div>
        )}
      </Card>

      {/* Modal de edição */}
      <Modal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title="Editar veículo"
        description="Atualize os dados do veículo."
        size="lg"
      >
        <VeiculoForm
          initial={veiculo}
          clientes={clientes}
          onSubmit={handleEdit}
          onCancel={() => setEditOpen(false)}
          submitting={submitting}
        />
      </Modal>
    </div>
  );
}