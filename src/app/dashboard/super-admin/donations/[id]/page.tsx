"use client";

import Link from "next/link";
import { useEffect, useState, type ComponentType } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  HandHeart,
  MapPin,
  CalendarDays,
  Mail,
  Phone,
  Edit3,
  Trash2,
  CheckCircle2,
  Clock3,
  AlertTriangle,
  XCircle,
  Banknote,
  Package,
  Pill,
  ShoppingBag,
  Loader2,
} from "lucide-react";
import type { DonationItem, DonationStatus, DonationType } from "@/components/DonationCard";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function DonationDetailsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const [donation, setDonation] = useState<DonationItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchDonation = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_URL}/api/donations/${params.id}`, { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }});
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data?.message || "Failed to fetch donation");
        }

        setDonation(data);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Something went wrong";
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchDonation();
  }, [params.id]);

  const handleDelete = async () => {
    if (!donation) return;

    const ok = window.confirm("Are you sure you want to delete this donation?");
    if (!ok) return;

    try {
      setDeleting(true);

      const res = await fetch(`${API_URL}/api/donations/${donation._id}`, { method: "DELETE", headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || "Failed to delete donation");
      }

      router.push("/dashboard/super-admin/donations");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      setError(message);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center rounded-3xl border border-slate-200 bg-white p-16 shadow-sm">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
        <p className="mt-4 text-slate-600">Loading donation details...</p>
      </div>
    );
  }

  if (error || !donation) {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700">
        {error || "Donation not found"}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link
        href="/dashboard/super-admin/donations"
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-950"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to donations
      </Link>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="flex flex-col items-start gap-4 sm:flex-row">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-white">
              <HandHeart className="h-8 w-8" />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-3xl font-bold text-slate-950">{donation.donorName}</h1>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(donation.status)}`}>
                  {donation.status}
                </span>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getTypeClass(donation.type)}`}>
                  {donation.type}
                </span>
              </div>

              <div className="mt-4 flex flex-wrap gap-3">
                <InfoItem
                  icon={MapPin}
                  text={`${donation.shelter || "No shelter"}${donation.city ? `, ${donation.city}` : ""}`}
                />
                <InfoItem icon={Mail} text={donation.donorEmail || "No Email"} />
                <InfoItem icon={Phone} text={donation.phone || "No Phone"} />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 lg:min-w-56">
            <Link
              href={`/dashboard/super-admin/donations/${donation._id}/edit`}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              <Edit3 className="h-4 w-4" />
              Edit Donation
            </Link>

            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-300 bg-white px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Trash2 className="h-4 w-4" />
              {deleting ? "Deleting..." : "Remove Donation"}
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <StatCard label="Donation Value" value={donation.value.toString()} icon={getValueIcon(donation.type)} />
        <StatCard label="Unit" value={donation.unit} icon={Package} />
        <StatCard label="Submitted On" value={new Date(donation.createdAt).toLocaleDateString()} icon={CalendarDays} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
          <h2 className="text-xl font-bold text-slate-950">Donation Information</h2>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <InfoBox label="Donor Name" value={donation.donorName} />
            <InfoBox label="Email" value={donation.donorEmail || "—"} />
            <InfoBox label="Phone" value={donation.phone || "—"} />
            <InfoBox label="Type" value={donation.type} />
            <InfoBox label="Status" value={donation.status} />
            <InfoBox label="Shelter Assigned" value={donation.shelter || "—"} />
            <InfoBox label="City" value={donation.city || "—"} />
            <InfoBox label="Value & Unit" value={`${donation.value} ${donation.unit}`} />
            
            <div className="rounded-2xl bg-slate-50 p-4 md:col-span-2">
              <p className="text-sm text-slate-500">Notes & Comments</p>
              <p className="mt-1 font-semibold text-slate-950 whitespace-pre-wrap">
                {donation.notes || "No additional notes provided."}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-950">Status Guide</h2>
            <div className="mt-5 space-y-4 text-sm text-slate-700">
              <InfoItem icon={Clock3} text="Pending = Under review by admins" />
              <InfoItem icon={CheckCircle2} text="Approved = Ready for drop-off / coordination" />
              <InfoItem icon={HandHeart} text="Received = Shelter has the items/funds" />
              <InfoItem icon={XCircle} text="Rejected = Setup issue or invalid info" />
            </div>
          </div>

          <div className="rounded-3xl border border-blue-200 bg-blue-50 p-6 shadow-sm">
            <h3 className="text-xl font-bold text-blue-900">Communication</h3>
            <p className="mt-3 text-sm leading-6 text-blue-800">
              When updating a donation to <strong>Approved</strong> or <strong>Received</strong>, you may want to ensure the shelter and the donor are both aware of the status change.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function getStatusClass(status: DonationStatus) {
  switch (status) {
    case "Pending":
      return "bg-yellow-100 text-yellow-700";
    case "Approved":
      return "bg-emerald-100 text-emerald-700";
    case "Received":
      return "bg-blue-100 text-blue-700";
    case "Rejected":
      return "bg-rose-100 text-rose-700";
    default:
      return "bg-slate-200 text-slate-700";
  }
}

function getTypeClass(type: DonationType) {
  switch (type) {
    case "Cash":
      return "bg-green-100 text-green-700";
    case "Food":
      return "bg-orange-100 text-orange-700";
    case "Medicine":
      return "bg-cyan-100 text-cyan-700";
    case "Supplies":
      return "bg-purple-100 text-purple-700";
    default:
      return "bg-slate-200 text-slate-700";
  }
}

function getValueIcon(type: DonationType) {
  switch (type) {
    case "Cash":
      return Banknote;
    case "Medicine":
      return Pill;
    case "Food":
      return ShoppingBag;
    case "Supplies":
      return Package;
    default:
      return Package;
  }
}

function InfoItem({
  icon: Icon,
  text,
}: {
  icon: ComponentType<{ className?: string }>;
  text: string;
}) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1">
      <Icon className="h-4 w-4 shrink-0 text-slate-500" />
      <span className="truncate max-w-[200px] sm:max-w-xs">{text}</span>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: ComponentType<{ className?: string }>;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-600">{label}</p>
        <Icon className="h-5 w-5 text-slate-500" />
      </div>
      <p className="mt-3 text-2xl font-bold text-slate-950 truncate">{value}</p>
    </div>
  );
}

function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-1 font-semibold text-slate-950 truncate">{value}</p>
    </div>
  );
}