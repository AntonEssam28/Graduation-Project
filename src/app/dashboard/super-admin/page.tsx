"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Building2,
  Users,
  Dog,
  FileText,
  HeartHandshake,
  Package,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Clock3,
  ArrowRight,
  Settings,
  LayoutDashboard,
  MapPinned,
  Crown,
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const quickActions = [
  {
    title: "Manage Shelters",
    description: "Add, edit, or remove shelters and assign admins.",
    href: "/dashboard/super-admin/shelters",
    icon: Building2,
  },
  {
    title: "Manage Users",
    description: "View all users, activity, and account status.",
    href: "/dashboard/super-admin/users",
    icon: Users,
  },
  {
    title: "Review Reports",
    description: "Track stray dog reports and rescue workflow.",
    href: "/dashboard/super-admin/reports",
    icon: FileText,
  },
  {
    title: "View Requests",
    description: "Monitor adoption and hosting requests across the platform.",
    href: "/dashboard/super-admin/requests",
    icon: HeartHandshake,
  },
  {
    title: "Manage Supplies",
    description: "Check stock levels and supply requests.",
    href: "/dashboard/super-admin/supplies",
    icon: Package,
  },
  {
    title: "Website Settings",
    description: "Update platform settings, support info, and branding.",
    href: "/dashboard/super-admin/settings",
    icon: Settings,
  },
];

// Removed static recent activity

// Removed dummy pending shelters

export default function SuperAdminPage() {
  const [data, setData] = useState({
    shelters: 0,
    users: 0,
    dogs: 0,
    reports: 0,
    requests: 0,
    supplies: 0,
    pendingSheltersList: [] as any[],
    recentActivityList: [] as any[],
    loading: true
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

        const [sheltersRes, usersRes, dogsRes, reportsRes, requestsRes, suppliesRes] = await Promise.allSettled([
          fetch(`${API_URL}/api/shelters`, { headers }),
          fetch(`${API_URL}/api/users`, { headers }),
          fetch(`${API_URL}/api/dogs`, { headers }),
          fetch(`${API_URL}/api/reports`, { headers }),
          fetch(`${API_URL}/api/requests`, { headers }),
          fetch(`${API_URL}/api/supplies`, { headers })
        ]);

        const getCount = async (res: any) => {
          if (res.status === 'fulfilled' && res.value.ok) {
            const json = await res.value.json();
            return Array.isArray(json) ? json : json.data || [];
          }
          return [];
        };

        const shelters = await getCount(sheltersRes);
        const users = await getCount(usersRes);
        const dogs = await getCount(dogsRes);
        const reports = await getCount(reportsRes);
        const requests = await getCount(requestsRes);
        const supplies = await getCount(suppliesRes);

        const pending = shelters.filter((s:any) => s.status === "Pending Approval" || !s.status);

        // Aggregate recent activity
        const recent = [
          ...shelters.slice(0, 2).map((s:any) => ({ text: `New shelter added: ${s.name}`, time: s.createdAt, type: 'shelter' })),
          ...users.slice(0, 2).map((u:any) => ({ text: `New user registered: ${u.name}`, time: u.createdAt, type: 'user' })),
          ...dogs.slice(0, 2).map((d:any) => ({ text: `New dog listed: ${d.name}`, time: d.createdAt, type: 'dog' }))
        ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 4);

        setData({
          shelters: shelters.length,
          users: users.length,
          dogs: dogs.length,
          reports: reports.length,
          requests: requests.length,
          supplies: supplies.length,
          pendingSheltersList: pending,
          recentActivityList: recent,
          loading: false
        });

      } catch (err) {
        console.error("Dashboard fetch error:", err);
      }
    };

    fetchData();
  }, []);

  const stats = [
    { label: "Total Shelters", value: data.loading ? "..." : data.shelters, icon: Building2, change: "Active platforms" },
    { label: "Total Users", value: data.loading ? "..." : data.users, icon: Users, change: "Registered accounts" },
    { label: "Total Dogs", value: data.loading ? "..." : data.dogs, icon: Dog, change: "Tracked animals" },
    { label: "Total Reports", value: data.loading ? "..." : data.reports, icon: FileText, change: "Community reports" },
    { label: "Total Requests", value: data.loading ? "..." : data.requests, icon: HeartHandshake, change: "Applications filed" },
    { label: "Total Supplies", value: data.loading ? "..." : data.supplies, icon: Package, change: "Items tracked" },
  ];
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-950 text-white">
              <Crown className="h-8 w-8" />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-3xl font-bold text-slate-950">
                  Super Admin Dashboard
                </h1>
                <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                  Full Access
                </span>
              </div>

              <p className="mt-2 text-sm text-slate-600">
                Manage the entire platform, all shelters, all users, all dogs, and all requests.
              </p>

              <div className="mt-3 flex flex-wrap gap-2">
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                  Platform Overview
                </span>
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                  System Healthy
                </span>
                <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                  All Features Enabled
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/dashboard/super-admin/settings"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
            >
              <Settings className="h-4 w-4" />
              Settings
            </Link>

           <Link
  href="/dashboard/super-admin/shelters"
  className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
>
  <Building2 className="h-4 w-4" />
  Manage Shelters
