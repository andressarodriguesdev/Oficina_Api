
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Plus,
  Car,
  Search,
  Pencil,
  Eye,
  User,
} from "lucide-react";

import { Select } from "../components/ui/Select";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Modal } from "../components/ui/Modal";
import { EmptyState } from "../components/ui/EmptyState";
import { PageLoader } from "../components/ui/Spinner";
import { useToast } from "../components/ui/Toast";

import {
  VeiculoForm,
  type VeiculoFormValues,
} from "../components/forms/VeiculoForm";

import {
  listVeiculos,
  createVeiculo,
  updateVeiculo,
} from "../services/veiculos";

import { listClientes } from "../services/clientes";

import type { Cliente, Veiculo } from "../types";

export function Veiculos() {
  const toast = useToast();
  const navigate = useNavigate();

  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Veiculo | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [filtroStatus, setFiltroStatus] = useState("todos");

  const load = useCallback(async () => {
    setLoading(true);

    try {
      const [veiculosResponse, clientesResponse] = await Promise.all([
        listVeiculos(),
        listClientes(),
      ]);

      const veiculosComCliente = veiculosResponse.map((veiculo) => ({
        ...veiculo,
        cliente:
          clientesResponse.find(
            (cliente) => cliente.id === veiculo.clienteId,
          ) ?? null,
      }));

      setVeiculos(veiculosComCliente);
      setClientes(clientesResponse);
    } catch (error) {
      toast.error("Erro ao carregar veículos");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    load();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    return veiculos.filter((v) => {
      const matchesSearch =
        !q ||
        v.placa.toLowerCase().includes(q) ||
        v.modelo.toLowerCase().includes(q) ||
        v.marca.toLowerCase().includes(q) ||
        v.cliente?.nome.toLowerCase().includes(q);

      const matchesStatus =
        filtroStatus === "todos" ||
        (filtroStatus === "ativos" && v.ativo) ||
        (filtroStatus === "inativos" && !v.ativo);

      return matchesSearch && matchesStatus;
    });
  }, [veiculos, search, filtroStatus]);

  async function handleSubmit(values: VeiculoFormValues) {
    setSubmitting(true);

    try {
      const payload = {
        clienteId: values.cliente_id,
        marca: values.marca,
        modelo: values.modelo,
        ano: values.ano,
        placa: values.placa,
      };

      if (editing) {
        await updateVeiculo(editing.id, payload);

        toast.success("Veículo atualizado com sucesso");
      } else {
        await createVeiculo(payload);

        toast.success("Veículo cadastrado com sucesso");
      }

      setModalOpen(false);
      setEditing(null);

      await load();
    } catch (error) {
      toast.error(
        editing
          ? "Erro ao atualizar veículo"
          : "Erro ao cadastrar veículo",
      );

      console.error(error);
    } finally {
      setSubmitting(false);
    }
  }

  function openCreateModal() {
    setEditing(null);
    setModalOpen(true);
  }

  function openEditModal(veiculo: Veiculo) {
    setEditing(veiculo);
    setModalOpen(true);
  }

  return (
    <div className="space-y-7">
      {/* HEADER */}
      <section className="border-b border-[var(--app-border-subtle)] pb-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--accent-text)]">
              Cadastro
            </p>

            <div className="flex items-end gap-3">
              

              <span className="mb-1.5 text-xs font-semibold text-[var(--app-text-faint)]">
                {veiculos.length.toString().padStart(2, "0")} cadastrados
              </span>
            </div>

            <p className="mt-2 max-w-xl text-sm leading-6 text-[var(--app-text-muted)]">
              Gerencie os veículos vinculados aos clientes da oficina.
            </p>
          </div>

          <Button
            className="w-full sm:w-auto"
            onClick={openCreateModal}
          >
            <Plus className="h-4 w-4" />
            Novo veículo
          </Button>
        </div>
      </section>

      {/* CONTROLS */}
      <section className="border-y border-[var(--app-border-subtle)] py-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-md">
            <Search
              className="
                pointer-events-none
                absolute
                left-3
                top-1/2
                h-4
                w-4
                -translate-y-1/2
                text-[var(--app-text-muted)]
              "
            />

            <Input
              placeholder="Buscar por marca, modelo ou placa..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2">
              <span className="hidden text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--app-text-faint)] sm:block">
                Status
              </span>

              <Select
                value={filtroStatus}
                onChange={(e) => setFiltroStatus(e.target.value)}
                className="w-full sm:w-56"
              >
                <option value="todos">Todos os veículos</option>
                <option value="ativos">Veículos ativos</option>
                <option value="inativos">Veículos inativos</option>
              </Select>
            </div>
          </div>
        </div>
      </section>

      {/* RESULT INFO */}
      {!loading && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-[var(--app-text-muted)]">
            <span className="font-semibold text-[var(--app-text)]">
              {filtered.length}
            </span>{" "}
            {filtered.length === 1
              ? "veículo encontrado"
              : "veículos encontrados"}
          </p>

          {(search || filtroStatus !== "todos") && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setFiltroStatus("todos");
              }}
              className="text-xs font-semibold text-[var(--accent-text)] transition-colors hover:text-[var(--accent-text-hover)]"
            >
              Limpar filtros
            </button>
          )}
        </div>
      )}

      {/* CONTENT */}
      {loading ? (
        <PageLoader label="Carregando veículos..." />
      ) : filtered.length === 0 ? (
        <Card>
          <EmptyState
            icon={<Car className="h-7 w-7" />}
            title={
              search || filtroStatus !== "todos"
                ? "Nenhum veículo encontrado"
                : "Nenhum veículo cadastrado"
            }
            description={
              search || filtroStatus !== "todos"
                ? "Tente ajustar os filtros para encontrar outro veículo."
                : "Cadastre o primeiro veículo da oficina."
            }
            action={
              search || filtroStatus !== "todos" ? (
                <Button
                  variant="secondary"
                  onClick={() => {
                    setSearch("");
                    setFiltroStatus("todos");
                  }}
                >
                  Limpar filtros
                </Button>
              ) : (
                <Button onClick={openCreateModal}>
                  <Plus className="h-4 w-4" />
                  Cadastrar veículo
                </Button>
              )
            }
          />
        </Card>
      ) : (
        <div className="grid gap-px overflow-hidden border border-[var(--app-border-subtle)] bg-[var(--app-border-subtle)] sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((v) => (
            <Card
              key={v.id}
              hover
              className="
                group
                cursor-pointer
                rounded-none
                border-0
                p-5
                transition-all
                duration-200
                hover:bg-[var(--app-surface-hover)]
              "
              onClick={() => navigate(`/veiculos/${v.id}`)}
            >
              {/* VEHICLE HEADER */}
              <div className="flex items-start justify-between gap-4">
                <Link
                  to={`/veiculos/${v.id}`}
                  onClick={(e) => e.stopPropagation()}
                  className="flex min-w-0 items-center gap-3"
                >
                  <div
                    className="
                      flex
                      h-11
                      w-11
                      shrink-0
                      items-center
                      justify-center
                      rounded-xl
                      bg-[var(--app-surface-raised)]
                      text-[var(--accent-text)]
                      transition-colors
                      duration-200
                      group-hover:bg-[var(--hover-bg)]
                    "
                  >
                    <Car className="h-5 w-5" />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="truncate font-display text-sm font-bold text-[var(--app-text)] transition-colors group-hover:text-[var(--accent-text)]">
                        {v.marca} {v.modelo}
                      </p>

                      {v.ativo ? (
                        <span className="shrink-0 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-500 dark:text-emerald-300">
                          Ativo
                        </span>
                      ) : (
                        <span className="shrink-0 rounded-full border border-red-500/20 bg-red-500/10 px-2 py-0.5 text-[10px] font-semibold text-red-500 dark:text-red-300">
                          Inativo
                        </span>
                      )}
                    </div>

                    <p className="mt-0.5 text-xs text-[var(--app-text-muted)]">
                      {v.ano} · {v.placa}
                    </p>
                  </div>
                </Link>

                {/* ACTIONS */}
                <div className="flex shrink-0 gap-1">
                  <Link
                    to={`/veiculos/${v.id}`}
                    onClick={(e) => e.stopPropagation()}
                    aria-label={`Visualizar ${v.marca} ${v.modelo}`}
                    className="
                      rounded-lg
                      p-2
                      text-[var(--app-text-muted)]
                      transition-colors
                      hover:bg-[var(--hover-bg)]
                      hover:text-sky-500
                      dark:hover:text-sky-400
                    "
                  >
                    <Eye className="h-4 w-4" />
                  </Link>

                  <button
                    type="button"
                    aria-label={`Editar ${v.marca} ${v.modelo}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      openEditModal(v);
                    }}
                    className="
                      rounded-lg
                      p-2
                      text-[var(--app-text-muted)]
                      transition-colors
                      hover:bg-[var(--hover-bg)]
                      hover:text-[var(--accent-text)]
                    "
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* CLIENT */}
              <div
                className="
                  mt-5
                  flex
                  items-center
                  gap-2
                  border-t
                  border-[var(--app-border-subtle)]
                  pt-3
                  text-xs
                  text-[var(--app-text-muted)]
                "
              >
                <User className="h-3 w-3 shrink-0" />

                <span className="shrink-0">Cliente</span>

                <span className="truncate font-medium text-[var(--app-text-secondary)]">
                  {v.cliente?.nome ?? "—"}
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* MODAL */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Editar veículo" : "Cadastrar veículo"}
        size="lg"
      >
        <VeiculoForm
          initial={editing}
          clientes={clientes}
          onSubmit={handleSubmit}
          onCancel={() => setModalOpen(false)}
          submitting={submitting}
        />
      </Modal>
    </div>
  );
}