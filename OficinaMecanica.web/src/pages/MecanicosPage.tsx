import { useEffect, useMemo, useState, useCallback } from "react";
import {
  Plus,
  Search,
  Pencil,
  Phone,
  Wrench,
  UserX,
  UserCheck,
  UserCog,
  Eye,
} from "lucide-react";
import { Link } from "react-router-dom";

import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Select } from "../components/ui/Select";
import { Modal } from "../components/ui/Modal";
import { EmptyState } from "../components/ui/EmptyState";
import { PageLoader } from "../components/ui/Spinner";
import { useToast } from "../components/ui/Toast";

import {
  MecanicoForm,
  type MecanicosFormValues,
} from "../components/forms/MecanicoForm";

import {
  listMecanico,
  createMecanico,
  updateMecanico,
  inativarMecanico,
  reativarMecanico,
} from "../services/mecanico";

import type { Mecanico} from "../types";

import { initials } from "../utils/format";

export function Mecanicos() {
  const toast = useToast();

  const [mecanicos, setMecanicos] = useState<Mecanico[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("todos");

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Mecanico | null>(null);

  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);

    try {
      const data = await listMecanico();

      setMecanicos(data);
    } catch (err) {
      toast.error("Erro ao carregar mecânicos");
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

    return mecanicos.filter((m) => {
      const matchesSearch =
        !q ||
        m.nome.toLowerCase().includes(q) ||
        (m.telefone ?? "").toLowerCase().includes(q) ||
        (m.especialidade ?? "").toLowerCase().includes(q);

      const matchesStatus =
        filtroStatus === "todos" ||
        (filtroStatus === "ativos" && m.ativo) ||
        (filtroStatus === "inativos" && !m.ativo);

      return matchesSearch && matchesStatus;
    });
  }, [mecanicos, search, filtroStatus]);

  const handleSubmit = async (values: MecanicosFormValues) => {
    setSubmitting(true);

    try {
      if (editing) {
        await updateMecanico(editing.id, values);

        toast.success("Mecânico atualizado com sucesso");
      } else {
        await createMecanico(values);

        toast.success("Mecânico cadastrado com sucesso");
      }

      setModalOpen(false);
      setEditing(null);

      await load();
    } catch (err) {
      toast.error(
        editing ? "Erro ao atualizar mecânico" : "Erro ao cadastrar mecânico",
      );

      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleInativar = async (mecanico: Mecanico) => {
    try {
      await inativarMecanico(mecanico.id);

      toast.success("Mecânico inativado com sucesso");

      await load();
    } catch (err) {
      toast.error("Erro ao inativar mecânico");

      console.error(err);
    }
  };

  const handleReativar = async (mecanico: Mecanico) => {
    try {
      await reativarMecanico(mecanico.id);

      toast.success("Mecânico reativado com sucesso");

      await load();
    } catch (err) {
      toast.error("Erro ao reativar mecânico");

      console.error(err);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search
            className="
            pointer-events-none
            absolute left-3 top-1/2
            h-4 w-4
            -translate-y-1/2
            text-ink-400
            "
          />

          <Input
            placeholder="Buscar por nome, telefone ou especialidade..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <Select
          value={filtroStatus}
          onChange={(e) => setFiltroStatus(e.target.value)}
          className="sm:w-56"
        >
          <option value="todos">Todos os mecânicos</option>

          <option value="ativos">Mecânicos ativos</option>

          <option value="inativos">Mecânicos inativos</option>
        </Select>

        <Button
          className="whitespace-nowrap"
          onClick={() => {
            setEditing(null);
            setModalOpen(true);
          }}
        >
          <Plus className="h-4 w-4" />
          Novo mecânico
        </Button>
      </div>

      {loading ? (
        <PageLoader label="Carregando mecânicos..." />
      ) : filtered.length === 0 ? (
        <Card>
          <EmptyState
            icon={<UserCog className="h-7 w-7" />}
            title={
              search
                ? "Nenhum mecânico encontrado"
                : "Nenhum mecânico cadastrado"
            }
            description={
              search
                ? "Tente outra busca."
                : "Cadastre o primeiro mecânico da oficina."
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
                  Cadastrar mecânico
                </Button>
              )
            }
          />
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((m) => (
            <Card key={m.id} hover className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <div
                    className="
                    flex h-11 w-11
                    shrink-0
                    items-center justify-center
                    rounded-full
                    bg-gradient-to-br
                    from-ink-700
                    to-ink-800
                    text-sm
                    font-bold
                    text-flame-400
                    "
                  >
                    {initials(m.nome)}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p
                        className="
                      truncate
                      font-display
                      text-sm
                      font-bold
                      text-white
                      "
                      >
                        {m.nome}
                      </p>

                      {m.ativo ? (
                        <span
                          className="
                        rounded-full
                        bg-green-500/20
                        px-2 py-0.5
                        text-[10px]
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
                        px-2 py-0.5
                        text-[10px]
                        font-semibold
                        text-red-400
                        "
                        >
                          Inativo
                        </span>
                      )}
                    </div>

                    <p
                      className="
                    mt-0.5
                    flex
                    items-center
                    gap-1
                    truncate
                    text-xs
                    text-ink-400
                    "
                    >
                      <Phone className="h-3 w-3" />

                      {m.telefone || "—"}
                    </p>
                  </div>
                </div>

                <div className="flex shrink-0 gap-1">
                  <Link
                    to={`/mecanicos/${m.id}`}
                                        className="
                        rounded-lg
                        p-2
                        text-ink-400
                        transition
                        hover:bg-ink-800
                        hover:text-sky-400
                        "
                    title="Visualizar"
                  >
                    <Eye className="h-4 w-4" />
                  </Link>

                  <button
                    onClick={() => {
                      setEditing(m);
                      setModalOpen(true);
                    }}
                                    className="
                    rounded-lg
                    p-2
                    text-ink-400
                    transition
                    hover:bg-ink-800
                    hover:text-flame-400
                    "
                    title="Editar"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>

                  {m.ativo ? (
                    <button
                      onClick={() => handleInativar(m)}
                                        className="
                        rounded-lg
                        p-2
                        text-ink-400
                        transition
                        hover:bg-ink-800
                        hover:text-red-400
      "
                      title="Inativar mecânico"
                    >
                      <UserX className="h-4 w-4" />
                    </button>
                  ) : (
                    <button
                      onClick={() => handleReativar(m)}
                                        className="
                        rounded-lg
                        p-2
                        text-ink-400
                        transition
                        hover:bg-ink-800
                        hover:text-green-400
                        "
                      title="Reativar mecânico"
                    >
                      <UserCheck className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              <div
                className="
              mt-3
              space-y-1.5
              border-t
              border-ink-700/40
              pt-3
              text-xs
              text-ink-400
              "
              >
                <p className="flex items-center gap-1.5">
                  <Wrench className="h-3 w-3" />

                  {m.especialidade || "Sem especialidade"}
                </p>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditing(null);
        }}
        title={editing ? "Editar mecânico" : "Cadastrar mecânico"}
        description={
          editing
            ? "Atualize os dados do mecânico."
            : "Preencha os dados do novo mecânico."
        }
        size="lg"
      >
        <MecanicoForm
          initial={editing}
          onSubmit={handleSubmit}
          onCancel={() => {
            setModalOpen(false);
            setEditing(null);
          }}
          submitting={submitting}
        />
      </Modal>
    </div>
  );
}
