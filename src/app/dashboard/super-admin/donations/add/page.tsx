"use client"

import { useState, type ChangeEvent, type FormEvent } from "react";
import Link from "next/link";
import { ArrowLeft, Save, Upload } from "lucide-react";
import type { DonationItem, DonationStatus, DonationType } from "@/components/DonationCard";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function AddDonationPage() {
  const [formData, setFormData] = useState<DonationItem>({
    _id: "",
    donorName: "",
    donorEmail: "",
    phone: "",
    type: "Cash",
    value: 0,
    unit: "EGP",
    shelter: "",
    city: "",
    status: "Pending",
    createdAt: "",
    notes: "",
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "value" ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/api/donations`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Failed to create donation");
      alert("Donation added successfully");
      // redirect back to list
      window.location.href = "/dashboard/super-admin/donations";
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Something went wrong");
    }
  };

  return (
    <div className="space-y-6">
      <Link href="/dashboard/super-admin/donations" className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-slate-950">
        <ArrowLeft className="h-4 w-4" /> Back to Donations
      </Link>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-bold text-slate-950 mb-4">Add New Donation</h1>
        <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Donor Name</label>
            <input name="donorName" value={formData.donorName} onChange={handleChange} placeholder="John Doe" className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-950" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Donor Email</label>
            <input name="donorEmail" value={formData.donorEmail} onChange={handleChange} placeholder="john@example.com" className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-950" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Phone</label>
            <input name="phone" value={formData.phone} onChange={handleChange} placeholder="+20 123 456 7890" className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-950" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Type</label>
            <select name="type" value={formData.type} onChange={handleChange} className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-slate-950">
              <option value="Cash">Cash</option>
              <option value="Food">Food</option>
              <option value="Medicine">Medicine</option>
              <option value="Supplies">Supplies</option>
            </select>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Value</label>
            <input name="value" type="number" value={formData.value} onChange={handleChange} placeholder="0" className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-950" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Unit</label>
            <input name="unit" value={formData.unit} onChange={handleChange} placeholder="EGP" className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-950" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Shelter</label>
            <input name="shelter" value={formData.shelter} onChange={handleChange} placeholder="Cairo Shelter" className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-950" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">City</label>
            <input name="city" value={formData.city} onChange={handleChange} placeholder="Cairo" className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-950" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Status</label>
            <select name="status" value={formData.status} onChange={handleChange} className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-slate-950">
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Received">Received</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
          <div className="lg:col-span-2">
            <label className="mb-2 block text-sm font-medium text-slate-700">Notes</label>
            <textarea name="notes" value={formData.notes} onChange={handleChange} rows={4} placeholder="Additional details..." className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-950" />
          </div>
          <div className="flex gap-4 lg:col-span-2">
            <button type="submit" className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-6 py-3 font-semibold text-white transition hover:bg-slate-800">
              <Save className="h-4 w-4" /> Save Donation
            </button>
            <Link href="/dashboard/super-admin/donations" className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-6 py-3 font-semibold text-slate-900 transition hover:bg-slate-100">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
