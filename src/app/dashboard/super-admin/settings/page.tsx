"use client";

import Link from "next/link";
import { useState, useEffect, type ComponentType, type ReactNode, type FormEvent, createContext, useContext } from "react";
import {
  AlertTriangle,
  BellRing,
  CheckCircle2,
  CloudCog,
  CreditCard,
  Database,
  Download,
  Globe,
  History,
  LockKeyhole,
  Mail,
  MapPin,
  Palette,
  Phone,
  RefreshCcw,
  Save,
  Settings2,
  ShieldCheck,
  Trash2,
  Users,
  Webhook,
  Clock3,
  UserCircle2,
  Power,
  RotateCcw,
} from "lucide-react";

// Removed integrations from section links
const sectionLinks = [
  { id: "general", label: "General", icon: Settings2 },
  { id: "profile", label: "Profile", icon: UserCircle2 },
  { id: "security", label: "Security", icon: LockKeyhole },
  { id: "notifications", label: "Notifications", icon: BellRing },
  { id: "permissions", label: "Roles & Permissions", icon: Users },
  { id: "shelter", label: "Shelter Defaults", icon: MapPin },
  { id: "danger", label: "Danger Zone", icon: AlertTriangle },
] as const;

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const permissionColumns = [
  { key: "shelters", label: "Shelters Management" },
  { key: "dogs", label: "Dogs" },
  { key: "adoptions", label: "Adoptions/Fostering" },
  { key: "donations", label: "Donations/Supplies" },
  { key: "users", label: "Users" },
  { key: "reports", label: "Reports" },
] as const;

const roleRows = [
  {
    key: "superAdmin",
    label: "Super Admin",
    description: "Full platform access",
    defaults: { shelters: true, dogs: true, adoptions: true, donations: true, users: true, reports: true }
  },
  {
    key: "shelterAdmin",
    label: "Shelter Admin",
    description: "Manages shelter data and local adoptions",
    defaults: { shelters: true, dogs: true, adoptions: true, donations: true, users: false, reports: true }
  },
  {
    key: "user",
    label: "User",
    description: "Standard registered community member",
    defaults: { shelters: false, dogs: false, adoptions: false, donations: false, users: false, reports: false }
  },
];

const notificationRows = [
  { name: "notify_new_shelters", label: "New shelter approvals", description: "Alert me when a new shelter submits for approval.", defaultChecked: true },
  { name: "notify_donations", label: "Donation updates", description: "Get notified when donations are approved or received.", defaultChecked: true },
  { name: "notify_dog_reports", label: "Stray dog reports", description: "Receive alerts for missing or urgent stray dog reports.", defaultChecked: true },
  { name: "notify_adoption_requests", label: "Adoption/Fostering Requests", description: "Notify when a user requests to adopt or foster a dog.", defaultChecked: true },
  { name: "notify_email", label: "Email notifications", description: "Send notifications via email.", defaultChecked: true },
  { name: "notify_sms", label: "SMS notifications", description: "Send critical dog rescue alerts via SMS.", defaultChecked: false },
] as const;

const SettingsContextObj = createContext<any>(null);

