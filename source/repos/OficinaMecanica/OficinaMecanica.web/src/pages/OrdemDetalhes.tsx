import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Pencil,  FileDown, MessageCircle, Send, Check, X, CheckCircle2, XCircle, RotateCcw, ClipboardList, User, Car, Wrench, Package, Clock } from 'lucide-react';
import { Card, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { StatusBadge } from '../components/ui/StatusBadge';
import { PageLoader } from '../components/ui/Spinner';
import { EmptyState } from '../components/ui/EmptyState';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { useToast } from '../components/ui/Toast';
import {
  getOrdem,
  getOrdemHistorico,
  enviarAprovacao,
  aprovar,
  recusar,
  concluir,
  cancelar,
  reabrir,
  deleteOrdem,
  baixarPdf,
  type OrdemWithRelations
} from '../services/ordens';
import type { OrdemServicoItem, HistoricoOrdemServico } from '../types';
import { formatCurrency, formatDate } from '../utils/format';
import { statusFromNumber, statusLabel } from '../utils/status';
import { buildWhatsAppMessage, whatsappUrl } from '../utils/whatsapp';

export function OrdemDetalhes() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const [ordem, setOrdem] = useState<OrdemWithRelations | null>(null);
  const [itens, setItens] = useState<OrdemServicoItem[]>([]);
  const [historicos, setHistoricos] = useState<HistoricoOrdemServico[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [motivoCancelamento, setMotivoCancelamento] = useState('');

  const load = useCallback(async () => {
    if (!id) return;
    try {
     const [o, hist] = await Promise.all([
  getOrdem(id),
  getOrdemHistorico(id)
]);

setOrdem(o);
setItens(o?.itens ?? []);
setHistoricos(hist);
    } catch (err) { toast.error('Erro ao carregar ordem de serviço'); console.error(err); }
    finally { setLoading(false); }
  }, [id, toast]);

  useEffect(() => { load(); }, [load]);

  const runAction = async (key: string, fn: (id: string) => Promise<unknown>, successMsg: string, errorMsg: string) => {
    if (!id) return;
    setActionLoading(key);
    try { await fn(id); toast.success(successMsg); await load(); }
    catch (err) { toast.error(errorMsg); console.error(err); }
    finally { setActionLoading(null); }
  };

  const handleEnviarAprovacao = async () => {
    if (!id || !ordem) return;
    setActionLoading('enviar');
    try {
      await enviarAprovacao(id); toast.success('OS enviada para aprovação'); await load();
      if (ordem.cliente?.telefone) {
        const fresh = await getOrdem(id);
        const msg = buildWhatsAppMessage(fresh ?? ordem, ordem.cliente, ordem.veiculo);
        window.open(whatsappUrl(ordem.cliente.telefone, msg), '_blank');
      }
    } catch (err) { toast.error('Erro ao enviar para aprovação'); console.error(err); }
    finally { setActionLoading(null); }
  };

  const handleWhatsApp = () => {
    if (!ordem?.cliente?.telefone) { toast.warning('Cliente não possui telefone cadastrado'); return; }
    const msg = buildWhatsAppMessage(ordem, ordem.cliente, ordem.veiculo);
    window.open(whatsappUrl(ordem.cliente.telefone, msg), '_blank');
  };

const handlePdf = async () => {
  if (!ordem) return;

  try {
    toast.info('Gerando PDF...');

    const blob = await baixarPdf(ordem.id);

    const url = window.URL.createObjectURL(blob);

    const link = document.createElement('a');

    link.href = url;
    link.download = `OS-${ordem.id.slice(0, 8)}.pdf`;

    document.body.appendChild(link);

    link.click();

    link.remove();

    window.URL.revokeObjectURL(url);

    toast.success('PDF gerado com sucesso!');
  } catch (error) {
    console.error(error);
    toast.error('Erro ao gerar PDF');
  }
};

const handleCancelar = async () => {
  if (!ordem) return;

  if (!motivoCancelamento.trim()) {
    toast.warning('Informe o motivo do cancelamento');
    return;
  }

  setActionLoading('cancelar');

  try {
    await cancelar(ordem.id, {
      motivo: motivoCancelamento,
    });

    toast.success('Ordem cancelada com sucesso');
    setMotivoCancelamento('');
    await load();
  } catch (error) {
    console.error(error);
    toast.error('Erro ao cancelar a ordem');
  } finally {
    setActionLoading(null);
  }
};

const handleDelete = async () => {
  if (!ordem) return;

  setDeleting(true);

  try {
    await deleteOrdem(ordem.id);
    toast.success('Ordem de serviço excluída com sucesso');
    navigate('/ordens-servico');
  } catch (error) {
    console.error(error);
    toast.error('Erro ao excluir a ordem de serviço');
  } finally {
    setDeleting(false);
    setConfirmDelete(false);
  }
};

  if (loading) return <PageLoader label="Carregando ordem de serviço..." />;
  if (!ordem) return <Card><EmptyState icon={<ClipboardList className="h-7 w-7" />} title="Ordem de serviço não encontrada" action={<Link to="/ordens-servico"><Button variant="outline"><ArrowLeft className="h-4 w-4" />Voltar</Button></Link>} /></Card>;

  const status = statusFromNumber(ordem.status);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link to="/ordens-servico"><Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4" />Voltar</Button></Link>
        <div className="flex flex-wrap gap-2">
          <Link to={`/ordens-servico/${ordem.id}/editar`}><Button variant="outline" size="sm" disabled={ordem.status !== 0}><Pencil className="h-4 w-4" />Editar</Button></Link>
          <Button variant="outline" size="sm" onClick={handlePdf}><FileDown className="h-4 w-4" />Gerar PDF</Button>
          <Button variant="outline" size="sm" onClick={handleWhatsApp}><MessageCircle className="h-4 w-4" />WhatsApp</Button>
                
        </div>
      </div>

      <Card className="p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="font-mono font-display text-xl font-bold text-white">OS #{ordem.id.slice(0, 8).toUpperCase()}</h2>
              <StatusBadge status={ordem.status} />
            </div>
            <p className="mt-1 text-sm text-ink-400">Criada em {formatDate(ordem.dataCriacao)}</p>
          </div>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div className="flex items-center gap-3 rounded-xl border border-ink-700/50 bg-ink-800/40 px-4 py-3">
            <User className="h-5 w-5 shrink-0 text-sky-400" />
            <div className="min-w-0"><p className="text-xs font-semibold uppercase tracking-wide text-ink-400">Cliente</p>
              <Link to={`/clientes/${ordem.clienteId}`} className="truncate text-sm font-semibold text-white hover:text-flame-400">{ordem.cliente?.nome ?? '—'}</Link></div>
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-ink-700/50 bg-ink-800/40 px-4 py-3">
            <Car className="h-5 w-5 shrink-0 text-flame-400" />
            <div className="min-w-0"><p className="text-xs font-semibold uppercase tracking-wide text-ink-400">Veículo</p>
              <Link to={`/veiculos/${ordem.veiculoId}`} className="truncate text-sm font-semibold text-white hover:text-flame-400">{ordem.veiculo ? `${ordem.veiculo.marca} ${ordem.veiculo.modelo}` : '—'}{ordem.veiculo?.placa ? ` — ${ordem.veiculo.placa}` : ''}</Link></div>
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-ink-700/50 bg-ink-800/40 px-4 py-3">
            <Wrench className="h-5 w-5 shrink-0 text-emerald-400" />
            <div><p className="text-xs font-semibold uppercase tracking-wide text-ink-400">Status atual</p><p className="text-sm font-semibold text-white">{statusLabel(status)}</p></div>
          </div>
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Card>
            <CardHeader title="Descrição do serviço" />
            <div className="px-5 py-4">
              <p className="text-sm leading-relaxed text-ink-200">{ordem.descricao || 'Sem descrição'}</p>
              {ordem.observacao && <div className="mt-4 rounded-xl border border-ink-700/50 bg-ink-800/40 p-4"><p className="text-xs font-semibold uppercase tracking-wide text-ink-400">Observação</p><p className="mt-1 text-sm text-ink-200">{ordem.observacao}</p></div>}
            </div>
          </Card>

          <Card>
            <CardHeader title="Peças / Itens" subtitle={`${itens.length} item(s)`} />
            {itens.length === 0 ? <EmptyState icon={<Package className="h-7 w-7" />} title="Nenhum item" /> : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead><tr className="border-b border-ink-700/60 text-left text-xs font-semibold uppercase tracking-wide text-ink-400">
                    <th className="px-5 py-3">Descrição</th><th className="px-5 py-3 text-right">Qtd</th><th className="px-5 py-3 text-right">Valor unit.</th><th className="px-5 py-3 text-right">Total</th>
                  </tr></thead>
                  <tbody className="divide-y divide-ink-700/40">
                    {itens.map((item) => (
                      <tr key={item.id}>
                        <td className="px-5 py-3 text-sm text-white">{item.descricao}</td>
                        <td className="px-5 py-3 text-right text-sm text-ink-200">{item.quantidade}</td>
                        <td className="px-5 py-3 text-right text-sm text-ink-200">{formatCurrency(item.valorUnitario)}</td>
                        <td className="px-5 py-3 text-right text-sm font-semibold text-white">{formatCurrency(item.valorTotal)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          <Card>
            <CardHeader title="Valores" />
            <div className="space-y-3 px-5 py-4">
              <div className="flex items-center justify-between"><span className="text-sm text-ink-300">Mão de obra</span><span className="text-sm font-semibold text-white">{formatCurrency(ordem.valorMaoObra)}</span></div>
              <div className="flex items-center justify-between"><span className="text-sm text-ink-300">Peças/Itens</span><span className="text-sm font-semibold text-white">{formatCurrency(itens.reduce((s, i) => s + (Number(i.valorTotal) || 0), 0))}</span></div>
              <div className="flex items-center justify-between border-t border-ink-700/60 pt-3"><span className="font-display text-base font-bold text-white">Valor total</span><span className="font-display text-xl font-bold text-flame-400">{formatCurrency(ordem.valorTotal)}</span></div>
              <p className="text-xs text-ink-400">Valor total calculado pelo backend. O frontend não recalcula este valor.</p>
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader title="Ações" subtitle="Fluxo da ordem de serviço" />
            <div className="space-y-2 p-4">
              {status === 'Aberta' && <Button className="w-full justify-start" onClick={handleEnviarAprovacao} loading={actionLoading === 'enviar'}><Send className="h-4 w-4" />Enviar para Aprovação</Button>}
              {status === 'AguardandoAprovacao' && (
                <>
                  <Button variant="success" className="w-full justify-start" onClick={() => runAction('aprovar', aprovar, 'OS aprovada', 'Erro ao aprovar OS')} loading={actionLoading === 'aprovar'}><Check className="h-4 w-4" />Aprovar</Button>
                  <Button variant="danger" className="w-full justify-start" onClick={() => runAction('recusar', recusar, 'OS recusada', 'Erro ao recusar OS')} loading={actionLoading === 'recusar'}><X className="h-4 w-4" />Recusar</Button>
                </>
              )}
              {status === 'Aprovada' && <Button variant="success" className="w-full justify-start" onClick={() => runAction('concluir', concluir, 'OS concluída', 'Erro ao concluir OS')} loading={actionLoading === 'concluir'}><CheckCircle2 className="h-4 w-4" />Concluir</Button>}
              {(status === 'Aprovada' ||
  status === 'AguardandoAprovacao' ||
  status === 'Recusada') && (
  <>
    <div className="space-y-2">
      <label className="text-sm font-medium text-ink-200">
        Motivo do cancelamento
      </label>

      <textarea
        className="w-full rounded-lg border border-ink-700 bg-ink-900 p-3 text-sm text-white focus:border-flame-500 focus:outline-none"
        rows={3}
        value={motivoCancelamento}
        onChange={(e) => setMotivoCancelamento(e.target.value)}
        placeholder="Ex: Cliente desistiu do serviço"
      />
    </div>

    <Button
      variant="danger"
      className="w-full justify-start"
      onClick={handleCancelar}
      loading={actionLoading === 'cancelar'}
    >
      <XCircle className="h-4 w-4" />
      Cancelar
    </Button>
  </>
)}
              {(status === 'Concluida' || status === 'Cancelada' || status === 'Recusada') && <Button variant="outline" className="w-full justify-start" onClick={() => runAction('reabrir', reabrir, 'OS reaberta', 'Erro ao reabrir OS')} loading={actionLoading === 'reabrir'}><RotateCcw className="h-4 w-4" />Reabrir</Button>}
              <Button variant="outline" className="w-full justify-start" onClick={handleWhatsApp}><MessageCircle className="h-4 w-4" />Enviar WhatsApp</Button>
              <Button variant="outline" className="w-full justify-start" onClick={handlePdf}><FileDown className="h-4 w-4" />Gerar PDF</Button>
            </div>
          </Card>

          <Card>
            <CardHeader title="Timeline" subtitle="Histórico de status" />

            <div className="p-5">
              {historicos.length === 0 ? (
                <p className="text-sm text-ink-400">
                  Nenhum histórico registrado.
                </p>
              ) : (
                <ol className="relative space-y-5 border-l border-ink-700/60 pl-5">
                  {[...historicos].reverse().map((h) => (
                    <li key={h.id} className="relative">
                      <span className="absolute -left-[26px] top-0.5 flex h-3 w-3 items-center justify-center">
                        <span className="h-3 w-3 rounded-full bg-flame-500 ring-4 ring-flame-500/20" />
                      </span>

                      <div className="flex items-center gap-2">
                        <StatusBadge status={h.novoStatus} />

                        {h.statusAnterior !== null && (
                          <span className="text-xs text-ink-400">
                            de{' '}
                            <span className="font-medium text-ink-300">
                              {statusLabel(statusFromNumber(h.statusAnterior))}
                            </span>
                          </span>
                        )}
                      </div>

                      <p className="mt-1 text-xs text-ink-400">
                        {formatDate(h.dataAlteracao)}
                      </p>

                      {h.observacao && (
                        <p className="mt-1 text-sm text-ink-200">
                          {h.observacao}
                        </p>
                      )}
                    </li>
                  ))}
                </ol>
              )}
            </div>
          </Card>

          {(ordem.dataEnvioAprovacao || ordem.dataConclusao) && (
            <Card className="p-5">
              <div className="space-y-2 text-sm">
                {ordem.dataEnvioAprovacao && (
                  <div className="flex items-center gap-2 text-ink-300">
                    <Clock className="h-4 w-4 text-ink-400" />
                    Enviado em: {formatDate(ordem.dataEnvioAprovacao)}
                  </div>
                )}

                {ordem.dataConclusao && (
                  <div className="flex items-center gap-2 text-ink-300">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    Concluído em: {formatDate(ordem.dataConclusao)}
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Excluir ordem de serviço"
        message="Tem certeza que deseja excluir esta ordem de serviço?"
      />
    </div>
  );
}