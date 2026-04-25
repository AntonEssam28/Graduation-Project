"use client";

import Link from "next/link";
import { useEffect, useState, type ComponentType } from "react";

import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Users,
  Mail,
  Phone,
  MapPin,
  Shield,
  CalendarDays,
  Clock3,
  UserCog,
  Edit3,
  Trash2,
  CheckCircle2,
  Ban,
  AlertTriangle,
} from "lucide-react";

type UserRole =
  | "Super Admin"
  | "Shelter Admin"
  | "Volunteer"
  | "Adopter"
  | "User"
  | "Vet"
  | "Staff";

type UserStatus = "Active" | "Pending Approval" | "Invited";

type UserItem = {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  city?: string;
  role: UserRole;
  status: UserStatus;
  assignedShelter?: string;
  lastLogin?: string | null;
  createdAt: string;
  updatedAt: string;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function UserDetailsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const [user, setUser] = useState<UserItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_URL}/api/users/${params.id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data?.message || "Failed to fetch user");
        }

        setUser(data);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Something went wrong";
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [params.id]);

  const handleDelete = async () => {
    if (!user) return;

    const ok = window.confirm("Are you sure you want to delete this user?");
    if (!ok) return;

    try {
      setDeleting(true);

      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/users/${user._id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || "Failed to delete user");
      }

      router.push("/dashboard/super-admin/users");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      setError(message);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        Loading user details...
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700">
        {error || "User not found"}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link
        href="/dashboard/super-admin/users"
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-950"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to users
      </Link>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-950 text-white">
              <Users className="h-7 w-7" />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-3xl font-bold text-slate-950">
                  {user.name}
                </h1>

                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getRoleClass(user.role)}`}>
                  {user.role}
                </span>

                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(user.status)}`}>
                  {user.status}
                </span>
              </div>

              <div className="mt-4 flex flex-wrap gap-3">
                <InfoItem icon={Mail} text={user.email} />
                <InfoItem icon={Phone} text={user.phone || "No phone"} />
                <InfoItem icon={MapPin} text={user.city || "No city"} />
                {user.assignedShelter && (
                  <InfoItem icon={Shield} text={`Assigned shelter: ${user.assignedShelter}`} />
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 lg:min-w-56">
            <Link
              href={`/dashboard/super-admin/users/${user._id}/edit`}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              <Edit3 className="h-4 w-4" />
              Edit User
            </Link>

            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-300 bg-white px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Trash2 className="h-4 w-4" />
              {deleting ? "Deleting..." : "Remove User"}
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Role" value={user.role} icon={UserCog} />
        <StatCard label="Status" value={user.status} icon={Shield} />
        <StatCard
          label="Joined At"
          value={formatDate(user.createdAt)}
          icon={CalendarDays}
        />
        <StatCard
          label="Last Login"
          value={user.lastLogin ? formatDate(user.lastLogin) : "No login yet"}
          icon={Clock3}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
          <h2 className="text-xl font-bold text-slate-950">User Information</h2>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <InfoBox label="Full Name" value={user.name} />
            <InfoBox label="Email" value={user.email} />
            <InfoBox label="Phone" value={user.phone || "—"} />
            <InfoBox label="City" value={user.city || "—"} />
            <InfoBox label="Role" value={user.role} />
            <InfoBox label="Status" value={user.status} />
            <InfoBox label="Assigned Shelter" value={user.assignedShelter || "—"} />
            <InfoBox label="Updated At" value={formatDate(user.updatedAt)} />
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-950">Status Guide</h2>
          <div className="mt-5 space-y-4 text-sm text-slate-700">
            <InfoItem icon={CheckCircle2} text="Active = account working normally" />
            <InfoItem icon={Clock3} text="Pending Approval = waiting review" />
            <InfoItem icon={AlertTriangle} text="Invited = invitation sent" />
          </div>
        </div>
      </div>
    </div>
  );
}

function getRoleClass(role: UserRole) {
  switch (role) {
    case "Super Admin":
      return "bg-slate-950 text-white";
    case "Shelter Admin":
      return "bg-blue-100 text-blue-700";
    case "Volunteer":
      return "bg-emerald-100 text-emerald-700";
    case "Adopter":
      return "bg-violet-100 text-violet-700";
    case "User":
      return "bg-slate-100 text-slate-700";
    case "Vet":
      return "bg-amber-100 text-amber-700";
    case "Staff":
      return "bg-cyan-100 text-cyan-700";
    default:
      return "bg-slate-200 text-slate-700";
  }
}

function getStatusClass(status: UserStatus) {
  switch (status) {
    case "Active":
      return "bg-emerald-100 text-emerald-700";
    case "Pending Approval":
      return "bg-amber-100 text-amber-700";
    case "Invited":
      return "bg-blue-100 text-blue-700";
    default:
      return "bg-slate-200 text-slate-700";
  }
}

function InfoItem({
  icon: Icon,
  text,
}: {
  icon: ComponentType<{ className?: string }>;

  text: string;
}) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1">
      <Icon className="h-4 w-4 text-slate-500" />
      <span>{text}</span>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: ComponentType<{ className?: string }>;

}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-600">{label}</p>
        <Icon className="h-5 w-5 text-slate-500" />
      </div>
      <p className="mt-3 text-2xl font-bold text-slate-950">{value}</p>
    </div>
  );
}

function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-1 font-semibold text-slate-950">{value}</p>
    </div>
  );
}

function formatDate(date: string) {
  return new Date(date).toLocaleString();
}