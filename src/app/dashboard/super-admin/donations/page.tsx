"use client"

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Search, Filter, Plus, Loader2 } from "lucide-react";
import DonationCard from "@/components/DonationCard";
import type { DonationItem, DonationStatus } from "@/components/DonationCard";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function SuperAdminDonationsPage() {
  const [donations, setDonations] = useState<DonationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<DonationStatus | "All">("All");
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDonations = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_URL}/api/donations`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.message || "Failed to fetch donations");
        setDonations(data);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
    };
    fetchDonations();
  }, []);

  const filteredDonations = useMemo(() => {
    return donations.filter((don) => {
      const q = searchTerm.toLowerCase();
      const matchesSearch =
        don.donorName.toLowerCase().includes(q) ||
        don.type.toLowerCase().includes(q) ||
        don.shelter.toLowerCase().includes(q) ||
        don.city.toLowerCase().includes(q) ||
        don.notes.toLowerCase().includes(q);
      const matchesStatus = selectedStatus === "All" ? true : don.status === selectedStatus;
      return matchesSearch && matchesStatus;
    });
  }, [donations, searchTerm, selectedStatus]);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this donation?")) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/donations/${id}`, { 
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Failed to delete donation");
      setDonations((prev) => prev.filter((d) => d._id !== id));
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Something went wrong");
    }
  };

  if (loading) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2 text-slate-600">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading donations...
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-950">Manage Donations</h1>
          <p className="mt-2 text-sm text-slate-600">Search, filter, and monitor all donations.</p>
        </div>
        <Link
          href="/dashboard/super-admin/donations/add"
          className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          <Plus className="h-4 w-4" /> Add Donation
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {/* Stats placeholder – can be expanded later */}
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="relative lg:col-span-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by donor, type, shelter..."
              className="w-full rounded-2xl border border-slate-300 bg-white py-3 pl-12 pr-4 outline-none transition focus:border-slate-950"
            />
          </div>
          <div className="relative">
            <Filter className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as any)}
              className="w-full rounded-2xl border border-slate-300 bg-white py-3 pl-12 pr-4 outline-none transition focus:border-slate-950"
            >
              <option value="All">All</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Received">Received</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {filteredDonations.length > 0 ? (
          filteredDonations.map((don) => (
            <DonationCard key={don._id} donation={don} onDelete={handleDelete} />
          ))
        ) : (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 py-16 text-center">
            <p className="mt-4 text-xl font-semibold text-slate-950">No donations found</p>
          </div>
        )}
      </div>
    </div>
  );
}