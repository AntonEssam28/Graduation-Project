"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  FileText,
  Dog,
  HeartHandshake,
  HandCoins,
  Package,
  Clock3,
  CheckCircle2,
  XCircle,
  CalendarDays,
  Loader2,
  LayoutDashboard,
  ShieldCheck,
  AlertCircle,
  ArrowRight,
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function UserRequestDetailsPage() {
  const params = useParams();
  const [request, setRequest] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequestDetails = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const res = await fetch(`${API_URL}/api/requests/${params.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error("Request not found");
        const data = await res.json();
        setRequest(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchRequestDetails();
  }, [params.id]);

  if (loading) return (
    <div className="flex h-[60vh] items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
    </div>
  );

  if (!request) return (
    <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
      <AlertCircle className="h-12 w-12 text-red-500" />
      <h2 className="text-xl font-bold text-slate-950">Request Not Found</h2>
      <Link href="/dashboard/user/requests" className="text-sm font-bold text-blue-600">Back to Requests</Link>
    </div>
  );

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "Pending": return "bg-amber-50 text-amber-700 border-amber-100";
      case "Approved": return "bg-emerald-50 text-emerald-700 border-emerald-100";
      case "Rejected": return "bg-red-50 text-red-700 border-red-100";
      case "In Review": return "bg-blue-50 text-blue-700 border-blue-100";
      default: return "bg-slate-50 text-slate-700 border-slate-100";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "Adoption": return Dog;
      case "Foster": return HeartHandshake;
      case "Report": return AlertCircle;
      default: return FileText;
    }
  };

  const Icon = getTypeIcon(request.type);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard/user/requests"
          className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 transition hover:text-slate-950"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to List
        </Link>
        <div className="flex items-center gap-2">
           <span className={`px-4 py-1.5 rounded-full text-xs font-bold border ${getStatusStyle(request.status)}`}>
              {request.status}
           </span>
        </div>
      </div>

      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex flex-col md:flex-row gap-6 items-start justify-between">
           <div className="flex items-center gap-5">
              <div className="h-16 w-16 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-xl">
                 <Icon className="h-8 w-8" />
              </div>
              <div>
                 <h1 className="text-3xl font-bold text-slate-950 tracking-tight">{request.type} Request</h1>
                 <p className="text-sm text-slate-500 mt-1">{request.shelter}</p>
              </div>
           </div>
           <div className="flex items-center gap-2 text-sm font-bold text-slate-400 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
              <CalendarDays className="h-4 w-4" />
              Submitted: {new Date(request.createdAt).toLocaleDateString()}
           </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
         <div className="lg:col-span-2 space-y-6">
            {/* Dog Details Section */}
            {request.dogId && (
              <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-6 items-center">
                 <div className="h-32 w-32 rounded-2xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                    {request.dogId.photo ? (
                      <img src={request.dogId.photo} alt={request.dogId.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center">
                        <Dog className="h-10 w-10 text-slate-300" />
                      </div>
                    )}
                 </div>
                 <div className="flex-1 text-center md:text-left">
                    <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Target Canine</p>
                    <h2 className="text-3xl font-black text-slate-950">{request.dogId.name}</h2>
                    <p className="text-slate-500 font-medium">{request.dogId.breed} • {request.dogId.age} Years Old</p>
                    <Link 
                      href={`/dog/${request.dogId._id}`}
                      className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-blue-600 hover:underline"
                    >
                      View Full Profile <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                 </div>
              </div>
            )}

            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm h-full">
               <h3 className="text-xl font-bold text-slate-950 mb-6 flex items-center gap-2">
                 <FileText className="h-5 w-5 text-slate-400" />
                 Request Application
               </h3>
               <div className="space-y-6">
                  <div>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Requester Name</p>
                    <p className="text-slate-900 font-bold">{request.requesterName}</p>
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Email & Contact</p>
                    <p className="text-slate-900 font-bold">{request.requesterEmail}</p>
                    <p className="text-slate-500 text-sm mt-1">{request.requesterPhone || "No phone provided"}</p>
                  </div>
                  <div className="pt-6 border-t border-slate-50">
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Additional Application Message</p>
                    <p className="text-slate-600 leading-relaxed italic border-l-4 border-slate-100 pl-4">
                       "{request.message || "No additional application notes provided."}"
                    </p>
                  </div>
               </div>
            </div>
         </div>

         <div className="space-y-6">
            <div className="bg-slate-900 p-8 rounded-3xl text-white shadow-lg relative overflow-hidden">
               <h3 className="text-xl font-bold mb-6">Process Status</h3>
               <div className="space-y-6 relative z-10">
                  <TimelineItem label="Submitted" date={new Date(request.createdAt).toLocaleDateString()} active icon={CheckCircle2} />
                  
                  <TimelineItem 
                    label="In Review" 
                    active={request.status === 'In Review' || request.status === 'Approved' || request.status === 'Rejected'} 
                    icon={request.status === 'In Review' ? Clock3 : CheckCircle2}
                  />

                  {request.status === 'Rejected' ? (
                    <TimelineItem label="Rejected" active icon={XCircle} color="bg-red-500" />
                  ) : (
                    <TimelineItem label="Approved" active={request.status === 'Approved'} icon={CheckCircle2} />
                  )}
               </div>
               <div className="absolute -right-10 -bottom-10 h-40 w-40 bg-blue-500/10 blur-[80px] rounded-full" />
            </div>

            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
               <h3 className="text-xl font-bold text-slate-950 mb-4">Official Notice</h3>
               <p className="text-sm text-slate-500 leading-relaxed mb-4">
                  Please allow 3-5 business days for our shelter team to process your application and contact you.
               </p>
               <button className="w-full bg-slate-50 text-slate-900 font-bold py-3 rounded-xl border border-slate-200 hover:bg-slate-100 transition">
                  Contact Support
               </button>
            </div>
         </div>
      </div>
    </div>
  );
}

function TimelineItem({ label, date, active, icon: Icon, color = "bg-emerald-500" }: any) {
  return (
    <div className="flex gap-4">
       <div className={`h-6 w-6 rounded-full flex items-center justify-center shrink-0 ${active ? `${color} shadow-lg` : 'bg-white/10'}`}>
          <Icon className={`h-3.5 w-3.5 ${active ? 'text-white' : 'text-white/20'}`} />
       </div>
       <div>
          <p className={`text-sm font-bold ${active ? 'text-white' : 'text-slate-500'}`}>{label}</p>
          {date && <p className="text-[10px] text-slate-400 font-medium">{date}</p>}
       </div>
    </div>
  )
}