"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Dog as DogIcon,
  MapPin,
  CalendarDays,
  ShieldCheck,
  ArrowRight,
  PawPrint,
  Loader2,
  Lock,
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function DogsPage() {
  const router = useRouter();
  const [dogs, setDogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const fetchDogs = async () => {
      try {
        const res = await fetch(`${API_URL}/api/dogs`);
        const data = await res.json();
        setDogs(Array.isArray(data) ? data : (data.data || []));
      } catch (err) {
        console.error("Failed to fetch dogs", err);
      } finally {
        setLoading(false);
      }
    };

    setIsLoggedIn(!!localStorage.getItem("token"));
    fetchDogs();
  }, []);

  const filteredDogs = useMemo(() => {
    return dogs.filter((dog) => {
      const matchesSearch =
        dog.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dog.breed.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dog.shelter.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        selectedStatus === "All" ? true : dog.status === selectedStatus;

      return matchesSearch && matchesStatus;
    });
  }, [dogs, searchTerm, selectedStatus]);

  const handleAction = (e: React.MouseEvent) => {
    if (!isLoggedIn) {
      e.preventDefault();
      if (confirm("You need to sign in to take this action. Go to login page?")) {
        router.push("/login");
      }
    }
  };

  if (loading) return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
           <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                <PawPrint className="h-3.5 w-3.5" />
                Animal Rescue Gallery
              </div>
              <h1 className="text-4xl font-bold text-slate-950 mt-4 tracking-tight">Available Dogs</h1>
              <p className="text-slate-500 mt-2">Find your perfect companion from our network of partner shelters.</p>
           </div>
           
           <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
              <div className="relative">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                 <input 
                   type="text"
                   placeholder="Search dogs..."
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                   className="pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-slate-950 transition text-sm w-full md:w-64"
                 />
              </div>
              <select 
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-slate-950 transition text-sm font-semibold"
              >
                 <option value="All">All Statuses</option>
                 <option value="Available">Available</option>
                 <option value="Reserved">Reserved</option>
                 <option value="Adopted">Adopted</option>
              </select>
           </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {filteredDogs.length > 0 ? filteredDogs.map((dog) => (
          <div key={dog._id} className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition">
             <div className="aspect-[4/3] bg-slate-100 relative">
                {dog.photo ? (
                  <img src={dog.photo} alt={dog.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <DogIcon className="h-12 w-12 text-slate-300" />
                  </div>
                )}
                <div className="absolute top-4 right-4">
                   <StatusBadge status={dog.status} />
                </div>
             </div>
             
             <div className="p-6">
                <h3 className="text-xl font-bold text-slate-950">{dog.name}</h3>
                <p className="text-sm font-semibold text-blue-600 uppercase tracking-wide mt-1">{dog.breed}</p>
                
                <p className="text-sm text-slate-500 mt-4 line-clamp-2 leading-relaxed">
                  {dog.notes || "No additional information provided for this dog."}
                </p>

                <div className="mt-6 space-y-2 border-t border-slate-50 pt-4">
                   <InfoLine icon={MapPin} text={`${dog.city} • ${dog.shelter}`} />
                   <InfoLine icon={CalendarDays} text={`${dog.age} Years Old`} />
                   <InfoLine icon={ShieldCheck} text={dog.sex} />
                </div>

                <div className="mt-6 flex gap-3">
                   <Link href={`/dog/${dog._id}`} className="flex-1 text-center py-2.5 bg-slate-100 text-slate-900 rounded-xl font-bold text-sm hover:bg-slate-200 transition">
                      Details
                   </Link>
                   <Link 
                     href="/adopt"
                     onClick={handleAction}
                     className="flex-1 text-center py-2.5 bg-slate-950 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition flex items-center justify-center gap-2"
                   >
                      {!isLoggedIn && <Lock className="h-3.5 w-3.5" />}
                      Adopt
                   </Link>
                </div>
             </div>
          </div>
        )) : (
          <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-slate-200 border-dashed">
             <DogIcon className="h-10 w-10 text-slate-200 mx-auto" />
             <p className="text-slate-500 mt-4 font-medium">No dogs matching your criteria.</p>
          </div>
        )}
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
    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${styles[status]}`}>{status}</span>
  );
}

function InfoLine({ icon: Icon, text }: any) {
  return (
    <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
      <Icon className="h-3.5 w-3.5 text-slate-400" />
      {text}
    </div>
  );
}