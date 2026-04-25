"use client";

import Link from "next/link";
import { useMemo, useState, useEffect } from "react";
import {
  Dog,
  Search,
  Plus,
  Filter,
  MapPin,
  CalendarDays,
  PawPrint,
  CheckCircle2,
  HeartHandshake,
  ShieldCheck,
  Trash2,
  Edit3,
  Eye,
  ArrowRight,
} from "lucide-react";

type DogStatus = "Available" | "Fostered" | "Adopted" | "Pending";

type DogItem = {
  _id: string;
  name: string;
  breed: string;
  age: number;
  sex: string;
  city: string;
  shelter: string;
  status: DogStatus;
  notes: string;
  vaccinated: boolean;
  featured: boolean;
  photo?: string;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const statusFilters = ["All", "Available", "Fostered", "Adopted", "Pending"] as const;

export default function ShelterAdminDogsPage() {
  const [dogs, setDogs] = useState<DogItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<(typeof statusFilters)[number]>("All");

  useEffect(() => {
    fetchDogs();
  }, []);

  const fetchDogs = async () => {
    try {
      const token = localStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const res = await fetch(`${API_URL}/api/dogs`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      
      const myDogs = Array.isArray(data) 
        ? data.filter((d: any) => !user.assignedShelter || d.shelter === user.assignedShelter) 
        : [];
        
      setDogs(myDogs);
    } catch (err) {
      console.error("Failed to fetch dogs", err);
    }
  };

  const handleDeleteDog = async (id: string) => {
    if (!window.confirm("Are you sure you want to remove this dog?")) return;
    try {
      const res = await fetch(`${API_URL}/api/dogs/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } });
      if (res.ok) fetchDogs();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredDogs = useMemo(() => {
    return dogs.filter((dog) => {
      const locationMatchString = dog.city || "";
      const matchesSearch =
        (dog.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (dog.breed || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        locationMatchString.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (dog.shelter || "").toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        selectedStatus === "All" ? true : dog.status === selectedStatus;

      return matchesSearch && matchesStatus;
    });
  }, [dogs, searchTerm, selectedStatus]);

  const stats = [
    { label: "Total Dogs", value: dogs.length, icon: Dog },
    {
      label: "Available",
      value: dogs.filter((d) => d.status === "Available").length,
      icon: HeartHandshake,
    },
    {
      label: "Fostered",
      value: dogs.filter((d) => d.status === "Fostered").length,
      icon: PawPrint,
    },
    {
      label: "Adopted",
      value: dogs.filter((d) => d.status === "Adopted").length,
      icon: CheckCircle2,
    },
  ];

  const getStatusClass = (status: DogStatus) => {
    switch (status) {
      case "Available":
        return "bg-emerald-100 text-emerald-700";
      case "Fostered":
        return "bg-amber-100 text-amber-700";
      case "Adopted":
        return "bg-slate-200 text-slate-700";
      case "Pending":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-slate-200 text-slate-700";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-950">Manage Dogs</h1>
          <p className="mt-2 text-sm text-slate-600">
            Add, edit, and track all dogs in your shelter.
          </p>
        </div>

        <Link
  href="/dashboard/shelter-admin/dogs/add"
  className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
>
  <Plus className="h-4 w-4" />
  Add New Dog
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
              <p className="mt-3 text-3xl font-bold text-slate-950">{item.value}</p>
            </div>
          );
        })}
      </div>

      {/* Search / filter */}
      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search dogs by name, breed, shelter, or location..."
              className="w-full rounded-2xl border border-slate-300 bg-white py-3 pl-12 pr-4 outline-none transition focus:border-slate-950"
            />
          </div>

          <div className="relative">
            <Filter className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <select
              value={selectedStatus}
              onChange={(e) =>
                setSelectedStatus(e.target.value as (typeof statusFilters)[number])
              }
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

      {/* Dogs list */}
      <div className="space-y-4">
        {filteredDogs.length > 0 ? (
          filteredDogs.map((dog) => (
            <div
              key={dog._id}
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md"
            >
              <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-950 text-white overflow-hidden relative shrink-0">
                    {dog.photo ? (
                      <img src={dog.photo} alt={dog.name} className="h-full w-full object-cover" />
                    ) : (
                      <Dog className="h-7 w-7" />
                    )}
                  </div>

                  <div className="max-w-3xl">
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="text-2xl font-bold text-slate-950">{dog.name}</h3>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(
                          dog.status
                        )}`}
                      >
                        {dog.status}
                      </span>

                      {dog.featured && (
                        <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                          Featured
                        </span>
                      )}
                    </div>

                    <p className="mt-2 text-sm text-slate-600">{dog.breed}</p>
                    <p className="mt-3 text-sm leading-6 text-slate-600">
                      {dog.notes}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-600">
                      <InfoItem icon={CalendarDays} text={`Age: ${dog.age}`} />
                      <InfoItem icon={MapPin} text={`${dog.city} • ${dog.shelter}`} />
                      <InfoItem
                        icon={ShieldCheck}
                        text={dog.vaccinated ? "Vaccinated" : "Not vaccinated"}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-3 lg:min-w-56">
  <Link
    href={`/dashboard/shelter-admin/dogs/${dog._id}`}
    className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
  >
    <Eye className="h-4 w-4" />
    View Details
  </Link>

  <Link
    href={`/dashboard/shelter-admin/dogs/${dog._id}/edit`}
    className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
  >
    <Edit3 className="h-4 w-4" />
    Edit Dog
  </Link>



  <button 
    onClick={() => handleDeleteDog(dog._id)}
    className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 transition hover:bg-red-100"
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
            <Dog className="mx-auto h-12 w-12 text-slate-400" />
            <h3 className="mt-4 text-xl font-semibold text-slate-950">
              No dogs found
            </h3>
            <p className="mt-2 text-sm text-slate-600">
              Try another search term or change the status filter.
            </p>
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
  icon: React.ComponentType<{ className?: string }>;
  text: string;
}) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full bg-slate-50 px-3 py-1">
      <Icon className="h-4 w-4 text-slate-500" />
      <span>{text}</span>
    </div>
  );
}