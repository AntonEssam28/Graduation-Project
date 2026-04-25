"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  HeartHandshake,
  Dog,
  HandCoins,
  ShoppingBag,
  MapPin,
  ShieldCheck,
  PawPrint,
  ArrowRight,
  Users,
  Sparkles,
  Loader2,
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const services = [
  {
    icon: Dog,
    title: "Rescue Reports",
    description: "Report stray dogs with location, photo, and details so the shelter can rescue them quickly.",
  },
  {
    icon: HeartHandshake,
    title: "Adoption & Foster",
    description: "Adopt a dog permanently or host one temporarily while the owner is away.",
  },
  {
    icon: HandCoins,
    title: "Donations",
    description: "Support the shelter through money donations or monthly contributions.",
  },
  {
    icon: ShoppingBag,
    title: "Supplies Store",
    description: "Order food, medicine, blankets, and other supplies for the dogs.",
  },
];

const steps = [
  {
    number: "01",
    title: "Report or Browse",
    description: "Report a stray dog or browse available dogs for adoption and fostering.",
  },
  {
    number: "02",
    title: "Shelter Review",
    description: "The shelter admin reviews the request and updates the dog status.",
  },
  {
    number: "03",
    title: "Help the Dog",
    description: "Adopt, foster, donate, or order supplies to support the dog.",
  },
];

