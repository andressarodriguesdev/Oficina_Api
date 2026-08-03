import { type FormEvent } from 'react';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import type { Customer, Vehicle } from '../../types';

export interface VehicleFormValues { customer_id: string; make: string; model: string; year: string; registrationNumber: string; }

export function VehicleForm({ initial, customers, onSubmit, onCancel, submitting }: {
  initial?: Vehicle | null; customers: Customer[]; onSubmit: (v: VehicleFormValues) => void; onCancel: () => void; submitting?: boolean;
}) {
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    onSubmit({
      customer_id: String(fd.get('customer_id') ?? ''),
      make: String(fd.get('make') ?? '').trim(),
      model: String(fd.get('model') ?? '').trim(),
      year: String(fd.get('year') ?? '').trim(),
      registrationNumber: String(fd.get('registrationNumber') ?? '').trim().toUpperCase(),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Select label="Owner *" name="customer_id" defaultValue={initial?.customerId ?? ''} required>
        <option value="" disabled>Select a customer</option>
        {customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
      </Select>
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Make *" name="make" defaultValue={initial?.make ?? ''} placeholder="E.g. Toyota" required />
        <Input label="Model *" name="model" defaultValue={initial?.model ?? ''} placeholder="E.g. Corolla" required />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Year" name="year" type="number" min={1900} max={2099} defaultValue={initial?.year ?? ''} placeholder="E.g. 2021" />
        <Input label="Registration No." name="registrationNumber" defaultValue={initial?.registrationNumber ?? ''} placeholder="ABC 123" maxLength={8} />
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={submitting}>Cancel</Button>
        <Button type="submit" loading={submitting}>{initial ? 'Save changes' : 'Add vehicle'}</Button>
      </div>
    </form>
  );
}
