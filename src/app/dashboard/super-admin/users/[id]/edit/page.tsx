"use client";

import Link from "next/link";
import { useEffect, useState, type ChangeEvent, type FormEvent, type ComponentType } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Save,
  Users,
  Mail,
  Phone,
  MapPin,
  Shield,
  UserCog,
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

type UserForm = {
  name: string;
  email: string;
  phone: string;
  city: string;
  role: UserRole;
  status: UserStatus;
  assignedShelter: string;
  lastLogin: string;
  password?: string;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function EditUserPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");

  const [shelters, setShelters] = useState<string[]>([]);
  const [form, setForm] = useState<UserForm>({
    name: "",
    email: "",
    phone: "",
    city: "",
    role: "Adopter",
    status: "Active",
    assignedShelter: "",
    lastLogin: "",
    password: "",
  });

  useEffect(() => {
    const fetchShelters = async () => {
      try {
        const res = await fetch(`${API_URL}/api/shelters`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        });
        const data = await res.json();
        const shelterNames = (Array.isArray(data) ? data : (data.data || [])).map((s: any) => s.name);
        setShelters(shelterNames);
      } catch (err) {
        console.error("Failed to fetch shelters", err);
      }
    };
    fetchShelters();
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setFetching(true);
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_URL}/api/users/${params.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data?.message || "Failed to fetch user");
        }

        setForm({
          name: data.name || "",
          email: data.email || "",
          phone: data.phone || "",
          city: data.city || "",
          role: data.role || "Adopter",
          status: data.status || "Active",
          assignedShelter: data.assignedShelter || "",
          lastLogin: data.lastLogin ? String(data.lastLogin).slice(0, 19) : "",
          password: "", // Always start empty for security
        });
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Something went wrong";
        setError(message);
      } finally {
        setFetching(false);
      }
    };

    fetchUser();
  }, [params.id]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/users/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || "Failed to update user");
      }

      router.push("/dashboard/super-admin/users");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        Loading user data...
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
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-950">Edit User</h1>
            <p className="text-sm text-slate-600">
              Update user information in MongoDB.
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div className="grid gap-4 md:grid-cols-2">
          <Field
            label="Full Name"
            name="name"
            value={form.name}
            onChange={handleChange}
            icon={Users}
            placeholder="Ali Hassan"
          />
          <Field
            label="Email"
            name="email"
            value={form.email}
            onChange={handleChange}
            icon={Mail}
            placeholder="ali@pawcare.com"
          />
          <Field
            label="Phone"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            icon={Phone}
            placeholder="+20 ..."
          />
          <Field
            label="City"
            name="city"
            value={form.city}
            onChange={handleChange}
            icon={MapPin}
            placeholder="Cairo"
          />
          <Field
            label="Role"
            name="role"
            value={form.role}
            onChange={handleChange}
            icon={UserCog}
            as="select"
            options={[
              "Super Admin",
              "Shelter Admin",
              "Volunteer",
              "Adopter",
              "User",
              "Vet",
              "Staff",
            ]}
          />
          <Field
            label="Status"
            name="status"
            value={form.status}
            onChange={handleChange}
            icon={Shield}
            as="select"
            options={["Active", "Pending Approval", "Invited"]}
          />
          <div className="md:col-span-2">
            <Field
              label="Assigned Shelter"
              name="assignedShelter"
              value={form.assignedShelter}
              onChange={handleChange}
              icon={Shield}
              as="select"
              options={["", ...shelters]}
              placeholder="Select a shelter"
            />
          </div>
          <div className="md:col-span-2">
            <Field
              label="Reset Password"
              name="password"
              type="password"
              value={form.password || ""}
              onChange={handleChange}
              icon={Shield}
              placeholder="Enter new password to reset (leave empty to keep current)"
            />
          </div>
          <div className="md:col-span-2">
            <Field
              label="Last Login"
              name="lastLogin"
              value={form.lastLogin}
              onChange={handleChange}
              icon={Shield}
              placeholder="2026-04-16T12:00:00"
            />
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Save className="h-4 w-4" />
            {loading ? "Saving..." : "Save Changes"}
          </button>

          <Link
            href="/dashboard/super-admin/users"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}

function Field({
  label,
  name,
  value,
  onChange,
  icon: Icon,
  type = "text",
  as = "input",
  options = [],
  placeholder = "",
}: {
  label: string;
  name: string;
  value: string | number;
  onChange: (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;
  icon: ComponentType<{ className?: string }>;
  type?: string;
  as?: "input" | "select";
  options?: string[];
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-700">
        {label}
      </span>

      <div className="relative">
        <Icon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

        {as === "select" ? (
          <select
            name={name}
            value={value}
            onChange={onChange}
            className="w-full rounded-2xl border border-slate-300 bg-white py-3 pl-12 pr-4 outline-none transition focus:border-slate-950"
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
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className="w-full rounded-2xl border border-slate-300 bg-white py-3 pl-12 pr-4 outline-none transition focus:border-slate-950"
          />
        )}
      </div>
    </label>
  );
}