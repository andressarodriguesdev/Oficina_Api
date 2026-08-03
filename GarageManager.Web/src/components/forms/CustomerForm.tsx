import { type FormEvent } from 'react';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Button } from '../ui/Button';
import type { Customer } from '../../types';

export interface CustomerFormValues { name: string; phone: string; email: string; address: string; }

export function CustomerForm({ initial, onSubmit, onCancel, submitting }: {
  initial?: Customer | null; onSubmit: (v: CustomerFormValues) => void; onCancel: () => void; submitting?: boolean;
}) {
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    onSubmit({
      name: String(fd.get('name') ?? '').trim(),
      phone: String(fd.get('phone') ?? '').trim(),
      email: String(fd.get('email') ?? '').trim(),
      address: String(fd.get('address') ?? '').trim(),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input label="Name *" name="name" defaultValue={initial?.name ?? ''} placeholder="Customer's full name" required />
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Phone" name="phone" defaultValue={initial?.phone ?? ''} placeholder="+356 0000 0000" />
        <Input label="Email" name="email" type="email" defaultValue={initial?.email ?? ''} placeholder="customer@email.com" />
      </div>
      <Textarea label="Address" name="address" defaultValue={initial?.address ?? ''} placeholder="Street, number, town..." />
      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={submitting}>Cancel</Button>
        <Button type="submit" loading={submitting}>{initial ? 'Save changes' : 'Add customer'}</Button>
      </div>
    </form>
  );
}
