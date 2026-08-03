import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { ArrowLeft, ClipboardList } from "lucide-react";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { PageLoader } from "../components/ui/Spinner";
import { EmptyState } from "../components/ui/EmptyState";
import { useToast } from "../components/ui/Toast";
import {
  JobCardForm,
  type JobCardFormValues,
} from "../components/forms/JobCardForm";
import {
  getJobCard,
  updateJobCard,
  type JobCardWithRelations,
} from "../services/jobCards";
import { listCustomers } from "../services/customers";
import { listVehicles } from "../services/vehicles";
import { listMechanics } from "../services/mechanics";

import type { Customer, Vehicle, Part, Mechanic } from "../types";

export function JobCardEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const [jobCard, setJobCard] = useState<JobCardWithRelations | null>(null);
  const [parts, setParts] = useState<Part[]>([]);
  const [mechanics, setMechanics] = useState<Mechanic[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    try {
      const [jc, c, v, m] = await Promise.all([
        getJobCard(id),
        listCustomers(),
        listVehicles(),
        listMechanics(),
      ]);

      setJobCard(jc);
      setParts(jc?.parts ?? []);
      setCustomers(c);
      setVehicles(v);
      setMechanics(m);
    } catch (err) {
      toast.error("Failed to load job card");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [id, toast]);

  useEffect(() => {
    load();
  }, [load]);

  const handleSubmit = async (values: JobCardFormValues) => {
    if (!id) return;
    setSubmitting(true);
    try {
      const partsTotal = values.parts.reduce(
        (s, p) => s + (p.total || 0),
        0,
      );
      const totalAmount = Number((values.labourCharge + partsTotal).toFixed(2));
      await updateJobCard(id, {
        customerId: values.customerId,
        vehicleId: values.vehicleId,
        mechanicId: values.mechanicId,
        description: values.description,
        labourCharge: values.labourCharge,
        totalAmount: totalAmount,
      });
      toast.success("Job card updated successfully");
      navigate(`/job-cards/${id}`);
    } catch (err) {
      toast.error("Failed to update job card");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <PageLoader label="Loading job card..." />;
  if (!jobCard)
    return (
      <Card>
        <EmptyState
          icon={<ClipboardList className="h-7 w-7" />}
          title="Job card not found"
          action={
            <Link to="/job-cards">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
            </Link>
          }
        />
      </Card>
    );

  return (
    <div className="space-y-5">
      <Link to={`/job-cards/${id}`}>
        <Button variant="ghost" size="sm">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
      </Link>
      <Card className="p-6">
        <h2 className="mb-1 font-display text-lg font-bold text-white">
          Edit job card
        </h2>
        <p className="mb-5 text-sm text-ink-400">
          Job Card #{jobCard.id.slice(0, 8).toUpperCase()}
        </p>
        <JobCardForm
          initial={{
            id: jobCard.id,
            customerId: jobCard.customerId,
            vehicleId: jobCard.vehicleId,
            mechanicId: jobCard.mechanicId,
            description: jobCard.description,
            labourCharge: jobCard.labourCharge,
            note: "",
            parts: parts.map((p) => ({
              id: p.id,
              description: p.description,
              quantity: p.quantity,
              unitPrice: p.unitPrice,
              total: p.total,
            })),
          }}
          customers={customers}
          vehicles={vehicles}
          mechanics={mechanics}
          onSubmit={handleSubmit}
          onCancel={() => navigate(`/job-cards/${id}`)}
          submitting={submitting}
        />
      </Card>
    </div>
  );
}
