"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type ComponentType } from "react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import {
  Users,
  Search,
  Filter,
  UserCog,
  CheckCircle2,
  Clock3,
  Ban,
  Plus,
  Mail,
  Phone,
  MapPin,
  Shield,
  Eye,
  Edit3,
  Trash2,
  Loader2,
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
  photo?: string;
  createdAt: string;
  updatedAt: string;
};

const roleFilters = [
  "All Roles",
  "Super Admin",
  "Shelter Admin",
  "Volunteer",
  "Adopter",
  "User",
  "Vet",
  "Staff",
] as const;

const statusFilters = [
  "All Statuses",
  "Active",
  "Pending Approval",
  "Invited",
] as const;

type RoleFilter = (typeof roleFilters)[number];
type StatusFilter = (typeof statusFilters)[number];

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function SuperAdminUsersPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState<RoleFilter>("All Roles");
  const [selectedStatus, setSelectedStatus] =
    useState<StatusFilter>("All Statuses");
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_URL}/api/users`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data?.message || "Failed to fetch users");
        }

        const usersData = Array.isArray(data) ? data : (data.data || []);
        setUsers(usersData);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Something went wrong";
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const q = searchTerm.toLowerCase();

      const matchesSearch =
        user.name.toLowerCase().includes(q) ||
        user.email.toLowerCase().includes(q) ||
        (user.phone ?? "").toLowerCase().includes(q) ||
        (user.city ?? "").toLowerCase().includes(q) ||
        user.role.toLowerCase().includes(q) ||
        (user.assignedShelter ?? "").toLowerCase().includes(q);

      const matchesRole =
        selectedRole === "All Roles" ? true : user.role === selectedRole;

      const matchesStatus =
        selectedStatus === "All Statuses"
          ? true
          : user.status === selectedStatus;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchTerm, selectedRole, selectedStatus]);

  const stats = [
    {
      label: "Total Users",
      value: users.length,
      icon: Users,
    },
    {
      label: "Active",
      value: users.filter((u) => u.status === "Active").length,
      icon: CheckCircle2,
    },
    {
      label: "Admins",
      value: users.filter((u) => u.role.includes("Admin")).length,
      icon: UserCog,
    },
  ];

  const getRoleClass = (role: UserRole) => {
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
  };

  const getStatusClass = (status: UserStatus) => {
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
  };

  const handleDeleteUser = async (id: string) => {
    const ok = window.confirm("Are you sure you want to delete this user?");
    if (!ok) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/users/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || "Failed to delete user");
      }

      setUsers((prev) => prev.filter((user) => user._id !== id));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      alert(message);
    }
  };

  if (loading) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2 text-slate-600">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading users...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700">
        {error}
      </div>
    );
  }

  return (
    <ProtectedRoute allowedRoles={["Super Admin"]} permission="users">
      <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-950">Manage Users</h1>
          <p className="mt-2 text-sm text-slate-600">
            Search, filter, and monitor all platform users.
          </p>
        </div>

        <Link
          href="/dashboard/super-admin/users/new"
          className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          <Plus className="h-4 w-4" />
          Add User
        </Link>
      </div>

      {/* Stats */}
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
              <p className="mt-3 text-3xl font-bold text-slate-950">
                {item.value}
              </p>
            </div>
          );
        })}
      </div>

      {/* Search / filter */}
      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="relative lg:col-span-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, email, phone, city..."
              className="w-full rounded-2xl border border-slate-300 bg-white py-3 pl-12 pr-4 outline-none transition focus:border-slate-950"
            />
          </div>

          <div className="relative">
            <Filter className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value as RoleFilter)}
              className="w-full rounded-2xl border border-slate-300 bg-white py-3 pl-12 pr-4 outline-none transition focus:border-slate-950"
            >
              {roleFilters.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </div>

          <div className="relative">
            <Filter className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as StatusFilter)}
              className="w-full rounded-2xl border border-slate-300 bg-white py-3 pl-12 pr-4 outline-none transition focus:border-slate-950"
            >
              {statusFilters.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* List */}
      <div className="space-y-4">
        {filteredUsers.length > 0 ? (
          filteredUsers.map((user, index) => (
            <div
              key={user._id}
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md"
            >
              <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex items-start gap-4">
                  <div
                    className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-white overflow-hidden relative ${
                      user.photo ? "bg-slate-100" : avatarColors[index % avatarColors.length]
                    }`}
                  >
                    {user.photo ? (
                      <img src={user.photo} alt={user.name} className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-sm font-bold">
                        {getInitials(user.name)}
                      </span>
                    )}
                  </div>

                  <div className="max-w-3xl">
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="text-2xl font-bold text-slate-950">
                        {user.name}
                      </h3>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${getRoleClass(
                          user.role
                        )}`}
                      >
                        {user.role}
                      </span>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(
                          user.status
                        )}`}
                      >
                        {user.status}
                      </span>
                    </div>

                    <div className="mt-4 space-y-2 text-sm text-slate-600">
                      <InfoItem icon={Mail} text={user.email} />
                      <InfoItem icon={Phone} text={user.phone || "No phone"} />
                      <InfoItem icon={MapPin} text={user.city || "No city"} />
                      {user.role === "Shelter Admin" && (
                        <div className="inline-flex items-center gap-2 rounded-xl bg-blue-50 px-4 py-2 border border-blue-100">
                          <Shield className="h-4 w-4 text-blue-600" />
                          <span className="text-blue-900 font-bold">
                            Admin of: {user.assignedShelter || "No Shelter Assigned"}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 flex flex-col gap-1 text-sm text-slate-500">
                      <p>
                        Joined at:{" "}
                        <span className="font-semibold text-slate-700">
                          {formatDate(user.createdAt)}
                        </span>
                      </p>
                      <p>
                        Last Login:{" "}
                        <span className="font-semibold text-slate-700">
                          {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : "Never"}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-3 lg:min-w-56">
                  <Link
                    href={`/dashboard/super-admin/users/${user._id}`}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
                  >
                    <Eye className="h-4 w-4" />
                    View Details
                  </Link>

                  <Link
                    href={`/dashboard/super-admin/users/${user._id}/edit`}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                  >
                    <Edit3 className="h-4 w-4" />
                    Edit User
                  </Link>

                  <button
                    type="button"
                    onClick={() => handleDeleteUser(user._id)}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-300 bg-white px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 py-16 text-center">
            <Users className="mx-auto h-12 w-12 text-slate-400" />
            <h3 className="mt-4 text-xl font-semibold text-slate-950">
              No users found
            </h3>
          </div>
        )}
      </div>
      </div>
    </ProtectedRoute>
  );
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

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString();
}

const avatarColors = [
  "bg-slate-950",
  "bg-blue-600",
  "bg-emerald-600",
  "bg-amber-600",
  "bg-violet-600",
];