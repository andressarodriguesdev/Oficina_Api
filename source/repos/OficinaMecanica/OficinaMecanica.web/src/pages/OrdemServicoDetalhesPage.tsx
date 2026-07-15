import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  FileText,
  MessageCircle,
  CheckCircle2,
  Clock,
  XCircle,
  User,
  Car,
  Wrench,
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { StatusBadge } from '../components/ui/StatusBadge';
import type { OrdemServico, Cliente, Veiculo } from '../types';
import type { Page } from '../hooks/useNavigation';
import { ordemServicoService } from '../services/ordemServicoService';
import { clienteService } from '../services/clienteService';
import { veiculoService } from '../services/veiculoService';

const fmtCurrency = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });

interface OSDetailsProps {
  osId: string;
  onNavigate: (page: Page, params?: Record<string, string>) => void;
}

export function OrdemServicoDetalhesPage({ osId, onNavigate }: OSDetailsProps) {
  const [os, setOs] = useState<OrdemServico | null>(null);
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [veiculo, setVeiculo] = useState<Veiculo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      ordemServicoService.getById(osId),
      clienteService.list(),
      veiculoService.list(),
    ]).then(([o, clientes, veiculos]) => {
      setOs(o ?? null);
      if (o) {
        setCliente(clientes.find((c) => c.id === o.clienteId) ?? null);
        setVeiculo(veiculos.find((v) => v.id === o.veiculoId) ?? null);
      }
      setLoading(false);
    });
  }, [osId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin h-8 w-8 border-2 border-accent-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!os) {
    return (
      <div className="text-center py-20">
        <p className="text-graphite-400">Ordem de serviço não encontrada.</p>
        <Button variant="outline" className="mt-4" onClick={() => onNavigate('dashboard')}>
          Voltar ao Dashboard
        </Button>
      </div>
    );
  }

  const totalPecas = os.itens.reduce((s, i) => s + i.quantidade * i.valorUnitario, 0);
  const total = os.valorMaoObra + totalPecas;

  const handleWhatsApp = () => {
    if (!cliente) return;
    const msg = `Olá ${cliente.nome}! Sua OS ${os.numero} está pronta para aprovação.\n\n` +
      `Veículo: ${veiculo?.marca} ${veiculo?.modelo} - ${veiculo?.placa}\n` +
      `Serviço: ${os.descricao}\n` +
      `Mão de obra: ${fmtCurrency(os.valorMaoObra)}\n` +
      `Peças: ${fmtCurrency(totalPecas)}\n` +
      `Total: ${fmtCurrency(total)}\n\n` +
      `Deseja aprovar?`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const timelineIcons: Record<string, React.ReactNode> = {
    aberta: <Clock size={16} />,
    aguardando_aprovacao: <Clock size={16} />,
    aprovada: <CheckCircle2 size={16} />,
    concluida: <CheckCircle2 size={16} />,
    cancelada: <XCircle size={16} />,
  };

  return (
    <div className="space-y-5 max-w-5xl">
      <button
        onClick={() => onNavigate('dashboard')}
        className="inline-flex items-center gap-2 text-sm text-graphite-400 hover:text-graphite-200 transition-colors"
      >
        <ArrowLeft size={16} /> Voltar
      </button>

      {/* Header card */}
      <Card className="p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h3 className="text-2xl font-bold text-graphite-100 font-mono">{os.numero}</h3>
              <StatusBadge status={os.status} />
            </div>
            <p className="text-sm text-graphite-400 mt-1">Criada em {fmtDate(os.data)}</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" icon={<FileText size={18} />}>Gerar PDF</Button>
            <Button icon={<MessageCircle size={18} />} onClick={handleWhatsApp}>
              Enviar Aprovação
            </Button>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left: info */}
        <div className="lg:col-span-2 space-y-5">
          {/* Cliente e Veículo */}
          <Card className="p-5">
            <h4 className="text-sm font-semibold text-graphite-200 uppercase tracking-wide mb-4">
              Informações
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-steel-500/10 text-steel-400">
                  <User size={18} />
                </div>
                <div>
                  <p className="text-xs text-graphite-400">Cliente</p>
                  <p className="font-medium text-graphite-100">{cliente?.nome ?? '—'}</p>
                  <p className="text-xs text-graphite-400 mt-0.5">{cliente?.telefone}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-accent-500/10 text-accent-400">
                  <Car size={18} />
                </div>
                <div>
                  <p className="text-xs text-graphite-400">Veículo</p>
                  <p className="font-medium text-graphite-100">
                    {veiculo ? `${veiculo.marca} ${veiculo.modelo}` : '—'}
                  </p>
                  <p className="text-xs text-graphite-400 mt-0.5">
                    {veiculo?.ano} · Placa: {veiculo?.placa}
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-graphite-700">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-graphite-700 text-graphite-300">
                  <Wrench size={18} />
                </div>
                <div>
                  <p className="text-xs text-graphite-400">Descrição do Serviço</p>
                  <p className="text-graphite-200 mt-1">{os.descricao || '—'}</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Peças */}
          {os.itens.length > 0 && (
            <Card className="p-5">
              <h4 className="text-sm font-semibold text-graphite-200 uppercase tracking-wide mb-4">
                Peças e Materiais
              </h4>
              <div className="overflow-x-auto rounded-lg border border-graphite-700">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-graphite-800 border-b border-graphite-700">
                      <th className="text-left px-4 py-2.5 font-semibold text-graphite-300 text-xs uppercase">Descrição</th>
                      <th className="text-right px-4 py-2.5 font-semibold text-graphite-300 text-xs uppercase">Qtd</th>
                      <th className="text-right px-4 py-2.5 font-semibold text-graphite-300 text-xs uppercase">Unit.</th>
                      <th className="text-right px-4 py-2.5 font-semibold text-graphite-300 text-xs uppercase">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-graphite-800">
                    {os.itens.map((item) => (
                      <tr key={item.id}>
                        <td className="px-4 py-2.5 text-graphite-200">{item.descricao}</td>
                        <td className="px-4 py-2.5 text-right text-graphite-300">{item.quantidade}</td>
                        <td className="px-4 py-2.5 text-right text-graphite-300">{fmtCurrency(item.valorUnitario)}</td>
                        <td className="px-4 py-2.5 text-right font-medium text-graphite-100">
                          {fmtCurrency(item.quantidade * item.valorUnitario)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {/* Financeiro */}
          <Card className="p-5">
            <h4 className="text-sm font-semibold text-graphite-200 uppercase tracking-wide mb-4">
              Área Financeira
            </h4>
            <div className="space-y-2 max-w-sm ml-auto">
              <div className="flex justify-between text-sm">
                <span className="text-graphite-400">Mão de obra:</span>
                <span className="text-graphite-200 font-medium">{fmtCurrency(os.valorMaoObra)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-graphite-400">Peças:</span>
                <span className="text-graphite-200 font-medium">{fmtCurrency(totalPecas)}</span>
              </div>
              <div className="flex justify-between text-base pt-2 border-t border-graphite-700">
                <span className="font-semibold text-graphite-100">Valor Total:</span>
                <span className="font-bold text-accent-400 text-lg">{fmtCurrency(total)}</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Right: timeline */}
        <div>
          <Card className="p-5 sticky top-24">
            <h4 className="text-sm font-semibold text-graphite-200 uppercase tracking-wide mb-4">
              Linha do Tempo
            </h4>
            <div className="space-y-1">
              {os.timeline.map((event, idx) => {
                const isLast = idx === os.timeline.length - 1;
                return (
                  <div key={event.id} className="flex gap-3">
                    {/* Vertical line + dot */}
                    <div className="flex flex-col items-center">
                      <div
                        className={`p-1.5 rounded-full ${
                          event.status === 'cancelada'
                            ? 'bg-red-500/15 text-red-400'
                            : event.status === 'concluida' || event.status === 'aprovada'
                            ? 'bg-emerald-500/15 text-emerald-400'
                            : 'bg-accent-500/15 text-accent-400'
                        }`}
                      >
                        {timelineIcons[event.status]}
                      </div>
                      {!isLast && <div className="w-0.5 flex-1 bg-graphite-700 my-1" />}
                    </div>
                    {/* Content */}
                    <div className={`pb-4 ${isLast ? '' : ''}`}>
                      <p className="text-sm font-medium text-graphite-100">{event.label}</p>
                      <p className="text-xs text-graphite-400 mt-0.5">{event.timestamp}</p>
                      <p className="text-xs text-graphite-500 mt-0.5">por {event.user}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
