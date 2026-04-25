"use client";

import { useState, useEffect } from "react";
import { 
  Plus, 
  Trash2, 
  Save, 
  Stethoscope, 
  AlertCircle, 
  CheckCircle2, 
  Loader2,
  Scissors,
  Sparkles,
  ShowerHead,
  Syringe,
  Heart,
  DollarSign
} from "lucide-react";
import { Button } from "@/components/ui/button";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const DEFAULT_SERVICES = [
  "Grooming",
  "Nails",
  "Shower",
  "Vaccine",
  "Checkup",
  "Surgery",
  "Other"
];

export default function ClinicManagementPage() {
  const [shelter, setShelter] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newService, setNewService] = useState({ name: "Grooming", price: 0 });

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const shelterName = user.assignedShelter;
    const token = localStorage.getItem("token");

    if (!shelterName) {
      setLoading(false);
      return;
    }

    fetch(`${API_URL}/api/shelters?name=${encodeURIComponent(shelterName)}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setShelter(data[0]);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const handleAddService = () => {
    if (!shelter) return;
    
    // Check if service already exists
    if (shelter.clinicServices?.some((s: any) => s.name === newService.name)) {
      alert("This service is already added.");
      return;
    }

    const updatedServices = [...(shelter.clinicServices || []), { ...newService, available: true }];
    setShelter({ ...shelter, clinicServices: updatedServices });
  };

  const handleRemoveService = (name: string) => {
    const updatedServices = shelter.clinicServices.filter((s: any) => s.name !== name);
    setShelter({ ...shelter, clinicServices: updatedServices });
  };

  const handleToggleAvailability = (name: string) => {
    const updatedServices = shelter.clinicServices.map((s: any) => 
      s.name === name ? { ...s, available: !s.available } : s
    );
    setShelter({ ...shelter, clinicServices: updatedServices });
  };

  const handleUpdatePrice = (name: string, price: number) => {
    const updatedServices = shelter.clinicServices.map((s: any) => 
      s.name === name ? { ...s, price } : s
    );
    setShelter({ ...shelter, clinicServices: updatedServices });
  };

  const saveChanges = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/api/shelters/${shelter._id}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({ clinicServices: shelter.clinicServices }),
      });

      if (res.ok) {
        alert("Clinic services updated successfully ✅");
      } else {
        alert("Failed to save changes.");
      }
    } catch (err) {
      console.error(err);
      alert("Error saving changes.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex h-96 items-center justify-center">
      <Loader2 className="h-10 w-10 animate-spin text-slate-300" />
    </div>
  );

  if (!shelter) return (
    <div className="p-20 text-center">
      <AlertCircle className="mx-auto h-16 w-16 text-amber-500 mb-6" />
      <h2 className="text-3xl font-black text-slate-900">Shelter Not Found</h2>
      <p className="mt-4 text-slate-600">Please make sure you are assigned to a shelter.</p>
    </div>
  );

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700 uppercase tracking-wider">
              <Stethoscope className="h-3.5 w-3.5" />
              Clinic Management
            </div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Clinical Services</h1>
            <p className="mt-1 text-sm text-slate-500 font-medium">
              Manage the medical and grooming services your shelter provides.
            </p>
          </div>
          <Button 
            onClick={saveChanges}
            disabled={saving}
            className="h-12 rounded-xl bg-slate-950 px-6 font-bold text-white hover:bg-slate-800 shadow-md transition-all active:scale-95"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Add Service Section */}
        <div className="lg:col-span-1 space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900 mb-5">Add New Service</h2>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Service Name</label>
                <select 
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold outline-none focus:border-slate-900"
                  value={newService.name}
                  onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                >
                  {DEFAULT_SERVICES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Price (EGP)</label>
                <div className="relative">
                  <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input 
                    type="number"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm font-bold outline-none focus:border-slate-900"
                    placeholder="0.00"
                    value={newService.price}
                    onChange={(e) => setNewService({ ...newService, price: Number(e.target.value) })}
                  />
                </div>
              </div>

              <Button 
                onClick={handleAddService}
                className="w-full h-12 rounded-xl bg-slate-900 font-bold text-white hover:bg-slate-800 shadow-sm"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add to Clinic
              </Button>
            </div>
          </div>

          <div className="rounded-3xl bg-slate-950 p-6 text-white text-sm">
             <h3 className="font-bold mb-3 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-amber-400" />
                Admin Tip
             </h3>
             <p className="text-slate-400 leading-relaxed font-medium">
                Services you add here will be visible on the public page. Ensure prices are accurate and update availability if booked.
             </p>
          </div>
        </div>

        {/* List Services Section */}
        <div className="lg:col-span-2">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Current Offerings</h2>
            
            {(!shelter.clinicServices || shelter.clinicServices.length === 0) ? (
              <div className="py-20 text-center rounded-2xl border-2 border-dashed border-slate-100 bg-slate-50">
                <div className="mx-auto h-12 w-12 rounded-xl bg-white border border-slate-100 flex items-center justify-center mb-4">
                   <Stethoscope className="h-6 w-6 text-slate-300" />
                </div>
                <p className="text-sm font-bold text-slate-400">No services added yet</p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {shelter.clinicServices.map((service: any) => {
                  let Icon = Stethoscope;
                  if (service.name === "Grooming") Icon = Scissors;
                  if (service.name === "Shower") Icon = ShowerHead;
                  if (service.name === "Vaccine") Icon = Syringe;
                  if (service.name === "Nails") Icon = Sparkles;
                  if (service.name === "Surgery") Icon = Heart;

                  return (
                    <div 
                      key={service.name}
                      className={`group relative overflow-hidden rounded-2xl border p-5 transition-all ${
                        service.available ? "border-slate-200 bg-white hover:shadow-md" : "border-slate-100 bg-slate-50 opacity-80"
                      }`}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className={`h-10 w-10 rounded-xl flex items-center justify-center text-white shadow-sm ${service.available ? 'bg-slate-900' : 'bg-slate-400'}`}>
                           <Icon className="h-5 w-5" />
                        </div>
                        <button 
                          onClick={() => handleRemoveService(service.name)}
                          className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      <h3 className="font-bold text-slate-900">{service.name}</h3>
                      
                      <div className="mt-5 flex items-center justify-between gap-4">
                         <div className="flex-1">
                            <p className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">Price (EGP)</p>
                            <input 
                              type="number"
                              className="mt-1 w-full rounded-lg bg-slate-50 px-3 py-2 text-sm font-bold text-slate-900 outline-none border border-transparent focus:border-slate-200 focus:bg-white"
                              value={service.price}
                              onChange={(e) => handleUpdatePrice(service.name, Number(e.target.value))}
                            />
                         </div>
                         <button 
                           onClick={() => handleToggleAvailability(service.name)}
                           className={`h-9 px-3 rounded-lg text-[10px] font-bold uppercase tracking-wider transition ${
                             service.available ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-slate-100 text-slate-500 border border-slate-200"
                           }`}
                         >
                            {service.available ? "Active" : "Inactive"}
                         </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
