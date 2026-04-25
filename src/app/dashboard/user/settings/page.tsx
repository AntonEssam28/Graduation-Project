"use client";

import { useState, useEffect, type FormEvent } from "react";
import {
  BellRing,
  CheckCircle2,
  LockKeyhole,
  Mail,
  MapPin,
  Phone,
  Save,
  Settings2,
  ShieldCheck,
  UserCircle2,
  Loader2,
  Lock,
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function UserSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    city: "",
  });
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const fetchSettings = async () => {
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
      });
    } catch (err) {
      console.error("Failed to fetch settings", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleProfileSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const token = localStorage.getItem("token");
    const userObj = JSON.parse(localStorage.getItem("user") || "{}");

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
        localStorage.setItem("user", JSON.stringify({ ...userObj, name: updated.name, email: updated.email }));
        alert("Settings saved successfully ✅");
      }
    } catch (err) {
      alert("Error saving settings");
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      alert("New passwords do not match");
      return;
    }
    setSaving(true);
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(`${API_URL}/api/auth/change-password`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({
          currentPassword: passwords.currentPassword,
          newPassword: passwords.newPassword,
        })
      });
      if (res.ok) {
        alert("Password changed successfully ✅");
        setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
      } else {
        const err = await res.json();
        alert(err.message || "Failed to change password");
      }
    } catch (err) {
      alert("Error changing password");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-10 rounded-[40px] border border-slate-200 shadow-sm">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-700 uppercase tracking-widest">
            <Settings2 className="h-3.5 w-3.5" />
            Control Center
          </div>
          <h1 className="text-4xl font-black text-slate-950 mt-4 tracking-tight">Account Settings</h1>
          <p className="text-slate-500 font-medium mt-2">Manage your credentials, privacy, and preferences.</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Personal Details Section */}
        <section className="bg-white rounded-[40px] border border-slate-200 p-10 shadow-sm space-y-8">
          <div className="flex items-center gap-3 border-b border-slate-50 pb-6">
            <div className="h-12 w-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
              <UserCircle2 className="h-6 w-6" />
            </div>
            <h2 className="text-2xl font-black text-slate-950">Personal Details</h2>
          </div>

          <form onSubmit={handleProfileSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
              <div className="relative">
                <UserCircle2 className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
                <input 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl pl-14 pr-6 py-4 outline-none transition font-bold"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Email (Primary)</label>
              <div className="relative">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
                <input 
                  value={formData.email}
                  disabled
                  className="w-full bg-slate-50 border-2 border-transparent rounded-2xl pl-14 pr-6 py-4 outline-none transition font-bold text-slate-400 cursor-not-allowed"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Phone</label>
                <input 
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl px-6 py-4 outline-none transition font-bold"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">City</label>
                <input 
                  value={formData.city}
                  onChange={(e) => setFormData({...formData, city: e.target.value})}
                  className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl px-6 py-4 outline-none transition font-bold"
                />
              </div>
            </div>

            <button 
              disabled={saving}
              className="w-full mt-4 flex items-center justify-center gap-3 bg-slate-950 text-white rounded-2xl py-5 font-black text-lg hover:bg-slate-800 transition disabled:opacity-50"
            >
              <Save className="h-6 w-6" /> Save Changes
            </button>
          </form>
        </section>

        {/* Security Section */}
        <section className="bg-white rounded-[40px] border border-slate-200 p-10 shadow-sm space-y-8">
          <div className="flex items-center gap-3 border-b border-slate-50 pb-6">
            <div className="h-12 w-12 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center">
              <LockKeyhole className="h-6 w-6" />
            </div>
            <h2 className="text-2xl font-black text-slate-950">Security & Password</h2>
          </div>

          <form onSubmit={handlePasswordSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Current Password</label>
              <div className="relative">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
                <input 
                  type="password"
                  value={passwords.currentPassword}
                  onChange={(e) => setPasswords({...passwords, currentPassword: e.target.value})}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl pl-14 pr-6 py-4 outline-none transition font-bold"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">New Password</label>
              <input 
                type="password"
                value={passwords.newPassword}
                onChange={(e) => setPasswords({...passwords, newPassword: e.target.value})}
                placeholder="New Password"
                className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl px-6 py-4 outline-none transition font-bold"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Confirm New Password</label>
              <input 
                type="password"
                value={passwords.confirmPassword}
                onChange={(e) => setPasswords({...passwords, confirmPassword: e.target.value})}
                placeholder="Confirm Password"
                className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl px-6 py-4 outline-none transition font-bold"
              />
            </div>

            <button 
              disabled={saving}
              className="w-full mt-4 flex items-center justify-center gap-3 bg-red-600 text-white rounded-2xl py-5 font-black text-lg hover:bg-red-700 transition disabled:opacity-50"
            >
              <ShieldCheck className="h-6 w-6" /> Update Password
            </button>
          </form>
        </section>

        {/* Preferences & Notifications */}
        <section className="lg:col-span-2 bg-slate-50 rounded-[40px] p-10 border border-slate-100 grid md:grid-cols-2 gap-10">
           <div>
              <div className="flex items-center gap-3 mb-6">
                <BellRing className="h-8 w-8 text-blue-600" />
                <h3 className="text-2xl font-black text-slate-950">Notification Preferences</h3>
              </div>
              <p className="text-slate-500 font-medium mb-8">Choose how you want to be reached for updates.</p>
              
              <div className="space-y-4">
                 {[
                   "Email updates on adoption status",
                   "Donation confirmation receipts",
                   "Nearby missing pet alerts",
                   "New match recommendations"
                 ].map((t, i) => (
                   <label key={i} className="flex items-center justify-between p-5 bg-white rounded-2xl border border-slate-200 cursor-pointer hover:border-blue-400 transition">
                      <span className="font-bold text-slate-700 text-sm">{t}</span>
                      <input type="checkbox" defaultChecked className="h-6 w-6 accent-blue-600" />
                   </label>
                 ))}
              </div>
           </div>

           <div>
              <div className="flex items-center gap-3 mb-6">
                <ShieldCheck className="h-8 w-8 text-emerald-600" />
                <h3 className="text-2xl font-black text-slate-950">Account Integrity</h3>
              </div>
              <p className="text-slate-500 font-medium mb-8">Maintain your account health and safety.</p>

              <div className="bg-white rounded-3xl p-8 border border-slate-200">
                 <div className="flex items-center gap-4 mb-4">
                    <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                    <span className="font-black text-slate-900 uppercase tracking-widest text-xs">Verified Account</span>
                 </div>
                 <p className="text-sm text-slate-500 leading-relaxed">
                   Your account has been fully verified via email. This increases your chances of approval for premium adoption requests by 45%.
                 </p>
                 <button className="mt-6 text-sm font-black text-blue-600 hover:text-blue-800 uppercase tracking-wider">
                   Learn about trust scores
                 </button>
              </div>
           </div>
        </section>
      </div>
    </div>
  );
}