</Link>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
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
              <p className="mt-2 text-sm text-slate-500">{item.change}</p>
            </div>
          );
        })}
      </div>

      {/* Main grid */}
      <div className="grid gap-6 xl:grid-cols-3">
        {/* Quick Actions */}
        <div className="xl:col-span-2 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white">
              <LayoutDashboard className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-950">Quick Actions</h2>
              <p className="text-sm text-slate-600">
                Jump directly to the main management sections.
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {quickActions.map((action) => {
              const Icon = action.icon;

              return (
                <Link
                  key={action.title}
                  href={action.href}
                  className="rounded-3xl border border-slate-200 bg-slate-50 p-5 transition hover:-translate-y-1 hover:shadow-md"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white">
                      <Icon className="h-6 w-6" />
                    </div>

                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-slate-950">
                        {action.title}
                      </h3>
                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        {action.description}
                      </p>

                      <div className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-slate-950">
                        Open
                        <ArrowRight className="h-4 w-4" />
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Right side */}
        <div className="space-y-6">
          {/* System Status */}
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
            <h3 className="text-xl font-bold text-slate-950">System Status</h3>

            <div className="mt-5 space-y-4 text-sm text-slate-700">
              <StatusRow
                icon={ShieldCheck}
                label="Website"
                value="Running normally"
                color="text-emerald-600"
              />
              <StatusRow
                icon={CheckCircle2}
                label="Shelter module"
                value={data.shelters > 0 ? "Healthy" : "Empty"}
                color="text-emerald-600"
              />
              <StatusRow
                icon={Clock3}
                label="Pending users"
                value={`${data.reports} reports`}
                color={data.reports > 10 ? "text-red-600" : "text-amber-600"}
              />
              <StatusRow
                icon={AlertTriangle}
                label="Pending Approvals"
                value={`${data.pendingSheltersList.length} items`}
                color={data.pendingSheltersList.length > 0 ? "text-amber-600" : "text-emerald-600"}
              />
            </div>
          </div>

          {/* Pending shelters */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-xl font-bold text-slate-950">Shelters Waiting Approval</h3>

            <div className="mt-5 space-y-4">
              {data.pendingSheltersList.length === 0 && !data.loading && (
                <p className="text-sm text-slate-500">No pending shelters.</p>
              )}
              {data.pendingSheltersList.map((shelter: any) => (
                <div key={shelter._id || shelter.name} className="rounded-2xl bg-amber-50 border border-amber-100 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-950">{shelter.name}</p>
                      <p className="mt-1 text-sm text-slate-600">
                        {shelter.city || shelter.address || "No Address"} • Admin: {shelter.adminName || "Unassigned"}
                      </p>
                    </div>
                    <span className="rounded-full bg-amber-200 px-3 py-1 text-xs font-semibold text-amber-800">
                      Pending
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Activity */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-xl font-bold text-slate-950">Recent Activity</h3>

            <div className="mt-5 space-y-4">
              {data.loading ? (
                <p className="text-sm text-slate-500">Loading activity...</p>
              ) : data.recentActivityList.length === 0 ? (
                <p className="text-sm text-slate-500">No recent activity.</p>
              ) : (
                data.recentActivityList.map((item: any, idx: number) => (
                  <div key={idx} className="flex items-start gap-3">
                    <ActivityDot type={item.type} />
                    <div>
                      <p className="text-sm font-medium text-slate-950">{item.text}</p>
                      <p className="text-xs text-slate-500">{new Date(item.time).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom section */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-xl font-bold text-slate-950">Platform Controls</h3>
          <div className="mt-5 space-y-4 text-sm text-slate-700">
            <ControlItem icon={Building2} text="Add / remove shelters" />
            <ControlItem icon={Users} text="Manage users and admins" />
            <ControlItem icon={Dog} text="Monitor all dogs across shelters" />
            <ControlItem icon={FileText} text="Track reports and requests" />
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-xl font-bold text-slate-950">Top Priorities</h3>
          <div className="mt-5 space-y-4 text-sm text-slate-700">
            {data.pendingSheltersList.length > 0 && (
              <ControlItem icon={AlertTriangle} text={`Review ${data.pendingSheltersList.length} shelter approvals`} />
            )}
            {data.reports > 0 && (
              <ControlItem icon={Clock3} text={`Process ${data.reports} active reports`} />
            )}
            {data.requests > 0 && (
              <ControlItem icon={HeartHandshake} text={`Handle ${data.requests} adoption requests`} />
            )}
            <ControlItem icon={MapPinned} text="Track rescue operations" />
          </div>
        </div>

        <div className="rounded-3xl border border-amber-200 bg-amber-50 p-6 shadow-sm">
          <h3 className="text-xl font-bold text-amber-900">Quick Insights</h3>
          <p className="mt-3 text-sm leading-6 text-amber-800">
            {data.pendingSheltersList.length > 0 
              ? `There are ${data.pendingSheltersList.length} shelters awaiting your approval. Efficient vetting ensures platform quality.`
              : "All pending shelters have been reviewed. The platform is currently operating with full active capacity."}
          </p>
          <p className="mt-2 text-sm leading-6 text-amber-800">
            Recent activity shows a healthy growth in {data.users > 100 ? "user registrations" : "community engagement"}.
          </p>
        </div>
      </div>
    </div>
  );
}

function StatusRow({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-white px-4 py-3">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-slate-500" />
        <span>{label}</span>
      </div>
      <span className={`font-semibold ${color}`}>{value}</span>
    </div>
  );
}

function ControlItem({
  icon: Icon,
  text,
}: {
  icon: ComponentType<{ className?: string }>;
  text: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="mt-0.5 h-5 w-5 text-slate-500" />
      <p>{text}</p>
    </div>
  );
}

function ActivityDot({ type }: { type: string }) {
  const color =
    type === "shelter"
      ? "bg-blue-500"
      : type === "request"
      ? "bg-emerald-500"
      : type === "report"
      ? "bg-amber-500"
      : "bg-red-500";

  return <div className={`mt-1 h-3 w-3 rounded-full ${color}`} />;
}