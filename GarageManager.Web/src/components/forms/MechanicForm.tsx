import { type FormEvent } from "react";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";
import type { Mechanic } from "../../types";

export interface MechanicFormValues {
  name: string;
  phone: string;
  speciality: string;
}

export function MechanicForm({
  initial,
  onSubmit,
  onCancel,
  submitting,
}: {
  initial?: Mechanic | null;
  onSubmit: (v: MechanicFormValues) => void;
  onCancel: () => void;
  submitting?: boolean;
}) {
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const fd = new FormData(e.currentTarget);

    onSubmit({
      name: String(fd.get("name") ?? "").trim(),
      phone: String(fd.get("phone") ?? "").trim(),
      speciality: String(fd.get("speciality") ?? "").trim()
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Name *"
        name="name"
        defaultValue={initial?.name ?? ""}
        placeholder="Mechanic's full name"
        required
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Phone"
          name="phone"
          defaultValue={initial?.phone ?? ""}
          placeholder="+356 0000 0000"
        />

        <Input
          label="Speciality"
          name="speciality"
          defaultValue={initial?.speciality ?? ""}
          placeholder="E.g. Engine, Electrical, Suspension..."
        />
      </div>

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
          {initial ? "Save changes" : "Add mechanic"}
        </Button>
      </div>
    </form>
  );
}
