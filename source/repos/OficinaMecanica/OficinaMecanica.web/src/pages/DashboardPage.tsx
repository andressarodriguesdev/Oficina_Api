import { useEffect, useState } from 'react';
import {
  ClipboardList,
  Clock,
  CheckCircle2,
  DollarSign,
  ArrowRight,
} from 'lucide-react';
import { Card, StatCard } from '../components/ui/Card';
import { Table, TableRow, TableCell } from '../components/ui/Table';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Button } from '../components/ui/Button';
import type { OrdemServico, Cliente, Veiculo } from '../types';
import type { Page } from '../hooks/useNavigation';
import { ordemServicoService } from '../services/ordemServicoService';
import { clienteService } from '../services/clienteService';
import { veiculoService } from '../services/veiculoService';

const fmtCurrency = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });

interface DashboardProps {
  onNavigate: (page: Page, params?: Record<string, string>) => void;
}

export function DashboardPage({ onNavigate }: DashboardProps) {
  const [ordens, setOrdens] = useState<OrdemServico[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [loading, setLoading] = useState(true);

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

  const abertas = ordens.filter((o) => o.status === 'aberta').length;
  const aguardando = ordens.filter((o) => o.status === 'aguardando_aprovacao').length;
  const concluidas = ordens.filter((o) => o.status === 'concluida').length;
  const faturamento = ordens
    .filter((o) => o.status === 'concluida')
    .reduce((sum, o) => sum + o.valorMaoObra + o.itens.reduce((s, i) => s + i.quantidade * i.valorUnitario, 0), 0);

  const ultimas = [...ordens].slice(0, 5);

  const getCliente = (id: string) => clientes.find((c) => c.id === id)?.nome ?? '—';
  const getVeiculo = (id: string) => {
    const v = veiculos.find((v) => v.id === id);
    return v ? `${v.marca} ${v.modelo}` : '—';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin h-8 w-8 border-2 border-accent-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Ordens Abertas"
          value={String(abertas)}
          icon={<ClipboardList size={22} />}
          accent="steel"
          trend="Atualizado agora"
          trendUp
        />
        <StatCard
          title="Aguardando Aprovação"
          value={String(aguardando)}
          icon={<Clock size={22} />}
          accent="orange"
          trend="Requer atenção"
        />
        <StatCard
          title="Serviços Concluídos"
          value={String(concluidas)}
          icon={<CheckCircle2 size={22} />}
          accent="green"
          trend="+12% este mês"
          trendUp
        />
        <StatCard
          title="Faturamento"
          value={fmtCurrency(faturamento)}
          icon={<DollarSign size={22} />}
          accent="steel"
          trend="+8% vs mês anterior"
          trendUp
        />
      </div>

      {/* Recent OS table */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-graphite-100">Últimas Ordens de Serviço</h3>
            <p className="text-sm text-graphite-400">Visão geral das OS mais recentes</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onNavigate('os-nova')}
            icon={<ArrowRight size={16} />}
          >
            Ver todas
          </Button>
        </div>

        <Table headers={['Nº OS', 'Cliente', 'Veículo', 'Valor Total', 'Status', 'Data']}>
          {ultimas.map((os) => {
            const total = os.valorMaoObra + os.itens.reduce((s, i) => s + i.quantidade * i.valorUnitario, 0);
            return (
              <TableRow key={os.id} onClick={() => onNavigate('os-detalhes', { id: os.id })}>
                <TableCell className="font-mono text-accent-400 font-medium">{os.numero}</TableCell>
                <TableCell>{getCliente(os.clienteId)}</TableCell>
                <TableCell>{getVeiculo(os.veiculoId)}</TableCell>
                <TableCell className="font-semibold">{fmtCurrency(total)}</TableCell>
                <TableCell><StatusBadge status={os.status} /></TableCell>
                <TableCell className="text-graphite-400">{fmtDate(os.data)}</TableCell>
              </TableRow>
            );
          })}
        </Table>
      </Card>
    </div>
  );
}
