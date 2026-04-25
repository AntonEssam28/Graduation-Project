"use client";

import { useState, useEffect } from "react";
import { 
  Calendar, 
  ChevronRight, 
  CreditCard, 
  Loader2, 
  CheckCircle2,
  Stethoscope
} from "lucide-react";
import { Button } from "@/components/ui/button";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

type ClinicFormProps = {
  selectedService: string;
  selectedShelter: string;
};

export default function ClinicForm({ selectedService, selectedShelter }: ClinicFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    date: "",
    notes: "",
  });

  const [readOnlyFields, setReadOnlyFields] = useState({
    name: false,
    email: false,
    phone: false,
  });

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        setFormData(prev => ({
          ...prev,
          name: user.name || "",
          email: user.email || "",
          phone: user.phone || "",
        }));
        
        setReadOnlyFields({
          name: !!user.name,
          email: !!user.email,
          phone: !!user.phone,
        });
      } catch (err) {
        console.error("Error parsing user data", err);
      }
    }
  }, []);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please log in to book a clinic appointment.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/requests`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({
          requesterName: formData.name,
          requesterEmail: formData.email,
          requesterPhone: formData.phone,
          type: "Clinic",
          clinicService: selectedService,
          shelter: selectedShelter,
          message: formData.notes,
          appointmentDate: formData.date,
        }),
      });

      if (res.ok) {
        setSubmitted(true);
      } else {
        alert("Something went wrong. Please try again.");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to submit request.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="rounded-3xl border border-emerald-100 bg-emerald-50 p-8 text-center shadow-sm">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500 text-white shadow-sm">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <h3 className="text-2xl font-bold text-slate-900">Request Sent!</h3>
        <p className="mt-3 text-sm text-slate-600 leading-relaxed font-bold">
          We've received your booking for <span className="text-emerald-600">{selectedService}</span> at <span className="text-slate-900">{selectedShelter}</span>. We'll contact you soon.
        </p>
        <Button 
          className="mt-6 h-12 w-full rounded-2xl bg-slate-950 font-bold text-white transition hover:bg-slate-800 shadow-lg shadow-slate-200"
          onClick={() => window.location.reload()}
        >
          Book Another Service
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
      <div className="flex items-center gap-4 mb-8">
        <div className="h-12 w-12 rounded-xl bg-slate-950 flex items-center justify-center text-white">
          <Calendar className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">Book Appointment</h2>
          <p className="text-sm text-slate-500 font-medium">Finalize your details below</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Full Name</label>
            <input
              required
              type="text"
              placeholder="Your name"
              className={`w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold outline-none transition focus:border-slate-900 focus:bg-white ${readOnlyFields.name ? "cursor-not-allowed opacity-75" : ""}`}
              value={formData.name}
              readOnly={readOnlyFields.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Email Address</label>
            <input
              required
              type="email"
              placeholder="email@example.com"
              className={`w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold outline-none transition focus:border-slate-900 focus:bg-white ${readOnlyFields.email ? "cursor-not-allowed opacity-75" : ""}`}
              value={formData.email}
              readOnly={readOnlyFields.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Phone Number</label>
            <input
              required
              type="tel"
              placeholder="+20 ..."
              className={`w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold outline-none transition focus:border-slate-900 focus:bg-white ${readOnlyFields.phone ? "cursor-not-allowed opacity-75" : ""}`}
              value={formData.phone}
              readOnly={readOnlyFields.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Preferred Date</label>
            <input
              required
              type="date"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold outline-none transition focus:border-slate-900 focus:bg-white"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Notes for the Clinic</label>
          <textarea
            rows={3}
            placeholder="Special requirements..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold outline-none transition focus:border-slate-900 focus:bg-white resize-none"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          />
        </div>

        <div className="rounded-2xl bg-slate-50 p-5 border border-slate-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CreditCard className="h-4 w-4 text-slate-400" />
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Payment</p>
                <p className="text-sm font-bold text-slate-900">Pay at Clinic</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Service</p>
              <p className="text-sm font-bold text-indigo-600">{selectedService}</p>
            </div>
          </div>
        </div>

        <Button
          disabled={loading}
          className="h-14 w-full rounded-2xl bg-slate-950 font-bold text-white transition hover:bg-slate-800 shadow-lg shadow-slate-200"
        >
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <>
              Confirm Booking
              <ChevronRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </form>
    </div>
  );
}
