import { type FormEvent, useState } from "react";
import { Plus, Trash2, GripVertical } from "lucide-react";
import { Input } from "../ui/Input";
import { Select } from "../ui/Select";
import { Textarea } from "../ui/Textarea";
import { Button } from "../ui/Button";
import type { Customer, Vehicle, Mechanic } from "../../types";
import { formatCurrency } from "../../utils/format";

export interface PartFormValue {
  id?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface JobCardFormValues {
  customerId: string;
  vehicleId: string;
  mechanicId: string;
  description: string;
  labourCharge: number;
  note: string;
  parts: PartFormValue[];
}

interface JobCardFormProps {
  initial?: Partial<JobCardFormValues> & { id?: string };
  customers: Customer[];
  vehicles: Vehicle[];
  mechanics: Mechanic[];
  onSubmit: (v: JobCardFormValues) => void;
  onCancel: () => void;
  submitting?: boolean;
}

export function JobCardForm({
  initial,
  customers,
  vehicles,
  mechanics,
  onSubmit,
  onCancel,
  submitting,
}: JobCardFormProps) {
  const [parts, setParts] = useState<PartFormValue[]>(
    initial?.parts && initial.parts.length > 0
      ? initial.parts
      : [{ description: "", quantity: 1, unitPrice: 0, total: 0 }],
  );
  const [selectedCustomer, setSelectedCustomer] = useState(
    initial?.customerId ?? "",
  );

  const [selectedVehicle, setSelectedVehicle] = useState(
    initial?.vehicleId ?? "",
  );

  const [selectedMechanic, setSelectedMechanic] = useState(
    initial?.mechanicId ?? "",
  );

  const filteredVehicles = selectedCustomer
    ? vehicles.filter((v) => v.customerId === selectedCustomer)
    : [];

  const updatePart = (
    index: number,
    field: keyof PartFormValue,
    value: string,
  ) => {
    setParts((prev) =>
      prev.map((part, i) => {
        if (i !== index) return part;

        const next = {
          ...part,
          [field]: field === 'description' ? value : Number(value),
        } as PartFormValue;

        if (field === "quantity" || field === "unitPrice") {
          next.total = Number(
            (
              (Number(next.quantity) || 0) * (Number(next.unitPrice) || 0)
            ).toFixed(2),
          );
        }

        return next;
      }),
    );
  };

  const addPart = () =>
    setParts((prev) => [
      ...prev,
      { description: "", quantity: 1, unitPrice: 0, total: 0 },
    ]);

  const removePart = (index: number) =>
    setParts((prev) =>
      prev.length > 1 ? prev.filter((_, i) => i !== index) : prev,
    );

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const fd = new FormData(e.currentTarget);

    onSubmit({
      customerId: String(fd.get("customerId") ?? ""),
      vehicleId: String(fd.get("vehicleId") ?? ""),
      mechanicId: String(fd.get("mechanicId") ?? ""),
      description: String(fd.get("description") ?? "").trim(),
      labourCharge: Number(fd.get("labourCharge") ?? 0) || 0,
      note: String(fd.get("note") ?? "").trim(),
      parts: parts.map((p) => ({
        id: p.id,
        description: p.description.trim(),
        quantity: Number(p.quantity) || 0,
        unitPrice: Number(p.unitPrice) || 0,
        total: Number(p.total) || 0,
      })),
    });
  };
  const partsTotal = parts.reduce(
    (sum, p) => sum + (Number(p.total) || 0),
    0,
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <Select
          label="Customer *"
          name="customerId"
          value={selectedCustomer}
          onChange={(e) => {
            setSelectedCustomer(e.target.value);
            setSelectedVehicle("");
          }}
          required
        >
          <option value="" disabled>
            Select a customer
          </option>
          {customers.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>

        <Select
          label="Vehicle *"
          name="vehicleId"
          value={selectedVehicle}
          onChange={(e) => setSelectedVehicle(e.target.value)}
          required
        >
          <option value="" disabled>
            Select a vehicle
          </option>
          {filteredVehicles.map((v) => (
            <option key={v.id} value={v.id}>
              {v.make} {v.model} {v.registrationNumber ? `— ${v.registrationNumber}` : ""}
            </option>
          ))}
        </Select>

        <Select
          label="Mechanic *"
          name="mechanicId"
          value={selectedMechanic}
          onChange={(e) => setSelectedMechanic(e.target.value)}
          required
        >
          <option value="" disabled>
            Select a mechanic
          </option>

          {mechanics
            .filter((m) => m.isActive)
            .map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} {m.speciality ? `- ${m.speciality}` : ""}
              </option>
            ))}
        </Select>
      </div>

      <Textarea
        label="Job description *"
        name="description"
        defaultValue={initial?.description ?? ""}
        placeholder="Describe the work to be carried out..."
        required
      />

      <Input
        label="Labour charge (€)"
        name="labourCharge"
        type="number"
        step="0.01"
        min="0"
        defaultValue={
          initial?.labourCharge && initial.labourCharge > 0
            ? initial.labourCharge
            : ""
        }
        placeholder="0.00"
      />

      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className="label-base mb-0">Parts / job items</label>
          <Button type="button" size="sm" variant="outline" onClick={addPart}>
            <Plus className="h-4 w-4" />
            Add item
          </Button>
        </div>

        <div className="space-y-2.5">
          {parts.map((part, index) => (
            <div
              key={index}
              className="grid grid-cols-12 items-end gap-2 rounded-xl border border-ink-700/60 bg-ink-800/40 p-3"
            >
              <div className="col-span-12 flex items-center gap-2 sm:col-span-5">
                <GripVertical className="h-4 w-4 shrink-0 text-ink-500" />
                <Input
                  aria-label="Item description"
                  placeholder="Part/service description"
                  value={part.description}
                  onChange={(e) =>
                    updatePart(index, "description", e.target.value)
                  }
                />
              </div>

              <div className="col-span-4 sm:col-span-2">
                <Input
                  aria-label="Quantity"
                  type="number"
                  step="0.01"
                  min="0"
                  value={part.quantity === 0 ? '' : part.quantity}
                  onChange={(e) =>
                    updatePart(index, "quantity", e.target.value)
                  }
                />
              </div>

              <div className="col-span-4 sm:col-span-2">
                <Input
                  aria-label="Unit price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={part.unitPrice === 0 ? "" : part.unitPrice}
                  onChange={(e) =>
                    updatePart(index, "unitPrice", e.target.value)
                  }
                />
              </div>

              <div className="col-span-3 sm:col-span-2">
                <div className="label-base mb-1.5 text-right">Total</div>
                <div className="flex h-[42px] items-center justify-end rounded-xl border border-ink-700 bg-ink-900/50 px-3 text-sm font-semibold text-ink-200">
                  {formatCurrency(part.total)}
                </div>
              </div>

              <div className="col-span-1 flex justify-end">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removePart(index)}
                  disabled={parts.length === 1}
                  aria-label="Remove item"
                >
                  <Trash2 className="h-4 w-4 text-red-400" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        <p className="mt-2 text-xs text-ink-400">
          Parts total: {formatCurrency(partsTotal)} — the job card's total
          amount is calculated by the backend.
        </p>
      </div>

      <Textarea
        label="Note"
        name="note"
        defaultValue={initial?.note ?? ""}
        placeholder="Internal notes (optional)"
      />

      <div className="flex justify-end gap-3 pt-2">
        <Button
          type="button"
          variant="ghost"
          onClick={onCancel}
          disabled={submitting}
        >
          Cancel
        </Button>

        <Button type="submit" loading={submitting}>
          {initial?.id ? "Save changes" : "Save job card"}
        </Button>
      </div>
    </form>
  );
}
