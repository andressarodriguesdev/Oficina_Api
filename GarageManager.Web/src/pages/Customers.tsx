import { useEffect, useMemo, useState, useCallback } from "react";
import { Select } from "../components/ui/Select";
import { Link } from "react-router-dom";
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
import { EmptyState } from "../components/ui/EmptyState";
import { PageLoader } from "../components/ui/Spinner";
import { useToast } from "../components/ui/Toast";

import {
  CustomerForm,
  type CustomerFormValues,
} from "../components/forms/CustomerForm";

import {
  listCustomers,
  createCustomer,
  updateCustomer,
  deactivateCustomer,
  reactivateCustomer,
} from "../services/customers";
import type { Customer } from "../types";
import { initials } from "../utils/format";
import { useAuth } from "../auth/AuthProvider";

export function Customers() {
  const toast = useToast();
  const { isProprietor } = useAuth();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Customer | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");

  const load = useCallback(async () => {
    setLoading(true);

    try {
      const data = await listCustomers();
      setCustomers(data);
    } catch (err) {
      toast.error("Failed to load customers");
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

    return customers.filter((c) => {
      const matchesSearch =
        !q ||
        c.name.toLowerCase().includes(q) ||
        (c.email ?? "").toLowerCase().includes(q) ||
        (c.phone ?? "").toLowerCase().includes(q);

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && c.isActive) ||
        (statusFilter === "inactive" && !c.isActive);

      return matchesSearch && matchesStatus;
    });
  }, [customers, search, statusFilter]);

  const handleSubmit = async (values: CustomerFormValues) => {
    setSubmitting(true);

    try {
      if (editing) {
        await updateCustomer(editing.id, values);
        toast.success("Customer updated successfully");
      } else {
        await createCustomer(values);
        toast.success("Customer added successfully");
      }

      setModalOpen(false);
      setEditing(null);
      await load();
    } catch (err) {
      toast.error(
        editing ? "Failed to update customer" : "Failed to add customer",
      );

      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeactivate = async (customer: Customer) => {
    try {
      await deactivateCustomer(customer.id);

      toast.success("Customer deactivated successfully");

      await load();
    } catch (err) {
      toast.error("Failed to deactivate customer");
      console.error(err);
    }
  };

  const handleReactivate = async (customer: Customer) => {
    try {
      await reactivateCustomer(customer.id);

      toast.success("Customer reactivated successfully");

      await load();
    } catch (err) {
      toast.error("Failed to reactivate customer");
      console.error(err);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />

          <Input
            placeholder="Search by name, email or phone..."
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
          <option value="all">All customers</option>
          <option value="active">Active customers</option>
          <option value="inactive">Inactive customers</option>
        </Select>
        <Button
          className="whitespace-nowrap"
          onClick={() => {
            setEditing(null);
            setModalOpen(true);
          }}
        >
          <Plus className="h-4 w-4" />
          New customer
        </Button>
      </div>

      {loading ? (
        <PageLoader label="Loading customers..." />
      ) : filtered.length === 0 ? (
        <Card>
          <EmptyState
            icon={<Users className="h-7 w-7" />}
            title={
              search ? "No customers found" : "No customers yet"
            }
            description={
              search
                ? "Try a different search."
                : "Add the workshop's first customer."
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
                  Add customer
                </Button>
              )
            }
          />
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((c) => (
            <Card key={c.id} hover className="p-5">
              <div className="flex items-start justify-between gap-3">
                <Link
                  to={`/customers/${c.id}`}
                  className="flex min-w-0 items-center gap-3"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-ink-700 to-ink-800 text-sm font-bold text-flame-400">
                    {initials(c.name)}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="truncate font-display text-sm font-bold text-white hover:text-flame-400">
                        {c.name}
                      </p>

                      {c.isActive ? (
                        <span className="rounded-full bg-green-500/20 px-2 py-0.5 text-[10px] font-semibold text-green-400">
                          Active
                        </span>
                      ) : (
                        <span className="rounded-full bg-red-500/20 px-2 py-0.5 text-[10px] font-semibold text-red-400">
                          Inactive
                        </span>
                      )}
                    </div>

                    <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-ink-400">
                      <Phone className="h-3 w-3" />
                      {c.phone || "—"}
                    </p>
                  </div>
                </Link>

                <div className="flex shrink-0 gap-1">
                  <Link
                    to={`/customers/${c.id}`}
                    className="rounded-lg p-2 text-ink-400 transition hover:bg-ink-800 hover:text-sky-400"
                    title="View"
                  >
                    <Eye className="h-4 w-4" />
                  </Link>

                  <button
                    onClick={() => {
                      setEditing(c);
                      setModalOpen(true);
                    }}
                    className="rounded-lg p-2 text-ink-400 transition hover:bg-ink-800 hover:text-flame-400"
                    title="Edit"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>

                  {isProprietor && (c.isActive ? (
                    <button
                      onClick={() => handleDeactivate(c)}
                      className="rounded-lg p-2 text-ink-400 transition hover:bg-ink-800 hover:text-red-400"
                      title="Deactivate customer"
                    >
                      <UserX className="h-4 w-4" />
                    </button>
                  ) : (
                    <button
                      onClick={() => handleReactivate(c)}
                      className="rounded-lg p-2 text-ink-400 transition hover:bg-ink-800 hover:text-green-400"
                      title="Reactivate customer"
                    >
                      <UserCheck className="h-4 w-4" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-3 space-y-1.5 border-t border-ink-700/40 pt-3 text-xs text-ink-400">
                <p className="flex items-center gap-1.5 truncate">
                  <Mail className="h-3 w-3 shrink-0" />
                  {c.email || "—"}
                </p>

                <p className="flex items-start gap-1.5">
                  <MapPin className="mt-0.5 h-3 w-3 shrink-0" />
                  {c.address || "—"}
                </p>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Edit customer" : "Add customer"}
        description={
          editing
            ? "Update the customer's details."
            : "Fill in the new customer's details."
        }
        size="lg"
      >
        <CustomerForm
          initial={editing}
          onSubmit={handleSubmit}
          onCancel={() => setModalOpen(false)}
          submitting={submitting}
        />
      </Modal>
    </div>
  );
}
