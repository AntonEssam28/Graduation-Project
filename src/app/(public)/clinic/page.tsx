"use client";

import { useState, useEffect } from "react";
import { 
  Stethoscope, 
  Scissors, 
  ShowerHead, 
  Syringe, 
  ShieldCheck, 
  Clock, 
  MapPin, 
  Star,
  ChevronRight,
  ArrowRight,
  Sparkles,
  Loader2,
  Heart,
  Calendar
} from "lucide-react";
import { Button } from "@/components/ui/button";
import ClinicForm from "./components/ClinicForm";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const CLINIC_SERVICES = [
  { id: "Grooming", name: "Grooming", icon: Scissors, color: "bg-pink-500", desc: "Full haircut and style" },
  { id: "Nails", name: "Nail Trimming", icon: Sparkles, color: "bg-amber-500", desc: "Professional paw care" },
  { id: "Shower", name: "Bath & Shower", icon: ShowerHead, color: "bg-blue-500", desc: "Deep cleaning session" },
  { id: "Vaccine", name: "Vaccination", icon: Syringe, color: "bg-emerald-500", desc: "Essential health shots" },
  { id: "Checkup", name: "Full Checkup", icon: Stethoscope, color: "bg-indigo-500", desc: "General health screening" },
  { id: "Surgery", name: "Surgery", icon: Heart, color: "bg-rose-500", desc: "Advanced medical care" },
];

