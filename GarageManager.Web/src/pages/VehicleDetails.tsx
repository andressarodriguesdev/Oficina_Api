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
} from "lucide-react";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { PageLoader } from "../components/ui/Spinner";
import { EmptyState } from "../components/ui/EmptyState";
import { Modal } from "../components/ui/Modal";
import { useToast } from "../components/ui/Toast";
import {
  VehicleForm,
  type VehicleFormValues,
} from "../components/forms/VehicleForm";
import {
  getVehicle,
  updateVehicle,
  deactivateVehicle,
  reactivateVehicle,
} from "../services/vehicles";
import { listCustomers } from "../services/customers";
import type { Customer, Vehicle } from "../types";

export function VehicleDetails() {
  const { id } = useParams<{ id: string }>();
  const toast = useToast();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const [v, c] = await Promise.all([getVehicle(id), listCustomers()]);

        setVehicle(v);
        setCustomers(c);
      } catch (err) {
        toast.error("Failed to load vehicle");
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, [id, toast]);

  const handleEdit = async (values: VehicleFormValues) => {
    if (!id) return;

    setSubmitting(true);

    try {
      await updateVehicle(id, {
        registrationNumber: values.registrationNumber,
        make: values.make,
        model: values.model,
        year: values.year,
      });

      toast.success("Vehicle updated successfully");

      setEditOpen(false);

      const updated = await getVehicle(id);
      setVehicle(updated);
    } catch (err) {
      toast.error("Failed to update vehicle");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeactivate = async () => {
    if (!id) return;

    try {
      await deactivateVehicle(id);

      toast.success("Vehicle deactivated successfully");

      const updated = await getVehicle(id);
      setVehicle(updated);
    } catch (err) {
      toast.error("Failed to deactivate vehicle");
      console.error(err);
    }
  };

  const handleReactivate = async () => {
    if (!id) return;

    try {
      await reactivateVehicle(id);

      toast.success("Vehicle reactivated successfully");

      const updated = await getVehicle(id);
      setVehicle(updated);
    } catch (err) {
      toast.error("Failed to reactivate vehicle");
      console.error(err);
    }
  };

  if (loading) return <PageLoader label="Loading vehicle..." />;
  if (!vehicle)
    return (
      <Card>
        <EmptyState
          icon={<Car className="h-7 w-7" />}
          title="Vehicle not found"
          action={
            <Link to="/vehicles">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
            </Link>
          }
        />
      </Card>
    );

  const info = [
    { icon: Hash, label: "Make", value: vehicle.make },
    { icon: Car, label: "Model", value: vehicle.model },
    { icon: Calendar, label: "Year", value: vehicle.year ?? "—" },
    { icon: Hash, label: "Registration No.", value: vehicle.registrationNumber || "—" },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <Link to="/vehicles">
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

          {vehicle.isActive ? (
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
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-ink-700 to-ink-800 text-flame-400">
            <Car className="h-8 w-8" />
          </div>
          <div className="flex-1">
            <h2 className="font-display text-2xl font-bold text-white">
              {vehicle.make} {vehicle.model}
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

      <Card className="p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-ink-800 text-sky-400">
            <User className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">
              Owner
            </p>
            {(() => {
              const customer = customers.find((c) => c.id === vehicle.customerId);

              return customer ? (
                <Link
                  to={`/customers/${customer.id}`}
                  className="font-display text-lg font-bold text-white transition hover:text-flame-400"
                >
                  {customer.name}
                </Link>
              ) : (
                <p className="font-display text-lg font-bold text-ink-400">
                  No owner
                </p>
              );
            })()}
          </div>
        </div>
      </Card>

      <Modal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title="Edit vehicle"
        description="Update the vehicle's details."
        size="lg"
      >
        <VehicleForm
          initial={vehicle}
          customers={customers}
          onSubmit={handleEdit}
          onCancel={() => setEditOpen(false)}
          submitting={submitting}
        />
      </Modal>

    </div>
  );
}
