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
  MechanicForm,
  type MechanicFormValues,
} from "../components/forms/MechanicForm";

import {
  listMechanics,
  createMechanic,
  updateMechanic,
  deactivateMechanic,
  reactivateMechanic,
} from "../services/mechanics";

import type { Mechanic } from "../types";

import { initials } from "../utils/format";
import { useAuth } from "../auth/AuthProvider";

export function Mechanics() {
  const { isProprietor } = useAuth();
  const toast = useToast();

  const [mechanics, setMechanics] = useState<Mechanic[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Mechanic | null>(null);

  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);

    try {
      const data = await listMechanics();

      setMechanics(data);
    } catch (err) {
      toast.error("Failed to load mechanics");
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

    return mechanics.filter((m) => {
      const matchesSearch =
        !q ||
        m.name.toLowerCase().includes(q) ||
        (m.phone ?? "").toLowerCase().includes(q) ||
        (m.speciality ?? "").toLowerCase().includes(q);

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && m.isActive) ||
        (statusFilter === "inactive" && !m.isActive);

      return matchesSearch && matchesStatus;
    });
  }, [mechanics, search, statusFilter]);

  const handleSubmit = async (values: MechanicFormValues) => {
    setSubmitting(true);

    try {
      if (editing) {
        await updateMechanic(editing.id, values);

        toast.success("Mechanic updated successfully");
      } else {
        await createMechanic(values);

        toast.success("Mechanic added successfully");
      }

      setModalOpen(false);
      setEditing(null);

      await load();
    } catch (err) {
      toast.error(
        editing ? "Failed to update mechanic" : "Failed to add mechanic",
      );

      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeactivate = async (mechanic: Mechanic) => {
    try {
      await deactivateMechanic(mechanic.id);

      toast.success("Mechanic deactivated successfully");

      await load();
    } catch (err) {
      toast.error("Failed to deactivate mechanic");

      console.error(err);
    }
  };

  const handleReactivate = async (mechanic: Mechanic) => {
    try {
      await reactivateMechanic(mechanic.id);

      toast.success("Mechanic reactivated successfully");

      await load();
    } catch (err) {
      toast.error("Failed to reactivate mechanic");

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
            placeholder="Search by name, phone or speciality..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="sm:w-56"
        >
          <option value="all">All mechanics</option>

          <option value="active">Active mechanics</option>

          <option value="inactive">Inactive mechanics</option>
        </Select>

        {isProprietor && (
          <Button
            className="whitespace-nowrap"
            onClick={() => {
              setEditing(null);
              setModalOpen(true);
            }}
          >
            <Plus className="h-4 w-4" />
            New mechanic
          </Button>
        )}
      </div>

      {loading ? (
        <PageLoader label="Loading mechanics..." />
      ) : filtered.length === 0 ? (
        <Card>
          <EmptyState
            icon={<UserCog className="h-7 w-7" />}
            title={
              search
                ? "No mechanics found"
                : "No mechanics yet"
            }
            description={
              search
                ? "Try a different search."
                : "Add the workshop's first mechanic."
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
                  Add mechanic
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
                    {initials(m.name)}
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
                        {m.name}
                      </p>

                      {m.isActive ? (
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
                          Active
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
                          Inactive
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

                      {m.phone || "—"}
                    </p>
                  </div>
                </div>

                <div className="flex shrink-0 gap-1">
                  <Link
                    to={`/mechanics/${m.id}`}
                                        className="
                        rounded-lg
                        p-2
                        text-ink-400
                        transition
                        hover:bg-ink-800
                        hover:text-sky-400
                        "
                    title="View"
                  >
                    <Eye className="h-4 w-4" />
                  </Link>

                  {isProprietor && (
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
                      title="Edit"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                  )}

                  {isProprietor && (m.isActive ? (
                    <button
                      onClick={() => handleDeactivate(m)}
                                        className="
                        rounded-lg
                        p-2
                        text-ink-400
                        transition
                        hover:bg-ink-800
                        hover:text-red-400
      "
                      title="Deactivate mechanic"
                    >
                      <UserX className="h-4 w-4" />
                    </button>
                  ) : (
                    <button
                      onClick={() => handleReactivate(m)}
                                        className="
                        rounded-lg
                        p-2
                        text-ink-400
                        transition
                        hover:bg-ink-800
                        hover:text-green-400
                        "
                      title="Reactivate mechanic"
                    >
                      <UserCheck className="h-4 w-4" />
                    </button>
                  ))}
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

                  {m.speciality || "No speciality"}
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
        title={editing ? "Edit mechanic" : "Add mechanic"}
        description={
          editing
            ? "Update the mechanic's details."
            : "Fill in the new mechanic's details."
        }
        size="lg"
      >
        <MechanicForm
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