export default function ClinicPage() {
  const [shelters, setShelters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [selectedShelter, setSelectedShelter] = useState<any | null>(null);

  useEffect(() => {
    fetch(`${API_URL}/api/shelters`)
      .then(res => res.json())
      .then(data => {
        setShelters(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const filteredShelters = selectedService 
    ? shelters.filter(s => s.clinicServices?.some((cs: any) => cs.name === selectedService && cs.available))
    : [];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section - Aligned with Home/Adopt */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white py-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.08),_transparent_35%)]" />
        <div className="absolute -right-24 top-20 h-72 w-72 rounded-full bg-indigo-400/10 blur-3xl" />
        <div className="absolute -left-24 bottom-0 h-72 w-72 rounded-full bg-emerald-400/10 blur-3xl" />
        
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 backdrop-blur">
              <Sparkles className="h-4 w-4 text-indigo-400" />
              <span>Professional Pet Care Services</span>
            </div>
            
            <h1 className="max-w-4xl text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Professional care for your <br />
              <span className="text-indigo-400">pet's health and beauty</span>
            </h1>
            
            <p className="mt-6 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
              Book professional grooming, vaccinations, and medical checkups from trusted shelters and certified clinics across the city.
            </p>

            <div className="mt-10 flex flex-wrap justify-center gap-6 text-sm text-slate-300">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                <span>Certified Vets</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-indigo-400" />
                <span>Same-day Booking</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-rose-400" />
                <span>Local Shelters</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-12">
          
          {/* Left Column: Service Selection */}
          <div className="lg:col-span-12 xl:col-span-7">
            <div className="mb-8">
              <p className="text-sm font-semibold uppercase tracking-widest text-slate-500">Step 1</p>
              <h2 className="mt-2 text-3xl font-bold text-slate-950 tracking-tight">Select a Service</h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {CLINIC_SERVICES.map((service) => {
                const Icon = service.icon;
                const active = selectedService === service.id;
                
                return (
                  <button
                    key={service.id}
                    onClick={() => {
                      setSelectedService(service.id);
                      setSelectedShelter(null);
                    }}
                    className={`group relative flex items-center gap-4 rounded-2xl border p-5 text-left transition-all ${
                      active 
                        ? "border-slate-900 bg-slate-50 shadow-md" 
                        : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm"
                    }`}
                  >
                    <div className={`flex h-14 w-14 items-center justify-center rounded-xl text-white shadow-sm transition-transform group-hover:scale-105 ${service.color}`}>
                      <Icon className="h-7 w-7" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900">{service.name}</h3>
                      <p className="text-xs text-slate-500">{service.desc}</p>
                    </div>
                    <div className={`absolute right-4 top-1/2 -translate-y-1/2 rounded-full p-1.5 transition-all ${active ? "bg-slate-900 text-white" : "text-slate-300 opacity-0 group-hover:opacity-100"}`}>
                      <ChevronRight className="h-4 w-4" />
                    </div>
                  </button>
                );
              })}
            </div>

            {selectedService && (
              <div className="mt-16 animate-in fade-in slide-in-from-bottom-4">
                <div className="mb-8">
                  <p className="text-sm font-semibold uppercase tracking-widest text-slate-500">Step 2</p>
                  <h2 className="mt-2 text-3xl font-bold text-slate-950 tracking-tight">Choose a Provider</h2>
                </div>

                {loading ? (
                  <div className="flex h-40 items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-slate-300" />
                  </div>
                ) : filteredShelters.length > 0 ? (
                  <div className="space-y-4">
                    {filteredShelters.map((shelter) => (
                      <button
                        key={shelter._id}
                        onClick={() => setSelectedShelter(shelter)}
                        className={`group flex w-full items-center justify-between rounded-2xl border p-6 transition-all ${
                          selectedShelter?._id === shelter._id
                            ? "border-slate-900 bg-slate-50 shadow-md"
                            : "border-slate-200 bg-white hover:border-slate-300"
                        }`}
                      >
                        <div className="flex items-center gap-5">
                          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 text-white">
                            <MapPin className="h-6 w-6" />
                          </div>
                          <div className="text-left">
                            <h4 className="font-bold text-slate-900">{shelter.name}</h4>
                            <p className="flex items-center gap-1 text-xs text-slate-500">
                              <MapPin className="h-3 w-3" />
                              {shelter.city}, {shelter.address}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                           <span className="text-[10px] font-bold text-slate-400 uppercase">From</span>
                           <p className="text-xl font-bold text-slate-900">EGP {shelter.clinicServices?.find((cs: any) => cs.name === selectedService)?.price || 0}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-12 text-center">
                    <Stethoscope className="mx-auto h-12 w-12 text-slate-300" />
                    <h3 className="mt-4 text-xl font-bold text-slate-900">Service not available</h3>
                    <p className="mt-2 text-sm text-slate-500">Currently, no providers offer {selectedService}.</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column: Booking Form */}
          <div className="lg:col-span-12 xl:col-span-5">
            <div className="sticky top-24">
              {selectedShelter ? (
                <div className="animate-in fade-in zoom-in-95 duration-500">
                  <ClinicForm 
                    selectedService={selectedService || ""} 
                    selectedShelter={selectedShelter.name} 
                  />
                </div>
              ) : (
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-10 text-center shadow-sm">
                  <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-sm border border-slate-100">
                    <Clock className="h-8 w-8 text-slate-300" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">Booking Summary</h3>
                  <p className="mt-3 text-sm text-slate-500 leading-relaxed">
                    Please select a service and a provider to continue with your appointment booking.
                  </p>
                  
                  <div className="mt-8 space-y-3">
                     {[
                       { num: "1", label: "Select clinical service" },
                       { num: "2", label: "Pick nearby shelter" },
                       { num: "3", label: "Secure your slot" }
                     ].map((s) => (
                       <div key={s.num} className="flex items-center gap-3 rounded-xl bg-white p-3.5 text-left border border-slate-100">
                          <div className="h-7 w-7 rounded-lg bg-slate-950 text-white flex items-center justify-center text-xs font-bold">{s.num}</div>
                          <p className="text-sm font-medium text-slate-700">{s.label}</p>
                       </div>
                     ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Why Section */}
      <section className="bg-slate-50 py-20 border-y border-slate-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
           <div className="text-center mb-12">
              <p className="text-sm font-semibold uppercase tracking-widest text-slate-500">Benefits</p>
              <h2 className="mt-2 text-3xl font-bold text-slate-950 tracking-tight">Why choose our clinical network?</h2>
           </div>
           
           <div className="grid gap-6 md:grid-cols-3">
              {[
                { title: "Direct Support", desc: "Every booking supports the shelter's mission to rescue more animals.", icon: Heart, color: "text-rose-500" },
                { title: "Quality Care", desc: "Our partners use certified professionals and follow strict hygiene protocols.", icon: ShieldCheck, color: "text-indigo-500" },
                { title: "Easy Management", desc: "Track all your appointments, history and records in one dashboard.", icon: Calendar, color: "text-emerald-500" },
              ].map((item, i) => {
                const Icon = item.icon || Stethoscope;
                return (
                  <div key={i} className="rounded-3xl bg-white p-8 border border-slate-200 shadow-sm transition hover:shadow-md">
                     <div className={`h-10 w-10 flex items-center justify-center rounded-xl bg-slate-50 ${item.color} mb-5`}>
                        <Icon className="h-5 w-5" />
                     </div>
                     <h3 className="text-xl font-bold text-slate-950 mb-3">{item.title}</h3>
                     <p className="text-sm leading-relaxed text-slate-600 font-medium">{item.desc}</p>
                  </div>
                )
              })}
           </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
         <div className="relative overflow-hidden rounded-3xl bg-slate-950 px-8 py-16 text-white text-center shadow-xl">
            <div className="absolute top-0 right-0 h-64 w-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="relative z-10 max-w-2xl mx-auto">
               <h2 className="text-3xl font-bold sm:text-4xl tracking-tight mb-6">Need urgent help?</h2>
               <p className="mt-4 text-slate-300 mx-auto text-lg leading-relaxed mb-10">
                  Our emergency network is active 24/7. Report an injured animal or find the nearest critical care unit.
               </p>
               <div className="flex flex-col gap-4 sm:flex-row justify-center">
                  <Button className="h-14 rounded-2xl bg-white px-8 text-base font-bold text-slate-950 hover:bg-slate-100">
                     Report Emergency
                  </Button>
                  <Button variant="outline" className="h-14 rounded-2xl border-white/20 bg-white/5 px-8 text-base font-bold text-white hover:bg-white/10">
                     Find Nearest Clinic
                  </Button>
               </div>
            </div>
         </div>
      </section>
    </div>
  );
}
