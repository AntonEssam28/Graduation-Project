"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  HandCoins,
  Gift,
  Package,
  CalendarDays,
  BadgeDollarSign,
  Loader2,
  Info,
  ArrowRight,
  LayoutDashboard,
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function UserDonationsPage() {
  const [donations, setDonations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState("All");

  const fetchDonations = async () => {
    const userStr = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    if (!userStr || !token) return;

    const user = JSON.parse(userStr);
    const email = user.email;

    try {
      const res = await fetch(`${API_URL}/api/donations`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      const myDonations = (Array.isArray(data) ? data : (data.data || [])).filter((d: any) => d.donorEmail === email);
      setDonations(myDonations);
    } catch (err) {
      console.error("Failed to fetch donations", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonations();
  }, []);

  const filteredDonations = useMemo(() => {
    return donations.filter((donation) =>
      selectedFilter === "All" ? true : donation.type === selectedFilter
    );
  }, [donations, selectedFilter]);

  const totalCash = donations
    .filter((d) => d.type === "Cash" && d.status === "Approved")
    .reduce((sum, d) => sum + (d.value || 0), 0);

  const stats = [
    { label: "Total Contributions", value: donations.length, icon: Gift },
    { label: "Cash Provided", value: `EGP ${totalCash}`, icon: BadgeDollarSign },
    { label: "Supply Batches", value: donations.filter(d => d.type !== "Cash").length, icon: Package },
    { label: "Pending Review", value: donations.filter(d => d.status === 'Pending').length, icon: HandCoins },
  ];

  if (loading) return (
    <div className="flex h-[60vh] items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
           <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                <LayoutDashboard className="h-3.5 w-3.5" />
                Donation History
            </div>
          <h1 className="text-3xl font-bold text-slate-950 mt-4 tracking-tight">My Donations</h1>
          <p className="text-sm text-slate-500 mt-2">Track your support and contribution impact.</p>
        </div>
        <Link href="/donate" className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800">
          Make a Donation <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {stats.map((s, idx) => {
          const Icon = s.icon;
          return (
            <div key={idx} className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-400 uppercase">{s.label}</span>
                <Icon className="h-4 w-4 text-slate-300" />
              </div>
              <p className="text-2xl font-bold text-slate-950">{s.value}</p>
            </div>
          );
        })}
      </div>

      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-wrap gap-2">
         {["All", "Cash", "Food", "Medicine", "Supplies"].map(f => (
           <button 
             key={f}
             onClick={() => setSelectedFilter(f)}
             className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${selectedFilter === f ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
           >
             {f}
           </button>
         ))}
      </div>

      <div className="space-y-4">
        {filteredDonations.length > 0 ? filteredDonations.map((don) => (
          <div key={don._id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition">
             <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
                <div className="flex items-center gap-4">
                   <div className="h-12 w-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400">
                      {don.type === 'Cash' ? <BadgeDollarSign className="h-6 w-6" /> : <Package className="h-6 w-6" />}
                   </div>
                   <div>
                      <h4 className="font-bold text-slate-950 text-lg">
                        {don.type === 'Cash' ? `EGP ${don.value}` : don.type} Donation
                      </h4>
                      <p className="text-sm text-slate-500">{don.shelter || 'General Fund'} • {new Date(don.createdAt).toLocaleDateString()}</p>
                   </div>
                </div>
                <div className="flex items-center gap-3">
                   <StatusBadge status={don.status} />
                   <Link href={`/dashboard/user/donations/${don._id}`} className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-bold hover:bg-slate-50">View Receipt</Link>
                </div>
             </div>
          </div>
        )) : (
          <div className="bg-white p-20 rounded-3xl border border-slate-200 border-dashed text-center">
             <Gift className="h-10 w-10 text-slate-200 mx-auto" />
             <p className="text-slate-500 mt-4 font-medium">No donations found.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: any = {
    Pending: "bg-amber-50 text-amber-700 border-amber-100",
    Approved: "bg-emerald-50 text-emerald-700 border-emerald-100",
    Rejected: "bg-red-50 text-red-700 border-red-100",
    Received: "bg-emerald-50 text-emerald-700 border-emerald-100",
  };
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${styles[status] || "bg-slate-50 text-slate-700 border-slate-100"}`}>
      {status}
    </span>
  );
}