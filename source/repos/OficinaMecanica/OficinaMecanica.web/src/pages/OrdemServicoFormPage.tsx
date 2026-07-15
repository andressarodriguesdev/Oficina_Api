import { useEffect, useState } from 'react';
import {
  Plus,
  Trash2,
  Save,
  FileText,
  MessageCircle,
  ArrowLeft,
  Package,
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input, Select, Textarea, Label } from '../components/ui/Form';
import type { Cliente, Veiculo, OSItem } from '../types';
import type { Page } from '../hooks/useNavigation';
import { clienteService } from '../services/clienteService';
import { veiculoService } from '../services/veiculoService';
import { ordemServicoService } from '../services/ordemServicoService';

const fmtCurrency = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

interface OSFormPageProps {
  onNavigate: (page: Page, params?: Record<string, string>) => void;
}

export function OrdemServicoFormPage({ onNavigate }: OSFormPageProps) {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [clienteId, setClienteId] = useState('');
  const [veiculoId, setVeiculoId] = useState('');
  const [descricao, setDescricao] = useState('');
  const [valorMaoObra, setValorMaoObra] = useState('');

  const [itens, setItens] = useState<OSItem[]>([]);
  const [novoItem, setNovoItem] = useState({ descricao: '', quantidade: '', valorUnitario: '' });

  useEffect(() => {
    Promise.all([clienteService.list(), veiculoService.list()]).then(([c, v]) => {
      setClientes(c);
      setVeiculos(v);
      setLoading(false);
    });
  }, []);

  const veiculosCliente = veiculos.filter((v) => v.clienteId === clienteId);

  const totalPecas = itens.reduce((s, i) => s + i.quantidade * i.valorUnitario, 0);
  const total = (Number(valorMaoObra) || 0) + totalPecas;

  const handleAddItem = () => {
    if (!novoItem.descricao || !novoItem.quantidade || !novoItem.valorUnitario) return;
    setItens([
      ...itens,
      {
        id: `i${Date.now()}`,
        descricao: novoItem.descricao,
        quantidade: Number(novoItem.quantidade),
        valorUnitario: Number(novoItem.valorUnitario),
      },
    ]);
    setNovoItem({ descricao: '', quantidade: '', valorUnitario: '' });
  };

  const handleRemoveItem = (id: string) => {
    setItens(itens.filter((i) => i.id !== id));
  };

  const handleSave = async () => {
    if (!clienteId || !veiculoId) return;
    setSaving(true);
    await ordemServicoService.create({
      clienteId,
      veiculoId,
      descricao,
      valorMaoObra: Number(valorMaoObra) || 0,
      itens,
      status: 'aberta',
      data: new Date().toISOString().slice(0, 10),
    });
    setSaving(false);
    onNavigate('dashboard');
  };

  const handleWhatsApp = () => {
    const cliente = clientes.find((c) => c.id === clienteId);
    const veiculo = veiculos.find((v) => v.id === veiculoId);
    if (!cliente) return;
    const msg = `Olá ${cliente.nome}! Segue a OS para aprovação:\n\n` +
      `Veículo: ${veiculo?.marca} ${veiculo?.modelo} - ${veiculo?.placa}\n` +
      `Serviço: ${descricao}\n` +
      `Mão de obra: ${fmtCurrency(Number(valorMaoObra) || 0)}\n` +
      `Peças: ${fmtCurrency(totalPecas)}\n` +
      `Total: ${fmtCurrency(total)}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin h-8 w-8 border-2 border-accent-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-5xl">
      <button
        onClick={() => onNavigate('dashboard')}
        className="inline-flex items-center gap-2 text-sm text-graphite-400 hover:text-graphite-200 transition-colors"
      >
        <ArrowLeft size={16} /> Voltar
      </button>

      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-graphite-100">Nova Ordem de Serviço</h3>
          <p className="text-sm text-graphite-400">Preencha os dados da ordem de serviço</p>
        </div>
      </div>

      {/* Dados principais */}
      <Card className="p-5">
        <h4 className="text-sm font-semibold text-graphite-200 uppercase tracking-wide mb-4">
          Dados do Serviço
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Cliente"
            value={clienteId}
            onChange={(e) => {
              setClienteId(e.target.value);
              setVeiculoId('');
            }}
          >
            <option value="">Selecione um cliente...</option>
            {clientes.map((c) => (
              <option key={c.id} value={c.id}>{c.nome}</option>
            ))}
          </Select>
          <Select
            label="Veículo"
            value={veiculoId}
            onChange={(e) => setVeiculoId(e.target.value)}
            disabled={!clienteId}
          >
            <option value="">
              {clienteId ? 'Selecione um veículo...' : 'Selecione um cliente primeiro'}
            </option>
            {veiculosCliente.map((v) => (
              <option key={v.id} value={v.id}>
                {v.marca} {v.modelo} - {v.placa}
              </option>
            ))}
          </Select>
        </div>
        <div className="mt-4">
          <Textarea
            label="Descrição do Serviço"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            placeholder="Descreva o serviço a ser realizado..."
            rows={3}
          />
        </div>
        <div className="mt-4 max-w-xs">
          <Label>Valor da Mão de Obra (R$)</Label>
          <Input
            type="number"
            value={valorMaoObra}
            onChange={(e) => setValorMaoObra(e.target.value)}
            placeholder="0,00"
          />
        </div>
      </Card>

      {/* Peças e materiais */}
      <Card className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <Package size={18} className="text-accent-400" />
          <h4 className="text-sm font-semibold text-graphite-200 uppercase tracking-wide">
            Peças e Materiais Utilizados
          </h4>
        </div>

        {/* Add item row */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_80px_120px_auto] gap-3 mb-4">
          <Input
            placeholder="Descrição da peça"
            value={novoItem.descricao}
            onChange={(e) => setNovoItem({ ...novoItem, descricao: e.target.value })}
          />
          <Input
            type="number"
            placeholder="Qtd"
            value={novoItem.quantidade}
            onChange={(e) => setNovoItem({ ...novoItem, quantidade: e.target.value })}
          />
          <Input
            type="number"
            placeholder="Valor unit."
            value={novoItem.valorUnitario}
            onChange={(e) => setNovoItem({ ...novoItem, valorUnitario: e.target.value })}
          />
          <Button variant="secondary" icon={<Plus size={18} />} onClick={handleAddItem}>
            Adicionar
          </Button>
        </div>

        {/* Items table */}
        {itens.length > 0 && (
          <div className="overflow-x-auto rounded-lg border border-graphite-700">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-graphite-800 border-b border-graphite-700">
                  <th className="text-left px-4 py-2.5 font-semibold text-graphite-300 text-xs uppercase">Descrição</th>
                  <th className="text-right px-4 py-2.5 font-semibold text-graphite-300 text-xs uppercase">Qtd</th>
                  <th className="text-right px-4 py-2.5 font-semibold text-graphite-300 text-xs uppercase">Valor Unit.</th>
                  <th className="text-right px-4 py-2.5 font-semibold text-graphite-300 text-xs uppercase">Total</th>
                  <th className="px-4 py-2.5"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-graphite-800">
                {itens.map((item) => (
                  <tr key={item.id} className="hover:bg-graphite-800/50">
                    <td className="px-4 py-2.5 text-graphite-200">{item.descricao}</td>
                    <td className="px-4 py-2.5 text-right text-graphite-300">{item.quantidade}</td>
                    <td className="px-4 py-2.5 text-right text-graphite-300">{fmtCurrency(item.valorUnitario)}</td>
                    <td className="px-4 py-2.5 text-right font-medium text-graphite-100">
                      {fmtCurrency(item.quantidade * item.valorUnitario)}
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="text-graphite-400 hover:text-red-400 transition-colors p-1"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {itens.length === 0 && (
          <p className="text-sm text-graphite-500 text-center py-6 border border-dashed border-graphite-700 rounded-lg">
            Nenhuma peça adicionada ainda
          </p>
        )}
      </Card>

      {/* Resumo financeiro */}
      <Card className="p-5">
        <h4 className="text-sm font-semibold text-graphite-200 uppercase tracking-wide mb-4">
          Resumo Financeiro
        </h4>
        <div className="space-y-2 max-w-sm ml-auto">
          <div className="flex justify-between text-sm">
            <span className="text-graphite-400">Mão de obra:</span>
            <span className="text-graphite-200 font-medium">{fmtCurrency(Number(valorMaoObra) || 0)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-graphite-400">Peças:</span>
            <span className="text-graphite-200 font-medium">{fmtCurrency(totalPecas)}</span>
          </div>
          <div className="flex justify-between text-base pt-2 border-t border-graphite-700">
            <span className="font-semibold text-graphite-100">Total da OS:</span>
            <span className="font-bold text-accent-400">{fmtCurrency(total)}</span>
          </div>
        </div>
      </Card>

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row gap-3 pb-6">
        <Button onClick={handleSave} disabled={saving || !clienteId || !veiculoId} icon={<Save size={18} />} className="flex-1">
          {saving ? 'Salvando...' : 'Salvar OS'}
        </Button>
        <Button variant="outline" icon={<FileText size={18} />} className="flex-1">
          Gerar PDF
        </Button>
        <Button variant="outline" icon={<MessageCircle size={18} />} onClick={handleWhatsApp} className="flex-1">
          Enviar WhatsApp
        </Button>
      </div>
    </div>
  );
}
