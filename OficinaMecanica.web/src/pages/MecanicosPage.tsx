
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
  ArrowLeft,
  Users,
  Activity,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

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

import type { Mecanico } from "../types";

import { initials } from "../utils/format";

export function Mecanicos() {
  const navigate = useNavigate();
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
        editing
          ? "Erro ao atualizar mecânico"
          : "Erro ao cadastrar mecânico",
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

  const totalAtivos = mecanicos.filter((m) => m.ativo).length;
  const totalInativos = mecanicos.filter((m) => !m.ativo).length;

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
            -right-12
            -top-24
            h-56
            w-56
            rounded-full
            border
            border-[var(--app-border-subtle)]
          "
        />

        <div
          className="
            pointer-events-none
            absolute
            right-16
            -top-8
            h-28
            w-28
            rounded-full
            border
            border-[var(--app-border-subtle)]
          "
        />

        <div className="relative">
          <div className="mb-5">
            <Link to="/painel">
              <Button
                variant="ghost"
                size="sm"
                className="px-0"
              >
                <ArrowLeft className="h-4 w-4" />
                Voltar ao painel
              </Button>
            </Link>
          </div>

          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p
                className="
                  text-[10px]
                  font-bold
                  uppercase
                  tracking-[0.18em]
                  text-[var(--app-text-muted)]
                "
              >
                Equipe
              </p>

              <h1
                className="
                  mt-2
                  font-display
                  text-3xl
                  font-extrabold
                  tracking-[-0.04em]
                  text-[var(--app-text)]
                  sm:text-4xl
                "
              >
                Mecânicos
              </h1>

              <p
                className="
                  mt-2
                  max-w-xl
                  text-sm
                  leading-6
                  text-[var(--app-text-muted)]
                "
              >
                Gerencie os profissionais da oficina,
                acompanhe seus dados e mantenha a equipe
                organizada.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div
                className="
                  flex
                  items-center
                  gap-2
                  border
                  border-[var(--app-border-subtle)]
                  bg-[var(--app-surface-raised)]
                  px-3
                  py-2
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
                  {totalAtivos} ativos
                </span>
              </div>

              <Button
                onClick={() => {
                  setEditing(null);
                  setModalOpen(true);
                }}
              >
                <Plus className="h-4 w-4" />
                Novo mecânico
              </Button>
            </div>
          </div>
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
            Estrutura
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
            Visão da equipe
          </h2>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <Card className="relative overflow-hidden p-5">
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
                <Users className="h-5 w-5" />
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
                {mecanicos.length}
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
                Mecânicos cadastrados
              </p>
            </div>
          </Card>

          <Card className="relative overflow-hidden p-5">
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
                <UserCheck className="h-5 w-5" />
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
                Ativos
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
                {totalAtivos}
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
                Profissionais ativos
              </p>
            </div>
          </Card>

          <Card className="relative overflow-hidden p-5">
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
                <UserX className="h-5 w-5" />
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
                Inativos
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
                {totalInativos}
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
                Profissionais inativos
              </p>
            </div>
          </Card>
        </div>
      </section>

      {/* FILTROS */}

      <section>
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <p
              className="
                text-[10px]
                font-bold
                uppercase
                tracking-[0.18em]
                text-[var(--app-text-muted)]
              "
            >
              Diretório
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
              Equipe da oficina
            </h2>
          </div>

          <span
            className="
              hidden
              text-xs
              font-medium
              text-[var(--app-text-muted)]
              sm:block
            "
          >
            {filtered.length} resultado(s)
          </span>
        </div>

        <div
          className="
            grid
            gap-3
            border-y
            border-[var(--app-border-subtle)]
            py-4
            lg:grid-cols-[minmax(0,1fr)_224px]
          "
        >
          {/* BUSCA */}

          <div className="relative">
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
              placeholder="Buscar por nome, telefone ou especialidade..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9"
            />
          </div>

          {/* FILTRO */}

          <Select
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value)}
            className="w-full"
          >
            <option value="todos">Todos os mecânicos</option>
            <option value="ativos">Mecânicos ativos</option>
            <option value="inativos">Mecânicos inativos</option>
          </Select>
        </div>
      </section>

      {/* CONTEÚDO */}

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
        <div
          className="
            grid
            grid-cols-1
            gap-3
            md:grid-cols-2
            xl:grid-cols-3
          "
        >
          {filtered.map((m) => (
            <Card
              key={m.id}
              hover
              className="
                group
                cursor-pointer
                overflow-hidden
                p-0
              "
              onClick={() =>
                navigate(`/mecanicos/${m.id}`)
              }
            >
              {/* PERFIL */}

              <div className="p-5">
                <div className="flex items-start gap-3.5">
                  {/* AVATAR */}

                  <div
                    className="
                      flex
                      h-12
                      w-12
                      shrink-0
                      items-center
                      justify-center
                      rounded-2xl
                      bg-[var(--app-surface-raised)]
                      font-display
                      text-sm
                      font-extrabold
                      tracking-tight
                      text-[var(--accent-text)]
                      transition-colors
                      duration-200
                      group-hover:bg-[var(--app-surface-hover)]
                    "
                  >
                    {initials(m.nome)}
                  </div>

                  {/* DADOS */}

                  <div className="min-w-0 flex-1">
                    <div className="flex min-w-0 items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p
                          className="
                            truncate
                            font-display
                            text-sm
                            font-bold
                            text-[var(--app-text)]
                            transition-colors
                            duration-200
                            group-hover:text-[var(--accent-text)]
                          "
                        >
                          {m.nome}
                        </p>

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
                            {m.telefone || "—"}
                          </span>
                        </p>
                      </div>

                      {m.ativo ? (
                        <span
                          className="
                            shrink-0
                            inline-flex
                            items-center
                            gap-1.5
                            rounded-full
                            bg-emerald-500/10
                            px-2
                            py-1
                            text-[9px]
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
                            shrink-0
                            inline-flex
                            items-center
                            gap-1.5
                            rounded-full
                            bg-red-500/10
                            px-2
                            py-1
                            text-[9px]
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
                  </div>
                </div>

                {/* ESPECIALIDADE */}

                <div
                  className="
                    mt-5
                    border-t
                    border-[var(--app-border-subtle)]
                    pt-4
                  "
                >
                  <div
                    className="
                      flex
                      min-w-0
                      items-center
                      gap-2
                    "
                  >
                    <div
                      className="
                        flex
                        h-7
                        w-7
                        shrink-0
                        items-center
                        justify-center
                        rounded-lg
                        bg-[var(--app-surface-raised)]
                        text-[var(--app-text-muted)]
                      "
                    >
                      <Wrench className="h-3.5 w-3.5" />
                    </div>

                    <div className="min-w-0">
                      <p
                        className="
                          text-[9px]
                          font-bold
                          uppercase
                          tracking-[0.14em]
                          text-[var(--app-text-faint)]
                        "
                      >
                        Especialidade
                      </p>

                      <p
                        className="
                          mt-0.5
                          truncate
                          text-xs
                          font-semibold
                          text-[var(--app-text-secondary)]
                        "
                      >
                        {m.especialidade ||
                          "Sem especialidade"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* AÇÕES */}

              <div
                className="
                  flex
                  items-center
                  justify-between
                  border-t
                  border-[var(--app-border-subtle)]
                  bg-[var(--app-surface-raised)]
                  px-4
                  py-2.5
                "
              >
                <Link
                  to={`/mecanicos/${m.id}`}
                  onClick={(e) =>
                    e.stopPropagation()
                  }
                  className="
                    inline-flex
                    items-center
                    gap-1.5
                    rounded-lg
                    px-2
                    py-1.5
                    text-xs
                    font-semibold
                    text-[var(--app-text-muted)]
                    transition-colors
                    duration-200
                    hover:bg-[var(--hover-bg)]
                    hover:text-[var(--accent-text)]
                  "
                  title="Visualizar"
                >
                  <Eye className="h-3.5 w-3.5" />
                  Ver perfil
                </Link>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditing(m);
                      setModalOpen(true);
                    }}
                    className="
                      rounded-lg
                      p-2
                      text-[var(--app-text-muted)]
                      transition-colors
                      duration-200
                      hover:bg-[var(--hover-bg)]
                      hover:text-[var(--accent-text)]
                      focus:outline-none
                      focus-visible:ring-2
                      focus-visible:ring-[var(--accent)]/40
                    "
                    title="Editar"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>

                  {m.ativo ? (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleInativar(m);
                      }}
                      className="
                        rounded-lg
                        p-2
                        text-[var(--app-text-muted)]
                        transition-colors
                        duration-200
                        hover:bg-red-500/10
                        hover:text-red-500
                        focus:outline-none
                        focus-visible:ring-2
                        focus-visible:ring-red-500/30
                      "
                      title="Inativar mecânico"
                    >
                      <UserX className="h-4 w-4" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleReativar(m);
                      }}
                      className="
                        rounded-lg
                        p-2
                        text-[var(--app-text-muted)]
                        transition-colors
                        duration-200
                        hover:bg-emerald-500/10
                        hover:text-emerald-500
                        focus:outline-none
                        focus-visible:ring-2
                        focus-visible:ring-emerald-500/30
                      "
                      title="Reativar mecânico"
                    >
                      <UserCheck className="h-4 w-4" />
                    </button>
                  )}
                </div>
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
        title={
          editing
            ? "Editar mecânico"
            : "Cadastrar mecânico"
        }
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

