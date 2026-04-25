"use client";

import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  HeartHandshake,
  CalendarDays,
  MapPin,
  PawPrint,
  CheckCircle2,
  Dog,
  Loader2,
  Globe,
  Settings,
  Star,
  Zap,
  Crown,
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

type BoardingTier = "Silver" | "Gold" | "Premium";

type BoardingForm = {
  dogName: string;
  dogBreed: string;
  dogAge: string;
  dogNotes: string;
  targetShelter: string;
  tier: BoardingTier;
  startDate: string;
  endDate: string;
  requesterPhone: string;
};

export default function BoardingPage() {
  const router = useRouter();
  const [shelters, setShelters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedTier, setSelectedTier] = useState<BoardingTier>("Silver");

  const [formData, setFormData] = useState<BoardingForm>({
    dogName: "",
    dogBreed: "",
    dogAge: "",
    dogNotes: "",
    targetShelter: "",
    tier: "Silver",
    startDate: "",
    endDate: "",
    requesterPhone: "",
  });

  useEffect(() => {
    const fetchShelters = async () => {
      try {
        const res = await fetch(`${API_URL}/api/shelters`);
        const data = await res.json();
        setShelters(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to fetch shelters", err);
      } finally {
        setLoading(false);
      }
    };
    fetchShelters();

    // Fill user data
    const userJson = localStorage.getItem("user");
    if (userJson) {
      try {
        const user = JSON.parse(userJson);
        setFormData(prev => ({
          ...prev,
          requesterPhone: user.phone || prev.requesterPhone
        }));
      } catch (err) {}
    }
  }, []);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) {
       alert("Please sign in to book a boarding spot.");
       router.push("/login");
       return;
    }

    setSubmitting(true);
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    try {
      const res = await fetch(`${API_URL}/api/requests`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          type: "Boarding",
          requesterName: user.name,
          requesterEmail: user.email,
          requesterPhone: formData.requesterPhone,
          shelter: formData.targetShelter,
          message: `Boarding Tier: ${selectedTier}. Dog: ${formData.dogName} (${formData.dogBreed}, ${formData.dogAge}y). Dates: ${formData.startDate} to ${formData.endDate}. Notes: ${formData.dogNotes}`
        })
      });

      if (res.ok) {
        alert("Boarding request submitted successfully! The shelter will contact you soon.");
        router.push("/dashboard/user/requests");
      } else {
        const err = await res.json();
        alert(err.message || "Failed to submit request");
      }
    } catch (err) {
      alert("Error submitting boarding request");
    } finally {
      setSubmitting(false);
    }
  };

  const tiers = [
    { id: "Silver", name: "Silver Tier", price: "200 EGP/Day", icon: Star, color: "text-slate-400", features: ["Standard Kennel", "Daily Walk", "Basic Food"] },
    { id: "Gold", name: "Gold Tier", price: "400 EGP/Day", icon: Zap, color: "text-amber-500", features: ["Spacious Room", "2 Walks/Day", "Premium Food", "Photo Updates"] },
    { id: "Premium", name: "Premium Tier", price: "700 EGP/Day", icon: Crown, color: "text-purple-600", features: ["Luxury Suite", "3 Walks/Day", "Custom Diet", "Video Calls", "Grooming"] },
  ];

  if (loading) return <div className="flex h-[60vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-slate-400" /></div>;

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="relative z-10">
           <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 border border-emerald-100 uppercase tracking-widest">
              <Globe className="h-3 w-3" />
              Professional Pet Boarding
           </div>
           <h1 className="text-4xl font-black text-slate-950 mt-4 tracking-tight">Shelter Hotel & Hosting</h1>
           <p className="text-slate-500 mt-2 max-w-xl">Traveling? Leave your loyal friend in safe hands. Choose a shelter and a hosting tier that fits your dog's needs.</p>
        </div>
      </div>

      {/* Tier Selection */}
      <div className="grid md:grid-cols-3 gap-6">
         {tiers.map((tier) => (
            <button
               key={tier.id}
               onClick={() => setSelectedTier(tier.id as BoardingTier)}
               className={`relative p-6 rounded-3xl border-2 transition-all text-left ${selectedTier === tier.id ? 'border-slate-950 bg-white ring-4 ring-slate-100 scale-[1.02]' : 'border-slate-100 bg-slate-50 hover:border-slate-200'}`}
            >
               <div className={`p-3 rounded-2xl w-fit mb-4 bg-white shadow-sm border border-slate-100`}>
                  <tier.icon className={`h-6 w-6 ${tier.color}`} />
               </div>
               <h3 className="font-black text-slate-900">{tier.name}</h3>
               <p className="font-bold text-slate-500 text-sm mt-1">{tier.price}</p>
               <ul className="mt-4 space-y-2">
                  {tier.features.map(f => (
                     <li key={f} className="text-xs font-medium text-slate-600 flex items-center gap-2">
                        <CheckCircle2 className="h-3 w-3 text-emerald-500" /> {f}
                     </li>
                  ))}
               </ul>
            </button>
         ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
         <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
               <div className="flex items-center gap-3 mb-8">
                  <div className="h-10 w-10 bg-slate-900 rounded-xl flex items-center justify-center text-white">
                     <Settings className="h-5 w-5" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-950">Dog & Hosting Details</h3>
               </div>

               <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Dog Info */}
                  <div className="grid md:grid-cols-3 gap-4">
                     <Input label="Dog's Name" name="dogName" value={formData.dogName} onChange={handleChange} required placeholder="e.g. Max" />
                     <Input label="Dog's Breed" name="dogBreed" value={formData.dogBreed} onChange={handleChange} required placeholder="e.g. Golden Retriever" />
                     <Input label="Dog's Age (Years)" name="dogAge" value={formData.dogAge} onChange={handleChange} required type="number" />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                     <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">Choose Shelter</label>
                        <select 
                          name="targetShelter" 
                          value={formData.targetShelter} 
                          onChange={handleChange} 
                          required
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-slate-950 transition text-sm font-medium"
                        >
                           <option value="">Select a shelter...</option>
                           {shelters.map(s => <option key={s._id} value={s.name}>{s.name} ({s.location})</option>)}
                        </select>
                     </div>
                     <Input label="Your Phone" name="requesterPhone" value={formData.requesterPhone} onChange={handleChange} required type="tel" placeholder="01xxxxxxxxx" />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                     <Input label="Start Date" name="startDate" value={formData.startDate} onChange={handleChange} required type="date" />
                     <Input label="End Date" name="endDate" value={formData.endDate} onChange={handleChange} required type="date" />
                  </div>

                  <div className="space-y-2">
                     <label className="text-sm font-bold text-slate-700">Health or Behavioral Notes</label>
                     <textarea 
                        name="dogNotes"
                        value={formData.dogNotes}
                        onChange={handleChange}
                        rows={3}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-slate-950 transition text-sm"
                        placeholder="Any medications or habits we should know about?"
                     />
                  </div>

                  <button 
                    type="submit" 
                    disabled={submitting}
                    className="w-full bg-slate-950 text-white rounded-xl py-4 font-bold text-sm hover:bg-slate-800 transition flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                     {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : `Book ${selectedTier} Hosting Now`}
                  </button>
               </form>
            </div>
         </div>

         <div className="space-y-6">
            <div className="bg-emerald-900 p-8 rounded-3xl text-white shadow-xl relative overflow-hidden">
               <h3 className="text-xl font-bold mb-4 relative z-10">Safe & Secure</h3>
               <p className="text-emerald-100 text-sm leading-relaxed relative z-10">We treat your dog like family. Every shelter listed is certified for professional boarding and care.</p>
               <div className="mt-6 space-y-3 relative z-10">
                  <Feature text="24/7 Security" />
                  <Feature text="Medical Staff Onsite" />
                  <Feature text="Climate Controlled Rooms" />
               </div>
               <div className="absolute right-0 bottom-0 opacity-10">
                  <PawPrint className="h-32 w-32" />
               </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
               <h3 className="font-bold text-slate-950">Important Notice</h3>
               <p className="text-xs text-slate-500 mt-2 leading-relaxed italic">
                  * Please make sure your dog's vaccinations are up to date before handing them over to the shelter.
               </p>
            </div>
         </div>
      </div>
    </div>
  );
}

function Input({ label, ...props }: any) {
  return (
    <div className="space-y-2">
       <label className="text-sm font-bold text-slate-700">{label}</label>
       <input {...props} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-slate-950 transition text-sm" />
    </div>
  )
}

function Feature({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3 text-xs font-bold">
       <div className="h-2 w-2 rounded-full bg-emerald-400" />
       {text}
    </div>
  )
}