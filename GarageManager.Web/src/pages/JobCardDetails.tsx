import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Pencil, FileDown, MessageCircle, Send, Check, X, CheckCircle2, XCircle, RotateCcw, ClipboardList, User, Car, Wrench, Package, Clock } from 'lucide-react';
import { Card, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { StatusBadge } from '../components/ui/StatusBadge';
import { PageLoader } from '../components/ui/Spinner';
import { EmptyState } from '../components/ui/EmptyState';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { useToast } from '../components/ui/Toast';
import {
  getJobCard,
  getJobCardStatusHistory,
  sendForApproval,
  approve,
  decline,
  complete,
  cancel,
  reopen,
  deleteJobCard,
  downloadPdf,
  generateWhatsApp,
  type JobCardWithRelations
} from '../services/jobCards';
import type { Part, JobCardStatusChange } from '../types';
import { formatCurrency, formatDate } from '../utils/format';
import { statusFromNumber, statusLabel } from '../utils/status';
import { buildWhatsAppMessage, whatsappUrl } from '../utils/whatsapp';

export function JobCardDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const [jobCard, setJobCard] = useState<JobCardWithRelations | null>(null);
  const [parts, setParts] = useState<Part[]>([]);
  const [statusChanges, setStatusChanges] = useState<JobCardStatusChange[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [cancellationReason, setCancellationReason] = useState('');

  const load = useCallback(async () => {
    if (!id) return;
    try {
     const [jc, history] = await Promise.all([
  getJobCard(id),
  getJobCardStatusHistory(id)
]);

setJobCard(jc);
setParts(jc?.parts ?? []);
setStatusChanges(history);
    } catch (err) { toast.error('Failed to load job card'); console.error(err); }
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

  const handleSendForApproval = async () => {
    if (!id || !jobCard) return;
    setActionLoading('send');
    try {
      await sendForApproval(id); toast.success('Job card sent for approval'); await load();
      if (jobCard.customer?.phone) {
        const fresh = await getJobCard(id);
        const msg = buildWhatsAppMessage(fresh ?? jobCard, jobCard.customer, jobCard.vehicle);
        window.open(whatsappUrl(jobCard.customer.phone, msg), '_blank');
      }
    } catch (err) { toast.error('Failed to send for approval'); console.error(err); }
    finally { setActionLoading(null); }
  };

 const handleWhatsApp = async () => {
  if (!jobCard) return;

  try {
    const link = await generateWhatsApp(jobCard.id);

    window.open(link, '_blank');

  } catch (error) {
    console.error(error);
    toast.error('Failed to generate WhatsApp link');
  }
};

const handlePdf = async () => {
  if (!jobCard) return;

  try {
    toast.info('Generating PDF...');

    const blob = await downloadPdf(jobCard.id);

    const url = window.URL.createObjectURL(blob);

    const link = document.createElement('a');

    link.href = url;
    link.download = `job-card-${jobCard.id.slice(0, 8)}.pdf`;

    document.body.appendChild(link);

    link.click();

    link.remove();

    window.URL.revokeObjectURL(url);

    toast.success('PDF generated successfully!');
  } catch (error) {
    console.error(error);
    toast.error('Failed to generate PDF');
  }
};

const handleCancel = async () => {
  if (!jobCard) return;

  if (!cancellationReason.trim()) {
    toast.warning('Enter a cancellation reason');
    return;
  }

  setActionLoading('cancel');

  try {
    await cancel(jobCard.id, {
      reason: cancellationReason,
    });

    toast.success('Job card cancelled successfully');
    setCancellationReason('');
    await load();
  } catch (error) {
    console.error(error);
    toast.error('Failed to cancel the job card');
  } finally {
    setActionLoading(null);
  }
};

const handleDelete = async () => {
  if (!jobCard) return;

  setDeleting(true);

  try {
    await deleteJobCard(jobCard.id);
    toast.success('Job card deleted successfully');
    navigate('/job-cards');
  } catch (error) {
    console.error(error);
    toast.error('Failed to delete the job card');
  } finally {
    setDeleting(false);
    setConfirmDelete(false);
  }
};

  if (loading) return <PageLoader label="Loading job card..." />;
  if (!jobCard) return <Card><EmptyState icon={<ClipboardList className="h-7 w-7" />} title="Job card not found" action={<Link to="/job-cards"><Button variant="outline"><ArrowLeft className="h-4 w-4" />Back</Button></Link>} /></Card>;

  const status = statusFromNumber(jobCard.status);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link to="/job-cards"><Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4" />Back</Button></Link>
        <div className="flex flex-wrap gap-2">
          <Link to={`/job-cards/${jobCard.id}/edit`}><Button variant="outline" size="sm" disabled={jobCard.status !== 0}><Pencil className="h-4 w-4" />Edit</Button></Link>
          <Button variant="outline" size="sm" onClick={handlePdf}><FileDown className="h-4 w-4" />Generate PDF</Button>
          <Button variant="outline" size="sm" onClick={handleWhatsApp}><MessageCircle className="h-4 w-4" />WhatsApp</Button>

        </div>
      </div>

      <Card className="p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="font-mono font-display text-xl font-bold text-white">Job Card #{jobCard.id.slice(0, 8).toUpperCase()}</h2>
              <StatusBadge status={jobCard.status} />
            </div>
            <p className="mt-1 text-sm text-ink-400">Created on {formatDate(jobCard.createdAt)}</p>
          </div>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div className="flex items-center gap-3 rounded-xl border border-ink-700/50 bg-ink-800/40 px-4 py-3">
            <User className="h-5 w-5 shrink-0 text-sky-400" />
            <div className="min-w-0"><p className="text-xs font-semibold uppercase tracking-wide text-ink-400">Customer</p>
              <Link to={`/customers/${jobCard.customerId}`} className="truncate text-sm font-semibold text-white hover:text-flame-400">{jobCard.customer?.name ?? '—'}</Link></div>
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-ink-700/50 bg-ink-800/40 px-4 py-3">
            <Car className="h-5 w-5 shrink-0 text-flame-400" />
            <div className="min-w-0"><p className="text-xs font-semibold uppercase tracking-wide text-ink-400">Vehicle</p>
              <Link to={`/vehicles/${jobCard.vehicleId}`} className="truncate text-sm font-semibold text-white hover:text-flame-400">{jobCard.vehicle ? `${jobCard.vehicle.make} ${jobCard.vehicle.model}` : '—'}{jobCard.vehicle?.registrationNumber ? ` — ${jobCard.vehicle.registrationNumber}` : ''}</Link></div>
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-ink-700/50 bg-ink-800/40 px-4 py-3">
            <Wrench className="h-5 w-5 shrink-0 text-emerald-400" />
            <div><p className="text-xs font-semibold uppercase tracking-wide text-ink-400">Current status</p><p className="text-sm font-semibold text-white">{statusLabel(status)}</p></div>
          </div>
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Card>
            <CardHeader title="Job description" />
            <div className="px-5 py-4">
              <p className="text-sm leading-relaxed text-ink-200">{jobCard.description || 'No description'}</p>
            </div>
          </Card>

          <Card>
            <CardHeader title="Parts / Items" subtitle={`${parts.length} item(s)`} />
            {parts.length === 0 ? <EmptyState icon={<Package className="h-7 w-7" />} title="No items" /> : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead><tr className="border-b border-ink-700/60 text-left text-xs font-semibold uppercase tracking-wide text-ink-400">
                    <th className="px-5 py-3">Description</th><th className="px-5 py-3 text-right">Qty</th><th className="px-5 py-3 text-right">Unit price</th><th className="px-5 py-3 text-right">Total</th>
                  </tr></thead>
                  <tbody className="divide-y divide-ink-700/40">
                    {parts.map((part) => (
                      <tr key={part.id}>
                        <td className="px-5 py-3 text-sm text-white">{part.description}</td>
                        <td className="px-5 py-3 text-right text-sm text-ink-200">{part.quantity}</td>
                        <td className="px-5 py-3 text-right text-sm text-ink-200">{formatCurrency(part.unitPrice)}</td>
                        <td className="px-5 py-3 text-right text-sm font-semibold text-white">{formatCurrency(part.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          <Card>
            <CardHeader title="Amounts" />
            <div className="space-y-3 px-5 py-4">
              <div className="flex items-center justify-between"><span className="text-sm text-ink-300">Labour</span><span className="text-sm font-semibold text-white">{formatCurrency(jobCard.labourCharge)}</span></div>
              <div className="flex items-center justify-between"><span className="text-sm text-ink-300">Parts/Items</span><span className="text-sm font-semibold text-white">{formatCurrency(parts.reduce((s, p) => s + (Number(p.total) || 0), 0))}</span></div>
              <div className="flex items-center justify-between border-t border-ink-700/60 pt-3"><span className="font-display text-base font-bold text-white">Total amount</span><span className="font-display text-xl font-bold text-flame-400">{formatCurrency(jobCard.totalAmount)}</span></div>
              <p className="text-xs text-ink-400">Total amount calculated by the backend. The frontend does not recalculate this value.</p>
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader title="Actions" subtitle="Job card workflow" />
            <div className="space-y-2 p-4">
              {status === 'Open' && <Button className="w-full justify-start" onClick={handleSendForApproval} loading={actionLoading === 'send'}><Send className="h-4 w-4" />Send for Approval</Button>}
              {status === 'AwaitingApproval' && (
                <>
                  <Button variant="success" className="w-full justify-start" onClick={() => runAction('approve', approve, 'Job card approved', 'Failed to approve job card')} loading={actionLoading === 'approve'}><Check className="h-4 w-4" />Approve</Button>
                  <Button variant="danger" className="w-full justify-start" onClick={() => runAction('decline', decline, 'Job card declined', 'Failed to decline job card')} loading={actionLoading === 'decline'}><X className="h-4 w-4" />Decline</Button>
                </>
              )}
              {status === 'Approved' && <Button variant="success" className="w-full justify-start" onClick={() => runAction('complete', complete, 'Job card completed', 'Failed to complete job card')} loading={actionLoading === 'complete'}><CheckCircle2 className="h-4 w-4" />Complete</Button>}
              {(status === 'Approved' ||
  status === 'AwaitingApproval' ||
  status === 'Declined') && (
  <>
    <div className="space-y-2">
      <label className="text-sm font-medium text-ink-200">
        Cancellation reason
      </label>

      <textarea
        className="w-full rounded-lg border border-ink-700 bg-ink-900 p-3 text-sm text-white focus:border-flame-500 focus:outline-none"
        rows={3}
        value={cancellationReason}
        onChange={(e) => setCancellationReason(e.target.value)}
        placeholder="E.g. Customer cancelled the job"
      />
    </div>

    <Button
      variant="danger"
      className="w-full justify-start"
      onClick={handleCancel}
      loading={actionLoading === 'cancel'}
    >
      <XCircle className="h-4 w-4" />
      Cancel
    </Button>
  </>
)}
              {(status === 'Completed' || status === 'Cancelled' || status === 'Declined') && <Button variant="outline" className="w-full justify-start" onClick={() => runAction('reopen', reopen, 'Job card reopened', 'Failed to reopen job card')} loading={actionLoading === 'reopen'}><RotateCcw className="h-4 w-4" />Reopen</Button>}
              <Button variant="outline" className="w-full justify-start" onClick={handleWhatsApp}><MessageCircle className="h-4 w-4" />Send WhatsApp</Button>
              <Button variant="outline" className="w-full justify-start" onClick={handlePdf}><FileDown className="h-4 w-4" />Generate PDF</Button>
            </div>
          </Card>

          <Card>
            <CardHeader title="Timeline" subtitle="Status history" />

            <div className="p-5">
              {statusChanges.length === 0 ? (
                <p className="text-sm text-ink-400">
                  No history recorded.
                </p>
              ) : (
                <ol className="relative space-y-5 border-l border-ink-700/60 pl-5">
                  {[...statusChanges].reverse().map((h) => (
                    <li key={h.id} className="relative">
                      <span className="absolute -left-[26px] top-0.5 flex h-3 w-3 items-center justify-center">
                        <span className="h-3 w-3 rounded-full bg-flame-500 ring-4 ring-flame-500/20" />
                      </span>

                      <div className="flex items-center gap-2">
                        <StatusBadge status={h.newStatus} />

                        {h.previousStatus !== null && (
                          <span className="text-xs text-ink-400">
                            from{' '}
                            <span className="font-medium text-ink-300">
                              {statusLabel(statusFromNumber(h.previousStatus))}
                            </span>
                          </span>
                        )}
                      </div>

                      <p className="mt-1 text-xs text-ink-400">
                        {formatDate(h.changedAt)}
                      </p>

                      {h.note && (
                        <p className="mt-1 text-sm text-ink-200">
                          {h.note}
                        </p>
                      )}
                    </li>
                  ))}
                </ol>
              )}
            </div>
          </Card>

          {(jobCard.sentForApprovalAt || jobCard.completedAt) && (
            <Card className="p-5">
              <div className="space-y-2 text-sm">
                {jobCard.sentForApprovalAt && (
                  <div className="flex items-center gap-2 text-ink-300">
                    <Clock className="h-4 w-4 text-ink-400" />
                    Sent on: {formatDate(jobCard.sentForApprovalAt)}
                  </div>
                )}

                {jobCard.completedAt && (
                  <div className="flex items-center gap-2 text-ink-300">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    Completed on: {formatDate(jobCard.completedAt)}
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
        title="Delete job card"
        message="Are you sure you want to delete this job card?"
      />
    </div>
  );
}
