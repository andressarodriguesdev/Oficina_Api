import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ClipboardList,
  Clock,
  CheckCircle2,
  DollarSign,
  TrendingUp,
  Users,
  Car,
  ArrowRight,
} from "lucide-react";
import { Card } from "../components/ui/Card";
import { StatusBadge } from "../components/ui/StatusBadge";
import { PageLoader } from "../components/ui/Spinner";
import { EmptyState } from "../components/ui/EmptyState";
import { listJobCards, type JobCardWithRelations } from "../services/jobCards";
import { listCustomers } from "../services/customers";
import { listVehicles } from "../services/vehicles";
import { formatCurrency, formatDate } from "../utils/format";
import { useToast } from "../components/ui/Toast";
import { Select } from "../components/ui/Select";

export function Dashboard() {
  const toast = useToast();
  const [jobCards, setJobCards] = useState<JobCardWithRelations[]>([]);
  const [customerCount, setCustomerCount] = useState(0);
  const [vehicleCount, setVehicleCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("all");

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [jc, customers, vehicles] = await Promise.all([
          listJobCards(),
          listCustomers(),
          listVehicles(),
        ]);
        if (!active) return;
        setJobCards(jc);
        setCustomerCount(customers.length);
        setVehicleCount(vehicles.length);
      } catch (err) {
        toast.error("Failed to load dashboard data");
        console.error(err);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [toast]);

  if (loading) return <PageLoader label="Loading dashboard..." />;

  const filteredJobCards = jobCards.filter((jc) => {
    if (period === "all") return true;

    const jobCardDate = new Date(jc.createdAt);
    const today = new Date();

    const todayNoTime = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
    );

    const dateNoTime = new Date(
      jobCardDate.getFullYear(),
      jobCardDate.getMonth(),
      jobCardDate.getDate(),
    );

    if (period === "today") {
      return dateNoTime.getTime() === todayNoTime.getTime();
    }

    if (period === "7days") {
      const limit = new Date(todayNoTime);
      limit.setDate(limit.getDate() - 7);

      return dateNoTime >= limit;
    }

    if (period === "30days") {
      const limit = new Date(todayNoTime);
      limit.setDate(limit.getDate() - 30);

      return dateNoTime >= limit;
    }

    return true;
  });

  const open = filteredJobCards.filter((o) => o.status === 0).length;

  const awaitingApproval = filteredJobCards.filter((o) => o.status === 1).length;

  const completed = filteredJobCards.filter((o) => o.status === 4).length;

  const revenue = filteredJobCards
    .filter((o) => o.status === 4)
    .reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);

const recent = [...filteredJobCards]
  .sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )
  .slice(0, 6);

  const stats = [
    {
      label: "Open Job Cards",
      value: open,
      icon: ClipboardList,
      tone: "text-flame-400",
      bg: "bg-flame-500/10",
    },
    {
      label: "Awaiting Approval",
      value: awaitingApproval,
      icon: Clock,
      tone: "text-amber-400",
      bg: "bg-amber-500/10",
    },
    {
      label: "Completed",
      value: completed,
      icon: CheckCircle2,
      tone: "text-emerald-400",
      bg: "bg-emerald-500/10",
    },
    {
      label: "Revenue",
      value: formatCurrency(revenue),
      icon: DollarSign,
      tone: "text-sky-400",
      bg: "bg-sky-500/10",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label} hover className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">
                    {s.label}
                  </p>
                  <p className="mt-2 font-display text-2xl font-bold text-white">
                    {s.value}
                  </p>
                </div>
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-xl ${s.bg}`}
                >
                  <Icon className={`h-6 w-6 ${s.tone}`} />
                </div>
              </div>
            </Card>
          );
        })}
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          {
            label: "Customers",
            value: customerCount,
            icon: Users,
            tone: "text-ink-300",
          },
          {
            label: "Vehicles",
            value: vehicleCount,
            icon: Car,
            tone: "text-ink-300",
          },
          {
            label: "Total job cards",
            value: filteredJobCards.length,
            icon: TrendingUp,
          },

        ].map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label} className="p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-ink-800 text-ink-300">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">
                    {s.label}
                  </p>
                  <p className="font-display text-xl font-bold text-white">
                    {s.value}
                  </p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
      <Card>
        <div className="flex items-center justify-between border-b border-ink-700/60 px-5 py-4">
          <div>
            <h3 className="font-display text-base font-bold text-white">
              Recent Job Cards
            </h3>

            <p className="mt-0.5 text-sm text-ink-400">
              Track the most recent jobs
            </p>
          </div>

          <div className="flex items-end gap-4">
            <div className="w-44">
              <Select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
              >
                <option value="all">All</option>
                <option value="today">Today</option>
                <option value="7days">Last 7 days</option>
                <option value="30days">Last 30 days</option>
              </Select>
            </div>

            <Link
              to="/job-cards"
              className="mb-2 inline-flex items-center gap-1.5 text-sm font-semibold text-flame-400 transition hover:text-flame-300"
            >
              View all
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
        {recent.length === 0 ? (
          <EmptyState
            icon={<ClipboardList className="h-7 w-7" />}
            title="No job cards"
            description="Create the first job card to get started."
            action={
              <Link
                to="/job-cards"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-flame-400"
              >
                Create job card <ArrowRight className="h-4 w-4" />
              </Link>
            }
          />
        ) : (
          <div className="divide-y divide-ink-700/40">
            {recent.map((jc) => (
              <Link
                key={jc.id}
                to={`/job-cards/${jc.id}`}
                className="flex items-center justify-between gap-4 px-5 py-3.5 transition hover:bg-ink-800/40"
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white">
                    Job Card #{jc.id.substring(0, 6)}
                  </p>

                  <p className="mt-0.5 truncate text-xs text-ink-400">
                    {jc.customer?.name ?? "—"} ·{" "}
                    {jc.vehicle
                      ? `${jc.vehicle.make} ${jc.vehicle.model}`
                      : "—"}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <span className="hidden text-xs text-ink-400 sm:block">
                    {formatDate(jc.createdAt)}
                  </span>
                  <StatusBadge status={jc.status} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
