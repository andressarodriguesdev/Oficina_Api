import { useEffect, useState } from 'react';
import { Search, Filter, History, Eye } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Table, TableRow, TableCell } from '../components/ui/Table';
import { Button } from '../components/ui/Button';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Select } from '../components/ui/Form';
import type { OrdemServico, Cliente, Veiculo, OSStatus } from '../types';
import type { Page } from '../hooks/useNavigation';
import { ordemServicoService } from '../services/ordemServicoService';
import { clienteService } from '../services/clienteService';
import { veiculoService } from '../services/veiculoService';

const fmtCurrency = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });

interface HistoricoPageProps {
  onNavigate: (page: Page, params?: Record<string, string>) => void;
}

export function HistoricoPage({ onNavigate }: HistoricoPageProps) {
  const [ordens, setOrdens] = useState<OrdemServico[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('todos');

  useEffect(() => {
    Promise.all([
      ordemServicoService.list(),
      clienteService.list(),
      veiculoService.list(),
    ]).then(([o, c, v]) => {
      setOrdens(o);
      setClientes(c);
      setVeiculos(v);
      setLoading(false);
    });
  }, []);

  const getCliente = (id: string) => clientes.find((c) => c.id === id)?.nome ?? '—';
  const getVeiculo = (id: string) => {
    const v = veiculos.find((v) => v.id === id);
    return v ? `${v.marca} ${v.modelo}` : '—';
  };

  const filtered = ordens
    .filter((o) => {
      if (statusFilter !== 'todos' && o.status !== statusFilter) return false;
      if (!search) return true;
      const s = search.toLowerCase();
      return (
        o.numero.toLowerCase().includes(s) ||
        getCliente(o.clienteId).toLowerCase().includes(s) ||
        getVeiculo(o.veiculoId).toLowerCase().includes(s)
      );
    })
    .sort((a, b) => b.data.localeCompare(a.data));

  const statusOptions: { value: string; label: string }[] = [
    { value: 'todos', label: 'Todos os status' },
    { value: 'aberta', label: 'Aberta' },
    { value: 'aguardando_aprovacao', label: 'Aguardando Aprovação' },
    { value: 'aprovada', label: 'Aprovada' },
    { value: 'concluida', label: 'Concluída' },
    { value: 'cancelada', label: 'Cancelada' },
  ];

  const counts = {
    total: ordens.length,
    concluidas: ordens.filter((o) => o.status === 'concluida').length,
    canceladas: ordens.filter((o) => o.status === 'cancelada').length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin h-8 w-8 border-2 border-accent-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-graphite-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por OS, cliente ou veículo..."
            className="input-field pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={18} className="text-graphite-400" />
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-auto min-w-48"
          >
            {statusOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </Select>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4 flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-steel-500/10 text-steel-400"><History size={20} /></div>
          <div>
            <p className="text-xl font-bold text-graphite-100">{counts.total}</p>
            <p className="text-xs text-graphite-400">Total de OS</p>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400"><History size={20} /></div>
          <div>
            <p className="text-xl font-bold text-graphite-100">{counts.concluidas}</p>
            <p className="text-xs text-graphite-400">Concluídas</p>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-red-500/10 text-red-400"><History size={20} /></div>
          <div>
            <p className="text-xl font-bold text-graphite-100">{counts.canceladas}</p>
            <p className="text-xs text-graphite-400">Canceladas</p>
          </div>
        </Card>
      </div>

      {/* Table */}
      <Card className="p-5">
        <Table headers={['Nº OS', 'Cliente', 'Veículo', 'Valor Total', 'Status', 'Data', '']}>
          {filtered.map((os) => {
            const total = os.valorMaoObra + os.itens.reduce((s, i) => s + i.quantidade * i.valorUnitario, 0);
            return (
              <TableRow key={os.id}>
                <TableCell className="font-mono text-accent-400 font-medium">{os.numero}</TableCell>
                <TableCell>{getCliente(os.clienteId)}</TableCell>
                <TableCell>{getVeiculo(os.veiculoId)}</TableCell>
                <TableCell className="font-semibold">{fmtCurrency(total)}</TableCell>
                <TableCell><StatusBadge status={os.status} /></TableCell>
                <TableCell className="text-graphite-400">{fmtDate(os.data)}</TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={<Eye size={16} />}
                    onClick={() => onNavigate('os-detalhes', { id: os.id })}
                  >
                    Ver
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </Table>
        {filtered.length === 0 && (
          <div className="text-center py-8 text-graphite-400 text-sm">
            Nenhuma ordem de serviço encontrada com os filtros atuais.
          </div>
        )}
      </Card>
    </div>
  );
}
