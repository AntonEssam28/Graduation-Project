"use client";

import { useMemo, useState, useEffect } from "react";
import {
  Search,
  Filter,
  ShoppingBag,
  CreditCard,
  Truck,
  CheckCircle2,
  Clock3,
  MapPin,
  CalendarDays,
  User,
  ExternalLink,
  ChevronRight,
  Package,
} from "lucide-react";

type OrderItem = {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  shelterId: string;
};

type Order = {
  _id: string;
  items: OrderItem[];
  totalAmount: number;
  shippingDetails: {
    fullName: string;
    email: string;
    phone: string;
    city: string;
    address: string;
    notes?: string;
  };
  paymentMethod: "Instapay" | "Cash on Delivery" | "Wallet";
  orderType: "Purchase" | "Donation";
  status: "Pending" | "Processing" | "Shipped" | "Delivered" | "Cancelled";
  paymentStatus: "Unpaid" | "Paid" | "Refunded";
  createdAt: string;
  paymentScreenshot?: string;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function ShelterAdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const fetchOrders = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const shelterName = user.assignedShelter;
      
      const res = await fetch(`${API_URL}/api/orders?shelterName=${encodeURIComponent(shelterName || "")}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch orders", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const progressStatus = (current: Order["status"]): Order["status"] | null => {
    switch (current) {
      case "Pending": return "Processing";
      case "Processing": return "Shipped";
      case "Shipped": return "Delivered";
      default: return null;
    }
  };

  const handleUpdateStatus = async (id: string, currentStatus: Order["status"]) => {
    const nextStatus = progressStatus(currentStatus);
    if (!nextStatus) return;

    try {
      const res = await fetch(`${API_URL}/api/orders/${id}/status`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}` 
        },
        body: JSON.stringify({ status: nextStatus }),
      });

      if (res.ok) {
        setOrders(prev => prev.map(o => o._id === id ? { ...o, status: nextStatus } : o));
      }
    } catch (err) {
      console.error("Failed to update status", err);
    }
  };

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesSearch =
        order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.shippingDetails.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.shippingDetails.phone.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "All" ? true : order.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [orders, searchTerm, statusFilter]);

  const stats = [
    { label: "Total Orders", value: orders.length, icon: ShoppingBag, color: "text-slate-600" },
    { label: "Pending", value: orders.filter(o => o.status === "Pending").length, icon: Clock3, color: "text-amber-600" },
    { label: "Processing", value: orders.filter(o => o.status === "Processing").length, icon: Package, color: "text-blue-600" },
    { label: "Delivered", value: orders.filter(o => o.status === "Delivered").length, icon: CheckCircle2, color: "text-emerald-600" },
  ];

  const getStatusClass = (status: Order["status"]) => {
    switch (status) {
      case "Pending": return "bg-amber-100 text-amber-700 border-amber-200";
      case "Processing": return "bg-blue-100 text-blue-700 border-blue-200";
      case "Shipped": return "bg-indigo-100 text-indigo-700 border-indigo-200";
      case "Delivered": return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "Cancelled": return "bg-red-100 text-red-700 border-red-200";
      default: return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-950">Store Orders</h1>
          <p className="mt-2 text-lg text-slate-600">
            Manage your shelter's product sales and donation orders.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchOrders}
            className="rounded-2xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 active:scale-95"
          >
            Refresh Data
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <div key={i} className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md">
            <div className={`absolute top-0 right-0 h-24 w-24 translate-x-8 -translate-y-8 rounded-full bg-slate-50 opacity-50 transition-transform group-hover:scale-110`} />
            <div className="relative flex items-center justify-between">
              <p className="text-sm font-medium text-slate-500">{stat.label}</p>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </div>
            <p className="relative mt-4 text-3xl font-bold text-slate-900">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by Order ID, Customer Name..."
            className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 py-3.5 pl-12 pr-4 text-sm outline-none transition focus:border-slate-900 focus:bg-white"
          />
        </div>
        <div className="flex items-center gap-3">
          <div className="relative min-w-[180px]">
             <Filter className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
             <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50/50 py-3.5 pl-11 pr-10 text-sm outline-none transition focus:border-slate-900 focus:bg-white"
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Processing">Processing</option>
              <option value="Shipped">Shipped</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-6">
        {loading ? (
             <div className="flex min-h-[400px] flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900" />
                <p className="mt-4 font-medium text-slate-500">Loading orders...</p>
             </div>
        ) : filteredOrders.length > 0 ? (
          filteredOrders.map((order) => (
            <div
              key={order._id}
              className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition-all hover:border-slate-300 hover:shadow-md"
            >
              <div className="flex flex-col lg:flex-row lg:items-stretch">
                {/* Product Preview / Summary */}
                <div className="border-b border-slate-100 bg-slate-50/50 p-6 lg:w-80 lg:border-b-0 lg:border-r">
                   <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Order ID</span>
                      <span className="font-mono text-xs text-slate-600">#{order._id.slice(-8)}</span>
                   </div>
                   <div className="mt-6 flex flex-col gap-4">
                      {order.items.map((item, idx) => (
                         <div key={idx} className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm">
                               <Package className="h-5 w-5 text-slate-400" />
                            </div>
                            <div className="min-w-0 flex-1">
                               <p className="truncate text-sm font-bold text-slate-900">{item.name}</p>
                               <p className="text-xs text-slate-500">Qty: {item.quantity} × {item.price} EGP</p>
                            </div>
                         </div>
                      ))}
                   </div>
                   <div className="mt-8 pt-6 border-t border-slate-200/50">
                      <p className="text-sm font-medium text-slate-500">Total Revenue</p>
                      <p className="mt-1 text-2xl font-black text-slate-900">{order.totalAmount} EGP</p>
                   </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 p-6">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className={`rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wider ${getStatusClass(order.status)}`}>
                        {order.status}
                      </span>
                      <span className={`flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700`}>
                        <CreditCard className="h-3 w-3" />
                        {order.paymentMethod}
                      </span>
                      {order.orderType === "Donation" && (
                         <span className="flex items-center gap-1.5 rounded-full border border-amber-100 bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">
                            <ShoppingBag className="h-3 w-3" />
                            Donation
                         </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-500 flex items-center gap-2">
                       <CalendarDays className="h-4 w-4" />
                       {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="mt-8 grid gap-8 md:grid-cols-2">
                    <div className="space-y-4">
                      <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400">Customer Details</h4>
                      <div className="space-y-3">
                         <div className="flex items-center gap-3 text-slate-700">
                            <User className="h-4 w-4 text-slate-400" />
                            <span className="text-sm font-semibold">{order.shippingDetails.fullName}</span>
                         </div>
                         <div className="flex items-center gap-3 text-slate-700">
                            <MapPin className="h-4 w-4 text-slate-400" />
                            <span className="text-sm">{order.shippingDetails.address}, {order.shippingDetails.city}</span>
                         </div>
                         {order.shippingDetails.notes && (
                            <div className="rounded-2xl bg-amber-50/50 p-4 border border-amber-100/50">
                               <p className="text-xs font-bold text-amber-800 uppercase tracking-tighter mb-1">Customer Note:</p>
                               <p className="text-xs text-amber-700 italic leading-relaxed">{order.shippingDetails.notes}</p>
                            </div>
                         )}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400">Verification</h4>
                      {order.paymentScreenshot ? (
                         <div className="group/img relative h-32 w-full overflow-hidden rounded-2xl border border-slate-200 transition-transform hover:scale-[1.02]">
                            <img src={order.paymentScreenshot} alt="Payment Proof" className="h-full w-full object-cover" />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover/img:opacity-100">
                               <a href={order.paymentScreenshot} target="_blank" rel="noopener noreferrer" className="rounded-xl bg-white px-4 py-2 text-xs font-bold text-slate-900 shadow-xl transition-transform hover:scale-110">
                                  View Full Screenshot
                               </a>
                            </div>
                         </div>
                      ) : (
                         <div className="flex h-32 w-full flex-col items-center justify-center rounded-2xl bg-slate-50 text-slate-400 border border-dashed border-slate-200">
                            <Clock3 className="h-6 w-6 opacity-40" />
                            <p className="mt-2 text-xs font-medium">No verification image</p>
                         </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-8 flex justify-end gap-3 pt-6 border-t border-slate-100">
                    {progressStatus(order.status) && (
                      <button 
                        onClick={() => handleUpdateStatus(order._id, order.status)}
                        className="flex items-center gap-2 rounded-xl bg-slate-950 px-6 py-3 text-sm font-bold text-white transition hover:bg-slate-800 hover:shadow-lg active:scale-95"
                      >
                        Mark as {progressStatus(order.status)}
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="flex min-h-[400px] flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50/30">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-slate-100">
               <ShoppingBag className="h-8 w-8 text-slate-300" />
            </div>
            <h3 className="mt-6 text-xl font-bold text-slate-900">No orders found</h3>
            <p className="mt-2 max-w-sm text-center text-slate-500">
              When customers purchase items from your store, they will appear here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
