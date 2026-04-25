"use client";

import { useMemo, useState, useEffect } from "react";
import {
  Users,
  Search,
  Plus,
  Mail,
  Phone,
  MapPin,
  ShieldCheck,
  ShieldBan,
  X,
  Edit3,
  Trash2,
  Eye,
  EyeOff,
  Lock,
} from "lucide-react";

type StaffItem = {
  _id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  status: "Active" | "Suspended" | "Pending Approval" | "Invited";
  photo?: string;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function ShelterAdminStaffPage() {
  const [staffList, setStaffList] = useState<StaffItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Add/Edit Staff Modal State
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ 
    name: "", 
    email: "", 
    password: "",
    phone: "", 
    city: "", 
    status: "Active", 
    photo: "" 
  });
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = () => {
    fetch(`${API_URL}/api/staff`, { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }})
      .then((res) => {
        if (res.status === 401) {
          alert("Your session has expired. Please login again.");
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          window.location.href = "/signin";
          return;
        }
        return res.json();
      })
      .then((data) => {
        if (!data) return;
        const staffData = Array.isArray(data) ? data : (data.data || []);
        setStaffList(staffData);
      })
      .catch((err) => {
        console.error("Failed to fetch staff", err);
        setStaffList([]);
      });
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingPhoto(true);
      const uploadData = new FormData();
      uploadData.append("image", file);

      const res = await fetch(`${API_URL}/api/upload`, {
        method: "POST",
        body: uploadData,
      });

      const data = await res.json();
      if (res.ok && data.url) {
        setFormData({ ...formData, photo: data.url });
      } else {
        alert(data.message || "Failed to upload image");
      }
    } catch (error) {
      console.error(error);
      alert("An error occurred during upload.");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSaveStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const isEditing = !!editingId;
      const url = isEditing ? `${API_URL}/api/staff/${editingId}` : `${API_URL}/api/staff`;
      const method = isEditing ? "PUT" : "POST";
      
      const userStr = localStorage.getItem("user");
      const user = userStr ? JSON.parse(userStr) : {};

      const payload = {
        ...formData,
        assignedShelter: user.assignedShelter || "Demo Shelter"
      };

      // If editing and password is empty, remove it from payload
      if (isEditing && !payload.password) {
        delete (payload as any).password;
      }

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        closeModal();
        fetchStaff();
      } else {
        const errData = await res.json();
        if (res.status === 401) {
          alert("Your session has expired. Please login again.");
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          window.location.href = "/signin";
          return;
        }
        alert(errData.message || "Failed to save staff member");
      }
    } catch (error) {
      console.error("Failed to save staff", error);
    }
  };

  const handleEditClick = (staff: StaffItem) => {
    setEditingId(staff._id);
    setFormData({
      name: staff.name || "",
      email: staff.email || "",
      password: "", // Don't populate password
      phone: staff.phone || "",
      city: staff.city || "",
      status: staff.status || "Active",
      photo: staff.photo || ""
    });
    setIsAdding(true);
  };

  const handleDeleteStaff = async (id: string) => {
    if (!window.confirm("Are you sure you want to remove this staff member?")) return;
    try {
      const res = await fetch(`${API_URL}/api/staff/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } });
      if (res.ok) {
        fetchStaff();
      }
    } catch (error) {
      console.error("Failed to delete staff", error);
    }
  };

  const closeModal = () => {
    setIsAdding(false);
    setEditingId(null);
    setFormData({ name: "", email: "", password: "", phone: "", city: "", status: "Active", photo: "" });
  };

  const filteredStaff = useMemo(() => {
    return staffList.filter((staff) =>
      (staff.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (staff.email || "").toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [staffList, searchTerm]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-950">Staff Management</h1>
          <p className="mt-2 text-sm text-slate-600">
            Manage the team members for your shelter.
          </p>
        </div>

        <button
          onClick={() => {
            if (isAdding) {
              closeModal();
            } else {
              setIsAdding(true);
            }
          }}
          className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          {isAdding ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {isAdding ? "Cancel" : "Add Staff"}
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleSaveStaff} className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm transition-all hover:shadow-md">
          <h2 className="text-2xl font-bold text-slate-950 mb-6 flex items-center gap-2">
            {editingId ? <Edit3 className="h-6 w-6 text-blue-600" /> : <Plus className="h-6 w-6 text-slate-950" />}
            {editingId ? "Edit Team Member" : "Add New Team Member"}
          </h2>
          
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Full Name</label>
              <div className="relative">
                <Users className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 pl-12 pr-4 py-3 outline-none focus:border-slate-950 transition"
                  placeholder="John Doe"
                />
              </div>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Email</label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 pl-12 pr-4 py-3 outline-none focus:border-slate-950 transition"
                  placeholder="email@example.com"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                {editingId ? "New Password (Leave blank to keep current)" : "Password"}
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  required={!editingId}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 pl-12 pr-12 py-3 outline-none focus:border-slate-950 transition"
                  placeholder={editingId ? "••••••••" : "Create a password"}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Phone</label>
              <div className="relative">
                <Phone className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 pl-12 pr-4 py-3 outline-none focus:border-slate-950 transition"
                  placeholder="+20 ..."
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">City</label>
              <div className="relative">
                <MapPin className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 pl-12 pr-4 py-3 outline-none focus:border-slate-950 transition"
                  placeholder="Cairo, Egypt"
                />
              </div>
            </div>
            
            {editingId && (
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Status</label>
                <div className="relative">
                  <ShieldCheck className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 pl-12 pr-4 py-3 outline-none focus:border-slate-950 bg-white appearance-none transition"
                  >
                    <option value="Active">Active</option>
                    <option value="Suspended">Suspended</option>
                  </select>
                </div>
              </div>
            )}
            
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-slate-700">Profile Photo</label>
              
              <div className="flex items-center gap-4">
                <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 flex items-center justify-center relative">
                  {formData.photo ? (
                    <img src={formData.photo} alt="Preview" className="h-full w-full object-cover" />
                  ) : (
                    <Users className="h-8 w-8 text-slate-300" />
                  )}
                </div>
                
                <div className="flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    disabled={uploadingPhoto}
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm outline-none transition file:mr-4 file:rounded-lg file:border-0 file:bg-slate-950 file:px-4 file:py-2 file:text-white file:text-xs file:font-semibold hover:border-slate-950 disabled:opacity-50"
                  />
                  {uploadingPhoto && <p className="mt-2 text-xs text-slate-500 animate-pulse">Uploading photo...</p>}
                  {formData.photo && (
                    <button type="button" onClick={() => setFormData({...formData, photo: ""})} className="mt-2 text-xs font-semibold text-red-600 hover:text-red-700">Remove Photo</button>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="mt-5 text-right">
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              {editingId ? <Edit3 className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              {editingId ? "Save Changes" : "Add Member"}
            </button>
          </div>
        </form>
      )}

      {/* Search */}
      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="relative max-w-md">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search team members by name or email..."
            className="w-full rounded-2xl border border-slate-300 bg-white py-3 pl-12 pr-4 outline-none transition focus:border-slate-950"
          />
        </div>
      </div>

      {/* List matches dog card design */}
      <div className="space-y-4">
        {filteredStaff.length > 0 ? (
          filteredStaff.map((staff) => (
            <div
              key={staff._id}
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md"
            >
              <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-100 text-blue-700 text-2xl font-bold overflow-hidden relative">
                    {staff.photo ? (
                      <img src={staff.photo} alt={staff.name} className="h-full w-full object-cover" />
                    ) : (
                      (staff.name || "?").charAt(0).toUpperCase()
                    )}
                  </div>

                  <div className="max-w-3xl">
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="text-2xl font-bold text-slate-950">{staff.name}</h3>
                      <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${staff.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'}`}>
                        {staff.status === 'Active' ? <ShieldCheck className="h-3 w-3" /> : <ShieldBan className="h-3 w-3" />}
                        {staff.status}
                      </span>
                    </div>

                    <p className="mt-2 text-sm text-slate-500 font-medium">Shelter Staff</p>

                    <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-600">
                      <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1">
                        <Mail className="h-4 w-4 text-slate-500" />
                        <span>{staff.email}</span>
                      </div>
                      
                      {staff.phone && (
                        <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1">
                          <Phone className="h-4 w-4 text-slate-500" />
                          <span>{staff.phone}</span>
                        </div>
                      )}

                      {staff.city && (
                        <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1">
                          <MapPin className="h-4 w-4 text-slate-500" />
                          <span>{staff.city}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-3 lg:min-w-40">
                  <button
                    onClick={() => handleEditClick(staff)}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
                  >
                    <Edit3 className="h-4 w-4" />
                    Edit
                  </button>

                  <button
                    onClick={() => handleDeleteStaff(staff._id)}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 transition hover:bg-red-100"
                  >
                    <Trash2 className="h-4 w-4" />
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 py-16 text-center">
            <Users className="mx-auto h-12 w-12 text-slate-400" />
            <h3 className="mt-4 text-xl font-semibold text-slate-950">No staff members found</h3>
            <p className="mt-2 text-sm text-slate-600">Try adjusting your search or add a new team member.</p>
          </div>
        )}
      </div>
    </div>
  );
}
