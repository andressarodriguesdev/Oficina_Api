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
import { listStatusHistory, type StatusHistoryWithRelations } from '../services/statusHistory';
import { listCustomers } from '../services/customers';
import { listVehicles } from '../services/vehicles';
import type { Customer, Vehicle } from '../types';
import { formatDate } from '../utils/format';
import { ALL_STATUSES, STATUS_LABEL, STATUS_TEXT_TO_NUMBER } from '../utils/status';

export function StatusHistory() {
  const toast = useToast();
  const [rows, setRows] = useState<StatusHistoryWithRelations[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ customerId: '', vehicleId: '', status: '', startDate: '', endDate: '' });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listStatusHistory({
        customerId: filters.customerId || undefined, vehicleId: filters.vehicleId || undefined,
        status: filters.status ? Number(filters.status) : undefined,
        startDate: filters.startDate ? new Date(filters.startDate).toISOString() : undefined,
        endDate: filters.endDate ? new Date(filters.endDate + 'T23:59:59').toISOString() : undefined,
      });
      setRows(data);
    } catch (err) { toast.error('Failed to load history'); console.error(err); }
    finally { setLoading(false); }
  }, [filters, toast]);

  useEffect(() => {
    (async () => {
      try { const [c, v] = await Promise.all([listCustomers(), listVehicles()]); setCustomers(c); setVehicles(v); }
      catch (err) { console.error(err); }
    })();
  }, []);

  useEffect(() => {
    const debounce = setTimeout(load, 300);
    return () => clearTimeout(debounce);
  }, [load]);

  const filteredVehicles = useMemo(() => filters.customerId ? vehicles.filter((v) => v.customerId === filters.customerId) : vehicles, [vehicles, filters.customerId]);
  const hasFilters = Object.values(filters).some((v) => v !== '');

  return (
    <div className="space-y-5">
      <Card className="p-4">
        <div className="mb-3 flex items-center gap-2">
          <Filter className="h-4 w-4 text-ink-400" /><span className="text-sm font-semibold text-white">Filters</span>
          {hasFilters && <Button variant="ghost" size="sm" onClick={() => setFilters({ customerId: '', vehicleId: '', status: '', startDate: '', endDate: '' })}><X className="h-3.5 w-3.5" />Clear</Button>}
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <Select label="Customer" value={filters.customerId} onChange={(e) => setFilters((f) => ({ ...f, customerId: e.target.value, vehicleId: '' }))}>
            <option value="">All</option>{customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </Select>
          <Select label="Vehicle" value={filters.vehicleId} onChange={(e) => setFilters((f) => ({ ...f, vehicleId: e.target.value }))}>
            <option value="">All</option>{filteredVehicles.map((v) => <option key={v.id} value={v.id}>{v.make} {v.model} {v.registrationNumber ? `— ${v.registrationNumber}` : ''}</option>)}
          </Select>
          <Select label="Status" value={filters.status} onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}>
            <option value="">All</option>{ALL_STATUSES.map((s) => <option key={s} value={STATUS_TEXT_TO_NUMBER[s]}>{STATUS_LABEL[s]}</option>)}
          </Select>
          <Input label="Start date" type="date" value={filters.startDate} onChange={(e) => setFilters((f) => ({ ...f, startDate: e.target.value }))} />
          <Input label="End date" type="date" value={filters.endDate} onChange={(e) => setFilters((f) => ({ ...f, endDate: e.target.value }))} />
        </div>
      </Card>

      {loading ? <PageLoader label="Loading history..." /> : rows.length === 0 ? (
        <Card><EmptyState icon={<History className="h-7 w-7" />} title="No history records" description="Job card status changes will appear here." /></Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr className="border-b border-ink-700/60 text-left text-xs font-semibold uppercase tracking-wide text-ink-400">
                <th className="px-5 py-3.5">Job Card</th><th className="px-5 py-3.5">Customer</th><th className="px-5 py-3.5">Previous Status</th><th className="px-5 py-3.5">New Status</th><th className="px-5 py-3.5">Date</th><th className="px-5 py-3.5">Note</th>
              </tr></thead>
              <tbody className="divide-y divide-ink-700/40">
                {rows.map((h) => (
                  <tr key={h.id} className="transition hover:bg-ink-800/30">
                    <td className="px-5 py-3.5">{h.jobCard?.id ? <Link to={`/job-cards/${h.jobCard.id}`} className="font-mono text-xs font-semibold text-flame-400 hover:text-flame-300">#{h.jobCard.id.slice(0, 8).toUpperCase()}</Link> : '—'}</td>
                    <td className="px-5 py-3.5"><p className="text-sm font-medium text-white">{h.jobCard?.customer?.name ?? '—'}</p></td>
                    <td className="px-5 py-3.5">{h.previousStatus !== null ? <StatusBadge status={h.previousStatus} /> : <span className="text-xs text-ink-400">—</span>}</td>
                    <td className="px-5 py-3.5"><StatusBadge status={h.newStatus} /></td>
                    <td className="px-5 py-3.5"><p className="text-sm text-ink-300">{formatDate(h.changedAt)}</p></td>
                    <td className="px-5 py-3.5"><p className="text-sm text-ink-200">{h.note ?? '—'}</p></td>
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
