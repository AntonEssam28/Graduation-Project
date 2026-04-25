"use client";

import type { ComponentType, ReactNode, FormEvent } from "react";
import Link from "next/link";
import {
  BellRing,
  Clock3,
  Dog,
  Edit3,
  Globe,
  HeartPulse,
  Mail,
  MapPin,
  Phone,
  Save,
  Settings2,
  ShieldCheck,
  Siren,
  UserCircle2,
  Users,
  Building2,
  CalendarClock,
  AlertTriangle,
  PawPrint,
  Loader2,
} from "lucide-react";

const sectionLinks = [
  { id: "general", label: "General", icon: Settings2 },
  { id: "profile", label: "Shelter Profile", icon: Building2 },
  { id: "team", label: "Team Access", icon: Users },
  { id: "notifications", label: "Notifications", icon: BellRing },
  { id: "support", label: "Emergency & Support", icon: Siren },
  { id: "danger", label: "Danger Zone", icon: AlertTriangle },
] as const;

const stats = [
  {
    label: "Shelter Status",
    value: "Active",
    icon: ShieldCheck,
  },
  {
    label: "Total Dogs",
    value: "42",
    icon: Dog,
  },
  {
    label: "Open Reports",
    value: "6",
    icon: HeartPulse,
  },
  {
    label: "Today Requests",
    value: "8",
    icon: PawPrint,
  },
] as const;

const notificationRows = [
  {
    name: "notify_new_dogs",
    label: "New dog added",
    description: "Get notified when a dog is added to the shelter.",
    defaultChecked: true,
  },
  {
    name: "notify_reports",
    label: "Dog reports",
    description: "Alerts for missing dogs or urgent health reports.",
    defaultChecked: true,
  },
  {
    name: "notify_donations",
    label: "Donation updates",
    description: "Know when donations are approved or received.",
    defaultChecked: true,
  },
  {
    name: "notify_volunteers",
    label: "Volunteer requests",
    description: "Receive alerts when volunteers apply to help.",
    defaultChecked: false,
  },
  {
    name: "notify_email",
    label: "Email notifications",
    description: "Send notifications to your email inbox.",
    defaultChecked: true,
  },
  {
    name: "notify_in_app",
    label: "In-app notifications",
    description: "Show notifications inside the dashboard.",
    defaultChecked: true,
  },
] as const;

