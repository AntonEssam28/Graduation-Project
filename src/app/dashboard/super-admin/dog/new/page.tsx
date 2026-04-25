"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type ChangeEvent, type FormEvent, type ComponentType } from "react";
import {
  ArrowLeft,
  Save,
  PawPrint,
  MapPin,
  CalendarDays,
  ShieldCheck,
  HeartPulse,
  Dog as DogIcon,
} from "lucide-react";

type DogStatus = "Available" | "Reserved" | "Adopted" | "In Treatment" | "Missing";
type DogSex = "Male" | "Female";
type DogSize = "Small" | "Medium" | "Large";

type DogForm = {
  name: string;
  breed: string;
  age: number;
  sex: DogSex;
  size: DogSize;
  shelter: string;
  city: string;
  status: DogStatus;
  vaccinated: string;
  neutered: string;
  notes: string;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function AddDogPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState<DogForm>({
    name: "",
    breed: "",
    age: 0,
    sex: "Male",
    size: "Medium",
    shelter: "",
    city: "",
    status: "Available",
    vaccinated: "No",
    neutered: "No",
    notes: "",
  });

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: name === "age" ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const payload = {
        ...form,
        vaccinated: form.vaccinated === "Yes",
        neutered: form.neutered === "Yes",
      };

      const res = await fetch(`${API_URL}/api/dogs`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || "Failed to create dog");
      }

      router.push(`/dashboard/super-admin/dog/${data._id}`);
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
        href="/dashboard/super-admin/dog"
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-950"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to dogs
      </Link>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white">
            <PawPrint className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-950">Add Dog</h1>
            <p className="text-sm text-slate-600">
              Create a new dog record.
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
          <Field label="Dog Name" name="name" value={form.name} onChange={handleChange} icon={PawPrint} placeholder="Buddy" />
          <Field label="Breed" name="breed" value={form.breed} onChange={handleChange} icon={PawPrint} placeholder="Golden Retriever" />
          <Field label="Age" name="age" value={form.age} onChange={handleChange} icon={CalendarDays} type="number" />
          <Field label="Sex" name="sex" value={form.sex} onChange={handleChange} icon={DogIcon} as="select" options={["Male", "Female"]} />
          <Field label="Size" name="size" value={form.size} onChange={handleChange} icon={ShieldCheck} as="select" options={["Small", "Medium", "Large"]} />
          <Field label="Status" name="status" value={form.status} onChange={handleChange} icon={HeartPulse} as="select" options={["Available", "Reserved", "Adopted", "In Treatment", "Missing"]} />
          <Field label="Shelter" name="shelter" value={form.shelter} onChange={handleChange} icon={MapPin} placeholder="Cairo Shelter" />
          <Field label="City" name="city" value={form.city} onChange={handleChange} icon={MapPin} placeholder="Cairo" />
          <Field label="Vaccinated" name="vaccinated" value={form.vaccinated} onChange={handleChange} icon={ShieldCheck} as="select" options={["Yes", "No"]} />
          <Field label="Neutered" name="neutered" value={form.neutered} onChange={handleChange} icon={ShieldCheck} as="select" options={["Yes", "No"]} />
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
            {loading ? "Creating..." : "Create Dog"}
          </button>

          <Link
            href="/dashboard/super-admin/dogs"
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
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
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