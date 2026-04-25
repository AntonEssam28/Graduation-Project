"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  MapPin,
  User,
  Dog,
  FileText,
  Package,
  CheckCircle2,
  Clock3,
  ShieldCheck,
  AlertTriangle,
  Edit3,
  Trash2,
} from "lucide-react";

type ShelterStatus = "Active" | "Pending Approval" | "Under Review" | "Suspended";

type ShelterItem = {
  _id: string;
  name: string;
  city: string;
  address: string;
  adminName?: string;
  status: ShelterStatus;
  dogsCount: number;
  reportsCount: number;
  suppliesAlerts: number;
  createdAt: string;
  updatedAt: string;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function ShelterDetailsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const [shelter, setShelter] = useState<ShelterItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchShelter = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_URL}/api/shelters/${params.id}`, { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }});
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data?.message || "Failed to fetch shelter");
        }

        setShelter(data);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Something went wrong";
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchShelter();
  }, [params.id]);

  const handleDelete = async () => {
    if (!shelter) return;

    const ok = window.confirm("Are you sure you want to delete this shelter?");
    if (!ok) return;

    try {
      setDeleting(true);

      const res = await fetch(`${API_URL}/api/shelters/${shelter._id}`, { method: "DELETE", headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || "Failed to delete shelter");
      }

      router.push("/dashboard/super-admin/shelters");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      setError(message);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        Loading shelter details...
      </div>
    );
  }

  if (error || !shelter) {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700">
        {error || "Shelter not found"}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link
        href="/dashboard/super-admin/shelters"
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-950"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to shelters
      </Link>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-950 text-white">
              <Building2 className="h-7 w-7" />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-3xl font-bold text-slate-950">
                  {shelter.name}
                </h1>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(
                    shelter.status
                  )}`}
                >
                  {shelter.status}
                </span>
              </div>

              <p className="mt-2 text-sm text-slate-600">
                Admin:{" "}
                <span className="font-semibold">
                  {shelter.adminName || "No admin assigned"}
                </span>
              </p>

              <p className="mt-2 text-sm text-slate-600">
                Address: <span className="font-semibold">{shelter.address}</span>
              </p>

              <div className="mt-4 flex flex-wrap gap-3">
                <InfoItem icon={MapPin} text={shelter.city} />
                <InfoItem icon={Dog} text={`${shelter.dogsCount} dogs`} />
                <InfoItem
                  icon={FileText}
                  text={`${shelter.reportsCount} reports`}
                />
                <InfoItem
                  icon={Package}
                  text={`${shelter.suppliesAlerts} supply alerts`}
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 lg:min-w-56">
            <Link
              href={`/dashboard/super-admin/shelters/${shelter._id}/edit`}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              <Edit3 className="h-4 w-4" />
              Edit Shelter
            </Link>

            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-300 bg-white px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Trash2 className="h-4 w-4" />
              {deleting ? "Deleting..." : "Remove Shelter"}
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Dogs"
          value={shelter.dogsCount}
          icon={Dog}
        />
        <StatCard
          label="Reports"
          value={shelter.reportsCount}
          icon={FileText}
        />
        <StatCard
          label="Supply Alerts"
          value={shelter.suppliesAlerts}
          icon={Package}
        />
        <StatCard
          label="Status"
          value={shelter.status}
          icon={ShieldCheck}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
          <h2 className="text-xl font-bold text-slate-950">Shelter Information</h2>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <InfoBox label="Shelter Name" value={shelter.name} />
            <InfoBox label="City" value={shelter.city} />
            <InfoBox label="Admin Name" value={shelter.adminName || "—"} />
            <InfoBox label="Status" value={shelter.status} />
            <div className="rounded-2xl bg-slate-50 p-4 md:col-span-2">
              <p className="text-sm text-slate-500">Address</p>
              <p className="mt-1 font-semibold text-slate-950">
                {shelter.address}
              </p>
            </div>
            <InfoBox
              label="Created At"
              value={new Date(shelter.createdAt).toLocaleString()}
            />
            <InfoBox
              label="Updated At"
              value={new Date(shelter.updatedAt).toLocaleString()}
            />
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-950">Status Guide</h2>
          <div className="mt-5 space-y-4 text-sm text-slate-700">
            <InfoItem icon={CheckCircle2} text="Active = live and operating normally" />
            <InfoItem icon={Clock3} text="Pending Approval = waiting approval" />
            <InfoItem icon={ShieldCheck} text="Under Review = admin checking details" />
            <InfoItem
              icon={AlertTriangle}
              text="Suspended = temporarily hidden"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function getStatusClass(status: ShelterStatus) {
  switch (status) {
    case "Active":
      return "bg-emerald-100 text-emerald-700";
    case "Pending Approval":
      return "bg-amber-100 text-amber-700";
    case "Under Review":
      return "bg-blue-100 text-blue-700";
    case "Suspended":
      return "bg-red-100 text-red-700";
    default:
      return "bg-slate-200 text-slate-700";
  }
}

function InfoItem({
  icon: Icon,
  text,
}: {
  icon: React.ComponentType<{ className?: string }>;
  text: string;
}) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1">
      <Icon className="h-4 w-4 text-slate-500" />
      <span>{text}</span>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number | string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-600">{label}</p>
        <Icon className="h-5 w-5 text-slate-500" />
      </div>
      <p className="mt-3 text-3xl font-bold text-slate-950">{value}</p>
    </div>
  );
}

function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-1 font-semibold text-slate-950">{value}</p>
    </div>
  );
}