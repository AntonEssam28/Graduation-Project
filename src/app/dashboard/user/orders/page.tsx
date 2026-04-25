"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShoppingBag,
  Package,
  Truck,
  CheckCircle2,
  Clock3,
  Search,
  CalendarDays,
  ChevronRight,
  CreditCard,
  MapPin,
  FileText,
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
  paymentMethod: string;
  orderType: string;
  status: "Pending" | "Processing" | "Shipped" | "Delivered" | "Cancelled";
  createdAt: string;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function UserOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchMyOrders = async () => {
      try {
        const res = await fetch(`${API_URL}/api/orders/myorders`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        const data = await res.json();
        setOrders(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to fetch my orders", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMyOrders();
  }, []);

  const filteredOrders = orders.filter(o => 
    o._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.items.some(i => i.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getStatusIcon = (status: Order["status"]) => {
    switch (status) {
      case "Pending": return <Clock3 className="h-5 w-5 text-amber-500" />;
      case "Processing": return <Package className="h-5 w-5 text-blue-500" />;
      case "Shipped": return <Truck className="h-5 w-5 text-indigo-500" />;
      case "Delivered": return <CheckCircle2 className="h-5 w-5 text-emerald-500" />;
      default: return <Clock3 className="h-5 w-5 text-slate-400" />;
    }
  };

  const getStatusColor = (status: Order["status"]) => {
    switch (status) {
      case "Pending": return "bg-amber-50 text-amber-700 border-amber-100";
      case "Processing": return "bg-blue-50 text-blue-700 border-blue-100";
      case "Shipped": return "bg-indigo-50 text-indigo-700 border-indigo-100";
      case "Delivered": return "bg-emerald-50 text-emerald-700 border-emerald-100";
      case "Cancelled": return "bg-red-50 text-red-700 border-red-100";
      default: return "bg-slate-50 text-slate-700 border-slate-100";
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-950">My Orders</h1>
        <p className="mt-2 text-slate-600">Track your store purchases and donation history.</p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search items or order ID..."
          className="w-full rounded-2xl border border-slate-200 bg-white py-3.5 pl-12 pr-4 text-sm outline-none transition focus:border-slate-950 shadow-sm"
        />
      </div>

      {/* List */}
      <div className="space-y-4">
        {loading ? (
          <div className="py-12 text-center text-slate-500">Loading your orders...</div>
        ) : filteredOrders.length > 0 ? (
          filteredOrders.map((order) => (
            <div key={order._id} className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md">
              <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-100 bg-slate-50/50 p-6 gap-4">
                <div className="flex flex-wrap items-center gap-4">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Order ID</p>
                    <p className="text-sm font-mono font-bold text-slate-900">#{order._id.slice(-8)}</p>
                  </div>
                  <div className="h-8 w-px bg-slate-200 hidden md:block" />
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Date</p>
                    <p className="text-sm font-semibold text-slate-900">{new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="h-8 w-px bg-slate-200 hidden md:block" />
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Total Amount</p>
                    <p className="text-sm font-bold text-slate-900">{order.totalAmount} EGP</p>
                  </div>
                </div>
                
                <div className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold uppercase tracking-wider ${getStatusColor(order.status)}`}>
                  {getStatusIcon(order.status)}
                  {order.status}
                </div>
              </div>

              <div className="p-6">
                <div className="flex flex-col lg:flex-row gap-8">
                  {/* Items */}
                  <div className="flex-1 space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Purchased Items</h4>
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-4 group">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 transition group-hover:bg-slate-900 group-hover:text-white">
                          <Package className="h-6 w-6" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-bold text-slate-900">{item.name}</p>
                          <p className="text-xs text-slate-500">Qty: {item.quantity} × {item.price} EGP</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Tracking / Info */}
                  <div className="lg:w-72 space-y-6">
                     <div className="rounded-2xl bg-slate-50 p-5 space-y-4 border border-slate-100">
                        <div className="flex items-start gap-3">
                           <MapPin className="h-4 w-4 text-slate-400 mt-1" />
                           <div>
                              <p className="text-xs font-bold text-slate-900">Delivery Address</p>
                              <p className="text-xs text-slate-500 leading-relaxed mt-1">{order.shippingDetails.address}, {order.shippingDetails.city}</p>
                           </div>
                        </div>
                        <div className="flex items-start gap-3">
                           <CreditCard className="h-4 w-4 text-slate-400 mt-1" />
                           <div>
                              <p className="text-xs font-bold text-slate-900">Payment Method</p>
                              <p className="text-xs text-slate-500 mt-1">{order.paymentMethod}</p>
                           </div>
                        </div>
                     </div>

                     <Link 
                        href={`/dashboard/user/orders/${order._id}/invoice`}
                        className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-3 text-xs font-bold text-slate-900 transition hover:bg-slate-50"
                     >
                        <FileText className="h-4 w-4" />
                        View Invoice
                     </Link>
                  </div>
                </div>

                {/* Progress Bar (Visual only) */}
                <div className="mt-10">
                   <div className="relative mb-2 flex justify-between px-2">
                       <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Order Placed</span>
                       <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Processing</span>
                       <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">On the Way</span>
                       <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Delivered</span>
                   </div>
                   <div className="h-2 w-full rounded-full bg-slate-100">
                      <div 
                        className={`h-full rounded-full bg-slate-900 transition-all duration-1000`}
                        style={{ 
                          width: order.status === "Pending" ? "10%" : 
                                 order.status === "Processing" ? "40%" : 
                                 order.status === "Shipped" ? "75%" : 
                                 order.status === "Delivered" ? "100%" : "0%"
                        }}
                      />
                   </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50/50 py-24 text-center">
            <ShoppingBag className="mx-auto h-12 w-12 text-slate-300" />
            <h3 className="mt-4 text-xl font-bold text-slate-950">No orders yet</h3>
            <p className="mt-2 text-slate-600">Items you purchase from the shop will appear here.</p>
            <a href="/store" className="mt-8 inline-flex items-center gap-2 rounded-xl bg-slate-950 px-6 py-3 text-sm font-bold text-white transition hover:bg-slate-800">
              Start Shopping
              <ChevronRight className="h-4 w-4" />
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
