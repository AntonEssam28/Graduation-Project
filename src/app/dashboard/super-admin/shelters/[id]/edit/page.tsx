"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, type ChangeEvent, type FormEvent, type ComponentType } from "react";
import {
  ArrowLeft,
  Save,
  Building2,
  MapPin,
  User,
  Dog,
  FileText,
  Package,
  ShieldCheck,
} from "lucide-react";

type ShelterStatus = "Active" | "Pending Approval" | "Under Review" | "Suspended";

type ShelterForm = {
  name: string;
  city: string;
  address: string;
  adminName: string;
  status: ShelterStatus;
  dogsCount: number;
  reportsCount: number;
  suppliesAlerts: number;
};

export default function EditShelterPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const shelterId = params.id;

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");

  const [form, setForm] = useState<ShelterForm>({
    name: "",
    city: "",
    address: "",
    adminName: "",
    status: "Pending Approval",
    dogsCount: 0,
    reportsCount: 0,
    suppliesAlerts: 0,
  });

  useEffect(() => {
    const fetchShelter = async () => {
      try {
        setFetching(true);
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/shelters/${shelterId}`
        );

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data?.message || "Failed to fetch shelter");
        }

        setForm({
          name: data.name || "",
          city: data.city || "",
          address: data.address || "",
          adminName: data.adminName || "",
          status: data.status || "Pending Approval",
          dogsCount: data.dogsCount || 0,
          reportsCount: data.reportsCount || 0,
          suppliesAlerts: data.suppliesAlerts || 0,
        });
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Something went wrong";
        setError(message);
      } finally {
        setFetching(false);
      }
    };

    fetchShelter();
  }, [shelterId]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]:
        name === "dogsCount" || name === "reportsCount" || name === "suppliesAlerts"
          ? Number(value)
          : value,
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/shelters/${shelterId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` },
          body: JSON.stringify(form),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || "Failed to update shelter");
      }

      router.push("/dashboard/super-admin/shelters");
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
        Loading shelter data...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link
        href="/dashboard/super-admin/shelters"
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-950"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to shelters
      </Link>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white">
            <Building2 className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-950">Edit Shelter</h1>
            <p className="text-sm text-slate-600">
              Update shelter information in MongoDB.
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
            label="Shelter Name"
            name="name"
            value={form.name}
            onChange={handleChange}
            icon={Building2}
            placeholder="Cairo Shelter"
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
            label="Address"
            name="address"
            value={form.address}
            onChange={handleChange}
            icon={MapPin}
            placeholder="Nasr City, Cairo"
          />

          <Field
            label="Admin Name"
            name="adminName"
            value={form.adminName}
            onChange={handleChange}
            icon={User}
            placeholder="Sara Ahmed"
          />

          <Field
            label="Status"
            name="status"
            value={form.status}
            onChange={handleChange}
            icon={ShieldCheck}
            as="select"
            options={[
              "Active",
              "Pending Approval",
              "Under Review",
              "Suspended",
            ]}
          />

          <Field
            label="Dogs Count"
            name="dogsCount"
            value={form.dogsCount}
            onChange={handleChange}
            icon={Dog}
            type="number"
          />

          <Field
            label="Reports Count"
            name="reportsCount"
            value={form.reportsCount}
            onChange={handleChange}
            icon={FileText}
            type="number"
          />

          <Field
            label="Supply Alerts"
            name="suppliesAlerts"
            value={form.suppliesAlerts}
            onChange={handleChange}
            icon={Package}
            type="number"
          />
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
            href="/dashboard/super-admin/shelters"
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