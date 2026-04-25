"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Dog,
  FileText,
  Filter,
  HeartHandshake,
  MapPin,
  PawPrint,
  Search,
  CalendarDays,
  ArrowRight,
  Camera,
  Users,
} from "lucide-react";

type ReportStatus = "New" | "Assigned" | "In Progress" | "Resolved" | "Closed";
type ReportPriority = "Low" | "Medium" | "High" | "Critical";

type ReportItem = {
  _id: string;
  title: string;
  location: string;
  city?: string;
  reporterName?: string;
  createdAt: string;
  priority?: ReportPriority;
  status: ReportStatus;
  description: string;
  dogCondition?: string;
  photoAvailable?: boolean;
  shelter?: string;
  isGlobal?: boolean;
};

const statusFilters = [
  "All",
  "New",
  "Assigned",
  "In Progress",
  "Resolved",
  "Closed",
] as const;

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function ShelterAdminReportsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] =
    useState<(typeof statusFilters)[number]>("All");
  const [reports, setReports] = useState<ReportItem[]>([]);

  const fetchReports = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const url = user.assignedShelter 
        ? `${API_URL}/api/reports?shelter=${encodeURIComponent(user.assignedShelter)}`
        : `${API_URL}/api/reports`;

      const res = await fetch(url, { 
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      const data = await res.json();
      
      // Backend now handles the "your shelter OR global" logic via $or if shelter param is passed,
      // but let's double check if we need extra filtering here or if we trust backend.
      // Based on my recent change to the backend, it returns (shelter || global) if shelter query is present.
      
      setReports(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch reports", err);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const filteredReports = useMemo(() => {
    return reports.filter((report) => {
      const matchesSearch =
        (report.title || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (report.location || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (report.city || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (report.reporterName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (report.description || "").toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        selectedStatus === "All" ? true : report.status === selectedStatus;

      return matchesSearch && matchesStatus;
    });
  }, [reports, searchTerm, selectedStatus]);

  const stats = [
    {
      label: "Total Reports",
      value: reports.length,
      icon: FileText,
    },
    {
      label: "New",
      value: reports.filter((r) => r.status === "New").length,
      icon: Clock3,
    },
    {
      label: "Critical",
      value: reports.filter((r) => r.priority === "Critical").length,
      icon: AlertTriangle,
    },
    {
      label: "Resolved",
      value: reports.filter((r) => r.status === "Resolved").length,
      icon: CheckCircle2,
    },
  ];

  const getStatusClass = (status: ReportStatus) => {
    switch (status) {
      case "New":
        return "bg-amber-100 text-amber-700";
      case "Assigned":
        return "bg-blue-100 text-blue-700";
      case "In Progress":
        return "bg-purple-100 text-purple-700";
      case "Resolved":
        return "bg-emerald-100 text-emerald-700";
      case "Closed":
        return "bg-slate-200 text-slate-700";
      default:
        return "bg-slate-200 text-slate-700";
    }
  };

  const getPriorityClass = (priority: ReportPriority) => {
    switch (priority) {
      case "Low":
        return "bg-slate-100 text-slate-700";
      case "Medium":
        return "bg-blue-100 text-blue-700";
      case "High":
        return "bg-orange-100 text-orange-700";
      case "Critical":
        return "bg-red-100 text-red-700";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  const updateStatus = async (id: string, status: ReportStatus) => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const report = reports.find(r => r._id === id);
      
      const body: any = { status };
      
      // If the report is global and unassigned, assign it to this shelter when they take action
      if (report?.isGlobal && !report.shelter && user.assignedShelter) {
        body.shelter = user.assignedShelter;
      }

      const res = await fetch(`${API_URL}/api/reports/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        const updatedReport = await res.json();
        setReports((prev) =>
          prev.map((r) => (r._id === id ? { ...r, ...updatedReport } : r))
        );
      }
    } catch (error) {
      console.error("Failed to update status", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-950">Stray Dog Reports</h1>
          <p className="mt-2 text-sm text-slate-600">
            Review and manage all stray dog reports for your shelter.
          </p>
        </div>

        <Link
          href="/dashboard/shelter-admin/dogs/add"
          className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          <Dog className="h-4 w-4" />
          Add Dog
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

      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by title, location, city, reporter..."
              className="w-full rounded-2xl border border-slate-300 bg-white py-3 pl-12 pr-4 outline-none transition focus:border-slate-950"
            />
          </div>

          <div className="relative">
            <Filter className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <select
              value={selectedStatus}
              onChange={(e) =>
                setSelectedStatus(e.target.value as (typeof statusFilters)[number])
              }
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

      <div className="space-y-4">
        {filteredReports.length > 0 ? (
          filteredReports.map((report) => (
            <div
              key={report._id}
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md"
            >
              <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-950 text-white">
                    <PawPrint className="h-7 w-7" />
                  </div>

                  <div className="max-w-3xl">
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="text-2xl font-bold text-slate-950">
                        {report.title}
                      </h3>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${getPriorityClass(
                          report.priority || "Medium"
                        )}`}
                      >
                        {report.priority || "Medium"}
                      </span>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(
                          report.status
                        )}`}
                      >
                        {report.status}
                      </span>
                    </div>

                    <p className="mt-2 text-sm text-slate-600">
                      Reported by <span className="font-semibold">{report.reporterName || "Unknown"}</span>
                    </p>

                    <p className="mt-3 text-sm leading-6 text-slate-600">
                      {report.description}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-600">
                      <InfoItem icon={MapPin} text={`${report.location}, ${report.city || "Unknown City"}`} />
                      <InfoItem icon={CalendarDays} text={`Submitted on ${new Date(report.createdAt).toLocaleDateString()}`} />
                      <InfoItem
                        icon={Camera}
                        text={report.photoAvailable ? "Photo attached" : "No photo attached"}
                      />
                      <InfoItem icon={HeartHandshake} text={report.dogCondition || "Condition unknown"} />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-3 lg:min-w-56">
                  <Link
                    href={`/dashboard/shelter-admin/reports/${report._id}`}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
                  >
                    <FileText className="h-4 w-4" />
                    View Details
                  </Link>

                  {report.status === "New" && !report.shelter && (
                    <button
                      onClick={() => updateStatus(report._id, "Assigned")}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      Approve & Accept Case
                    </button>
                  )}

                  {report.shelter && JSON.parse(localStorage.getItem("user") || "{}").assignedShelter !== report.shelter && (
                    <div className="rounded-xl bg-slate-100 p-4 text-center">
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Handled By</p>
                      <p className="mt-1 text-sm font-bold text-slate-900">{report.shelter}</p>
                    </div>
                  )}

                  {(report.status === "New" || report.status === "Assigned") && 
                   (report.shelter === JSON.parse(localStorage.getItem("user") || "{}").assignedShelter || !report.shelter) && (
                    <button
                      onClick={() => updateStatus(report._id, "Assigned")}
                      className={`inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 ${report.shelter && JSON.parse(localStorage.getItem("user") || "{}").assignedShelter !== report.shelter ? "hidden" : ""}`}
                    >
                      Assign Team
                    </button>
                  )}

                  {(report.status === "New" || report.status === "Assigned") && 
                   (report.shelter === JSON.parse(localStorage.getItem("user") || "{}").assignedShelter || !report.shelter) && (
                    <button
                      onClick={() => updateStatus(report._id, "In Progress")}
                      className={`inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100 ${report.shelter && JSON.parse(localStorage.getItem("user") || "{}").assignedShelter !== report.shelter ? "hidden" : ""}`}
                    >
                      Start Rescue
                    </button>
                  )}

                  {(report.status === "Assigned" || report.status === "In Progress") && 
                   report.shelter === JSON.parse(localStorage.getItem("user") || "{}").assignedShelter && (
                    <button
                      onClick={() => updateStatus(report._id, "Resolved")}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
                    >
                      Mark Resolved
                    </button>
                  )}

                  {report.status !== "Closed" && 
                   (report.shelter === JSON.parse(localStorage.getItem("user") || "{}").assignedShelter || !report.shelter) && (
                    <button
                      onClick={() => updateStatus(report._id, "Closed")}
                      className={`inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100 ${report.shelter && JSON.parse(localStorage.getItem("user") || "{}").assignedShelter !== report.shelter ? "hidden" : ""}`}
                    >
                      Close Report
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 py-16 text-center">
            <FileText className="mx-auto h-12 w-12 text-slate-400" />
            <h3 className="mt-4 text-xl font-semibold text-slate-950">
              No reports found
            </h3>
            <p className="mt-2 text-sm text-slate-600">
              Try another search term or change the filter.
            </p>
          </div>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
          <h3 className="text-xl font-bold text-slate-950">Priority Guide</h3>
          <div className="mt-5 space-y-4 text-sm text-slate-700">
            <InfoItem icon={AlertTriangle} text="Critical = immediate danger or injury" />
            <InfoItem icon={Clock3} text="High = should be checked soon" />
            <InfoItem icon={Dog} text="Medium = normal rescue case" />
            <InfoItem icon={CheckCircle2} text="Low = safe but needs review" />
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-xl font-bold text-slate-950">What to check</h3>
          <div className="mt-5 space-y-4 text-sm text-slate-700">
            <InfoItem icon={MapPin} text="Exact location and landmark" />
            <InfoItem icon={Camera} text="Photo for quick identification" />
            <InfoItem icon={Users} text="Who reported the case" />
            <InfoItem icon={HeartHandshake} text="Dog condition and urgency" />
          </div>
        </div>

        <div className="rounded-3xl border border-amber-200 bg-amber-50 p-6 shadow-sm">
          <h3 className="text-xl font-bold text-amber-900">Next step</h3>
          <p className="mt-3 text-sm leading-6 text-amber-800">
            Efficient case management saves lives. Ensure teams are assigned quickly.
          </p>
          <Link
            href="/dashboard/shelter-admin/dogs"
            className="mt-5 inline-flex items-center justify-center rounded-xl bg-amber-500 px-4 py-3 font-semibold text-white transition hover:bg-amber-600"
          >
            Go to Dogs
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
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