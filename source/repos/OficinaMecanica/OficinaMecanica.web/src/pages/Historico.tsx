import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { History, Filter, X } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { StatusBadge } from '../components/ui/StatusBadge';
import { EmptyState } from '../components/ui/EmptyState';
import { PageLoader } from '../components/ui/Spinner';
import { useToast } from '../components/ui/Toast';
import { listHistorico, type HistoricoWithRelations } from '../services/historico';
import { listClientes } from '../services/clientes';
import { listVeiculos } from '../services/veiculos';
import type { Cliente, Veiculo } from '../types';
import { formatDate } from '../utils/format';
import { ALL_STATUSES, STATUS_LABEL, STATUS_TEXT_TO_NUMBER } from '../utils/status';

export function Historico() {
  const toast = useToast();
  const [rows, setRows] = useState<HistoricoWithRelations[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ clienteId: '', veiculoId: '', status: '', dataInicio: '', dataFim: '' });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listHistorico({
        clienteId: filters.clienteId || undefined, veiculoId: filters.veiculoId || undefined,
        status: filters.status ? Number(filters.status) : undefined,
        dataInicio: filters.dataInicio ? new Date(filters.dataInicio).toISOString() : undefined,
        dataFim: filters.dataFim ? new Date(filters.dataFim + 'T23:59:59').toISOString() : undefined,
      });
      setRows(data);
    } catch (err) { toast.error('Erro ao carregar histórico'); console.error(err); }
    finally { setLoading(false); }
  }, [filters, toast]);

  useEffect(() => {
    (async () => {
      try { const [c, v] = await Promise.all([listClientes(), listVeiculos()]); setClientes(c); setVeiculos(v); }
      catch (err) { console.error(err); }
    })();
  }, []);

  useEffect(() => {
    const debounce = setTimeout(load, 300);
    return () => clearTimeout(debounce);
  }, [load]);

  const filteredVeiculos = useMemo(() => filters.clienteId ? veiculos.filter((v) => v.clienteId === filters.clienteId) : veiculos, [veiculos, filters.clienteId]);
  const hasFilters = Object.values(filters).some((v) => v !== '');

  return (
    <div className="space-y-5">
      <Card className="p-4">
        <div className="mb-3 flex items-center gap-2">
          <Filter className="h-4 w-4 text-ink-400" /><span className="text-sm font-semibold text-white">Filtros</span>
          {hasFilters && <Button variant="ghost" size="sm" onClick={() => setFilters({ clienteId: '', veiculoId: '', status: '', dataInicio: '', dataFim: '' })}><X className="h-3.5 w-3.5" />Limpar</Button>}
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <Select label="Cliente" value={filters.clienteId} onChange={(e) => setFilters((f) => ({ ...f, clienteId: e.target.value, veiculoId: '' }))}>
            <option value="">Todos</option>{clientes.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
          </Select>
          <Select label="Veículo" value={filters.veiculoId} onChange={(e) => setFilters((f) => ({ ...f, veiculoId: e.target.value }))}>
            <option value="">Todos</option>{filteredVeiculos.map((v) => <option key={v.id} value={v.id}>{v.marca} {v.modelo} {v.placa ? `— ${v.placa}` : ''}</option>)}
          </Select>
          <Select label="Status" value={filters.status} onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}>
            <option value="">Todos</option>{ALL_STATUSES.map((s) => <option key={s} value={STATUS_TEXT_TO_NUMBER[s]}>{STATUS_LABEL[s]}</option>)}
          </Select>
          <Input label="Data início" type="date" value={filters.dataInicio} onChange={(e) => setFilters((f) => ({ ...f, dataInicio: e.target.value }))} />
          <Input label="Data fim" type="date" value={filters.dataFim} onChange={(e) => setFilters((f) => ({ ...f, dataFim: e.target.value }))} />
        </div>
      </Card>

      {loading ? <PageLoader label="Carregando histórico..." /> : rows.length === 0 ? (
        <Card><EmptyState icon={<History className="h-7 w-7" />} title="Nenhum registro no histórico" description="As mudanças de status das ordens de serviço aparecerão aqui." /></Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr className="border-b border-ink-700/60 text-left text-xs font-semibold uppercase tracking-wide text-ink-400">
                <th className="px-5 py-3.5">OS</th><th className="px-5 py-3.5">Cliente</th><th className="px-5 py-3.5">Status Anterior</th><th className="px-5 py-3.5">Novo Status</th><th className="px-5 py-3.5">Data</th><th className="px-5 py-3.5">Observação</th>
              </tr></thead>
              <tbody className="divide-y divide-ink-700/40">
                {rows.map((h) => (
                  <tr key={h.id} className="transition hover:bg-ink-800/30">
                    <td className="px-5 py-3.5">{h.ordem?.id ? <Link to={`/ordens-servico/${h.ordem.id}`} className="font-mono text-xs font-semibold text-flame-400 hover:text-flame-300">#{h.ordem.id.slice(0, 8).toUpperCase()}</Link> : '—'}</td>
                    <td className="px-5 py-3.5"><p className="text-sm font-medium text-white">{h.ordem?.cliente?.nome ?? '—'}</p></td>
                    <td className="px-5 py-3.5">{h.statusAnterior !== null ? <StatusBadge status={h.statusAnterior} /> : <span className="text-xs text-ink-400">—</span>}</td>
                    <td className="px-5 py-3.5"><StatusBadge status={h.novoStatus} /></td>
                    <td className="px-5 py-3.5"><p className="text-sm text-ink-300">{formatDate(h.dataAlteracao)}</p></td>
                    <td className="px-5 py-3.5"><p className="text-sm text-ink-200">{h.observacao ?? '—'}</p></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
