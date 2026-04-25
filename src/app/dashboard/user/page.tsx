"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Heart,
  Dog,
  FileText,
  HandCoins,
  History,
  TrendingUp,
  Search,
  Siren,
  Clock,
  CheckCircle2,
  ChevronRight,
  Loader2,
  LayoutDashboard,
  Shield,
  Users,
  Building2,
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function UserDashboardPage() {
  const [stats, setStats] = useState({
    requests: 0,
    donations: 0,
    reports: 0,
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("");
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      const userStr = localStorage.getItem("user");
      const token = localStorage.getItem("token");
      if (!userStr || !token) return;

      const user = JSON.parse(userStr);
      setUserName(user.name);
      const email = user.email;

      try {
        const [reqsRes, donsRes, repsRes] = await Promise.all([
          fetch(`${API_URL}/api/requests`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_URL}/api/donations`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_URL}/api/reports`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        const reqs = await reqsRes.json();
        const dons = await donsRes.json();
        const reps = await repsRes.json();

        const myRequests = (Array.isArray(reqs) ? reqs : (reqs.data || [])).filter((r: any) => r.requesterEmail === email);
        const myDonations = (Array.isArray(dons) ? dons : (dons.data || [])).filter((d: any) => d.donorEmail === email);
        const myReports = (Array.isArray(reps) ? reps : (reps.data || [])).filter((r: any) => r.reporterEmail === email);

        setStats({
          requests: myRequests.length,
          donations: myDonations.length,
          reports: myReports.length,
        });

        const allActivity = [
          ...myRequests.map((r: any) => ({ ...r, activityType: 'Request', icon: Heart })),
          ...myDonations.map((d: any) => ({ ...d, activityType: 'Donation', icon: HandCoins })),
          ...myReports.map((r: any) => ({ ...r, activityType: 'Report', icon: FileText })),
        ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);

        setRecentActivity(allActivity);

        // Fetch settings for permissions check
        const settingsRes = await fetch(`${API_URL}/api/settings`, { headers: { Authorization: `Bearer ${token}` } });
        const settingsData = await settingsRes.json();
        setSettings(settingsData);
      } catch (err) {
        console.error("Dashboard failed", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) return (
    <div className="flex h-[60vh] items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
           <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                <LayoutDashboard className="h-3.5 w-3.5" />
                User Workspace
            </div>
          <h1 className="text-3xl font-bold text-slate-950 mt-4 tracking-tight">Welcome back, {userName}</h1>
          <p className="text-sm text-slate-500 mt-2">Monitor your adoption status, donations and reports.</p>
        </div>
        <div className="flex gap-2">
           <Link href="/dogs" className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800">
             <Search className="h-4 w-4" />
             Browse Dogs
           </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="My Requests" value={stats.requests} icon={Heart} color="text-rose-500" bg="bg-rose-50" />
        <StatCard label="My Donations" value={stats.donations} icon={HandCoins} color="text-emerald-500" bg="bg-emerald-50" />
        <StatCard label="My Reports" value={stats.reports} icon={FileText} color="text-blue-500" bg="bg-blue-50" />
      </div>

      {/* Management Power (If authorized) */}
      {settings && (settings.user_shelters || settings.user_users || settings.user_dogs || settings.user_reports || settings.user_donations) && (
        <div className="rounded-3xl border-2 border-emerald-200 bg-emerald-50/50 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
             <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-lg shadow-emerald-200">
                <Shield className="h-5 w-5" />
             </div>
             <div>
                <h3 className="text-xl font-bold text-emerald-950 tracking-tight">Power User Options</h3>
                <p className="text-xs text-emerald-700 font-medium">You have been granted administrative privileges.</p>
             </div>
          </div>
          
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
             {settings.user_shelters && (
                <Link href="/dashboard/super-admin/shelters" className="flex items-center justify-between p-4 rounded-2xl bg-white border border-emerald-100 hover:border-emerald-300 hover:shadow-md transition">
                   <div className="flex items-center gap-3 text-emerald-900 font-bold text-sm">
                      <Building2 className="h-4 w-4" /> Manage Shelters
                   </div>
                   <ChevronRight className="h-4 w-4 text-emerald-300" />
                </Link>
             )}
             {settings.user_users && (
                <Link href="/dashboard/super-admin/users" className="flex items-center justify-between p-4 rounded-2xl bg-white border border-emerald-100 hover:border-emerald-300 hover:shadow-md transition">
                   <div className="flex items-center gap-3 text-emerald-900 font-bold text-sm">
                      <Users className="h-4 w-4" /> Manage Users
                   </div>
                   <ChevronRight className="h-4 w-4 text-emerald-300" />
                </Link>
             )}
             {settings.user_dogs && (
                <Link href="/dashboard/super-admin/dog" className="flex items-center justify-between p-4 rounded-2xl bg-white border border-emerald-100 hover:border-emerald-300 hover:shadow-md transition">
                   <div className="flex items-center gap-3 text-emerald-900 font-bold text-sm">
                      <Dog className="h-4 w-4" /> Manage Dogs
                   </div>
                   <ChevronRight className="h-4 w-4 text-emerald-300" />
                </Link>
             )}
             {settings.user_reports && (
                <Link href="/dashboard/super-admin/reports" className="flex items-center justify-between p-4 rounded-2xl bg-white border border-emerald-100 hover:border-emerald-300 hover:shadow-md transition">
                   <div className="flex items-center gap-3 text-emerald-900 font-bold text-sm">
                      <FileText className="h-4 w-4" /> Manage Reports
                   </div>
                   <ChevronRight className="h-4 w-4 text-emerald-300" />
                </Link>
             )}
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Activity */}
        <div className="lg:col-span-2 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-slate-950">Recent Activity</h3>
            <Link href="/dashboard/user/requests" className="text-sm font-semibold text-blue-600 hover:underline">View all</Link>
          </div>

          <div className="space-y-4">
            {recentActivity.length > 0 ? recentActivity.map((activity, idx) => {
              const Icon = activity.icon;
              return (
                <div key={idx} className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-slate-100 transition">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-slate-600 border border-slate-200">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-900 truncate">
                      {activity.activityType} Update
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {activity.status} • {new Date(activity.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-400" />
                </div>
              );
            }) : (
              <p className="text-sm text-slate-500 text-center py-10">No recent activity found.</p>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          <div className="rounded-3xl bg-slate-950 p-6 text-white shadow-sm">
            <h3 className="text-lg font-bold">Need Help?</h3>
            <p className="text-sm text-slate-400 mt-2 leading-relaxed">If you found a stray dog or need urgent assistance, please file a report immediately.</p>
            <Link href="/reports/new" className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-red-400 hover:text-red-300">
               <Siren className="h-4 w-4" />
               Report an Incident
            </Link>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
             <h3 className="text-lg font-bold text-slate-950">Quick Links</h3>
             <div className="mt-4 space-y-2">
                <QuickLink href="/dogs" label="Browse Dogs" icon={Dog} />
                <QuickLink href="/store" label="Shelter Supplies" icon={TrendingUp} />
                <QuickLink href="/dashboard/user/profile" label="Update Profile" icon={FileText} />
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color, bg }: any) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-500">{label}</p>
        <div className={`p-2 rounded-xl ${bg} ${color}`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <p className="mt-3 text-3xl font-bold text-slate-950">{value}</p>
    </div>
  );
}

function QuickLink({ href, label, icon: Icon }: any) {
  return (
    <Link href={href} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 text-sm font-medium text-slate-700 transition">
      <Icon className="h-4 w-4 text-slate-400" />
      {label}
    </Link>
  );
}