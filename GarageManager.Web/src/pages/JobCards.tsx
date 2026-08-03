import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Plus,
  ClipboardList,
  Search,
  Pencil,
  Trash2,
  Eye,
  FileText,
} from "lucide-react";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Select } from "../components/ui/Select";
import { StatusBadge } from "../components/ui/StatusBadge";
import { Modal } from "../components/ui/Modal";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { EmptyState } from "../components/ui/EmptyState";
import { PageLoader } from "../components/ui/Spinner";
import { useToast } from "../components/ui/Toast";
import {
  JobCardForm,
  type JobCardFormValues,
} from "../components/forms/JobCardForm";
import {
  listJobCards,
  createJobCard,
  deleteJobCard,
  sendForApproval,
  type JobCardWithRelations,
} from "../services/jobCards";
import { listCustomers } from "../services/customers";
import { listVehicles } from "../services/vehicles";
import { listMechanics } from "../services/mechanics";
import type { Customer, Vehicle, Mechanic } from "../types";
import { formatDate, formatCurrency } from "../utils/format";
import {
  ALL_STATUSES,
  STATUS_LABEL,
  STATUS_TEXT_TO_NUMBER,
} from "../utils/status";
import { buildWhatsAppMessage, whatsappUrl } from "../utils/whatsapp";

