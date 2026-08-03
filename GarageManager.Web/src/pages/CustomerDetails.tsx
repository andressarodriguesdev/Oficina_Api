import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Phone,
  Mail,
  Car,
  ClipboardList,
  Pencil,
  UserX,
  UserCheck,
  Plus,
  User,
} from "lucide-react";

import { Card, CardHeader } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { PageLoader } from "../components/ui/Spinner";
import { EmptyState } from "../components/ui/EmptyState";
import { Modal } from "../components/ui/Modal";
import { useToast } from "../components/ui/Toast";
import {
  CustomerForm,
  type CustomerFormValues,
} from "../components/forms/CustomerForm";

import {
  getCustomer,
  updateCustomer,
  deactivateCustomer,
  reactivateCustomer,
} from "../services/customers";
import type { CustomerDetail, VehicleSummary, JobCard } from "../types";

import { initials, formatCurrency } from "../utils/format";

export function CustomerDetails() {
  const { id } = useParams<{ id: string }>();
  const toast = useToast();

  const [customer, setCustomer] = useState<CustomerDetail | null>(null);
  const [vehicles, setVehicles] = useState<VehicleSummary[]>([]);
  const [jobCards] = useState<JobCard[]>([]);

  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const detail = await getCustomer(id);

        setCustomer(detail);
        setVehicles(detail?.vehicles ?? []);
      } catch (err) {
        toast.error("Failed to load customer");
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, [id, toast]);

  const handleEdit = async (values: CustomerFormValues) => {
    if (!id) return;

    setSubmitting(true);

    try {
      await updateCustomer(id, values);

      toast.success("Customer updated successfully");
      setEditOpen(false);

      const updated = await getCustomer(id);
      setCustomer(updated);
      setVehicles(updated?.vehicles ?? []);
    } catch (err) {
      toast.error("Failed to update customer");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeactivate = async () => {
    if (!id) return;

    try {
      await deactivateCustomer(id);

      toast.success("Customer deactivated successfully");

      const updated = await getCustomer(id);
      setCustomer(updated);
    } catch (err) {
      toast.error("Failed to deactivate customer");
      console.error(err);
    }
  };

  const handleReactivate = async () => {
    if (!id) return;

    try {
      await reactivateCustomer(id);

      toast.success("Customer reactivated successfully");

      const updated = await getCustomer(id);
      setCustomer(updated);
    } catch (err) {
      toast.error("Failed to reactivate customer");
      console.error(err);
    }
  };

  if (loading) {
    return <PageLoader label="Loading customer..." />;
  }

  if (!customer) {
    return (
      <Card>
        <EmptyState
          icon={<User className="h-7 w-7" />}
          title="Customer not found"
          action={
            <Link to="/customers">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
            </Link>
          }
        />
      </Card>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <Link to="/customers">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </Link>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
            <Pencil className="h-4 w-4" />
            Edit
          </Button>

          {customer.isActive ? (
            <Button variant="danger" size="sm" onClick={handleDeactivate}>
              <UserX className="h-4 w-4" />
              Deactivate
            </Button>
          ) : (
            <Button variant="outline" size="sm" onClick={handleReactivate}>
              <UserCheck className="h-4 w-4" />
              Reactivate
            </Button>
          )}
        </div>
      </div>
      <Card className="p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-ink-700 to-ink-800 text-xl font-bold text-flame-400">
            {initials(customer.name)}
          </div>

          <div className="flex-1">
            <h2 className="font-display text-2xl font-bold text-white">
              {customer.name}
            </h2>

            <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
              <div className="flex items-center gap-2 text-sm text-ink-300">
                <Phone className="h-4 w-4 text-ink-400" />
                {customer.phone || "—"}
              </div>

              <div className="flex items-center gap-2 text-sm text-ink-300">
                <Mail className="h-4 w-4 text-ink-400" />
                {customer.email || "—"}
              </div>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-ink-800 text-flame-400">
              <Car className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">
                Vehicles
              </p>
              <p className="font-display text-xl font-bold text-white">
                {vehicles.length}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-ink-800 text-sky-400">
              <ClipboardList className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">
                Job Cards
              </p>
              <p className="font-display text-xl font-bold text-white">
                {jobCards.length}
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
                Total job cards
              </p>
              <p className="font-display text-xl font-bold text-white">
                {formatCurrency(0)}
              </p>
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader
          title="Customer's vehicles"
          subtitle={`${vehicles.length} vehicle(s)`}
        />

        {vehicles.length === 0 ? (
          <EmptyState
            icon={<Car className="h-7 w-7" />}
            title="No vehicles"
            description="This customer has no vehicles registered yet."
            action={
              <Link to="/vehicles">
                <Button variant="outline" size="sm">
                  <Plus className="h-4 w-4" />
                  Add vehicle
                </Button>
              </Link>
            }
          />
        ) : (
          <div className="divide-y divide-ink-700/40">
            {vehicles.map((v) => (
              <Link
                key={v.id}
                to={`/vehicles/${v.id}`}
                className="flex items-center justify-between gap-4 px-5 py-3.5 transition hover:bg-ink-800/40"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-ink-800 text-ink-300">
                    <Car className="h-5 w-5" />
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-white">
                      {v.make} {v.model}
                    </p>
                    <p className="text-xs text-ink-400">{v.registrationNumber || "—"}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </Card>

      <Card>
        <CardHeader
          title="Job card history"
          subtitle="Coming soon"
        />

        <EmptyState
          icon={<ClipboardList className="h-7 w-7" />}
          title="History will be implemented"
          description="The next step is to integrate the customer's job cards."
        />
      </Card>

      <Modal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title="Edit customer"
        description="Update the customer's details."
        size="lg"
      >
        <CustomerForm
          initial={customer}
          onSubmit={handleEdit}
          onCancel={() => setEditOpen(false)}
          submitting={submitting}
        />
      </Modal>
    </div>
  );
}