export default function HomePage() {
  const [dogs, setDogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dashboardStats, setDashboardStats] = useState({
    rescued: "250+",
    users: "1.2K+",
    shelters: "8",
    adoptions: "140+"
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${API_URL}/api/dogs`);
        const data = await res.json();
        const dogsArray = Array.isArray(data) ? data : (data.data || []);
        // Display top 3 for featured section
        setDogs(dogsArray.slice(0, 3));

        // Attempt to fetch real stats if available
        const [usersRes, sheltersRes] = await Promise.all([
            fetch(`${API_URL}/api/users`).catch(() => null),
            fetch(`${API_URL}/api/shelters`).catch(() => null),
        ]);

        if (usersRes?.ok && sheltersRes?.ok) {
            const u = await usersRes.json();
            const s = await sheltersRes.json();
            setDashboardStats({
                rescued: `${dogsArray.length}+`,
                users: `${u.length}+`,
                shelters: `${s.length}`,
                adoptions: "140+" // Placeholder since no adoptions api shown yet
            });
        }
      } catch (err) {
        console.error("Failed to fetch home data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.08),_transparent_35%)]" />
        <div className="absolute -right-24 top-20 h-72 w-72 rounded-full bg-amber-400/10 blur-3xl" />
        <div className="absolute -left-24 bottom-0 h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl" />

        <div className="relative mx-auto grid max-w-7xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-28">
          <div className="flex flex-col justify-center">
            <div className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 backdrop-blur">
              <Sparkles className="h-4 w-4 text-amber-400" />
              Helping dogs find safety, care, and a home
            </div>

            <h1 className="max-w-xl text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
              From the street to a safe home
            </h1>

            <p className="mt-6 max-w-xl text-base leading-7 text-slate-300 sm:text-lg">
              Street2Home connects people with dog shelters for rescue reports,
              adoption, fostering, donations, and supplies — all in one platform.
            </p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/dog"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 font-semibold text-slate-950 transition hover:bg-slate-100"
              >
                Explore Dogs
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                href="/report"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-6 py-3 font-semibold text-white transition hover:bg-white/10"
              >
                Report a Dog
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap gap-6 text-sm text-slate-300">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                Verified shelters
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-rose-400" />
                Rescue tracking
              </div>
              <div className="flex items-center gap-2">
                <PawPrint className="h-4 w-4 text-amber-400" />
                Adoption support
              </div>
            </div>
          </div>

          {/* Hero Card */}
          <div className="flex items-center justify-center">
            <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-white/10 p-6 shadow-2xl backdrop-blur-xl">
              <div className="rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 p-6 text-slate-950">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Platform Impact</p>
                    <h3 className="mt-1 text-2xl font-bold">Rescuing lives daily</h3>
                  </div>
                  <div className="rounded-full bg-white/30 p-3">
                    <Dog className="h-7 w-7" />
                  </div>
                </div>

                <div className="mt-6 space-y-4">
                  <div className="rounded-2xl bg-white/25 p-4">
                    <p className="text-sm font-medium">Live status</p>
                    <p className="mt-1 text-lg font-bold">Operating in 8 major cities</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-2xl bg-white/25 p-4">
                      <p className="text-xs font-medium">Shelters Active</p>
                      <p className="mt-1 text-xl font-bold">{dashboardStats.shelters}</p>
                    </div>
                    <div className="rounded-2xl bg-white/25 p-4">
                      <p className="text-xs font-medium">Community members</p>
                      <p className="mt-1 text-xl font-bold">{dashboardStats.users}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-3 gap-3">
                <div className="rounded-2xl bg-slate-900 p-4 text-center">
                  <p className="text-2xl font-bold text-white">{dashboardStats.rescued}</p>
                  <p className="text-xs text-slate-400">Dogs Rescued</p>
                </div>
                <div className="rounded-2xl bg-slate-900 p-4 text-center">
                  <p className="text-2xl font-bold text-white">{dashboardStats.shelters}</p>
                  <p className="text-xs text-slate-400">Shelters</p>
                </div>
                <div className="rounded-2xl bg-slate-900 p-4 text-center">
                  <p className="text-2xl font-bold text-white">{dashboardStats.adoptions}</p>
                  <p className="text-xs text-slate-400">Adoptions</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-widest text-slate-500">
            Our Services
          </p>
          <h2 className="mt-3 text-3xl font-bold text-slate-950 sm:text-4xl tracking-tight">
            Comprehensive Care in One Platform
          </h2>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {services.map((service) => {
            const Icon = service.icon;
            return (
              <div
                key={service.title}
                className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold text-slate-950">{service.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">{service.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Featured Dogs */}
      <section className="bg-slate-50 py-20 border-y border-slate-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-slate-500">
                Featured Dogs
              </p>
              <h2 className="mt-3 text-3xl font-bold text-slate-950 sm:text-4xl tracking-tight">
                Meet some of our dogs
              </h2>
            </div>
            <Link
              href="/dog"
              className="hidden items-center gap-2 text-sm font-bold text-slate-950 hover:underline sm:flex"
            >
              View all available dogs
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {loading ? (
                Array(3).fill(0).map((_, i) => (
                    <div key={i} className="h-[400px] rounded-3xl bg-slate-100 animate-pulse" />
                ))
            ) : dogs.length > 0 ? (
              dogs.map((dog) => (
                <div
                  key={dog._id}
                  className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md"
                >
                  <div className="flex h-56 items-center justify-center rounded-2xl bg-slate-100 overflow-hidden relative">
                    {dog.image ? (
                        <img src={dog.image} alt={dog.name} className="h-full w-full object-cover" />
                    ) : (
                        <Dog className="h-16 w-16 text-slate-300" />
                    )}
                  </div>

                  <div className="mt-5 flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-2xl font-bold text-slate-950 tracking-tight">{dog.name}</h3>
                      <p className="mt-1 text-sm text-slate-600">{dog.breed} • {dog.gender}</p>
                    </div>
                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 border border-emerald-100">
                      {dog.status || "Available"}
                    </span>
                  </div>

                  <div className="mt-4 flex flex-col gap-2 text-sm text-slate-600">
                    <div className="flex items-center gap-2">
                        <MapPin className="h-3.5 w-3.5 text-slate-400" />
                        {dog.shelterName || "Local Shelter"}
                    </div>
                    <div className="flex items-center gap-2">
                        <PawPrint className="h-3.5 w-3.5 text-slate-400" />
                        Age: {dog.age}
                    </div>
                  </div>

                  <Link
                    href="/dog"
                    className="mt-6 inline-flex w-full items-center justify-center rounded-2xl bg-slate-950 px-4 py-3.5 font-bold text-white transition hover:bg-slate-800 shadow-lg shadow-slate-200"
                  >
                    View Rescue Story
                  </Link>
                </div>
              ))
            ) : (
                <div className="col-span-full py-20 text-center rounded-3xl border-2 border-dashed border-slate-300 bg-white">
                    <Dog className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500 font-medium">No dogs currently listed. Check back soon!</p>
                </div>
            )}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="max-w-2xl text-center mx-auto mb-12">
          <p className="text-sm font-semibold uppercase tracking-widest text-slate-500">
            How It Works
          </p>
          <h2 className="mt-3 text-3xl font-bold text-slate-950 sm:text-4xl tracking-tight">
            Simple steps to save a life
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {steps.map((step) => (
            <div
              key={step.number}
              className="relative p-8 rounded-3xl bg-white border border-slate-200 shadow-sm"
            >
              <div className="absolute -top-4 -left-4 flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 text-white font-bold shadow-lg">
                {step.number}
              </div>
              <h3 className="mt-2 text-xl font-bold text-slate-950">{step.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-slate-950 px-8 py-16 text-white text-center shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 h-64 w-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          
          <h2 className="text-3xl font-bold sm:text-4xl tracking-tight mb-6 relative z-10">
            Ready to make a difference today?
          </h2>
          <p className="mt-4 max-w-2xl text-slate-300 mx-auto text-lg leading-relaxed mb-10 relative z-10">
            Every report, donation, or adoption saves a life. Join our community of animal lovers and help us clear the streets Cairo, one dog at a time.
          </p>

          <div className="flex flex-col gap-4 sm:flex-row justify-center relative z-10">
            <Link
              href="/report"
              className="inline-flex items-center justify-center rounded-2xl bg-white px-10 py-4 font-bold text-slate-950 shadow-xl transition hover:bg-slate-100"
            >
              Report a Stray Dog
            </Link>
            <Link
              href="/donate"
              className="inline-flex items-center justify-center rounded-2xl border border-white/20 bg-white/5 px-10 py-4 font-bold text-white backdrop-blur transition hover:bg-white/10"
            >
              Support with Donation
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}