"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  ArrowLeft,
  Save,
  ShieldCheck,
  Mail,
  Phone,
  MapPin,
  FileText,
  Sparkles,
  Users,
  Clock,
  Globe,
} from "lucide-react";

import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function RequestNewShelterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);

  const [form, setForm] = useState({
    shelterName: "",
    shelterEmail: "",
    shelterPhone: "",
    shelterCity: "",
    shelterAddress: "",
    shelterDescription: "",
    capacity: "0",
    open_days: "Sunday - Thursday",
    opening_time: "09:00",
    closing_time: "17:00",
    social_link: "",
    message: "",
  });

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user") || "{}");
    setUser(userData);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        requesterName: user.name,
        requesterEmail: user.email,
        requesterPhone: user.phone || "Not Provided",
        type: "Shelter Creation",
        title: `Shelter Creation Request - ${form.shelterName}`,
        shelter: "System",
        message: form.message,
        shelterData: {
          name: form.shelterName,
          email: form.shelterEmail,
          phone: form.shelterPhone,
          city: form.shelterCity,
          address: form.shelterAddress,
          description: form.shelterDescription,
          capacity: Number(form.capacity),
          open_days: form.open_days,
          opening_time: form.opening_time,
          closing_time: form.closing_time,
          social_link: form.social_link,
        }
      };

      const res = await fetch(`${API_URL}/api/requests`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        alert("Your request has been sent to the Super Admin. You will be notified once reviewed.");
        router.push("/dashboard/user/requests");
      } else {
        const data = await res.json();
        alert(data.message || "Failed to submit request");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-8 animate-in fade-in duration-500 pb-20">
      <Link
        href="/dashboard/user/requests"
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-slate-950"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to My Requests
      </Link>

      {/* Header Card */}
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="bg-emerald-600 p-8 text-white">
           <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
             <div className="flex items-center gap-5">
               <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md shadow-inner">
                 <Building2 className="h-10 w-10 text-white" />
               </div>
               <div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white backdrop-blur-sm">
                     <Sparkles className="h-3 w-3" />
                     New Opportunity
                  </div>
                 <h1 className="mt-2 text-4xl font-black tracking-tight">Request New Shelter</h1>
                 <p className="mt-1 text-emerald-50">Complete the form to propose a new high-standard shelter.</p>
               </div>
             </div>
             
             <div className="hidden lg:block">
                <div className="flex items-center gap-3 rounded-2xl bg-black/10 p-4 border border-white/10 backdrop-blur-sm">
                   <ShieldCheck className="h-6 w-6 text-emerald-200" />
                   <div className="text-left">
                      <p className="text-xs font-bold text-white uppercase tracking-tighter">Super Admin Verification</p>
                      <p className="text-[10px] text-emerald-100/70">Required for official registration</p>
                   </div>
                </div>
             </div>
           </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
           {/* Section: Core Information */}
           <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
             <div className="mb-8 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white shadow-md">
                   <Building2 className="h-5 w-5" />
                </div>
                <h2 className="text-xl font-bold text-slate-950 uppercase tracking-tight">Core Shelter Details</h2>
             </div>

             <div className="grid gap-6 sm:grid-cols-2">
                <FormGroup label="Shelter Name" name="shelterName" value={form.shelterName} onChange={handleChange} placeholder="e.g. Hope Haven Shelter" />
                <FormGroup label="Official Email" name="shelterEmail" type="email" value={form.shelterEmail} onChange={handleChange} placeholder="contact@shelter.com" />
                <FormGroup label="Phone Number" name="shelterPhone" value={form.shelterPhone} onChange={handleChange} placeholder="+20 ..." />
                <FormGroup label="City" name="shelterCity" value={form.shelterCity} onChange={handleChange} placeholder="e.g. Cairo" />
                <div className="sm:col-span-2">
                   <FormGroup label="Full Physical Address" name="shelterAddress" value={form.shelterAddress} onChange={handleChange} placeholder="Building, Street, Area..." />
                </div>
                <div className="sm:col-span-2">
                   <label className="text-xs font-black uppercase tracking-widest text-slate-500 block mb-2">Shelter Mission & Description</label>
                   <textarea 
                      required
                      name="shelterDescription"
                      value={form.shelterDescription}
                      onChange={handleChange}
                      rows={4}
                      placeholder="Describe the shelter mission, vision, and special facilities..."
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3.5 text-sm outline-none transition focus:border-emerald-500 focus:bg-white"
                   />
                </div>
             </div>
           </div>

           {/* Section: Operational Settings */}
           <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
              <div className="mb-8 flex items-center gap-3">
                 <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white shadow-md">
                    <Clock className="h-5 w-5" />
                 </div>
                 <h2 className="text-xl font-bold text-slate-950 uppercase tracking-tight">Operation & Capacity</h2>
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                  <FormGroup label="Max Capacity (Dogs)" name="capacity" type="number" value={form.capacity} onChange={handleChange} placeholder="e.g. 50" />
                  <FormGroup label="Social / Website Link" name="social_link" value={form.social_link} onChange={handleChange} placeholder="https://..." icon={<Globe className="h-4 w-4" />} />
                  <div className="sm:col-span-2">
                    <FormGroup label="Working Days" name="open_days" value={form.open_days} onChange={handleChange} placeholder="e.g. Sunday to Thursday" />
                  </div>
                  <FormGroup label="Opening Time" name="opening_time" type="time" value={form.opening_time} onChange={handleChange} />
                  <FormGroup label="Closing Time" name="closing_time" type="time" value={form.closing_time} onChange={handleChange} />
              </div>
           </div>

           {/* Section: Administrative Message */}
           <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
              <div className="mb-6 flex items-center gap-3">
                 <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white shadow-md">
                    <FileText className="h-5 w-5" />
                 </div>
                 <h2 className="text-xl font-bold text-slate-950 uppercase tracking-tight">Why do you want to manage this shelter?</h2>
              </div>
              <textarea 
                name="message"
                value={form.message}
                onChange={handleChange}
                rows={3}
                placeholder="Share your experience or motivation with the Super Admin..."
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3.5 text-sm outline-none transition focus:border-emerald-500 focus:bg-white"
              />
           </div>

           <div className="flex items-center gap-4">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-slate-950 px-8 py-4 font-bold text-white shadow-xl transition hover:bg-slate-800 disabled:opacity-50 active:scale-[0.98]"
              >
                {loading ? "Sending Application..." : (
                   <>
                      <Save className="h-5 w-5" />
                      Submit Application
                   </>
                )}
              </button>
           </div>
        </div>

        {/* Sidebar Sidebar */}
        <div className="space-y-6">
           <div className="rounded-3xl bg-slate-900 p-8 text-white shadow-xl shadow-slate-200">
              <h3 className="text-xl font-black tracking-tight flex items-center gap-3">
                 <ShieldCheck className="h-6 w-6 text-emerald-400" />
                 Admin Path
              </h3>
              <p className="mt-4 text-sm leading-relaxed text-slate-400">
                 Upon approval, your account will be upgraded to **Shelter Admin** status.
              </p>
              <div className="mt-8 space-y-4">
                 <BenefitItem text="Manage Dogs & Content" />
                 <BenefitItem text="Control Team & Staff" />
                 <BenefitItem text="Handle Store & Supplies" />
                 <BenefitItem text="Direct Adopter Contact" />
              </div>
           </div>

           <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-8">
              <h4 className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700 text-center mb-6">Process Timeline</h4>
              <div className="space-y-6">
                 <TimelineStep step="1" title="Submission" desc="Admins receive your detailed proposal." />
                 <TimelineStep step="2" title="Verification" desc="Phone call or email interview for check." />
                 <TimelineStep step="3" title="Approval" desc="Shelter created, Admin role assigned." />
              </div>
           </div>
        </div>
      </form>
    </div>
  );
}

function FormGroup({ label, icon, ...props }: any) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
         {icon}
         {label}
      </label>
      <input 
        required
        {...props}
        className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3.5 text-sm outline-none transition focus:border-emerald-500 focus:bg-white"
      />
    </div>
  );
}

function BenefitItem({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
      <span className="text-sm font-medium text-slate-200">{text}</span>
    </div>
  );
}

function TimelineStep({ step, title, desc }: { step: string; title: string; desc: string }) {
  return (
    <div className="flex gap-4">
       <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-xs font-black text-white shadow-md shadow-emerald-200">{step}</div>
       <div>
          <p className="text-xs font-bold text-slate-900 uppercase tracking-tighter">{title}</p>
          <p className="mt-1 text-[11px] leading-relaxed text-slate-500">{desc}</p>
       </div>
    </div>
  );
}
