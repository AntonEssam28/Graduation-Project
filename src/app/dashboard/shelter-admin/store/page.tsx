"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShoppingBag,
  Plus,
  Search,
  Tag,
  Package,
  TrendingUp,
  Image as ImageIcon,
  X,
} from "lucide-react";

type StoreItem = {
  _id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  status: "Active" | "Draft" | "Out of Stock";
  photo?: string;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function ShelterAdminStorePage() {
  const [items, setItems] = useState<StoreItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Modal states
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    price: "",
    stock: "",
    status: "Active",
    photo: "",
  });
  
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = () => {
    fetch(`${API_URL}/api/store`, { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }})
      .then((res) => res.json())
      .then((data) => {
        const itemsData = Array.isArray(data) ? data : (data.data || []);
        setItems(itemsData);
      })
      .catch((err) => {
        console.error("Failed to fetch store items", err);
        setItems([]);
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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        price: Number(formData.price),
        stock: Number(formData.stock),
      };
      
      const isEditing = !!editingId;
      const url = isEditing ? `${API_URL}/api/store/${editingId}` : `${API_URL}/api/store`;
      const method = isEditing ? "PUT" : "POST";
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        closeModal();
        fetchItems();
      }
    } catch (error) {
      console.error("Failed to save store item", error);
    }
  };

  const handleEditClick = (item: StoreItem) => {
    setEditingId(item._id);
    setFormData({
      name: item.name || "",
      category: item.category || "",
      price: item.price !== undefined ? String(item.price) : "",
      stock: item.stock !== undefined ? String(item.stock) : "",
      status: item.status || "Active",
      photo: item.photo || "",
    });
    setIsAdding(true);
  };

  const closeModal = () => {
    setIsAdding(false);
    setEditingId(null);
    setFormData({ name: "", category: "", price: "", stock: "", status: "Active", photo: "" });
  };

  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = [
    { label: "Total Products", value: items.length, icon: Package },
    { label: "Active Listings", value: items.filter((i) => i.status === "Active").length, icon: Tag },
    { label: "Inventory Value", value: `EGP ${items.reduce((acc, item) => acc + (item.price * item.stock), 0).toLocaleString()}`, icon: Package },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-950">Shelter Store</h1>
          <p className="mt-2 text-sm text-slate-600">
            Manage your shelter's merchandise and supplies store.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/shelter-admin/store/sales"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            <TrendingUp className="h-4 w-4" />
            View Sales
          </Link>
          <button 
            onClick={() => {
              if (isAdding) closeModal();
              else setIsAdding(true);
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            {isAdding ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {isAdding ? "Cancel" : "Add Product"}
          </button>
        </div>
      </div>

      {isAdding && (
        <form onSubmit={handleSave} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm relative">
          <button 
            type="button" 
            onClick={() => setIsAdding(false)} 
            className="absolute top-6 right-6 text-slate-400 hover:text-slate-900"
          >
            <X className="h-5 w-5" />
          </button>
          
          <h2 className="text-xl font-bold text-slate-950 mb-5">{editingId ? "Edit Product" : "Create New Product"}</h2>
          
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-950"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Category</label>
              <input
                type="text"
                required
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-950"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Price (EGP)</label>
              <input
                type="number"
                min="0"
                required
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-950"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Stock</label>
              <input
                type="number"
                min="0"
                required
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-950"
              />
            </div>
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-slate-700">Product Photo</label>
              
              {formData.photo && (
                <div className="mb-3 flex items-center gap-4">
                  <div className="h-16 w-16 overflow-hidden rounded-xl border border-slate-200">
                    <img src={formData.photo} alt="Preview" className="h-full w-full object-cover" />
                  </div>
                  <button type="button" onClick={() => setFormData({...formData, photo: ""})} className="text-sm font-medium text-red-600 hover:text-red-700">Remove</button>
                </div>
              )}
              
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                disabled={uploadingPhoto}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition file:mr-4 file:rounded-lg file:border-0 file:bg-slate-950 file:px-4 file:py-2 file:text-white file:text-sm file:font-semibold hover:border-slate-950 disabled:opacity-50"
              />
              {uploadingPhoto && <p className="mt-2 text-sm text-slate-500">Uploading photo...</p>}
            </div>
          </div>
          
          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              {editingId ? "Save Changes" : "Save Product"}
            </button>
          </div>
        </form>
      )}

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-600">{stat.label}</p>
                <div className="rounded-full bg-slate-100 p-2">
                  <Icon className="h-4 w-4 text-slate-600" />
                </div>
              </div>
              <p className="mt-4 text-3xl font-bold text-slate-950">{stat.value}</p>
            </div>
          );
        })}
      </div>

      {/* Main Content */}
      <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-slate-200 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-xl font-bold text-slate-950 flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            Inventory
          </h2>
          <div className="relative w-full sm:max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search products..."
              className="w-full rounded-xl border border-slate-300 py-2 pl-9 pr-4 text-sm outline-none transition focus:border-slate-950 focus:ring-1 focus:ring-slate-950"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-6 py-4 font-medium">Product</th>
                <th className="px-6 py-4 font-medium">Category</th>
                <th className="px-6 py-4 font-medium">Price</th>
                <th className="px-6 py-4 font-medium">Stock</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredItems.length > 0 ? (
                filteredItems.map((item) => (
                  <tr key={item._id} className="transition hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 overflow-hidden relative">
                          {item.photo ? (
                            <img src={item.photo} alt={item.name} className="h-full w-full object-cover" />
                          ) : (
                            <ImageIcon className="h-5 w-5 text-slate-400" />
                          )}
                        </div>
                        <span className="font-semibold text-slate-950">{item.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">{item.category}</td>
                    <td className="px-6 py-4 font-medium text-slate-900">EGP {item.price}</td>
                    <td className="px-6 py-4">{item.stock} in stock</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                          item.status === "Active"
                            ? "bg-emerald-100 text-emerald-700"
                            : item.status === "Draft"
                            ? "bg-slate-100 text-slate-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => handleEditClick(item)}
                        className="text-sm font-medium text-blue-600 hover:text-blue-800"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    No products found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
