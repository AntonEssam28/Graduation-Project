"use client";

import Link from "next/link";
import { useMemo, useState, useEffect } from "react";
import {
  Search,
  Filter,
  FileText,
  CalendarDays,
  Dog,
  HeartHandshake,
  CheckCircle2,
  Clock3,
  MapPin,
  ArrowRight,
  XCircle,
  HandCoins,
  ShoppingBag,
} from "lucide-react";

type RequestType = "Adoption" | "Hosting" | "Donation" | "Supply Order";
type RequestStatus = "Pending" | "In Review" | "Approved" | "Rejected";

type RequestItem = {
  _id: string;
  type: RequestType;
  title?: string;
  requesterName: string;
  dogId: any; // Can be string ID or populated object with .name
  shelter: string;
  createdAt: string;
  status: RequestStatus;
  message?: string;
};


const requestTypes = ["All", "Adoption", "Hosting", "Donation", "Supply Order"] as const;

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function ShelterAdminRequestsPage() {
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] =
    useState<(typeof requestTypes)[number]>("All");

  const fetchRequests = async () => {
    try {
      const res = await fetch(`${API_URL}/api/requests`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      const data = await res.json();
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const filtered = Array.isArray(data) 
        ? data.filter((item: any) => {
            if (item.type === "Activation" || item.type === "Suspension") return false;
            if (!user.assignedShelter) return true;
            return (item.shelter || "").trim().toLowerCase() === user.assignedShelter.trim().toLowerCase();
          }) 
        : [];
      setRequests(filtered);
    } catch (err) {
      console.error("Failed to fetch requests", err);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const filteredRequests = useMemo(() => {
    return requests.filter((request) => {
      const matchesSearch =
        (request.title || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (request.requesterName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (request.dogId?.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (request.shelter || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (request.message || "").toLowerCase().includes(searchTerm.toLowerCase());

      const matchesType =
        selectedType === "All" ? true : request.type === selectedType;

      return matchesSearch && matchesType;
    });
  }, [requests, searchTerm, selectedType]);

  const stats = [
    {
      label: "Total Requests",
      value: requests.length,
      icon: FileText,
    },
    {
      label: "Pending",
      value: requests.filter((r) => r.status === "Pending").length,
      icon: Clock3,
    },
    {
      label: "In Review",
      value: requests.filter((r) => r.status === "In Review").length,
      icon: HeartHandshake,
    },
    {
      label: "Approved",
      value: requests.filter((r) => r.status === "Approved").length,
      icon: CheckCircle2,
    },
  ];

  const getStatusClass = (status: RequestStatus) => {
    switch (status) {
      case "Pending":
        return "bg-amber-100 text-amber-700";
      case "In Review":
        return "bg-blue-100 text-blue-700";
      case "Approved":
        return "bg-emerald-100 text-emerald-700";
      case "Rejected":
        return "bg-red-100 text-red-700";
      default:
        return "bg-slate-200 text-slate-700";
    }
  };

  const getTypeClass = (type: RequestType) => {
    if (type === "Adoption") return "bg-slate-100 text-slate-700";
    if (type === "Donation") return "bg-amber-100 text-amber-700";
    if (type === "Supply Order") return "bg-indigo-100 text-indigo-700";
    return "bg-emerald-100 text-emerald-700";
  };

  const getNextAction = (status: RequestStatus) => {
    switch (status) {
      case "Pending":
        return { label: "Start Review", nextStatus: "In Review" as const };
      case "In Review":
        return { label: "Approve", nextStatus: "Approved" as const };
      case "Approved":
      case "Rejected":
      default:
        return null;
    }
  };

  const updateStatus = async (id: string, nextStatus: RequestStatus) => {
    try {
      const res = await fetch(`${API_URL}/api/requests/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (res.ok) {
        setRequests((prev) =>
          prev.map((request) =>
            request._id === id ? { ...request, status: nextStatus } : request
          )
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
          <h1 className="text-3xl font-bold text-slate-950">Requests</h1>
          <p className="mt-2 text-sm text-slate-600">
            Manage adoption and hosting requests for your shelter.
          </p>
        </div>

        <Link
          href="/dashboard/shelter-admin/dogs"
          className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          <Dog className="h-4 w-4" />
          Go to Dogs
        </Link>
      </div>

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
              placeholder="Search by requester, dog, city, or notes..."
              className="w-full rounded-2xl border border-slate-300 bg-white py-3 pl-12 pr-4 outline-none transition focus:border-slate-950"
            />
          </div>

          <div className="relative">
            <Filter className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <select
              value={selectedType}
              onChange={(e) =>
                setSelectedType(e.target.value as (typeof requestTypes)[number])
              }
              className="w-full rounded-2xl border border-slate-300 bg-white py-3 pl-12 pr-4 outline-none transition focus:border-slate-950"
            >
              {requestTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {filteredRequests.length > 0 ? (
          filteredRequests.map((request) => {
            const nextAction = getNextAction(request.status);

            return (
              <div
                key={request._id}
                className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md"
              >
                <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                  <div className="flex items-start gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-950 text-white">
                      {request.type === "Adoption" ? (
                        <Dog className="h-7 w-7" />
                      ) : request.type === "Donation" ? (
                        <HandCoins className="h-7 w-7 text-amber-400" />
                      ) : request.type === "Supply Order" ? (
                        <ShoppingBag className="h-7 w-7 text-indigo-400" />
                      ) : (
                        <HeartHandshake className="h-7 w-7" />
                      )}
                    </div>

                    <div className="max-w-3xl">
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="text-2xl font-bold text-slate-950">
                          {request.title || `${request.type} Request`}
                        </h3>

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${getTypeClass(
                            request.type
                          )}`}
                        >
                          {request.type}
                        </span>

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(
                            request.status
                          )}`}
                        >
                          {request.status}
                        </span>
                      </div>

                      <p className="mt-2 text-sm text-slate-600">
                        Requested by{" "}
                        <span className="font-semibold">{request.requesterName}</span>
                      </p>

                      {request.type !== "Donation" && request.type !== "Supply Order" && (
                        <p className="mt-2 text-sm text-slate-600">
                          Dog: <span className="font-semibold">{request.dogId?.name || "N/A"}</span>
                        </p>
                      )}

                      <p className="mt-3 text-sm leading-6 text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <span className="font-bold text-slate-900 block mb-1">Details:</span>
                        {request.message}
                      </p>

                      <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-600">
                        <InfoItem icon={MapPin} text={request.shelter} />
                        <InfoItem
                          icon={CalendarDays}
                          text={`Submitted on ${new Date(request.createdAt).toLocaleDateString()}`}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 lg:min-w-52">
                    <Link
                      href={`/dashboard/shelter-admin/requests/${request._id}`}
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
                    >
                      <FileText className="h-4 w-4" />
                      View Details
                    </Link>

                    {nextAction ? (
                      <button
                        onClick={() => updateStatus(request._id, nextAction.nextStatus)}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                      >
                        {nextAction.label}
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    ) : (
                      <button
                        disabled
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-200 px-4 py-3 text-sm font-semibold text-slate-500"
                      >
                        Closed
                      </button>
                    )}

                    {request.status === "Pending" || request.status === "In Review" ? (
                      <button
                        onClick={() => updateStatus(request._id, "Rejected")}
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 transition hover:bg-red-100"
                      >
                        <XCircle className="h-4 w-4" />
                        Reject
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 py-16 text-center">
            <FileText className="mx-auto h-12 w-12 text-slate-400" />
            <h3 className="mt-4 text-xl font-semibold text-slate-950">
              No requests found
            </h3>
            <p className="mt-2 text-sm text-slate-600">
              Try another search term or change the filter.
            </p>
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