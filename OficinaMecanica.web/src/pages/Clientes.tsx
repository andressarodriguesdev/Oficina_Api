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
  ArrowLeft,
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

  const handleSubmit = async (values: ClienteFormValues) => {
    setSubmitting(true);

    try {
      if (editing) {
        await updateCliente(editing.id, values);
        toast.success("Cliente atualizado com sucesso");
      } else {
        await createCliente(values);
        toast.success("Cliente cadastrado com sucesso");
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

      toast.success("Cliente excluído com sucesso");

      setToDelete(null);

      await load();
    } catch (err) {
      toast.error("Erro ao excluir cliente");
      console.error(err);
    } finally {
      setDeleting(false);
    }
  };

  const handleInativar = async (cliente: Cliente) => {
    try {
      await inativarCliente(cliente.id);

      toast.success("Cliente inativado com sucesso");

      await load();
    } catch (err) {
      toast.error("Erro ao inativar cliente");
      console.error(err);
    }
  };

  const handleReativar = async (cliente: Cliente) => {
    try {
      await reativarCliente(cliente.id);

      toast.success("Cliente reativado com sucesso");

      await load();
    } catch (err) {
      toast.error("Erro ao reativar cliente");
      console.error(err);
    }
  };

  return (
    <div className="space-y-5">
      {/* VOLTAR */}
      <div className="flex items-center">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/painel")}
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>
      </div>

      {/* FILTROS / AÇÕES */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        {/* BUSCA */}
        <div className="relative w-full lg:w-[420px] lg:shrink-0">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />

          <Input
            placeholder="Buscar por nome, email ou telefone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9"
          />
        </div>

        {/* FILTRO DE STATUS */}
        <Select
          value={filtroStatus}
          onChange={(e) => setFiltroStatus(e.target.value)}
          className="w-full lg:w-56 lg:shrink-0"
        >
          <option value="todos">Todos os clientes</option>
          <option value="ativos">Clientes ativos</option>
          <option value="inativos">Clientes inativos</option>
        </Select>

        {/* NOVO CLIENTE */}
        <Button
          className="w-full whitespace-nowrap lg:ml-auto lg:w-auto"
          onClick={() => {
            setEditing(null);
            setModalOpen(true);
          }}
        >
          <Plus className="h-4 w-4" />
          Novo cliente
        </Button>
      </div>

      {/* CONTEÚDO */}
      {loading ? (
        <PageLoader label="Carregando clientes..." />
      ) : filtered.length === 0 ? (
        <Card>
          <EmptyState
            icon={<Users className="h-7 w-7" />}
            title={
              search
                ? "Nenhum cliente encontrado"
                : "Nenhum cliente cadastrado"
            }
            description={
              search
                ? "Tente outra busca."
                : "Cadastre o primeiro cliente da oficina."
            }
            action={
              !search && (
                <Button
                  onClick={() => {
                    setEditing(null);
                    setModalOpen(true);
                  }}
                >
                  <Plus className="h-4 w-4" />
                  Cadastrar cliente
                </Button>
              )
            }
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((c) => (
            <Card
              key={c.id}
              hover
              className="cursor-pointer p-4 sm:p-5"
              onClick={() => {
                navigate(`/clientes/${c.id}`);
              }}
            >
              {/* CABEÇALHO DO CARD */}
              <div className="flex items-start gap-3">
                {/* AVATAR */}
                <Link
                  to={`/clientes/${c.id}`}
                  onClick={(e) => e.stopPropagation()}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-ink-700 to-ink-800 text-sm font-bold text-flame-400"
                >
                  {initials(c.nome)}
                </Link>

                {/* NOME / STATUS / TELEFONE */}
                <div className="min-w-0 flex-1">
                  <div className="flex min-w-0 flex-wrap items-center gap-2">
                    <Link
                      to={`/clientes/${c.id}`}
                      onClick={(e) => e.stopPropagation()}
                      className="min-w-0 max-w-full truncate font-display text-sm font-bold text-white hover:text-flame-400"
                    >
                      {c.nome}
                    </Link>

                    {c.ativo ? (
                      <span className="shrink-0 rounded-full bg-green-500/20 px-2 py-0.5 text-[10px] font-semibold text-green-400">
                        Ativo
                      </span>
                    ) : (
                      <span className="shrink-0 rounded-full bg-red-500/20 px-2 py-0.5 text-[10px] font-semibold text-red-400">
                        Inativo
                      </span>
                    )}
                  </div>

                  <p className="mt-0.5 flex min-w-0 items-center gap-1 truncate text-xs text-ink-400">
                    <Phone className="h-3 w-3 shrink-0" />

                    <span className="truncate">
                      {c.telefone || "—"}
                    </span>
                  </p>
                </div>
              </div>

              {/* AÇÕES */}
              <div className="mt-3 flex justify-end gap-1 border-t border-ink-700/40 pt-3">
                <Link
                  to={`/clientes/${c.id}`}
                  onClick={(e) => e.stopPropagation()}
                  className="rounded-lg p-2 text-ink-400 transition hover:bg-ink-800 hover:text-sky-400"
                  title="Visualizar"
                >
                  <Eye className="h-4 w-4" />
                </Link>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditing(c);
                    setModalOpen(true);
                  }}
                  className="rounded-lg p-2 text-ink-400 transition hover:bg-ink-800 hover:text-flame-400"
                  title="Editar"
                >
                  <Pencil className="h-4 w-4" />
                </button>

                {c.ativo ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleInativar(c);
                    }}
                    className="rounded-lg p-2 text-ink-400 transition hover:bg-ink-800 hover:text-red-400"
                    title="Inativar cliente"
                  >
                    <UserX className="h-4 w-4" />
                  </button>
                ) : (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleReativar(c);
                    }}
                    className="rounded-lg p-2 text-ink-400 transition hover:bg-ink-800 hover:text-green-400"
                    title="Reativar cliente"
                  >
                    <UserCheck className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* INFORMAÇÕES */}
              <div className="mt-3 space-y-1.5 border-t border-ink-700/40 pt-3 text-xs text-ink-400">
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

      {/* MODAL */}
      <Modal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditing(null);
        }}
        title={editing ? "Editar cliente" : "Cadastrar cliente"}
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

      {/* CONFIRMAÇÃO DE EXCLUSÃO */}
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