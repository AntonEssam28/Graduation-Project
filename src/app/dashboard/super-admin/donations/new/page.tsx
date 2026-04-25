"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type ChangeEvent, type FormEvent, type ComponentType } from "react";
import {
  ArrowLeft,
  Save,
  Gift,
  Mail,
  Phone,
  Building2,
  MapPin,
  DollarSign,
  CalendarDays,
} from "lucide-react";
import type { DonationStatus, DonationType } from "@/lib/dontaions";

const typeOptions = ["Cash", "Food", "Medicine", "Supplies"] as const;
const statusOptions = ["Pending", "Approved", "Received", "Rejected"] as const;

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function AddDonationPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    donorName: "",
    donorEmail: "",
    phone: "",
    type: "Cash" as DonationType,
    value: 0,
    unit: "EGP",
    shelter: "",
    city: "",
    status: "Pending" as DonationStatus,
    notes: "",
  });

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: name === "value" ? Number(value) : value,
    }));
  };

  const readResponse = async (res: Response) => {
    const contentType = res.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      return await res.json();
    }

    return await res.text();
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const payload = {
        donorName: form.donorName,
        donorEmail: form.donorEmail,
        phone: form.phone,
        type: form.type,
        value: Number(form.value),
        unit: form.unit,
        shelter: form.shelter,
        city: form.city,
        status: form.status,
        notes: form.notes,
      };

      const res = await fetch(`${API_URL}/api/donations`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` },
        body: JSON.stringify(payload),
      });

      const data = await readResponse(res);

      if (!res.ok) {
        throw new Error(
          typeof data === "string"
            ? data
            : data?.message || `Failed to create donation (${res.status})`
        );
      }

      router.push("/dashboard/super-admin/donations");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Link
        href="/dashboard/super-admin/donations"
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-950"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to donations
      </Link>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white">
            <Gift className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-950">Add Donation</h1>
            <p className="text-sm text-slate-600">Create a new donation record.</p>
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
          <Field label="Donor Name" name="donorName" value={form.donorName} onChange={handleChange} icon={Gift} />
          <Field label="Donor Email" name="donorEmail" value={form.donorEmail} onChange={handleChange} icon={Mail} />
          <Field label="Phone" name="phone" value={form.phone} onChange={handleChange} icon={Phone} />
          <Field label="Type" name="type" value={form.type} onChange={handleChange} icon={Gift} as="select" options={[...typeOptions]} />
          <Field label="Value" name="value" value={form.value} onChange={handleChange} icon={DollarSign} type="number" />
          <Field label="Unit" name="unit" value={form.unit} onChange={handleChange} icon={DollarSign} />
          <Field label="Shelter" name="shelter" value={form.shelter} onChange={handleChange} icon={Building2} />
          <Field label="City" name="city" value={form.city} onChange={handleChange} icon={MapPin} />
          <Field label="Status" name="status" value={form.status} onChange={handleChange} icon={CalendarDays} as="select" options={[...statusOptions]} />

          <div className="md:col-span-2">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">
                Notes
              </span>
              <textarea
                name="notes"
                value={form.notes}
                onChange={handleChange}
                rows={4}
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-slate-950"
              />
            </label>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Save className="h-4 w-4" />
            {loading ? "Creating..." : "Create Donation"}
          </button>

          <Link
            href="/dashboard/super-admin/donations"
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
}: {
  label: string;
  name: string;
  value: string | number;
  onChange: (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => void;
  icon: ComponentType<{ className?: string }>;
  type?: string;
  as?: "input" | "select";
  options?: string[];
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
            {options.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        ) : (
          <input
            name={name}
            type={type}
            value={value}
            onChange={onChange}
            className="w-full rounded-2xl border border-slate-300 bg-white py-3 pl-12 pr-4 outline-none transition focus:border-slate-950"
          />
        )}
      </div>
    </label>
  );
}