export function JobCards() {
  const toast = useToast();
  const [jobCards, setJobCards] = useState<JobCardWithRelations[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toDelete, setToDelete] = useState<JobCardWithRelations | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [mechanics, setMechanics] = useState<Mechanic[]>([]);
  const load = useCallback(async () => {
    setLoading(true);

    try {
      const [jc, c, v, m] = await Promise.all([
        listJobCards(),
        listCustomers(),
        listVehicles(),
        listMechanics(),
      ]);

      const jobCardsWithRelations = jc.map((job) => ({
        ...job,
        customer: c.find((customer) => customer.id === job.customerId) ?? null,
        vehicle: v.find((vehicle) => vehicle.id === job.vehicleId) ?? null,
        mechanic: m.find((mechanic) => mechanic.id === job.mechanicId) ?? null,
      }));

      setJobCards(jobCardsWithRelations);
      setCustomers(c);
      setVehicles(v);
      setMechanics(m);
    } catch (err) {
      toast.error("Failed to load job cards");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return jobCards.filter((jc) => {
      if (statusFilter && jc.status !== Number(statusFilter)) return false;
      if (!q) return true;
      return (
        jc.description.toLowerCase().includes(q) ||
        (jc.customer?.name ?? "").toLowerCase().includes(q) ||
        (jc.vehicle ? `${jc.vehicle.make} ${jc.vehicle.model}` : "")
          .toLowerCase()
          .includes(q) ||
        (jc.vehicle?.registrationNumber ?? "").toLowerCase().includes(q)
      );
    });
  }, [jobCards, search, statusFilter]);

  const handleCreate = async (values: JobCardFormValues) => {
    setSubmitting(true);
    try {
      const partsTotal = values.parts.reduce(
        (s, p) => s + (p.total || 0),
        0,
      );
      const totalAmount = Number((values.labourCharge + partsTotal).toFixed(2));
      await createJobCard({
        customerId: values.customerId,
        vehicleId: values.vehicleId,
        mechanicId: values.mechanicId,
        description: values.description,
        labourCharge: values.labourCharge,
        totalAmount: totalAmount,
        parts: values.parts.filter((p) => p.description.trim() !== ""),
      });
      toast.success("Job card created successfully");
      setModalOpen(false);
      await load();
    } catch (err) {
      toast.error("Failed to create job card");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await deleteJobCard(toDelete.id);
      toast.success("Job card deleted successfully");
      setToDelete(null);
      await load();
    } catch (err) {
      toast.error("Failed to delete job card");
      console.error(err);
    } finally {
      setDeleting(false);
    }
  };

  const handleSendForApproval = async (jobCard: JobCardWithRelations) => {
    try {
      await sendForApproval(jobCard.id);
      toast.success("Job card sent for approval");
      await load();
      if (jobCard.customer?.phone) {
        const fresh = (await listJobCards()).find((jc) => jc.id === jobCard.id) ?? jobCard;
        const msg = buildWhatsAppMessage(fresh, jobCard.customer, jobCard.vehicle);
        window.open(whatsappUrl(jobCard.customer.phone, msg), "_blank");
      }
    } catch (err) {
      toast.error("Failed to send for approval");
      console.error(err);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row">
          <div className="relative w-full sm:max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
            <Input
              placeholder="Search job cards..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="sm:w-52"
          >
            <option value="">All statuses</option>
            {ALL_STATUSES.map((s) => (
              <option key={s} value={STATUS_TEXT_TO_NUMBER[s]}>
                {STATUS_LABEL[s]}
              </option>
            ))}
          </Select>
        </div>
        <Button onClick={() => setModalOpen(true)}>
          <Plus className="h-4 w-4" />
          New job card
        </Button>
      </div>

      {loading ? (
        <PageLoader label="Loading job cards..." />
      ) : filtered.length === 0 ? (
        <Card>
          <EmptyState
            icon={<ClipboardList className="h-7 w-7" />}
            title={
              search || statusFilter
                ? "No job cards found"
                : "No job cards yet"
            }
            description={
              search || statusFilter
                ? "Try a different search."
                : "Create the first job card."
            }
            action={
              !search &&
              !statusFilter && (
                <Button onClick={() => setModalOpen(true)}>
                  <Plus className="h-4 w-4" />
                  Create job card
                </Button>
              )
            }
          />
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-ink-700/60 text-left text-xs font-semibold uppercase tracking-wide text-ink-400">
                  <th className="px-5 py-3.5">Job Card</th>
                  <th className="px-5 py-3.5">Customer</th>
                  <th className="px-5 py-3.5">Vehicle</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Date</th>
                  <th className="px-5 py-3.5 text-right">Amount</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-700/40">
                {filtered.map((jc) => (
                  <tr key={jc.id} className="transition hover:bg-ink-800/30">
                    <td className="px-5 py-3.5">
                      <Link
                        to={`/job-cards/${jc.id}`}
                        className="font-mono text-xs font-semibold text-flame-400 hover:text-flame-300"
                      >
                        #{jc.id.slice(0, 8).toUpperCase()}
                      </Link>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="text-sm font-medium text-white">
                        {jc.customer?.name ?? "—"}
                      </p>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="text-sm text-ink-200">
                        {jc.vehicle
                          ? `${jc.vehicle.make} ${jc.vehicle.model}`
                          : "—"}
                      </p>
                      <p className="text-xs text-ink-400">
                        {jc.vehicle?.registrationNumber ?? ""}
                      </p>
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={jc.status} />
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="text-sm text-ink-300">
                        {formatDate(jc.createdAt)}
                      </p>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <p className="text-sm font-semibold text-white">
                        {formatCurrency(jc.totalAmount)}
                      </p>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          to={`/job-cards/${jc.id}`}
                          className="rounded-lg p-2 text-ink-400 transition hover:bg-ink-700 hover:text-sky-400"
                          title="View"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>

                       {jc.status === 0 && (
                        <Link to={`/job-cards/${jc.id}/edit`}>
                          <Button variant="ghost">
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </Link>
                      )}
                        {jc.status === 0 && (
                          <button
                            onClick={() => handleSendForApproval(jc)}
                            className="rounded-lg p-2 text-ink-400 transition hover:bg-ink-700 hover:text-emerald-400"
                            title="Send for approval"
                          >
                            <FileText className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => setToDelete(jc)}
                          className="rounded-lg p-2 text-ink-400 transition hover:bg-ink-700 hover:text-red-400"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="New job card"
        description="Fill in the job card's details."
        size="xl"
      >
        <JobCardForm
          customers={customers}
          vehicles={vehicles}
          mechanics={mechanics}
          onSubmit={handleCreate}
          onCancel={() => setModalOpen(false)}
          submitting={submitting}
        />
      </Modal>
      <ConfirmDialog
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete job card"
        message="Are you sure you want to delete this job card?"
      />
    </div>
  );
}