export default function SuperAdminSettingsPage() {
  const [adminCount, setAdminCount] = useState<number | string>("...");
  const [activeUsers, setActiveUsers] = useState<number | string>("...");
  const [pendingUsers, setPendingUsers] = useState<number | string>("...");
  const [pendingShelters, setPendingShelters] = useState<number | string>("...");
  const [activeShelters, setActiveShelters] = useState<number | string>("...");

  const [systemSettings, setSystemSettings] = useState<any>(null);

  const fetchSettings = async () => {
    const token = localStorage.getItem("token");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    try {
        const res = await fetch(`${API_URL}/api/settings`, { headers });
        const data = await res.json();
        setSystemSettings(data);
    } catch (err) {
        console.error(err);
    }
  };

  useEffect(() => {
    fetchSettings();

    const token = localStorage.getItem("token");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    fetch(`${API_URL}/api/users`, { headers })
      .then((res) => res.json())
      .then((users) => {
        if (Array.isArray(users)) {
          const isActive = (u: any) => !u.status || u.status === "Active";
          setAdminCount(users.filter((u: any) => u.role === "Super Admin" && isActive(u)).length);
          setActiveUsers(users.filter((u: any) => u.role !== "Super Admin" && isActive(u)).length);
          setPendingUsers(users.filter((u: any) => u.status === "Pending Approval").length);
        }
      });

    fetch(`${API_URL}/api/shelters`, { headers })
      .then((res) => res.json())
      .then((shelters) => {
        if (Array.isArray(shelters)) {
          setPendingShelters(shelters.filter((s: any) => s.status === "Pending Approval").length);
          setActiveShelters(shelters.filter((s: any) => s.status === "Active").length);
        }
      });
  }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget).entries());
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(`${API_URL}/api/settings`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error("Failed to save settings");
      alert("Settings saved successfully ✅");
      fetchSettings();
    } catch (err) {
      alert("Failed to save settings");
    }
  };

  const handleReset = async () => {
      if (!confirm("Are you sure you want to reset ALL settings to defaults? This cannot be undone.")) return;
      const token = localStorage.getItem("token");
      try {
          const res = await fetch(`${API_URL}/api/settings/reset`, {
              method: "POST",
              headers: { Authorization: `Bearer ${token}` }
          });
          if (res.ok) {
              alert("Settings reset successfully");
              fetchSettings();
          }
      } catch (err) {
          alert("Reset failed");
      }
  };

  const toggleMaintenance = async () => {
    const newVal = !systemSettings.isMaintenanceMode;
    if (!confirm(`Are you sure you want to ${newVal ? 'ENABLE' : 'DISABLE'} maintenance mode?`)) return;
    
    const token = localStorage.getItem("token");
    try {
        const res = await fetch(`${API_URL}/api/settings`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ isMaintenanceMode: newVal }),
        });
        if (res.ok) {
            alert(`Platform ${newVal ? 'deactivated (Maintenance Mode ON)' : 'activated (Maintenance Mode OFF)'}`);
            fetchSettings();
        }
    } catch (err) {
        alert("Action failed");
    }
  };

  if (!systemSettings) {
    return <div className="p-10">Loading settings...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
              <Settings2 className="h-3.5 w-3.5" />
              Super Admin Control Center
            </div>
            <h1 className="mt-4 text-3xl font-bold text-slate-950">Platform Settings</h1>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Control the engine of Street2Home. Manage roles, permissions, and platform-wide defaults.
            </p>
          </div>
          <button
            type="submit"
            form="settings-form"
            className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            <Save className="h-4 w-4" />
            Save All Changes
          </button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[260px_1fr]">
        <aside className="h-fit rounded-3xl border border-slate-200 bg-white p-4 shadow-sm xl:sticky xl:top-6">
          <nav className="space-y-1">
            {sectionLinks.map((item) => {
              const Icon = item.icon;
              return (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  className="flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-slate-950"
                >
                  <Icon className="h-4 w-4 text-slate-500" />
                  {item.label}
                </a>
              );
            })}
          </nav>
        </aside>

        <SettingsContextObj.Provider value={systemSettings}>
          <form id="settings-form" onSubmit={handleSubmit} className="space-y-6">
            <SectionCard id="general" icon={Globe} title="General Settings">
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Platform Name" name="platform_name" icon={Globe} defaultValue="Street2Home" />
                <Field label="Site Title" name="site_title" icon={Settings2} defaultValue="Control Center" />
                <Field label="Default Language" name="default_language" icon={Globe} as="select" options={["English", "Arabic"]} />
                <Field label="Timezone" name="timezone" icon={Clock3} as="select" options={["Africa/Cairo", "UTC"]} />
              </div>
            </SectionCard>

            <SectionCard id="permissions" icon={Users} title="Roles & Permissions">
              <div className="overflow-x-auto rounded-2xl border border-slate-200">
                <table className="min-w-[900px] w-full border-collapse bg-white text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="border-b border-slate-200 px-4 py-3 text-left font-semibold text-slate-700">Role</th>
                      {permissionColumns.map((col) => (
                        <th key={col.key} className="border-b border-slate-200 px-4 py-3 text-left font-semibold text-slate-700">{col.label}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {roleRows.map((row) => (
                      <tr key={row.key} className="hover:bg-slate-50/50">
                        <td className="border-b border-slate-100 px-4 py-4">
                          <p className="font-semibold text-slate-950">{row.label}</p>
                          <p className="text-xs text-slate-500">{row.description}</p>
                        </td>
                        {permissionColumns.map((col) => (
                          <td key={col.key} className="border-b border-slate-100 px-4 py-4">
                            <input
                              type="checkbox"
                              name={`${row.key}_${col.key}`}
                              defaultChecked={systemSettings[`${row.key}_${col.key}`] ?? row.defaults[col.key as keyof typeof row.defaults]}
                              className="h-4 w-4 rounded border-slate-300 text-slate-950 focus:ring-slate-950"
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </SectionCard>

            <SectionCard id="shelter" icon={MapPin} title="Shelter Defaults">
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Auto-Approve" name="auto_approve_shelters" icon={CheckCircle2} as="select" options={["Yes", "No (Manual Review)"]} />
                <Field label="Search Radius" name="assignment_radius" icon={MapPin} as="select" options={["10 km", "25 km", "50 km"]} />
              </div>
              <div className="mt-4 grid gap-3">
                <ToggleRow name="auto_route_reports" label="Auto-route stray dog reports" description="Automatically assign reports to nearest shelter." />
                <ToggleRow name="require_adoption_approval" label="Require ID Verification" description="Force users to upload ID for safety." />
              </div>
            </SectionCard>

            <SectionCard id="danger" icon={AlertTriangle} title="Danger Zone">
              <div className="rounded-3xl border border-red-200 bg-red-50 p-6">
                <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-red-900">Critical Actions</h3>
                    <p className="text-sm text-red-700 mt-1">Platform management and maintenance controls.</p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={handleReset}
                      className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-white px-5 py-3 text-sm font-bold text-red-700 transition hover:bg-red-100"
                    >
                      <RotateCcw className="h-4 w-4" /> Reset Settings
                    </button>
                    <button
                      type="button"
                      onClick={toggleMaintenance}
                      className={`inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold text-white transition ${systemSettings.isMaintenanceMode ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'}`}
                    >
                      <Power className="h-4 w-4" /> 
                      {systemSettings.isMaintenanceMode ? 'Activate Platform' : 'Deactivate Platform'}
                    </button>
                  </div>
                </div>
              </div>
            </SectionCard>
          </form>
        </SettingsContextObj.Provider>
      </div>
    </div>
  );
}

function SectionCard({ id, icon: Icon, title, description, children }: any) {
  return (
    <section id={id} className="scroll-mt-24 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-lg">
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-950 tracking-tight">{title}</h2>
          {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
        </div>
      </div>
      <div className="mt-8">{children}</div>
    </section>
  );
}

function Field({ label, name, icon: Icon, options = [], as = "input", ...props }: any) {
  const ctx = useContext(SettingsContextObj);
  const val = ctx?.[name] ?? props.defaultValue;
  return (
    <div className="space-y-2">
      <label className="text-xs font-bold uppercase tracking-widest text-slate-500">{label}</label>
      <div className="relative">
        <Icon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
        {as === "select" ? (
          <select name={name} defaultValue={val} className="w-full rounded-2xl border border-slate-200 bg-slate-50/30 py-3.5 pl-12 pr-4 text-sm outline-none transition focus:border-slate-950 focus:bg-white appearance-none">
            {options.map((o: any) => <option key={o} value={o}>{o}</option>)}
          </select>
        ) : (
          <input name={name} defaultValue={val} className="w-full rounded-2xl border border-slate-200 bg-slate-50/30 py-3.5 pl-12 pr-4 text-sm outline-none transition focus:border-slate-950 focus:bg-white" {...props} />
        )}
      </div>
    </div>
  );
}

function ToggleRow({ name, label, description }: any) {
  const ctx = useContext(SettingsContextObj);
  const checked = ctx?.[name] ?? false;
  return (
    <label className="flex items-start gap-4 p-4 rounded-2xl border border-slate-100 bg-slate-50/30 hover:bg-slate-50 transition cursor-pointer">
       <input type="checkbox" name={name} defaultChecked={checked} className="mt-1 h-4 w-4 rounded border-slate-300 text-slate-950 focus:ring-slate-950" />
       <div>
          <p className="text-sm font-bold text-slate-950">{label}</p>
          <p className="text-xs text-slate-500 mt-0.5">{description}</p>
       </div>
    </label>
  );
}
