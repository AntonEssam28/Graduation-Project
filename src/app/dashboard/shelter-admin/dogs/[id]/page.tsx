"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import {
  ArrowLeft,
  Dog,
  CalendarDays,
  MapPin,
  ShieldCheck,
  HeartHandshake,
  PawPrint,
  Edit3,
} from "lucide-react";

type DogItem = {
  _id: string;
  name: string;
  breed: string;
  age: number;
  sex: string;
  city: string;
  shelter: string;
  status: "Available" | "Fostered" | "Adopted" | "Pending";
  notes: string;
  vaccinated: boolean;
  featured: boolean;
  photo?: string;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

import { useParams } from "next/navigation";

export default function ShelterDogDetailsPage() {
  const params = useParams();
  const id = params?.id as string;
  
  const [dog, setDog] = useState<DogItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    fetch(`${API_URL}/api/dogs/${id}`, { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }})
      .then(res => {
        if (!res.ok) throw new Error("Not found");
        return res.json();
      })
      .then(data => {
        setDog(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (!dog) return (
    <div className="flex h-64 items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-slate-50">
      <div className="text-center">
        <Dog className="mx-auto h-12 w-12 text-slate-400" />
        <h2 className="mt-4 text-xl font-semibold text-slate-950">Dog Not Found</h2>
        <p className="mt-2 text-sm text-slate-600">The dog you are looking for does not exist or has been removed.</p>
        <Link href="/dashboard/shelter-admin/dogs" className="mt-6 inline-block rounded-xl bg-slate-950 px-6 py-3 text-sm font-semibold text-white">Back to List</Link>
      </div>
    </div>
  );

  const getStatusClass = () => {
    switch (dog.status) {
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
      <Link
        href="/dashboard/shelter-admin/dogs"
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-slate-950"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Dogs
      </Link>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-950 text-white overflow-hidden relative shrink-0">
              {dog.photo ? (
                <img src={dog.photo} alt={dog.name} className="h-full w-full object-cover" />
              ) : (
                <Dog className="h-7 w-7" />
              )}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-3xl font-bold text-slate-950">{dog.name}</h1>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass()}`}
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
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
                {dog.notes}
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <Link
              href={`/dashboard/shelter-admin/dogs/${dog._id}/edit`}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              <Edit3 className="h-4 w-4" />
              Edit Dog
            </Link>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
              <h2 className="text-xl font-bold text-slate-950">Dog Information</h2>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <InfoBox label="Age" value={`${dog.age} years`} icon={CalendarDays} />
                <InfoBox label="Gender" value={dog.sex} icon={ShieldCheck} />
                <InfoBox label="Location" value={dog.city} icon={MapPin} />
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6">
              <h2 className="text-xl font-bold text-slate-950">Health & Care</h2>

              <div className="mt-6 space-y-4 text-sm text-slate-700">

                <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-4">
                  <span>Vaccinated</span>
                  <span className="font-semibold text-slate-950">
                    {dog.vaccinated ? "Yes" : "No"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-6">
              <h3 className="text-xl font-bold text-slate-950">Quick Actions</h3>

              <div className="mt-5 flex flex-col gap-3">
                

                <Link
                  href={`/dashboard/shelter-admin/dogs/${dog._id}/edit`}
                  className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
                >
                  Edit Dog
                </Link>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
              <h3 className="text-xl font-bold text-slate-950">Shelter</h3>
              <p className="mt-3 text-sm text-slate-600">{dog.shelter}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoBox({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="rounded-2xl bg-white p-4 border border-slate-200">
      <div className="flex items-center gap-2 text-slate-500">
        <Icon className="h-4 w-4" />
        <span className="text-sm">{label}</span>
      </div>
      <p className="mt-2 text-lg font-semibold text-slate-950">{value}</p>
    </div>
  );
}