import { useState, useEffect } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function ShelterAdminSettingsPage() {
  const [shelter, setShelter] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [statsData, setStatsData] = useState({
    dogsCount: 0,
    reportsCount: 0,
    suppliesAlerts: 0,
    staffCount: 0,
    volunteerCount: 0,
  });

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const shelterName = user.assignedShelter;
    const token = localStorage.getItem("token");

    const fetchShelterData = async () => {
      let currentShelterName = shelterName;

      // If shelterName is missing, try to fetch fresh user data first
      if (!currentShelterName) {
        try {
          const userRes = await fetch(`${API_URL}/api/users/${user.id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          const freshUser = await userRes.json();
          if (freshUser.assignedShelter) {
            currentShelterName = freshUser.assignedShelter;
            // Update local storage for future use
            localStorage.setItem("user", JSON.stringify({ ...user, assignedShelter: currentShelterName }));
          }
        } catch (e) { console.error("Failed to refresh user", e); }
      }

      if (!currentShelterName) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${API_URL}/api/shelters?name=${encodeURIComponent(currentShelterName)}`, { 
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        
        if (Array.isArray(data) && data.length > 0) {
          setShelter(data[0]);
          fetchCounts(currentShelterName);
        }
      } catch (err) {
        console.error("Failed to fetch shelter:", err);
      }
      setLoading(false);
    };

    const fetchCounts = async (name: string) => {
      try {
        const [dogsRes, reportsRes, suppliesRes, usersRes] = await Promise.all([
          fetch(`${API_URL}/api/dogs`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_URL}/api/reports`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_URL}/api/supplies`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_URL}/api/users`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        const dogs = await dogsRes.json();
        const reports = await reportsRes.json();
        const supplies = await suppliesRes.json();
        const users = await usersRes.json();

        const filterByShelter = (arr: any) => (Array.isArray(arr) ? arr : (arr.data || [])).filter((item: any) => item.shelter === name || item.assignedShelter === name);
        
        const myDogs = filterByShelter(dogs);
        const myReports = filterByShelter(reports);
        const mySupplies = filterByShelter(supplies);
        const myUsers = filterByShelter(users);

        setStatsData({
          dogsCount: myDogs.length,
          reportsCount: myReports.length,
          suppliesAlerts: mySupplies.filter((s: any) => s.status === "Low Stock" || s.status === "Out of Stock").length,
          staffCount: myUsers.filter((u: any) => u.role === "Staff").length,
          volunteerCount: myUsers.filter((u: any) => u.role === "Volunteer").length,
        });
      } catch (err) {
        console.error("Failed to fetch stats:", err);
      }
    };

    if (token) fetchShelterData();
  }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!shelter) return;

    const form = e.currentTarget;
    const formData = new FormData(form);
    const data: any = Object.fromEntries(formData.entries());

    // Fix checkboxes manually since unchecked ones don't appear in FormData
    const booleanFields = [
      "allow_staff_invites",
      "allow_volunteer_acceptance",
      "show_public_team",
      "notify_new_dogs",
      "notify_reports",
      "notify_donations",
      "notify_volunteers",
      "notify_email",
      "notify_in_app",
    ];

    booleanFields.forEach((field) => {
      data[field] = formData.has(field);
    });

    try {
      const res = await fetch(`${API_URL}/api/shelters/${shelter._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        alert("Shelter settings saved successfully ✅");
        // Optionally update local shelter state
        const updated = await res.json();
        setShelter(updated);
      } else {
        alert("Failed to save settings");
      }
    } catch (error) {
      console.error(error);
      alert("Error saving settings");
    }
  };

  if (loading) return (
    <div className="flex items-center gap-2 p-20 justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      <span className="text-slate-600 font-bold text-lg">Loading shelter settings...</span>
    </div>
  );

  if (!shelter) {
    const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem("user") || "{}") : {};
    return (
      <div className="p-20 text-center space-y-4 max-w-md mx-auto">
        <div className="bg-amber-50 border border-amber-200 p-6 rounded-3xl">
          <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto" />
          <h2 className="mt-4 text-2xl font-black text-slate-900">Shelter Not Found</h2>
          <p className="mt-2 text-slate-600 leading-relaxed">
            {user.assignedShelter 
              ? `We couldn't find a shelter named "${user.assignedShelter}" in our records. Please contact the Super Admin to verify your assignment.`
              : "You haven't been assigned to any shelter yet. Please contact the Super Admin to get access to shelter settings."}
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-6 font-bold text-blue-600 hover:text-blue-800"
          >
            Retry Fetching Data
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
              <Settings2 className="h-3.5 w-3.5" />
              SHELTER ADMINISTRATION
            </div>

            <h1 className="mt-4 text-4xl font-black text-slate-950 tracking-tight">Shelter Settings</h1>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              Manage your shelter profile, contact info, operating hours,
              notifications, and emergency support details.
            </p>
          </div>

          <button
            type="submit"
            form="settings-form"
            className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-6 py-4 text-sm font-bold text-white transition hover:bg-slate-800 shadow-lg shadow-slate-200"
          >
            <Save className="h-4 w-4" />
            Save Changes
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {[
          { label: "Shelter Status", value: shelter.status, icon: ShieldCheck, color: 'text-emerald-600' },
          { label: "Total Dogs", value: statsData.dogsCount, icon: Dog, color: 'text-blue-600' },
          { label: "Open Reports", value: statsData.reportsCount, icon: HeartPulse, color: 'text-red-600' },
          { label: "Staff members", value: statsData.staffCount, icon: Users, color: 'text-cyan-600' },
          { label: "Volunteers", value: statsData.volunteerCount, icon: HeartPulse, color: 'text-violet-600' },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.label}
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{item.label}</p>
                <Icon className={`h-5 w-5 ${item.color}`} />
              </div>
              <p className="mt-3 text-3xl font-black text-slate-950">
                {item.value}
              </p>
            </div>
          );
        })}
      </div>

      <div className="grid gap-6 xl:grid-cols-[260px_1fr]">
        {/* Sidebar nav */}
        <aside className="h-fit rounded-3xl border border-slate-200 bg-white p-4 shadow-sm xl:sticky xl:top-6">
          <p className="px-2 pb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
            Sections
          </p>

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

          <div className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
            Tip: use the menu to jump quickly between shelter settings.
          </div>
        </aside>

        {/* Main form */}
        <form id="settings-form" onSubmit={handleSubmit} className="space-y-6">
          <SectionCard
            id="general"
            icon={Settings2}
            title="General Settings"
            description="Basic shelter account and contact configuration."
          >
            <div className="grid gap-4 md:grid-cols-2">
              <Field
                label="Shelter Name"
                name="name"
                icon={Building2}
                defaultValue={shelter.name}
                placeholder="Shelter name"
              />
              <Field
                label="City"
                name="city"
                icon={MapPin}
                defaultValue={shelter.city}
                placeholder="City"
              />
              <Field
                label="Phone"
                name="phone"
                icon={Phone}
                defaultValue={shelter.phone}
                placeholder="+20 ..."
              />
              <Field
                label="Email"
                name="email"
                icon={Mail}
                defaultValue={shelter.email}
                placeholder="email@example.com"
              />
              <Field
                label="Timezone"
                name="timezone"
                icon={Clock3}
                as="select"
                defaultValue={shelter.timezone}
                options={["Africa/Cairo", "Asia/Riyadh", "Europe/London", "UTC"]}
              />
              <Field
                label="Website / Facebook Link"
                name="social_link"
                icon={Globe}
                defaultValue={shelter.social_link}
                placeholder="Link"
              />
            </div>
          </SectionCard>

          <SectionCard
            id="profile"
            icon={Building2}
            title="Shelter Profile"
            description="Public info about the shelter, capacity, and working hours."
          >
            <div className="grid gap-4 md:grid-cols-2">
              <Field
                label="Address"
                name="address"
                icon={MapPin}
                defaultValue={shelter.address}
                placeholder="Shelter address"
              />
              <Field
                label="Capacity"
                name="capacity"
                icon={Dog}
                type="number"
                defaultValue={shelter.capacity}
                placeholder="Max dogs"
              />
              <Field
                label="Current Dogs"
                name="dogsCount"
                icon={Dog}
                type="number"
                defaultValue={shelter.dogsCount}
                placeholder="Current dogs"
              />
              <Field
                label="Open Days"
                name="open_days"
                icon={CalendarClock}
                defaultValue={shelter.open_days}
                placeholder="Open days"
              />
              <Field
                label="Opening Time"
                name="opening_time"
                icon={Clock3}
                defaultValue={shelter.opening_time}
                placeholder="Opening time"
              />
              <Field
                label="Closing Time"
                name="closing_time"
                icon={Clock3}
                defaultValue={shelter.closing_time}
                placeholder="Closing time"
              />
              <div className="md:col-span-2">
                <Field
                  label="Shelter Description"
                  name="description"
                  icon={UserCircle2}
                  textarea
                  defaultValue={shelter.description}
                  placeholder="Short description..."
                />
              </div>
            </div>
          </SectionCard>

          <SectionCard
            id="team"
            icon={Users}
            title="Team Access"
            description="Manage the key people who help run the shelter."
          >
            <div className="grid gap-4 md:grid-cols-2">
              <Field
                label="Shelter Admin Name"
                name="adminName"
                icon={Users}
                defaultValue={shelter.adminName}
                placeholder="Admin name"
              />
              <Field
                label="Assistant Admin"
                name="assistant_admin"
                icon={Users}
                defaultValue={shelter.assistant_admin}
                placeholder="Assistant admin"
              />
              <Field
                label="Vet Contact"
                name="vet_contact"
                icon={HeartPulse}
                defaultValue={shelter.vet_contact}
                placeholder="Vet name"
              />
              <Field
                label="Staff Count"
                name="staff_count"
                icon={Users}
                type="number"
                defaultValue={shelter.staff_count}
                placeholder="Number of staff"
              />
            </div>

            <div className="mt-4 grid gap-3">
              <ToggleRow
                name="allow_staff_invites"
                label="Allow staff invitations"
                description="Let the shelter admin invite new staff members."
                defaultChecked={shelter.allow_staff_invites}
              />
              <ToggleRow
                name="allow_volunteer_acceptance"
                label="Allow volunteer acceptance"
                description="Approve volunteer requests from the dashboard."
                defaultChecked={shelter.allow_volunteer_acceptance}
              />
              <ToggleRow
                name="show_public_team"
                label="Show team members publicly"
                description="Display shelter team info on the public shelter page."
                defaultChecked={shelter.show_public_team}
              />
            </div>
          </SectionCard>

          <SectionCard
            id="notifications"
            icon={BellRing}
            title="Notifications"
            description="Choose what you want to be notified about."
          >
            <div className="grid gap-3">
              {notificationRows.map((item) => (
                <ToggleRow
                  key={item.name}
                  name={item.name}
                  label={item.label}
                  description={item.description}
                  defaultChecked={shelter[item.name]}
                />
              ))}
            </div>
          </SectionCard>

          <SectionCard
            id="support"
            icon={Siren}
            title="Emergency & Support"
            description="Critical contacts and emergency procedures for the shelter."
          >
            <div className="grid gap-4 md:grid-cols-2">
              <Field
                label="Emergency Contact Name"
                name="emergency_contact_name"
                icon={Phone}
                defaultValue={shelter.emergency_contact_name}
                placeholder="Emergency contact"
              />
              <Field
                label="Emergency Contact Number"
                name="emergency_contact_phone"
                icon={Phone}
                defaultValue={shelter.emergency_contact_phone}
                placeholder="+20 ..."
              />
              <Field
                label="Nearest Clinic"
                name="nearest_clinic"
                icon={HeartPulse}
                defaultValue={shelter.nearest_clinic}
                placeholder="Clinic name"
              />
              <Field
                label="Backup Transport"
                name="backup_transport"
                icon={TruckIcon}
                defaultValue={shelter.backup_transport}
                placeholder="Transport status"
              />
              <div className="md:col-span-2">
                <Field
                  label="Emergency Notes"
                  name="emergency_notes"
                  icon={Siren}
                  textarea
                  defaultValue={shelter.emergency_notes}
                  placeholder="Emergency instructions..."
                />
              </div>
            </div>
          </SectionCard>

          <SectionCard
            id="danger"
            icon={AlertTriangle}
            title="Danger Zone"
            description="High-risk actions for this shelter account."
          >
            <div className="rounded-3xl border border-red-200 bg-red-50 p-5">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <h3 className="text-lg font-bold text-red-900">
                    Critical shelter actions
                  </h3>
                  <p className="mt-1 text-sm leading-6 text-red-800">
                    These actions affect your shelter visibility and should be
                    used carefully.
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={async () => {
                      if (!confirm("Are you sure you want to request a shelter suspension? This will be sent to the Super Admin for approval.")) return;
                      
                      const user = JSON.parse(localStorage.getItem("user") || "{}");
                      try {
                        const res = await fetch(`${API_URL}/api/requests`, {
                          method: "POST",
                          headers: { 
                            "Content-Type": "application/json", 
                            Authorization: `Bearer ${localStorage.getItem("token")}` 
                          },
                          body: JSON.stringify({
                            requesterName: user.name,
                            requesterEmail: user.email,
                            requesterPhone: user.phone || "N/A",
                            type: "Suspension",
                            shelter: shelter.name,
                            message: "Shelter admin requested suspension of this shelter."
                          })
                        });
                        if (res.ok) alert("Suspension request sent to Super Admin ✅");
                        else alert("Failed to send request.");
                      } catch (err) { alert("Error sending request."); }
                    }}
                    className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-700"
                  >
                    <AlertTriangle className="h-4 w-4" />
                    Suspend Shelter
                  </button>
                </div>
              </div>
            </div>
          </SectionCard>

          <div className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-950">
                Ready to save?
              </h3>
              <p className="mt-1 text-sm text-slate-600">
                Review your shelter settings and save changes.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                <Save className="h-4 w-4" />
                Save Changes
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

function SectionCard({
  id,
  icon: Icon,
  title,
  description,
  children,
}: {
  id: string;
  icon: ComponentType<{ className?: string }>;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      className="scroll-mt-24 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <div className="flex items-start gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white">
          <Icon className="h-6 w-6" />
        </div>

        <div>
          <h2 className="text-xl font-bold text-slate-950">{title}</h2>
          <p className="mt-1 text-sm leading-6 text-slate-600">{description}</p>
        </div>
      </div>

      <div className="mt-6">{children}</div>
    </section>
  );
}

function Field({
  label,
  name,
  icon: Icon,
  defaultValue,
  placeholder,
  type = "text",
  as = "input",
  textarea = false,
  options = [],
}: {
  label: string;
  name: string;
  icon: ComponentType<{ className?: string }>;
  defaultValue?: string;
  placeholder?: string;
  type?: string;
  as?: "input" | "select";
  textarea?: boolean;
  options?: string[];
}) {
  const base =
    "w-full rounded-2xl border border-slate-300 bg-white outline-none transition focus:border-slate-950";

  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-700">
        {label}
      </span>

      <div className="relative">
        {!textarea && (
          <Icon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
        )}

        {textarea ? (
          <textarea
            name={name}
            defaultValue={defaultValue}
            placeholder={placeholder}
            rows={4}
            className={`${base} px-4 py-3`}
          />
        ) : as === "select" ? (
          <select
            name={name}
            defaultValue={defaultValue}
            className={`${base} py-3 pl-12 pr-4`}
          >
            {options.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        ) : (
          <input
            name={name}
            type={type}
            defaultValue={defaultValue}
            placeholder={placeholder}
            className={`${base} py-3 pl-12 pr-4`}
          />
        )}
      </div>
    </label>
  );
}

function ToggleRow({
  name,
  label,
  description,
  defaultChecked = false,
}: {
  name: string;
  label: string;
  description: string;
  defaultChecked?: boolean;
}) {
  return (
    <label className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
      <div>
        <p className="font-semibold text-slate-950">{label}</p>
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </div>

      <input
        type="checkbox"
        name={name}
        defaultChecked={defaultChecked}
        className="h-5 w-5 rounded border-slate-300 text-slate-950 focus:ring-slate-950"
      />
    </label>
  );
}

function TruckIcon({ className }: { className?: string }) {
  return <PawPrint className={className} />;
}