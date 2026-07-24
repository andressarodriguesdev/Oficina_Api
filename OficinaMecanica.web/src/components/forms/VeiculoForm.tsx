import { type FormEvent } from 'react';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import type { Cliente, Veiculo } from '../../types';

export interface VeiculoFormValues { cliente_id: string; marca: string; modelo: string; ano: string; placa: string; }

export function VeiculoForm({ initial, clientes, onSubmit, onCancel, submitting }: {
  initial?: Veiculo | null; clientes: Cliente[]; onSubmit: (v: VeiculoFormValues) => void; onCancel: () => void; submitting?: boolean;
}) {
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    onSubmit({
      cliente_id: String(fd.get('cliente_id') ?? ''),
      marca: String(fd.get('marca') ?? '').trim(),
      modelo: String(fd.get('modelo') ?? '').trim(),
      ano: String(fd.get('ano') ?? '').trim(),
      placa: String(fd.get('placa') ?? '').trim().toUpperCase(),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Select label="Cliente proprietário *" name="cliente_id" defaultValue={initial?.clienteId ?? ''} required>
        <option value="" disabled>Selecione um cliente</option>
        {clientes.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
      </Select>
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Marca *" name="marca" defaultValue={initial?.marca ?? ''} placeholder="Ex: Toyota" required />
        <Input label="Modelo *" name="modelo" defaultValue={initial?.modelo ?? ''} placeholder="Ex: Corolla" required />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Ano" name="ano" type="number" min={1900} max={2099} defaultValue={initial?.ano ?? ''} placeholder="Ex: 2021" />
        <Input label="Placa" name="placa" defaultValue={initial?.placa ?? ''} placeholder="ABC1D23" maxLength={8} />
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={submitting}>Cancelar</Button>
        <Button type="submit" loading={submitting}>{initial ? 'Salvar alterações' : 'Cadastrar veículo'}</Button>
      </div>
    </form>
  );
}
