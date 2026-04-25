"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Printer,
  Download,
  ArrowLeft,
  CalendarDays,
  MapPin,
  Mail,
  Phone,
  CheckCircle2,
  Package,
  PawPrint,
} from "lucide-react";
import Link from "next/link";

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
  status: string;
  paymentStatus: string;
  createdAt: string;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function InvoicePage() {
  const { id } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await fetch(`${API_URL}/api/orders/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        if (res.ok) {
           const data = await res.json();
           setOrder(data);
        }
      } catch (err) {
        console.error("Failed to fetch order", err);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchOrder();
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) return <div className="flex h-screen items-center justify-center">Loading Invoice...</div>;
  if (!order) return <div className="flex h-screen items-center justify-center">Order not found.</div>;

  const subtotal = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = order.orderType === "Donation" ? 0 : 50;
  const tax = Math.round(subtotal * 0.14);

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      {/* Action Bar (Hidden when printing) */}
      <div className="mx-auto mb-8 flex max-w-4xl items-center justify-between print:hidden">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Orders
        </button>
        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-2.5 text-sm font-bold text-white shadow-lg transition hover:bg-slate-800 active:scale-95"
          >
            <Printer className="h-4 w-4" />
            Print Invoice
          </button>
        </div>
      </div>

      {/* Invoice Card */}
      <div className="mx-auto max-w-4xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl print:border-0 print:shadow-none">
        {/* Header Section */}
        <div className="bg-slate-950 p-8 text-white sm:p-12">
          <div className="flex flex-col items-start justify-between gap-8 sm:flex-row sm:items-center">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-slate-950">
                <PawPrint className="h-10 w-10" />
              </div>
              <div>
                <h1 className="text-3xl font-black tracking-tight">Street2Home</h1>
                <p className="text-slate-400">Official Store Receipt</p>
              </div>
            </div>
            <div className="text-left sm:text-right">
              <h2 className="text-4xl font-extrabold uppercase tracking-tight text-white/20">Invoice</h2>
              <p className="mt-1 text-sm font-mono text-slate-400 uppercase tracking-widest">Order ID: #{order._id.slice(-8)}</p>
            </div>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid gap-12 p-8 sm:p-12 md:grid-cols-2">
          {/* Bill From */}
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Bill From</h3>
            <div className="space-y-3">
               <p className="text-xl font-bold text-slate-900">Street2Home Shelters Network</p>
               <div className="flex items-center gap-3 text-sm text-slate-600">
                  <Mail className="h-4 w-4 text-slate-400" />
                  info@street2home.org
               </div>
               <div className="flex items-center gap-3 text-sm text-slate-600">
                  <Phone className="h-4 w-4 text-slate-400" />
                  +20 100 000 0000
               </div>
            </div>
          </div>

          {/* Bill To */}
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Bill To</h3>
            <div className="space-y-3">
               <p className="text-xl font-bold text-slate-900">{order.shippingDetails.fullName}</p>
               <div className="flex items-start gap-3 text-sm text-slate-600">
                  <MapPin className="h-4 w-4 text-slate-400 mt-1" />
                  <span className="leading-relaxed">{order.shippingDetails.address}, {order.shippingDetails.city}</span>
               </div>
               <div className="flex items-center gap-3 text-sm text-slate-600">
                  <Phone className="h-4 w-4 text-slate-400" />
                  {order.shippingDetails.phone}
               </div>
            </div>
          </div>
        </div>

        {/* Dates & Status Bar */}
        <div className="mx-8 flex flex-col gap-4 rounded-2xl bg-slate-50 p-6 sm:mx-12 sm:flex-row sm:items-center sm:justify-between lg:px-10">
           <div className="flex items-center gap-6">
              <div>
                 <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Order Date</p>
                 <p className="mt-1 text-sm font-semibold text-slate-900">{new Date(order.createdAt).toLocaleDateString()}</p>
              </div>
              <div>
                 <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Payment Type</p>
                 <p className="mt-1 text-sm font-semibold text-slate-900">{order.paymentMethod}</p>
              </div>
           </div>
           <div className="flex items-center gap-4 border-t border-slate-200 pt-4 sm:border-0 sm:pt-0">
               <div>
                  <p className="text-right text-[10px] font-bold uppercase tracking-widest text-slate-400">Status</p>
                  <p className="mt-1 flex items-center justify-end gap-2 text-sm font-bold text-slate-900">
                     <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                     {order.status}
                  </p>
               </div>
           </div>
        </div>

        {/* Items Table */}
        <div className="p-8 sm:p-12">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="pb-4 text-xs font-black uppercase tracking-widest text-slate-400">Item Description</th>
                <th className="pb-4 text-center text-xs font-black uppercase tracking-widest text-slate-400">Price</th>
                <th className="pb-4 text-center text-xs font-black uppercase tracking-widest text-slate-400">QTY</th>
                <th className="pb-4 text-right text-xs font-black uppercase tracking-widest text-slate-400">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {order.items.map((item, index) => (
                <tr key={index}>
                  <td className="py-6">
                    <p className="font-bold text-slate-900">{item.name}</p>
                    <p className="mt-1 text-xs text-slate-500">Service: {order.orderType}</p>
                  </td>
                  <td className="py-6 text-center font-medium text-slate-600">{item.price} EGP</td>
                  <td className="py-6 text-center font-medium text-slate-600">{item.quantity}</td>
                  <td className="py-6 text-right font-bold text-slate-900">{item.price * item.quantity} EGP</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer Summary */}
        <div className="bg-slate-50/50 p-8 sm:p-12">
          <div className="ml-auto space-y-4 sm:w-80">
            <div className="flex justify-between text-sm font-medium text-slate-600">
              <span>Subtotal</span>
              <span>{subtotal} EGP</span>
            </div>
            <div className="flex justify-between text-sm font-medium text-slate-600">
              <span>Tax Fee (14%)</span>
              <span>{tax} EGP</span>
            </div>
            <div className="flex justify-between text-sm font-medium text-slate-600">
              <span>Delivery Fee</span>
              <span>{deliveryFee} EGP</span>
            </div>
            <div className="flex justify-between border-t border-slate-200 pt-4 text-xl font-black text-slate-900">
              <span>Grand Total</span>
              <span>{order.totalAmount} EGP</span>
            </div>
          </div>
        </div>

        {/* Invoice Footer */}
        <div className="border-t border-slate-100 p-8 text-center sm:p-12">
           <p className="text-sm font-medium text-slate-600">Thank you for supporting Street2Home shelters network!</p>
           <p className="mt-2 text-xs text-slate-400 italic">This is a system generated invoice and does not require a physical signature.</p>
        </div>
      </div>
    </div>
  );
}
