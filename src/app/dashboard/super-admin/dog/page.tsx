"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type ComponentType } from "react";
import {
  PawPrint,
  Search,
  Filter,
  Plus,
  CheckCircle2,
  Clock3,
  HeartPulse,
  AlertTriangle,
  Eye,
  Edit3,
  MapPin,
  CalendarDays,
  ShieldCheck,
  Trash2,
  Loader2,
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

const statusFilters = [
  "All",
  "Available",
  "Reserved",
  "Adopted",
  "In Treatment",
  "Missing",
] as const;

type StatusFilter = (typeof statusFilters)[number];

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function SuperAdminDogsPage() {
  const [dogs, setDogs] = useState<DogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<StatusFilter>("All");
  const [selectedShelter, setSelectedShelter] = useState("All Shelters");
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDogs = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_URL}/api/dogs`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data?.message || "Failed to fetch dogs");
        }

        setDogs(data);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Something went wrong";
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchDogs();
  }, []);

  const shelterOptions = useMemo(() => {
    const unique = Array.from(
      new Set(dogs.map((dog) => dog.shelter).filter(Boolean))
    ) as string[];

    return ["All Shelters", ...unique];
  }, [dogs]);

  const filteredDogs = useMemo(() => {
    return dogs.filter((dog) => {
      const q = searchTerm.toLowerCase();

      const matchesSearch =
        dog.name.toLowerCase().includes(q) ||
        dog.breed.toLowerCase().includes(q) ||
        (dog.shelter ?? "").toLowerCase().includes(q) ||
        (dog.city ?? "").toLowerCase().includes(q) ||
        dog.notes.toLowerCase().includes(q);

      const matchesStatus =
        selectedStatus === "All" ? true : dog.status === selectedStatus;

      const matchesShelter =
        selectedShelter === "All Shelters"
          ? true
          : (dog.shelter ?? "") === selectedShelter;

      return matchesSearch && matchesStatus && matchesShelter;
    });
  }, [dogs, searchTerm, selectedStatus, selectedShelter]);

  const stats = [
    {
      label: "Total Dogs",
      value: dogs.length,
      icon: PawPrint,
    },
    {
      label: "Available",
      value: dogs.filter((d) => d.status === "Available").length,
      icon: CheckCircle2,
    },
    {
      label: "In Treatment",
      value: dogs.filter((d) => d.status === "In Treatment").length,
      icon: HeartPulse,
    },
    {
      label: "Missing",
      value: dogs.filter((d) => d.status === "Missing").length,
      icon: AlertTriangle,
    },
  ];

  const getStatusClass = (status: DogStatus) => {
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
  };

  const getSizeClass = (size: DogSize) => {
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
  };

  const handleDeleteDog = async (id: string) => {
    const ok = window.confirm("Are you sure you want to delete this dog?");
    if (!ok) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/dogs/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || "Failed to delete dog");
      }

      setDogs((prev) => prev.filter((dog) => dog._id !== id));
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
          Loading dogs...
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
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-950">Manage Dogs</h1>
          <p className="mt-2 text-sm text-slate-600">
            Search, filter, and monitor all dogs across the platform.
          </p>
        </div>

        <Link
          href="/dashboard/super-admin/dog/new"
          className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          <Plus className="h-4 w-4" />
          Add Dog
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-600">{item.label}</p>
                <Icon className="h-5 w-5 text-slate-500" />
              </div>
              <p className="mt-3 text-3xl font-bold text-slate-950">{item.value}</p>
            </div>
          );
        })}
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="relative lg:col-span-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, breed, shelter, city..."
              className="w-full rounded-2xl border border-slate-300 bg-white py-3 pl-12 pr-4 outline-none transition focus:border-slate-950"
            />
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

          <div className="relative">
            <Filter className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <select
              value={selectedShelter}
              onChange={(e) => setSelectedShelter(e.target.value)}
              className="w-full rounded-2xl border border-slate-300 bg-white py-3 pl-12 pr-4 outline-none transition focus:border-slate-950"
            >
              {shelterOptions.map((shelter) => (
                <option key={shelter} value={shelter}>
                  {shelter}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {filteredDogs.length > 0 ? (
          filteredDogs.map((dog) => (
            <div key={dog._id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-950 text-white">
                    <PawPrint className="h-7 w-7" />
                  </div>

                  <div className="max-w-3xl">
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="text-2xl font-bold text-slate-950">{dog.name}</h3>

                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(dog.status)}`}>
                        {dog.status}
                      </span>

                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getSizeClass(dog.size)}`}>
                        {dog.size}
                      </span>
                    </div>

                    <p className="mt-2 text-sm text-slate-600">
                      Breed: <span className="font-semibold">{dog.breed}</span>
                    </p>

                    <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-600">
                      <InfoItem
                        icon={MapPin}
                        text={`${dog.shelter || "No shelter"}${dog.city ? `, ${dog.city}` : ""}`}
                      />
                      <InfoItem icon={CalendarDays} text={`${dog.age} years old`} />
                      <InfoItem
                        icon={ShieldCheck}
                        text={dog.vaccinated ? "Vaccinated" : "Not vaccinated"}
                      />
                      <InfoItem
                        icon={ShieldCheck}
                        text={dog.neutered ? "Neutered" : "Not neutered"}
                      />
                    </div>

                    <p className="mt-4 text-sm text-slate-600">
                      Notes: <span className="font-semibold">{dog.notes || "—"}</span>
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-3 lg:min-w-56">
                  <Link
                    href={`/dashboard/super-admin/dog/${dog._id}`}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
                  >
                    <Eye className="h-4 w-4" />
                    View Details
                  </Link>

                  <Link
                    href={`/dashboard/super-admin/dog/${dog._id}/edit`}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                  >
                    <Edit3 className="h-4 w-4" />
                    Edit Dog
                  </Link>

                  <button
                    type="button"
                    onClick={() => handleDeleteDog(dog._id)}
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
            <PawPrint className="mx-auto h-12 w-12 text-slate-400" />
            <h3 className="mt-4 text-xl font-semibold text-slate-950">
              No dogs found
            </h3>
          </div>
        )}
      </div>
    </div>
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