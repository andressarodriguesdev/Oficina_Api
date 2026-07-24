import { type FormEvent } from 'react';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Button } from '../ui/Button';
import type { Cliente } from '../../types';

export interface ClienteFormValues { nome: string; telefone: string; email: string; endereco: string; }

export function ClienteForm({ initial, onSubmit, onCancel, submitting }: {
  initial?: Cliente | null; onSubmit: (v: ClienteFormValues) => void; onCancel: () => void; submitting?: boolean;
}) {
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    onSubmit({
      nome: String(fd.get('nome') ?? '').trim(),
      telefone: String(fd.get('telefone') ?? '').trim(),
      email: String(fd.get('email') ?? '').trim(),
      endereco: String(fd.get('endereco') ?? '').trim(),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input label="Nome *" name="nome" defaultValue={initial?.nome ?? ''} placeholder="Nome completo do cliente" required />
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Telefone" name="telefone" defaultValue={initial?.telefone ?? ''} placeholder="(00) 00000-0000" />
        <Input label="E-mail" name="email" type="email" defaultValue={initial?.email ?? ''} placeholder="cliente@email.com" />
      </div>
      <Textarea label="Endereço" name="endereco" defaultValue={initial?.endereco ?? ''} placeholder="Rua, número, bairro, cidade..." />
      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={submitting}>Cancelar</Button>
        <Button type="submit" loading={submitting}>{initial ? 'Salvar alterações' : 'Cadastrar cliente'}</Button>
      </div>
    </form>
  );
}
