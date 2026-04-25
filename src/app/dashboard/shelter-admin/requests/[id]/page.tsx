"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Dog,
  HeartHandshake,
  CalendarDays,
  MapPin,
  User,
  ShieldCheck,
  CheckCircle2,
  Clock3,
  XCircle,
  BadgeCheck,
  FileText,
  Loader2,
  Mail,
  Phone,
  MessageSquare,
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function ShelterRequestDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [request, setRequest] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchRequest = async () => {
      const token = localStorage.getItem("token");
      try {
        const res = await fetch(`${API_URL}/api/requests/${params.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        setRequest(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchRequest();
  }, [params.id]);

  const updateStatus = async (status: string) => {
    setUpdating(true);
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_URL}/api/requests/${params.id}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        const updated = await res.json();
        setRequest(updated);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <div className="flex h-[60vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-slate-400" /></div>;

  if (!request) return (
    <div className="text-center p-20">
       <h2 className="text-2xl font-bold">Request not found</h2>
       <Link href="/dashboard/shelter-admin/requests" className="text-blue-600 mt-4 inline-block">Back to list</Link>
    </div>
  );

  return (
    <div className="space-y-6">
      <Link
        href="/dashboard/shelter-admin/requests"
        className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 transition hover:text-slate-950"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Requests
      </Link>

      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
         <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex items-center gap-5">
               <div className="h-14 w-14 bg-slate-950 rounded-2xl flex items-center justify-center text-white">
                  {request.type === 'Boarding' ? <ShieldCheck className="h-7 w-7" /> : <Dog className="h-7 w-7" />}
               </div>
               <div>
                  <h1 className="text-3xl font-bold text-slate-950 tracking-tight">{request.type} Application</h1>
                  <p className="text-sm text-slate-500 mt-1">Status: <span className="font-bold text-slate-700">{request.status}</span></p>
               </div>
            </div>
            <div className="flex items-center gap-2 text-sm font-bold text-slate-400 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
               <CalendarDays className="h-4 w-4" />
               Received: {new Date(request.createdAt).toLocaleDateString()}
            </div>
         </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
         <div className="lg:col-span-2 space-y-6">
            {/* Requester Info Card */}
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
               <h3 className="text-xl font-bold text-slate-950 mb-6 flex items-center gap-2">
                  <User className="h-5 w-5 text-slate-400" />
                  Requester Profile
               </h3>
               <div className="grid md:grid-cols-2 gap-6">
                  <DetailItem label="Full Name" value={request.requesterName} icon={User} />
                  <DetailItem label="Email Address" value={request.requesterEmail} icon={Mail} />
                  <DetailItem label="Phone Number" value={request.requesterPhone || "N/A"} icon={Phone} />
                  <DetailItem label="Submission Date" value={new Date(request.createdAt).toLocaleString()} icon={CalendarDays} />
               </div>
            </div>

            {/* Application Content */}
            <div className="bg-slate-50 p-8 rounded-3xl border border-slate-200">
               <h3 className="text-xl font-bold text-slate-950 mb-4 flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-slate-400" />
                  Application Message
               </h3>
               <p className="text-slate-700 leading-relaxed whitespace-pre-wrap italic bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                  "{request.message || "No specific notes provided by the requester."}"
               </p>
            </div>

            {/* Target Dog (if applicable) */}
            {request.dogId && (
               <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-6">
                  <div className="h-24 w-24 bg-slate-100 rounded-2xl overflow-hidden border border-slate-200">
                     {request.dogId.photo ? (
                        <img src={request.dogId.photo} alt={request.dogId.name} className="h-full w-full object-cover" />
                     ) : (
                        <div className="h-full w-full flex items-center justify-center"><Dog className="h-8 w-8 text-slate-300" /></div>
                     )}
                  </div>
                  <div>
                     <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Selected Canine</p>
                     <h4 className="text-2xl font-bold text-slate-950">{request.dogId.name}</h4>
                     <p className="text-sm text-slate-500 font-medium">{request.dogId.breed} • {request.dogId.age} Years Old</p>
                  </div>
               </div>
            )}
         </div>

         <div className="space-y-6">
            <div className="bg-slate-950 p-8 rounded-3xl text-white shadow-xl relative overflow-hidden">
               <h3 className="text-xl font-bold mb-6">Action Center</h3>
               <div className="space-y-3 relative z-10">
                  <button 
                    disabled={updating || request.status === 'In Review'}
                    onClick={() => updateStatus('In Review')}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-900/50 py-4 rounded-2xl font-black text-sm transition"
                  >
                     {request.status === 'In Review' ? "Currently Under Review" : "Start Review"}
                  </button>
                  <button 
                    disabled={updating || request.status === 'Approved'}
                    onClick={() => updateStatus('Approved')}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-900/50 py-4 rounded-2xl font-black text-sm transition"
                  >
                     Approve Application
                  </button>
                  <button 
                    disabled={updating || request.status === 'Rejected'}
                    onClick={() => updateStatus('Rejected')}
                    className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-900/50 py-4 rounded-2xl font-black text-sm transition"
                  >
                     Reject Application
                  </button>
               </div>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
               <h3 className="text-lg font-bold text-slate-950 mb-4">Official Warning</h3>
               <p className="text-xs text-slate-500 leading-relaxed">
                  Before approving, please verify the requester's identity and ensure the dog is healthy and ready for the selected service.
               </p>
            </div>
         </div>
      </div>
    </div>
  );
}

function DetailItem({ label, value, icon: Icon }: any) {
   return (
      <div className="space-y-1">
         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
            <Icon className="h-3 w-3" /> {label}
         </p>
         <p className="text-slate-900 font-bold">{value}</p>
      </div>
   )
}