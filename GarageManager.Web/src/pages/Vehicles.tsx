import { useEffect, useMemo, useState } from "react";
import { Select } from "../components/ui/Select";
import { Link } from "react-router-dom";
import { Plus, Car, Search, Pencil, Eye, User } from "lucide-react";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Modal } from "../components/ui/Modal";
import { EmptyState } from "../components/ui/EmptyState";
import { PageLoader } from "../components/ui/Spinner";
import { useToast } from "../components/ui/Toast";
import { useCallback } from "react";

import {
  VehicleForm,
  type VehicleFormValues,
} from "../components/forms/VehicleForm";

import {
  listVehicles,
  createVehicle,
  updateVehicle,
} from "../services/vehicles";

import { listCustomers } from "../services/customers";

import type { Customer, Vehicle } from "../types";

export function Vehicles() {
  const toast = useToast();

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);

  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  const [modalOpen, setModalOpen] = useState(false);

  const [editing, setEditing] = useState<Vehicle | null>(null);

  const [submitting, setSubmitting] = useState(false);

  const [statusFilter, setStatusFilter] = useState("all");

  const load = useCallback(async () => {
    setLoading(true);

    try {
      const [vehiclesResponse, customersResponse] = await Promise.all([
        listVehicles(),
        listCustomers(),
      ]);

      const vehiclesWithCustomer = vehiclesResponse.map((vehicle) => ({
        ...vehicle,
        customer:
          customersResponse.find(
            (customer) => customer.id === vehicle.customerId,
          ) ?? null,
      }));

      setVehicles(vehiclesWithCustomer);
      setCustomers(customersResponse);
    } catch (error) {
      toast.error("Failed to load vehicles");

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

    return vehicles.filter((v) => {
      const matchesSearch =
        !q ||
        v.registrationNumber.toLowerCase().includes(q) ||
        v.model.toLowerCase().includes(q) ||
        v.make.toLowerCase().includes(q) ||
        v.customer?.name.toLowerCase().includes(q);

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && v.isActive) ||
        (statusFilter === "inactive" && !v.isActive);

      return matchesSearch && matchesStatus;
    });
  }, [vehicles, search, statusFilter]);

  async function handleSubmit(values: VehicleFormValues) {
    setSubmitting(true);

    try {
      const payload = {
        customerId: values.customer_id,
        make: values.make,
        model: values.model,
        year: values.year,
        registrationNumber: values.registrationNumber,
      };

      if (editing) {
        await updateVehicle(editing.id, payload);

        toast.success("Vehicle updated successfully");
      } else {
        await createVehicle(payload);

        toast.success("Vehicle added successfully");
      }

      setModalOpen(false);

      setEditing(null);

      await load();
    } catch (error) {
      toast.error(
        editing ? "Failed to update vehicle" : "Failed to add vehicle",
      );

      console.error(error);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search
            className="
            pointer-events-none
            absolute
            left-3
            top-1/2
            h-4
            w-4
            -translate-y-1/2
            text-ink-400
            "
          />

          <Input
            placeholder="Search by make, model or registration..."
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
          <option value="all">All vehicles</option>
          <option value="active">Active vehicles</option>
          <option value="inactive">Inactive vehicles</option>
        </Select>
        <Button
          className="whitespace-nowrap"
          onClick={() => {
            setEditing(null);
            setModalOpen(true);
          }}
        >
          <Plus className="h-4 w-4" />
          New vehicle
        </Button>
      </div>

      {loading ? (
        <PageLoader label="Loading vehicles..." />
      ) : filtered.length === 0 ? (
        <Card>
          <EmptyState
            icon={<Car className="h-7 w-7" />}
            title="No vehicles yet"
            description="Add the workshop's first vehicle."
            action={
              <Button
                onClick={() => {
                  setEditing(null);
                  setModalOpen(true);
                }}
              >
                <Plus className="h-4 w-4" />
                Add vehicle
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((v) => (
            <Card key={v.id} hover className="p-5">
              <div className="flex items-start justify-between gap-3">
                <Link
                  to={`/vehicles/${v.id}`}
                  className="flex items-center gap-3"
                >
                  <div
                    className="
                    flex
                    h-11
                    w-11
                    items-center
                    justify-center
                    rounded-xl
                    bg-ink-800
                    text-flame-400
                    "
                  >
                    <Car className="h-5 w-5" />
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-display text-sm font-bold text-white">
                        {v.make} {v.model}
                      </p>

                      {v.isActive ? (
                        <span className="rounded-full bg-green-500/20 px-2 py-0.5 text-[10px] font-semibold text-green-400">
                          Active
                        </span>
                      ) : (
                        <span className="rounded-full bg-red-500/20 px-2 py-0.5 text-[10px] font-semibold text-red-400">
                          Inactive
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-ink-400">
                      {v.year} · {v.registrationNumber}
                    </p>
                  </div>
                </Link>

                <div className="flex gap-1">
                  <Link
                    to={`/vehicles/${v.id}`}
                    className="rounded-lg p-2 text-ink-400 hover:text-sky-400"
                  >
                    <Eye className="h-4 w-4" />
                  </Link>

                  <button
                    onClick={() => {
                      setEditing(v);
                      setModalOpen(true);
                    }}
                    className="rounded-lg p-2 text-ink-400 hover:text-flame-400"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div
                className="
              mt-3
              border-t
              border-ink-700/40
              pt-3
              text-xs
              text-ink-400
              flex
              items-center
              gap-2
              "
              >
                <User className="h-3 w-3" />
                Customer:
                <span className="truncate"> {v.customer?.name ?? "—"}</span>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Edit vehicle" : "Add vehicle"}
        size="lg"
      >
        <VehicleForm
          initial={editing}
          customers={customers}
          onSubmit={handleSubmit}
          onCancel={() => setModalOpen(false)}
          submitting={submitting}
        />
      </Modal>
    </div>
  );
}
