"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type ComponentType } from "react";

import {
  Building2,
  Search,
  Filter,
  MapPin,
  User,
  Dog,
  FileText,
  Package,
  CheckCircle2,
  Clock3,
  ShieldCheck,
  Plus,
  Eye,
  Edit3,
  AlertTriangle,
} from "lucide-react";

type ShelterStatus = "Active" | "Pending Approval" | "Under Review" | "Suspended";

type ShelterItem = {
  _id: string;
  name: string;
  city: string;
  adminName?: string;
  status: ShelterStatus;
  dogsCount: number;
  reportsCount: number;
  suppliesAlerts: number;
  address: string;
  createdAt: string;
};

const statusFilters = [
  "All",
  "Active",
  "Pending Approval",
  "Under Review",
  "Suspended",
] as const;

type StatusFilter = (typeof statusFilters)[number];

export default function SuperAdminSheltersPage() {
  const [shelters, setShelters] = useState<ShelterItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<StatusFilter>("All");

  useEffect(() => {
    const fetchShelters = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/shelters`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        const sheltersData = Array.isArray(data) ? data : (data.data || []);
        setShelters(sheltersData);
      } catch (error) {
        console.error("Failed to fetch shelters:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchShelters();
  }, []);

  const filteredShelters = useMemo(() => {
    return shelters.filter((shelter) => {
      const matchesSearch =
        shelter.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        shelter.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (shelter.adminName ?? "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        shelter.address.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        selectedStatus === "All" ? true : shelter.status === selectedStatus;

      return matchesSearch && matchesStatus;
    });
  }, [shelters, searchTerm, selectedStatus]);

  const stats = [
    {
      label: "Total Shelters",
      value: shelters.length,
      icon: Building2,
    },
    {
      label: "Active",
      value: shelters.filter((s) => s.status === "Active").length,
      icon: CheckCircle2,
    },
    {
      label: "Pending Review",
      value: shelters.filter(
        (s) => s.status === "Pending Approval" || s.status === "Under Review"
      ).length,
      icon: Clock3,
    },
    {
      label: "Suspended",
      value: shelters.filter((s) => s.status === "Suspended").length,
      icon: ShieldCheck,
    },
  ];

  const getStatusClass = (status: ShelterStatus) => {
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
  };

  if (loading) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        Loading shelters...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-950">Manage Shelters</h1>
          <p className="mt-2 text-sm text-slate-600">
            Add, review, edit, and monitor all shelters on the platform.
          </p>
        </div>

        <Link
          href="/dashboard/super-admin/shelters/new"
          className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          <Plus className="h-4 w-4" />
          Add Shelter
        </Link>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.label}
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-600">{item.label}</p>
                <Icon className="h-5 w-5 text-slate-500" />
              </div>
              <p className="mt-3 text-3xl font-bold text-slate-950">{item.value}</p>
            </div>
          );
        })}
      </div>

      {/* Search / filter */}
      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search shelters by name, city, admin, or address..."
              className="w-full rounded-2xl border border-slate-300 bg-white py-3 pl-12 pr-4 outline-none transition focus:border-slate-950"
            />
          </div>

          <div className="relative">
            <Filter className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as StatusFilter)}
              className="w-full rounded-2xl border border-slate-300 bg-white py-3 pl-12 pr-4 outline-none transition focus:border-slate-950"
            >
              {statusFilters.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* List */}
      <div className="space-y-4">
        {filteredShelters.length > 0 ? (
          filteredShelters.map((shelter) => (
            <div
              key={shelter._id}
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md"
            >
              <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-950 text-white">
                    <Building2 className="h-7 w-7" />
                  </div>

                  <div className="max-w-3xl">
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="text-2xl font-bold text-slate-950">
                        {shelter.name}
                      </h3>

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
                      Address:{" "}
                      <span className="font-semibold">{shelter.address}</span>
                    </p>

                    <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-600">
                      <InfoItem icon={MapPin} text={shelter.city} />
                      <InfoItem icon={Dog} text={`${shelter.dogsCount} dogs`} />
                      <InfoItem icon={FileText} text={`${shelter.reportsCount} reports`} />
                      <InfoItem icon={Package} text={`${shelter.suppliesAlerts} supply alerts`} />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-3 lg:min-w-56">
                  <Link
  href={`/dashboard/super-admin/shelters/${shelter._id}`}
  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
>
  <Eye className="h-4 w-4" />
  View Details
</Link>

                  <Link
                    href={`/dashboard/super-admin/shelters/${shelter._id}/edit`}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                  >
                    <Edit3 className="h-4 w-4" />
                    Edit Shelter
                  </Link>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 py-16 text-center">
            <Building2 className="mx-auto h-12 w-12 text-slate-400" />
            <h3 className="mt-4 text-xl font-semibold text-slate-950">
              No shelters found
            </h3>
          </div>
        )}
      </div>
    </div>
  );
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
      <Icon className="h-4 w-4 text-slate-500" />
      <span>{text}</span>
    </div>
  );
}