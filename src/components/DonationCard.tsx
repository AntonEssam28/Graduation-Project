import Link from "next/link";
import { Trash2, Edit3, Eye, MapPin, FileText } from "lucide-react";
import type { ComponentType } from "react";

export type DonationStatus = "Pending" | "Approved" | "Received" | "Rejected";
export type DonationType = "Cash" | "Food" | "Medicine" | "Supplies";

export interface DonationItem {
  _id: string;
  donorName: string;
  donorEmail: string;
  phone: string;
  type: DonationType;
  value: number;
  unit: string;
  shelter: string;
  city: string;
  status: DonationStatus;
  createdAt: string;
  notes: string;
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

export default function DonationCard({ donation, onDelete }: { donation: DonationItem; onDelete: (id: string) => void }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-950 text-white">
            <Eye className="h-7 w-7" />
          </div>
          <div className="max-w-3xl">
            <h3 className="text-2xl font-bold text-slate-950">{donation.donorName}</h3>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(donation.status)}`}>
              {donation.status}
            </span>
            <p className="mt-2 text-sm text-slate-600">
              {donation.type}: {donation.value} {donation.unit}
            </p>
            <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-600">
              <InfoItem icon={MapPin} text={`${donation.shelter}, ${donation.city}`} />
              <InfoItem icon={FileText} text={donation.notes ? donation.notes.slice(0, 30) + "…" : "—"} />
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-3 lg:min-w-56">
          <Link
            href={`/dashboard/super-admin/donations/${donation._id}`}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
          >
            <Eye className="h-4 w-4" />
            View Details
          </Link>
          <Link
            href={`/dashboard/super-admin/donations/${donation._id}/edit`}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            <Edit3 className="h-4 w-4" />
            Edit
          </Link>
          <button
            type="button"
            onClick={() => onDelete(donation._id)}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-300 bg-white px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
            Remove
          </button>
        </div>
      </div>
    </div>
  );
}

function InfoItem({ icon: Icon, text }: { icon: ComponentType<{ className?: string }>; text: string }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1">
      <Icon className="h-4 w-4 text-slate-500" />
      <span>{text}</span>
    </div>
  );
}
