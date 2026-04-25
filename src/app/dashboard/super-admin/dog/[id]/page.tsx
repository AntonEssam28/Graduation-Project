"use client";

import Link from "next/link";
import { useEffect, useState, type ComponentType } from "react";

import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  PawPrint,
  MapPin,
  CalendarDays,
  ShieldCheck,
  HeartPulse,
  Edit3,
  Trash2,
  CheckCircle2,
  Clock3,
  AlertTriangle,
  Dog as DogIcon,
} from "lucide-react";

type DogStatus = "Available" | "Reserved" | "Adopted" | "In Treatment" | "Missing";
type DogSex = "Male" | "Female";
type DogSize = "Small" | "Medium" | "Large";

type DogItem = {
  _id: string;
  name: string;
  breed: string;
  age: number;
  sex: DogSex;
  size: DogSize;
  shelter?: string;
  city?: string;
  status: DogStatus;
  vaccinated: boolean;
  neutered: boolean;
  notes: string;
  createdAt: string;
  updatedAt: string;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function DogDetailsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const [dog, setDog] = useState<DogItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchDog = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_URL}/api/dogs/${params.id}`, { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }});
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data?.message || "Failed to fetch dog");
        }

        setDog(data);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Something went wrong";
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchDog();
  }, [params.id]);

  const handleDelete = async () => {
    if (!dog) return;

    const ok = window.confirm("Are you sure you want to delete this dog?");
    if (!ok) return;

    try {
      setDeleting(true);

      const res = await fetch(`${API_URL}/api/dogs/${dog._id}`, { method: "DELETE", headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || "Failed to delete dog");
      }

      router.push("/dashboard/super-admin/dog");
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
        Loading dog details...
      </div>
    );
  }

  if (error || !dog) {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700">
        {error || "Dog not found"}
      </div>
    );
  }

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
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-950 text-white">
              <PawPrint className="h-7 w-7" />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-3xl font-bold text-slate-950">{dog.name}</h1>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(dog.status)}`}>
                  {dog.status}
                </span>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getSizeClass(dog.size)}`}>
                  {dog.size}
                </span>
              </div>

              <div className="mt-4 flex flex-wrap gap-3">
                <InfoItem
                  icon={MapPin}
                  text={`${dog.shelter || "No shelter"}${dog.city ? `, ${dog.city}` : ""}`}
                />
                <InfoItem icon={CalendarDays} text={`${dog.age} years old`} />
                <InfoItem icon={DogIcon} text={dog.sex} />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 lg:min-w-56">
            <Link
              href={`/dashboard/super-admin/dog/${dog._id}/edit`}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              <Edit3 className="h-4 w-4" />
              Edit Dog
            </Link>

            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-300 bg-white px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Trash2 className="h-4 w-4" />
              {deleting ? "Deleting..." : "Remove Dog"}
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Breed" value={dog.breed} icon={PawPrint} />
        <StatCard label="Age" value={`${dog.age} years`} icon={CalendarDays} />
        <StatCard label="Vaccinated" value={dog.vaccinated ? "Yes" : "No"} icon={ShieldCheck} />
        <StatCard label="Neutered" value={dog.neutered ? "Yes" : "No"} icon={HeartPulse} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
          <h2 className="text-xl font-bold text-slate-950">Dog Information</h2>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <InfoBox label="Breed" value={dog.breed} />
            <InfoBox label="Sex" value={dog.sex} />
            <InfoBox label="Size" value={dog.size} />
            <InfoBox label="Status" value={dog.status} />
            <InfoBox label="Shelter" value={dog.shelter || "—"} />
            <InfoBox label="City" value={dog.city || "—"} />
            <InfoBox label="Created At" value={formatDate(dog.createdAt)} />
            <InfoBox label="Updated At" value={formatDate(dog.updatedAt)} />
            <div className="rounded-2xl bg-slate-50 p-4 md:col-span-2">
              <p className="text-sm text-slate-500">Notes</p>
              <p className="mt-1 font-semibold text-slate-950">
                {dog.notes || "—"}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-950">Status Guide</h2>
          <div className="mt-5 space-y-4 text-sm text-slate-700">
            <InfoItem icon={CheckCircle2} text="Available = ready for adoption" />
            <InfoItem icon={Clock3} text="Reserved = waiting for adoption decision" />
            <InfoItem icon={HeartPulse} text="In Treatment = under medical care" />
            <InfoItem icon={AlertTriangle} text="Missing = not currently in shelter" />
          </div>
        </div>
      </div>
    </div>
  );
}

function getStatusClass(status: DogStatus) {
  switch (status) {
    case "Available":
      return "bg-emerald-100 text-emerald-700";
    case "Reserved":
      return "bg-blue-100 text-blue-700";
    case "Adopted":
      return "bg-violet-100 text-violet-700";
    case "In Treatment":
      return "bg-amber-100 text-amber-700";
    case "Missing":
      return "bg-red-100 text-red-700";
    default:
      return "bg-slate-200 text-slate-700";
  }
}

function getSizeClass(size: DogSize) {
  switch (size) {
    case "Small":
      return "bg-cyan-100 text-cyan-700";
    case "Medium":
      return "bg-slate-100 text-slate-700";
    case "Large":
      return "bg-orange-100 text-orange-700";
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