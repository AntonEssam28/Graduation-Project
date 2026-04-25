"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import {
  ArrowLeft,
  Package,
  Clock3,
  CheckCircle2,
  AlertTriangle,
  HeartHandshake,
  FileText,
  UtensilsCrossed,
  Pill,
  BedDouble,
  Tag,
  ShoppingBag,
  Boxes,
  CalendarDays,
  Loader2,
} from "lucide-react";

import { type SupplyStatus, type SupplyCategory, type SupplyHistoryEntry } from "../components/RestockModal";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

type SupplyItemExtended = {
  _id: string;
  name: string;
  category: string;
  quantity?: number;
  stock?: number;
  unit: string;
  status: string;
  shelter: string;
  description?: string;
  usedFor?: string;
  history?: SupplyHistoryEntry[];
  createdAt: string;
  isStoreItem?: boolean;
};

export default function SupplyDetailsPage() {
  const { id } = useParams();
  const [item, setItem] = useState<SupplyItemExtended | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token || !id) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        // Try fetching from supplies first
        let res = await fetch(`${API_URL}/api/supplies/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        let data = await res.json();

        if (!res.ok) {
          // If not found in supplies, try fetching from store
          res = await fetch(`${API_URL}/api/store/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          data = await res.json();
          if (res.ok) {
            data.isStoreItem = true;
            data.quantity = data.stock;
            data.unit = "units";
          }
        }

        if (res.ok) {
          setItem(data);
        } else {
          setError("Item not found");
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load item details");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-slate-400" />
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <AlertTriangle className="h-12 w-12 text-red-500" />
        <h2 className="text-xl font-bold text-slate-900">{error || "Item not found"}</h2>
        <Link href="/dashboard/shelter-admin/supplies" className="text-blue-600 hover:underline">Back to Supplies</Link>
      </div>
    );
  }

  const getStatusClass = (status: string) => {
    switch (status) {
      case "Available":
        return "bg-emerald-100 text-emerald-700";
      case "Low Stock":
        return "bg-amber-100 text-amber-700";
      case "Out of Stock":
        return "bg-red-100 text-red-700";
      case "Requested":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-slate-200 text-slate-700";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Food":
        return UtensilsCrossed;
      case "Medicine":
        return Pill;
      case "Bedding":
        return BedDouble;
      case "Accessories":
        return Tag;
      case "Care":
        return HeartHandshake;
      case "Toys":
        return ShoppingBag;
      default:
        return Boxes;
    }
  };

  const Icon = getCategoryIcon(item.category);

  return (
    <div className="space-y-6">
      <Link
        href="/dashboard/shelter-admin/supplies"
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-slate-950"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Supplies
      </Link>

      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="flex items-start gap-5">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-lg">
              <Icon className="h-8 w-8" />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-3xl font-bold text-slate-950">{item.name}</h1>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(
                    item.status
                  )}`}
                >
                  {item.status}
                </span>
                {item.isStoreItem && (
                  <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                    Store Product
                  </span>
                )}
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                  {item.category}
                </span>
              </div>

              <p className="mt-2 text-sm text-slate-600 flex items-center gap-2">
                <Boxes className="h-4 w-4" />
                Shelter: <span className="font-semibold">{item.shelter}</span>
              </p>
            </div>
          </div>

          <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600 border border-slate-100">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4" />
              Created: {new Date(item.createdAt).toLocaleDateString()}
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-8">
            <div className="rounded-3xl border border-slate-100 bg-slate-50/50 p-8">
              <h2 className="text-xl font-bold text-slate-950 mb-6 flex items-center gap-2">
                <FileText className="h-5 w-5 text-slate-400" />
                Item Details
              </h2>

              <div className="grid gap-4 sm:grid-cols-2">
                <InfoRow label="Category" value={item.category} />
                <InfoRow label="Stock Level" value={`${item.quantity || item.stock} ${item.unit || 'units'}`} />
                <InfoRow label="Application" value={item.usedFor || "General Utility"} />
                <InfoRow label="Item Type" value={item.isStoreItem ? "Store Inventory" : "Shelter Supply"} />
              </div>
              
              <div className="mt-6">
                <p className="text-xs uppercase tracking-wide text-slate-500 mb-2">Detailed Description</p>
                <p className="text-slate-700 leading-relaxed text-sm bg-white p-4 rounded-2xl border border-slate-100">
                  {item.description || "No description provided for this item."}
                </p>
              </div>
            </div>

            {!item.isStoreItem && (
              <div className="rounded-3xl border border-slate-200 bg-white p-8">
                <h2 className="text-xl font-bold text-slate-950 mb-6 flex items-center gap-2">
                  <Clock3 className="h-5 w-5 text-slate-400" />
                  Restock History
                </h2>

                <div className="space-y-4">
                  {item.history && item.history.length > 0 ? (
                    item.history.map((entry, index) => (
                      <div
                        key={`${entry.date}-${index}`}
                        className="rounded-2xl border border-slate-100 bg-slate-50 p-5 transition hover:bg-slate-100"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <p className="font-bold text-slate-950 text-lg">
                            +{entry.quantity} {item.unit}
                          </p>
                          <p className="text-sm font-medium text-slate-500 flex items-center gap-1">
                            <CalendarDays className="h-3 w-3" />
                            {entry.date}
                          </p>
                        </div>
                        <div className="mt-3 flex items-center gap-4 text-sm">
                          <p className="text-slate-600 bg-white px-3 py-1 rounded-full border border-slate-200">
                            Source: <span className="font-bold">{entry.source}</span>
                          </p>
                        </div>
                        {entry.notes && (
                          <p className="mt-3 text-sm text-slate-600 bg-slate-200/50 p-3 rounded-xl italic">
                            "{entry.notes}"
                          </p>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="rounded-2xl border border-dashed border-slate-200 bg-white py-12 text-center">
                      <Clock3 className="mx-auto h-12 w-12 text-slate-300" />
                      <p className="mt-3 text-sm text-slate-500 font-medium">
                        No restock records found.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-8">
            <div className="rounded-3xl border border-slate-100 bg-white p-8 shadow-sm">
              <h3 className="text-xl font-bold text-slate-950 mb-6">Inventory Status</h3>

              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-slate-600">Availability</span>
                    <span className={`text-xs font-bold px-2 py-1 rounded-lg ${getStatusClass(item.status)}`}>
                      {item.status}
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${
                        item.status === 'Available' ? 'bg-emerald-500' : 
                        item.status === 'Low Stock' ? 'bg-amber-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${Math.min(((item.quantity || item.stock || 0) / 20) * 100, 100)}%` }}
                    />
                  </div>
                </div>

                <div className="grid gap-4">
                  <div className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50">
                    <Package className="h-5 w-5 text-slate-400" />
                    <div>
                      <p className="text-xs text-slate-500">Current Quantity</p>
                      <p className="text-sm font-bold text-slate-950">{item.quantity || item.stock} {item.unit}</p>
                    </div>
                  </div>
                  
                  {item.isStoreItem && (
                    <div className="flex items-center gap-3 p-4 rounded-2xl bg-blue-50">
                      <ShoppingBag className="h-5 w-5 text-blue-400" />
                      <div>
                        <p className="text-xs text-blue-500">Inventory Type</p>
                        <p className="text-sm font-bold text-blue-700">Marketplace Item</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-amber-100 bg-amber-50/50 p-8">
              <h3 className="text-xl font-bold text-amber-900 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Notice
              </h3>
              <p className="mt-4 text-sm leading-relaxed text-amber-800">
                {item.isStoreItem 
                  ? "This item is part of the public store. Changes here reflect in your market inventory."
                  : "These supplies are dedicated to internal shelter operations and local rescues."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-white p-4 border border-slate-100">
      <p className="text-xs uppercase tracking-wide text-slate-500 font-bold mb-1">{label}</p>
      <p className="font-bold text-slate-950">{value}</p>
    </div>
  );
}