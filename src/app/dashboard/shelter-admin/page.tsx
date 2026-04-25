"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Dog, FileText, HeartHandshake, ShieldCheck, LayoutDashboard, HandCoins } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function ShelterAdminDashboardPage() {
  const [data, setData] = useState({
    dogs: 0,
    reports: 0,
    adoptions: 0,
    hostings: 0,
    donations: 0,
    loading: true,
    shelterName: ""
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const userStr = localStorage.getItem("user");
        if (!token || !userStr) return;

        const user = JSON.parse(userStr);
        const shelterName = user.assignedShelter || "";
        setData(prev => ({ ...prev, shelterName }));

        const headers = { Authorization: `Bearer ${token}` };

        const [dogsRes, reportsRes, requestsRes] = await Promise.all([
          fetch(`${API_URL}/api/dogs`, { headers }),
          fetch(`${API_URL}/api/reports`, { headers }),
          fetch(`${API_URL}/api/requests`, { headers })
        ]);

        const dogs = await dogsRes.json();
        const reports = await reportsRes.json();
        const requests = await requestsRes.json();

        const myDogs = Array.isArray(dogs) ? dogs.filter((d: any) => d.shelter === shelterName) : [];
        const myReports = Array.isArray(reports) ? reports.filter((r: any) => r.shelter === shelterName) : [];
        const myAdoptions = Array.isArray(requests) ? requests.filter((r: any) => 
          r.shelter === shelterName && r.type?.toLowerCase() === "adoption") : [];
        const myHostings = Array.isArray(requests) ? requests.filter((r: any) => 
          r.shelter === shelterName && (r.type?.toLowerCase() === "hosting" || r.type?.toLowerCase() === "foster")) : [];
        const myDonations = Array.isArray(requests) ? requests.filter((r: any) => 
          r.shelter === shelterName && r.type?.toLowerCase() === "donation") : [];

        setData({
          dogs: myDogs.length,
          reports: myReports.length,
          adoptions: myAdoptions.length,
          hostings: myHostings.length,
          donations: myDonations.length,
          loading: false,
          shelterName
        });
      } catch (err) {
        console.error("Dashboard error:", err);
      }
    };

    fetchData();
  }, []);
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-950">Shelter Admin Dashboard</h1>
          <p className="mt-2 text-sm text-slate-600">
            Managing <span className="font-bold text-slate-900">{data.shelterName || "General"}</span> Shelter
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 border border-emerald-100">
           <ShieldCheck className="h-4 w-4" />
           Official Shelter Access
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-5">
        <Card title="My Dogs" value={data.loading ? "..." : data.dogs.toString()} icon={Dog} />
        <Card title="Active Reports" value={data.loading ? "..." : data.reports.toString()} icon={FileText} />
        <Card title="Adoptions" value={data.loading ? "..." : data.adoptions.toString()} icon={HeartHandshake} />
        <Card title="Hostings" value={data.loading ? "..." : data.hostings.toString()} icon={LayoutDashboard} />
        <Card title="Donations" value={data.loading ? "..." : data.donations.toString()} icon={HandCoins} />
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-950">Latest Shelter Updates</h2>
        <div className="mt-4 space-y-3 text-sm text-slate-600">
          <p>• Buddy marked as available for adoption.</p>
          <p>• Report #21 assigned to rescue team.</p>
          <p>• New hosting request waiting for review.</p>
        </div>
      </div>
    </div>
  );
}

function Card({ title, value, icon: Icon }: { title: string; value: string; icon: any }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-600">{title}</p>
        <Icon className="h-5 w-5 text-slate-400" />
      </div>
      <p className="mt-3 text-3xl font-bold text-slate-950">{value}</p>
    </div>
  );
}