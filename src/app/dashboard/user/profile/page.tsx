"use client";

import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import Link from "next/link";
import {
  User,
  Mail,
  Phone,
  ShieldCheck,
  Camera,
  Save,
  Dog,
  Edit3,
  Loader2,
  AlertTriangle,
  History,
  HandCoins,
  FileText,
  CheckCircle2,
  MapPin,
  LayoutDashboard,
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function UserProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    city: "",
    bio: "",
    photo: "",
  });
  const [stats, setStats] = useState({
    requests: 0,
    donations: 0,
    reports: 0,
  });

  const fetchProfile = async () => {
    const userStr = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    if (!userStr || !token) return;

    const userObj = JSON.parse(userStr);
    try {
      const res = await fetch(`${API_URL}/api/users/${userObj.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setFormData({
        name: data.name || "",
        email: data.email || "",
        phone: data.phone || "",
        city: data.city || "",
        bio: data.bio || "",
        photo: data.photo || "",
      });

      const [reqsRes, donsRes, repsRes] = await Promise.all([
        fetch(`${API_URL}/api/requests`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_URL}/api/donations`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_URL}/api/reports`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      const reqs = await reqsRes.json();
      const dons = await donsRes.json();
      const reps = await repsRes.json();

      setStats({
        requests: (Array.isArray(reqs) ? reqs : (reqs.data || [])).filter((r: any) => r.requesterEmail === data.email).length,
        donations: (Array.isArray(dons) ? dons : (dons.data || [])).filter((d: any) => d.donorEmail === data.email).length,
        reports: (Array.isArray(reps) ? reps : (reps.data || [])).filter((r: any) => r.reporterEmail === data.email).length,
      });

    } catch (err) {
      console.error("Failed to fetch profile", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePhotoChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, photo: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const userStr = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    const userObj = JSON.parse(userStr || "{}");

    try {
      const res = await fetch(`${API_URL}/api/users/${userObj.id}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        const updated = await res.json();
        localStorage.setItem("user", JSON.stringify({ ...userObj, name: updated.name, email: updated.email, photo: updated.photo }));
        alert("Profile updated successfully!");
        window.location.reload();
      }
    } catch (err) {
        alert("Error saving profile");
    } finally {
        setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex h-[60vh] items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex flex-col md:flex-row gap-6 items-center">
           <div className="relative group">
              <label className="cursor-pointer block">
                <input type="file" className="hidden" accept="image/*" onChange={handlePhotoChange} />
                <div className="h-24 w-24 rounded-2xl bg-slate-900 flex items-center justify-center text-white relative overflow-hidden">
                  {formData.photo ? <img src={formData.photo} alt="Profile" className="h-full w-full object-cover" /> : <User className="h-10 w-10" />}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                    <Camera className="h-6 w-6 text-white" />
                  </div>
                </div>
              </label>
           </div>
           <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl font-bold text-slate-950">{formData.name}</h1>
              <p className="text-sm text-slate-500 mt-1">{formData.email}</p>
              <div className="mt-3 flex flex-wrap justify-center md:justify-start gap-4">
                 <StatItem icon={History} label="Requests" value={stats.requests} />
                 <StatItem icon={HandCoins} label="Donations" value={stats.donations} />
                 <StatItem icon={FileText} label="Reports" value={stats.reports} />
              </div>
           </div>
           <Link href="/dashboard/user/settings" className="px-5 py-2.5 bg-slate-100 text-slate-900 rounded-xl font-bold text-sm hover:bg-slate-200 transition">
             Settings
           </Link>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
         <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-6">
               <h3 className="text-xl font-bold text-slate-950 flex items-center gap-2">
                 <Edit3 className="h-5 w-5" /> Edit Profile
               </h3>
               
               <div className="grid md:grid-cols-2 gap-4">
                  <Input label="Full Name" name="name" value={formData.name} onChange={handleChange} />
                  <Input label="Email Address" name="email" value={formData.email} disabled />
                  <Input label="Phone Number" name="phone" value={formData.phone} onChange={handleChange} />
                  <Input label="Current City" name="city" value={formData.city} onChange={handleChange} />
               </div>

               <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Bio</label>
                  <textarea 
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    rows={4}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-slate-950 transition text-sm"
                  />
               </div>

               <button disabled={saving} className="bg-slate-950 text-white rounded-xl px-6 py-3 font-bold text-sm flex items-center gap-2 hover:bg-slate-800 transition disabled:opacity-50">
                  <Save className="h-4 w-4" /> {saving ? 'Saving...' : 'Save Changes'}
               </button>
            </form>
         </div>

         <div className="space-y-6">
            <div className="bg-amber-50 rounded-3xl p-6 border border-amber-100">
               <BadgeCheck icon={CheckCircle2} label="Verified Status" />
               <p className="mt-2 text-sm text-amber-800 leading-relaxed">Your account is verified. This helps maintain trust between you and the shelters during applications.</p>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
               <h4 className="font-bold text-slate-950">Security Notice</h4>
               <p className="text-sm text-slate-500 leading-relaxed">Keep your contact information updated to receive real-time notifications about your rescue efforts.</p>
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
       <input {...props} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-slate-950 transition text-sm disabled:text-slate-400 disabled:cursor-not-allowed" />
    </div>
  );
}

function StatItem({ icon: Icon, label, value }: any) {
  return (
    <div className="flex items-center gap-2 text-sm text-slate-600">
       <Icon className="h-4 w-4 text-slate-400" />
       <span className="font-bold text-slate-900">{value}</span>
       <span>{label}</span>
    </div>
  );
}

function BadgeCheck({ icon: Icon, label }: any) {
    return (
        <div className="flex items-center gap-2 text-amber-800 font-bold text-sm">
           <Icon className="h-4 w-4" /> {label}
        </div>
    )
}