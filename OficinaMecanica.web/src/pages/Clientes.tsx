
import { useEffect, useMemo, useState, useCallback } from "react";
import { Select } from "../components/ui/Select";
import { Link, useNavigate } from "react-router-dom";
import {
  Plus,
  Users,
  Search,
  Pencil,
  Eye,
  Phone,
  Mail,
  MapPin,
  UserX,
  UserCheck,
} from "lucide-react";

import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Modal } from "../components/ui/Modal";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { EmptyState } from "../components/ui/EmptyState";
import { PageLoader } from "../components/ui/Spinner";
import { useToast } from "../components/ui/Toast";

import {
  ClienteForm,
  type ClienteFormValues,
} from "../components/forms/ClienteForm";

import {
  listClientes,
  createCliente,
  updateCliente,
  deleteCliente,
  inativarCliente,
  reativarCliente,
} from "../services/clientes";

import type { Cliente } from "../types";
import { initials } from "../utils/format";

export function Clientes() {
  const toast = useToast();
  const navigate = useNavigate();

  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Cliente | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [toDelete, setToDelete] = useState<Cliente | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [filtroStatus, setFiltroStatus] = useState("todos");

  const load = useCallback(async () => {
    setLoading(true);

    try {
      const data = await listClientes();
      setClientes(data);
    } catch (err) {
      toast.error("Erro ao carregar clientes");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    return clientes.filter((c) => {
      const matchesSearch =
        !q ||
        c.nome.toLowerCase().includes(q) ||
        (c.email ?? "").toLowerCase().includes(q) ||
        (c.telefone ?? "").toLowerCase().includes(q);

      const matchesStatus =
        filtroStatus === "todos" ||
        (filtroStatus === "ativos" && c.ativo) ||
        (filtroStatus === "inativos" && !c.ativo);

      return matchesSearch && matchesStatus;
    });
  }, [clientes, search, filtroStatus]);

  const handleSubmit = async (
    values: ClienteFormValues,
  ) => {
    setSubmitting(true);

    try {
      if (editing) {
        await updateCliente(editing.id, values);

        toast.success(
          "Cliente atualizado com sucesso",
        );
      } else {
        await createCliente(values);

        toast.success(
          "Cliente cadastrado com sucesso",
        );
      }

      setModalOpen(false);
      setEditing(null);

      await load();
    } catch (err) {
      toast.error(
        editing
          ? "Erro ao atualizar cliente"
          : "Erro ao cadastrar cliente",
      );

      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!toDelete) return;

    setDeleting(true);

    try {
      await deleteCliente(toDelete.id);

      toast.success(
        "Cliente excluído com sucesso",
      );

      setToDelete(null);

      await load();
    } catch (err) {
      toast.error("Erro ao excluir cliente");
      console.error(err);
    } finally {
      setDeleting(false);
    }
  };

  const handleInativar = async (
    cliente: Cliente,
  ) => {
    try {
      await inativarCliente(cliente.id);

      toast.success(
        "Cliente inativado com sucesso",
      );

      await load();
    } catch (err) {
      toast.error("Erro ao inativar cliente");
      console.error(err);
    }
  };

  const handleReativar = async (
    cliente: Cliente,
  ) => {
    try {
      await reativarCliente(cliente.id);

      toast.success(
        "Cliente reativado com sucesso",
      );

      await load();
    } catch (err) {
      toast.error("Erro ao reativar cliente");
      console.error(err);
    }
  };

  const openCreateModal = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEditModal = (cliente: Cliente) => {
    setEditing(cliente);
    setModalOpen(true);
  };

  return (
    <div className="space-y-7">
      {/* =================================================
          HEADER
          ================================================= */}

      <section className="border-b border-[var(--app-border-subtle)] pb-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--accent-text)]">
              Cadastro
            </p>

            <div className="flex items-end gap-3">
              <h1 className="font-display text-2xl font-black tracking-tight text-[var(--app-text)] sm:text-3xl">
                Clientes
              </h1>

              <span className="mb-1.5 text-xs font-semibold text-[var(--app-text-faint)]">
                {clientes.length
                  .toString()
                  .padStart(2, "0")}{" "}
                cadastrados
              </span>
            </div>

            <p className="mt-2 max-w-xl text-sm leading-6 text-[var(--app-text-muted)]">
              Gerencie os clientes e mantenha seus dados
              sempre atualizados.
            </p>
          </div>

          <Button
            className="w-full sm:w-auto"
            onClick={openCreateModal}
          >
            <Plus className="h-4 w-4" />
            Novo cliente
          </Button>
        </div>
      </section>

      {/* =================================================
          CONTROLS
          ================================================= */}

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
              placeholder="Buscar por nome, email ou telefone..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              className="w-full pl-9"
            />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2">
              <span className="hidden text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--app-text-faint)] sm:block">
                Status
              </span>

              <Select
                value={filtroStatus}
                onChange={(e) =>
                  setFiltroStatus(e.target.value)
                }
                className="w-full sm:w-56"
              >
                <option value="todos">
                  Todos os clientes
                </option>

                <option value="ativos">
                  Clientes ativos
                </option>

                <option value="inativos">
                  Clientes inativos
                </option>
              </Select>
            </div>
          </div>
        </div>
      </section>

      {/* =================================================
          RESULT INFO
          ================================================= */}

      {!loading && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-[var(--app-text-muted)]">
            <span className="font-semibold text-[var(--app-text)]">
              {filtered.length}
            </span>{" "}
            {filtered.length === 1
              ? "cliente encontrado"
              : "clientes encontrados"}
          </p>

          {(search || filtroStatus !== "todos") && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setFiltroStatus("todos");
              }}
              className="
                text-xs
                font-semibold
                text-[var(--accent-text)]
                transition-colors
                hover:text-[var(--accent-text-hover)]
              "
            >
              Limpar filtros
            </button>
          )}
        </div>
      )}

      {/* =================================================
          CONTENT
          ================================================= */}

      {loading ? (
        <PageLoader label="Carregando clientes..." />
      ) : filtered.length === 0 ? (
        <Card>
          <EmptyState
            icon={
              <Users className="h-7 w-7" />
            }
            title={
              search || filtroStatus !== "todos"
                ? "Nenhum cliente encontrado"
                : "Nenhum cliente cadastrado"
            }
            description={
              search || filtroStatus !== "todos"
                ? "Tente ajustar os filtros para encontrar outro cliente."
                : "Cadastre o primeiro cliente da oficina."
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
                  Cadastrar cliente
                </Button>
              )
            }
          />
        </Card>
      ) : (
        <div
          className="
            grid
            grid-cols-1
            gap-px
            overflow-hidden
            border
            border-[var(--app-border-subtle)]
            bg-[var(--app-border-subtle)]
            md:grid-cols-2
            xl:grid-cols-3
          "
        >
          {filtered.map((c) => (
            <Card
              key={c.id}
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
              onClick={() => {
                navigate(`/clientes/${c.id}`);
              }}
            >
              {/* CLIENT HEADER */}

              <div className="flex items-start gap-3">
                <Link
                  to={`/clientes/${c.id}`}
                  onClick={(e) =>
                    e.stopPropagation()
                  }
                  className="
                    flex
                    h-11
                    w-11
                    shrink-0
                    items-center
                    justify-center
                    rounded-full
                    bg-[var(--app-surface-raised)]
                    text-sm
                    font-bold
                    text-[var(--accent-text)]
                    transition-colors
                    group-hover:bg-[var(--hover-bg)]
                  "
                >
                  {initials(c.nome)}
                </Link>

                <div className="min-w-0 flex-1">
                  <div className="flex min-w-0 flex-wrap items-center gap-2">
                    <Link
                      to={`/clientes/${c.id}`}
                      onClick={(e) =>
                        e.stopPropagation()
                      }
                      className="
                        min-w-0
                        max-w-full
                        truncate
                        font-display
                        text-sm
                        font-bold
                        text-[var(--app-text)]
                        transition-colors
                        hover:text-[var(--accent-text)]
                      "
                    >
                      {c.nome}
                    </Link>

                    {c.ativo ? (
                      <span
                        className="
                          shrink-0
                          rounded-full
                          border
                          border-emerald-500/20
                          bg-emerald-500/10
                          px-2
                          py-0.5
                          text-[10px]
                          font-semibold
                          text-emerald-500
                          dark:text-emerald-300
                        "
                      >
                        Ativo
                      </span>
                    ) : (
                      <span
                        className="
                          shrink-0
                          rounded-full
                          border
                          border-red-500/20
                          bg-red-500/10
                          px-2
                          py-0.5
                          text-[10px]
                          font-semibold
                          text-red-500
                          dark:text-red-300
                        "
                      >
                        Inativo
                      </span>
                    )}
                  </div>

                  <p
                    className="
                      mt-1
                      flex
                      min-w-0
                      items-center
                      gap-1.5
                      truncate
                      text-xs
                      text-[var(--app-text-muted)]
                    "
                  >
                    <Phone className="h-3 w-3 shrink-0" />

                    <span className="truncate">
                      {c.telefone || "—"}
                    </span>
                  </p>
                </div>
              </div>

              {/* ACTIONS */}

              <div
                className="
                  mt-5
                  flex
                  justify-end
                  gap-1
                  border-t
                  border-[var(--app-border-subtle)]
                  pt-3
                "
              >
                <Link
                  to={`/clientes/${c.id}`}
                  onClick={(e) =>
                    e.stopPropagation()
                  }
                  className="
                    rounded-lg
                    p-2
                    text-[var(--app-text-muted)]
                    transition-colors
                    hover:bg-[var(--hover-bg)]
                    hover:text-sky-500
                    dark:hover:text-sky-400
                  "
                  title="Visualizar"
                >
                  <Eye className="h-4 w-4" />
                </Link>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    openEditModal(c);
                  }}
                  className="
                    rounded-lg
                    p-2
                    text-[var(--app-text-muted)]
                    transition-colors
                    hover:bg-[var(--hover-bg)]
                    hover:text-[var(--accent-text)]
                  "
                  title="Editar"
                >
                  <Pencil className="h-4 w-4" />
                </button>

                {c.ativo ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleInativar(c);
                    }}
                    className="
                      rounded-lg
                      p-2
                      text-[var(--app-text-muted)]
                      transition-colors
                      hover:bg-[var(--hover-bg)]
                      hover:text-red-500
                      dark:hover:text-red-400
                    "
                    title="Inativar cliente"
                  >
                    <UserX className="h-4 w-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleReativar(c);
                    }}
                    className="
                      rounded-lg
                      p-2
                      text-[var(--app-text-muted)]
                      transition-colors
                      hover:bg-[var(--hover-bg)]
                      hover:text-emerald-500
                      dark:hover:text-emerald-400
                    "
                    title="Reativar cliente"
                  >
                    <UserCheck className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* CONTACT INFORMATION */}

              <div
                className="
                  mt-4
                  space-y-2
                  border-t
                  border-[var(--app-border-subtle)]
                  pt-3
                  text-xs
                  text-[var(--app-text-muted)]
                "
              >
                <p className="flex min-w-0 items-center gap-1.5">
                  <Mail className="h-3 w-3 shrink-0" />

                  <span className="truncate">
                    {c.email || "—"}
                  </span>
                </p>

                <p className="flex min-w-0 items-start gap-1.5">
                  <MapPin className="mt-0.5 h-3 w-3 shrink-0" />

                  <span className="break-words">
                    {c.endereco || "—"}
                  </span>
                </p>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* =================================================
          MODAL
          ================================================= */}

      <Modal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditing(null);
        }}
        title={
          editing
            ? "Editar cliente"
            : "Cadastrar cliente"
        }
        description={
          editing
            ? "Atualize os dados do cliente."
            : "Preencha os dados do novo cliente."
        }
        size="lg"
      >
        <ClienteForm
          initial={editing}
          onSubmit={handleSubmit}
          onCancel={() => {
            setModalOpen(false);
            setEditing(null);
          }}
          submitting={submitting}
        />
      </Modal>

      {/* =================================================
          DELETE CONFIRMATION
          ================================================= */}

      <ConfirmDialog
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Excluir cliente"
        message={`Tem certeza que deseja excluir o cliente "${toDelete?.nome}"?`}
      />
    </div>
  );
}
