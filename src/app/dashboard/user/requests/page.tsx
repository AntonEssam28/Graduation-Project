"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  FileText,
  Dog,
  HandCoins,
  Clock3,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Loader2,
  Info,
  LayoutDashboard,
  Filter,
  AlertTriangle,
  Building2,
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function UserRequestsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState("All");

  const fetchRequests = async () => {
    const userStr = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    if (!userStr || !token) return;

    const user = JSON.parse(userStr);
    const email = user.email;

    try {
      // Fetch Requests (Adoption, Foster, etc.)
      const resReq = await fetch(`${API_URL}/api/requests`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const dataReq = await resReq.json();
      const myRequests = (Array.isArray(dataReq) ? dataReq : (dataReq.data || []))
        .filter((r: any) => r.requesterEmail === email);

      // Fetch Reports (Stray Dog Reports)
      const resRep = await fetch(`${API_URL}/api/reports?reporterEmail=${encodeURIComponent(email)}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const dataRep = await resRep.json();
      const myReports = (Array.isArray(dataRep) ? dataRep : []).map((r: any) => ({
        ...r,
        type: "Report", // Standardize type for display
      }));

      // Combine and Sort (Filtering out Foster, Activation, Suspension)
      const combined = [...myRequests, ...myReports]
        .filter(r => r.type !== "Foster" && r.type !== "Activation" && r.type !== "Suspension")
        .sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

      setRequests(combined);
    } catch (err) {
      console.error("Failed to fetch history", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const filteredRequests = useMemo(() => {
    return requests.filter((request) =>
      selectedFilter === "All" ? true : request.type === selectedFilter
    );
  }, [requests, selectedFilter]);

  const stats = [
    { label: "Total Requests", value: requests.length, icon: FileText },
    { label: "Pending", value: requests.filter((r) => r.status === "Pending").length, icon: Clock3 },
    { label: "Approved", value: requests.filter((r) => r.status === "Approved").length, icon: CheckCircle2 },
    { label: "Rejected", value: requests.filter((r) => r.status === "Rejected").length, icon: XCircle },
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
                Requests History
            </div>
          <h1 className="text-3xl font-bold text-slate-950 mt-4 tracking-tight">My Requests</h1>
          <p className="text-sm text-slate-500 mt-2">Track your adoption, foster and other applications.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/dashboard/user/requests/new-shelter" className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-700 shadow-lg shadow-emerald-100">
            <Building2 className="h-4 w-4" /> Apply for New Shelter
          </Link>
          <Link href="/dogs" className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-slate-50">
            Browse Dogs <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
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
         {["All", "Adoption", "Report", "Donation", "Shelter Creation"].map(f => (
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
        {filteredRequests.length > 0 ? filteredRequests.map((req) => (
          <div key={req._id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition">
             <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
                <div className="flex items-center gap-4">
                   <div className="h-12 w-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400">
                      {req.type === 'Donation' ? <HandCoins className="h-6 w-6" /> : 
                       req.type === 'Report' ? <AlertTriangle className="h-6 w-6 text-amber-500" /> :
                       <Dog className="h-6 w-6" />}
                   </div>
                   <div>
                      <h4 className="font-bold text-slate-950 text-lg">{req.type} Request</h4>
                      <p className="text-sm text-slate-500">{req.shelter || "Global"} • {new Date(req.createdAt).toLocaleDateString()}</p>
                   </div>
                </div>
                <div className="flex items-center gap-3">
                   <StatusBadge status={req.status} />
                   <Link 
                     href={req.type === 'Report' ? `/dashboard/user/reports/${req._id}` : `/dashboard/user/requests/${req._id}`} 
                     className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-bold hover:bg-slate-50"
                   >
                     Details
                   </Link>
                </div>
             </div>
          </div>
        )) : (
          <div className="bg-white p-20 rounded-3xl border border-slate-200 border-dashed text-center">
             <Info className="h-10 w-10 text-slate-200 mx-auto" />
             <p className="text-slate-500 mt-4 font-medium">No requests found matching your filter.</p>
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
  };
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${styles[status] || "bg-slate-50 text-slate-700 border-slate-100"}`}>
      {status}
    </span>
  );
}
