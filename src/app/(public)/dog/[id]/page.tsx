"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  Dog as DogIcon,
  MapPin,
  ShieldCheck,
  PawPrint,
  Loader2,
  Lock,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function DogDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [dog, setDog] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const fetchDog = async () => {
      try {
        const res = await fetch(`${API_URL}/api/dogs/${params.id}`);
        if (!res.ok) throw new Error("Dog not found");
        const data = await res.json();
        setDog(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    setIsLoggedIn(!!localStorage.getItem("token"));
    fetchDog();
  }, [params.id]);

  const handleAction = (e: React.MouseEvent) => {
    if (!isLoggedIn) {
      e.preventDefault();
      if (confirm("You need to sign in to take this action. Go to login page?")) {
        router.push("/login");
      }
    }
  };

  if (loading) return (
    <div className="flex h-[60vh] items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
    </div>
  );

  if (!dog) return (
    <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
      <AlertCircle className="h-10 w-10 text-red-500" />
      <h2 className="text-xl font-bold text-slate-950">Dog Not Found</h2>
      <Link href="/dog" className="text-sm font-bold text-blue-600">Back to all dogs</Link>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
         <Link href="/dog" className="flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-slate-900 transition">
            <ArrowLeft className="h-4 w-4" />
            Back to gallery
         </Link>
         <div className="flex items-center gap-2">
            <StatusBadge status={dog.status} />
         </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
         {/* Left: Media */}
         <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden aspect-square relative shadow-sm">
            {dog.photo ? (
              <img src={dog.photo} alt={dog.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-slate-50">
                <DogIcon className="h-20 w-20 text-slate-200" />
              </div>
            )}
         </div>

         {/* Right: Info */}
         <div className="space-y-6">
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
               <div>
                  <h1 className="text-4xl font-extrabold text-slate-950 tracking-tight">{dog.name}</h1>
                  <p className="text-blue-600 font-bold mt-1 uppercase tracking-wider">{dog.breed}</p>
               </div>

               <p className="text-sm text-slate-600 leading-relaxed">
                  {dog.notes || `Meet ${dog.name}, a friendly pet currently looking for a loving home. They are well-behaved and ready to meet their new family.`}
               </p>

               <div className="grid grid-cols-2 gap-4">
                  <InfoBox icon={CalendarDays} label="Age" value={`${dog.age} Years`} />
                  <InfoBox icon={ShieldCheck} label="Sex" value={dog.sex} />
                  <InfoBox icon={MapPin} label="Location" value={dog.city} />
                  <InfoBox icon={PawPrint} label="Shelter" value={dog.shelter} />
               </div>

               <div className="flex gap-4 pt-4">
                  <Link 
                    href="/adopt"
                    onClick={handleAction}
                    className="flex-1 bg-slate-950 text-white py-4 rounded-xl font-bold text-center hover:bg-slate-800 transition flex items-center justify-center gap-2"
                  >
                    {!isLoggedIn && <Lock className="h-4 w-4" />}
                    Adopt Now
                  </Link>
                  <Link 
                    href="/host"
                    onClick={handleAction}
                    className="flex-1 bg-white border border-slate-200 text-slate-950 py-4 rounded-xl font-bold text-center hover:bg-slate-50 transition"
                  >
                    Foster
                  </Link>
               </div>
            </div>

            <div className="bg-emerald-50 p-6 rounded-3xl border border-emerald-100 flex items-center gap-4">
               <div className="h-12 w-12 bg-white rounded-2xl flex items-center justify-center text-emerald-600 shadow-sm">
                  <CheckCircle2 className="h-6 w-6" />
               </div>
               <div>
                  <p className="font-bold text-emerald-900">Health Verified</p>
                  <p className="text-xs text-emerald-700 font-medium">This dog has been checked and verified by our partner shelters.</p>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: any = {
    Available: "bg-emerald-50 text-emerald-700 border-emerald-100",
    Reserved: "bg-amber-50 text-amber-700 border-amber-100",
    Adopted: "bg-slate-100 text-slate-700 border-slate-200",
  };
  return (
    <span className={`px-4 py-1.5 rounded-full text-xs font-bold border ${styles[status]}`}>{status}</span>
  );
}

function InfoBox({ icon: Icon, label, value }: any) {
  return (
    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
       <div className="flex items-center gap-2 mb-1">
          <Icon className="h-3.5 w-3.5 text-slate-400" />
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</span>
       </div>
       <p className="font-bold text-slate-900 truncate">{value}</p>
    </div>
  )
}