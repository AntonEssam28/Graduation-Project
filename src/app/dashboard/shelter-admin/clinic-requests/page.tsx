"use client";

import { useState, useEffect } from "react";
import { 
  Calendar, 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  MoreVertical,
  Stethoscope,
  Scissors,
  Sparkles,
  ShowerHead,
  Syringe,
  Heart,
  Loader2,
  Filter,
  Search
} from "lucide-react";
import { Button } from "@/components/ui/button";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function ClinicRequestsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [shelterName, setShelterName] = useState("");

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (user.assignedShelter) {
      setShelterName(user.assignedShelter);
      fetchRequests(user.assignedShelter);
    }
  }, []);

  const fetchRequests = async (name: string) => {
    try {
      const res = await fetch(`${API_URL}/api/requests?shelter=${encodeURIComponent(name)}&type=Clinic`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      const data = await res.json();
      setRequests(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`${API_URL}/api/requests/${id}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setRequests(requests.map(r => r._id === id ? { ...r, status } : r));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getServiceIcon = (service: string) => {
    switch (service) {
      case "Grooming": return Scissors;
      case "Shower": return ShowerHead;
      case "Vaccine": return Syringe;
      case "Nails": return Sparkles;
      case "Surgery": return Heart;
      default: return Stethoscope;
    }
  };

  if (loading) return (
    <div className="flex h-96 items-center justify-center">
      <Loader2 className="h-10 w-10 animate-spin text-slate-300" />
    </div>
  );

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700 uppercase tracking-wider">
              <Calendar className="h-3.5 w-3.5" />
              Incoming Bookings
            </div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Clinic Requests</h1>
            <p className="mt-1 text-sm text-slate-500 font-medium">
              Manage appointments and health service requests for your clinic.
            </p>
          </div>
          <div className="flex items-center gap-3">
             <div className="h-11 w-64 rounded-xl bg-slate-50 border border-slate-200 px-4 flex items-center gap-3 focus-within:border-slate-400 transition-colors">
                <Search className="h-4 w-4 text-slate-400" />
                <input type="text" placeholder="Search requester..." className="bg-transparent text-sm font-bold outline-none w-full placeholder:text-slate-400" />
             </div>
             <Button variant="outline" className="h-11 w-11 rounded-xl p-0 border-slate-200">
                <Filter className="h-4 w-4" />
             </Button>
          </div>
        </div>
      </div>

      {requests.length === 0 ? (
        <div className="rounded-3xl border-2 border-dashed border-slate-100 bg-white py-32 text-center">
           <div className="mx-auto h-16 w-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-6">
              <Stethoscope className="h-8 w-8 text-slate-200" />
           </div>
           <h3 className="text-xl font-bold text-slate-900">No requests yet</h3>
           <p className="mt-2 text-sm font-medium text-slate-400">Clinic bookings will appear here once users start booking.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {requests.map((request) => {
            const Icon = getServiceIcon(request.clinicService);
            return (
              <div 
                key={request._id}
                className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 transition-all hover:shadow-md"
              >
                <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                  {/* Status Bar */}
                  <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                    request.status === 'Approved' ? 'bg-emerald-500' : 
                    request.status === 'Rejected' ? 'bg-red-500' : 'bg-amber-400'
                  }`} />

                  <div className="flex items-center gap-6">
                    <div className="h-14 w-14 rounded-2xl bg-slate-950 flex items-center justify-center text-white shadow-md">
                      <Icon className="h-7 w-7" />
                    </div>

                    <div>
                      <div className="flex items-center gap-3">
                        <h4 className="text-xl font-bold text-slate-900 tracking-tight">{request.requesterName}</h4>
                        <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                          request.status === 'Approved' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 
                          request.status === 'Rejected' ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-amber-50 text-amber-700 border border-amber-100'
                        }`}>
                          {request.status}
                        </span>
                      </div>
                      
                      <div className="mt-2 flex flex-wrap gap-4 text-xs font-bold text-slate-500">
                         <div className="flex items-center gap-1.5">
                            <Mail className="h-3.5 w-3.5 text-slate-400" />
                            {request.requesterEmail}
                         </div>
                         <div className="flex items-center gap-1.5">
                            <Phone className="h-3.5 w-3.5 text-slate-400" />
                            {request.requesterPhone}
                         </div>
                         <div className="flex items-center gap-1.5 text-indigo-600">
                            <Stethoscope className="h-3.5 w-3.5" />
                            {request.clinicService}
                         </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-start gap-4 lg:items-end">
                    <div className="flex items-center gap-3 rounded-xl bg-slate-50 border border-slate-100 px-4 py-2">
                       <Calendar className="h-4 w-4 text-slate-400" />
                       <div className="text-left">
                          <p className="text-[9px] font-bold uppercase text-slate-400 tracking-wider leading-none">Schedule</p>
                          <p className="text-xs font-bold text-slate-900 mt-0.5">
                            {request.appointmentDate ? new Date(request.appointmentDate).toLocaleDateString() : 'Pending'}
                          </p>
                       </div>
                    </div>
                    
                    <div className="flex gap-2">
                      {request.status === "Pending" && (
                        <>
                          <Button 
                            onClick={() => updateStatus(request._id, "Rejected")}
                            variant="outline" 
                            className="h-10 rounded-lg border-slate-200 text-red-600 hover:bg-red-50 hover:border-red-100 font-bold text-xs"
                          >
                            Reject
                          </Button>
                          <Button 
                            onClick={() => updateStatus(request._id, "Approved")}
                            className="h-10 rounded-lg bg-slate-950 text-white hover:bg-slate-800 font-bold text-xs shadow-sm"
                          >
                            Approve
                          </Button>
                        </>
                      )}
                      
                      {request.status !== "Pending" && (
                         <Button 
                           variant="outline" 
                           onClick={() => updateStatus(request._id, "Pending")}
                           className="h-10 rounded-lg border-slate-200 text-xs font-bold"
                         >
                           Reset
                         </Button>
                      )}
                    </div>
                  </div>
                </div>
                
                {request.message && (
                  <div className="mt-5 rounded-2xl bg-slate-50 p-4 border border-slate-100">
                    <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-1">Notes</p>
                    <p className="text-xs font-medium text-slate-600 italic">"{request.message}"</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
