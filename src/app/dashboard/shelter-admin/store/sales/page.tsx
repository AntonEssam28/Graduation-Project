"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  TrendingUp,
  CreditCard,
  Banknote,
  Search,
  Filter,
} from "lucide-react";

type SaleItem = {
  _id: string;
  orderId: string;
  item: string;
  buyer: string;
  amount: number;
  qty: number;
  status: "Completed" | "Pending" | "Refunded";
  createdAt: string;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function StoreSalesPage() {
  const [sales, setSales] = useState<SaleItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetch(`${API_URL}/api/sales`, { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }})
      .then(res => res.json())
      .then(data => {
                const user = JSON.parse(localStorage.getItem("user") || "{}");
                const filtered = Array.isArray(data) ? data.filter(item => !user.assignedShelter || item.shelter === user.assignedShelter) : (data.data || []);
                setSales(filtered);
              })
      .catch(err => console.error("Failed to fetch sales", err));
  }, []);

  const totalRevenue = sales
    .filter(s => s.status === "Completed")
    .reduce((sum, s) => sum + s.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard/shelter-admin/store"
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm transition hover:bg-slate-50"
        >
          <ArrowLeft className="h-5 w-5 text-slate-700" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-slate-950">Store Sales</h1>
          <p className="mt-1 text-sm text-slate-600">Track merchandise revenue and recent transactions.</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-600">Total Revenue</p>
            <div className="rounded-full bg-emerald-100 p-2">
              <Banknote className="h-4 w-4 text-emerald-600" />
            </div>
          </div>
          <p className="mt-4 text-3xl font-bold text-slate-950">EGP {totalRevenue.toLocaleString()}</p>
          <div className="mt-2 flex items-center gap-1 text-sm text-emerald-600">
            <TrendingUp className="h-4 w-4" />
            <span className="font-medium">+15.2% from last month</span>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-600">Total Units Sold</p>
            <div className="rounded-full bg-blue-100 p-2">
              <CreditCard className="h-4 w-4 text-blue-600" />
            </div>
          </div>
          <p className="mt-4 text-3xl font-bold text-slate-950">
            {sales.filter(s => s.status === "Completed").reduce((sum, s) => sum + s.qty, 0)}
          </p>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-slate-200 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-xl font-bold text-slate-950">Recent Transactions</h2>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:max-w-xs">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search orders..."
                className="w-full rounded-xl border border-slate-300 py-2 pl-9 pr-4 text-sm outline-none transition focus:border-slate-950"
              />
            </div>
            <button className="flex items-center justify-center rounded-xl border border-slate-300 p-2 text-slate-600 hover:bg-slate-50">
              <Filter className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-6 py-4 font-medium">Order ID</th>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">Item & Qty</th>
                <th className="px-6 py-4 font-medium">Buyer</th>
                <th className="px-6 py-4 font-medium">Amount</th>
                <th className="px-6 py-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {sales
                .filter(sale => 
                  sale.orderId.toLowerCase().includes(searchTerm.toLowerCase()) || 
                  sale.buyer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  sale.item.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map((sale) => (
                <tr key={sale._id} className="transition hover:bg-slate-50">
                  <td className="px-6 py-4 font-mono text-slate-950 font-medium">{sale.orderId}</td>
                  <td className="px-6 py-4">{new Date(sale.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4">
                    <span className="font-semibold text-slate-900">{sale.item}</span>
                    <span className="ml-2 text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">x{sale.qty}</span>
                  </td>
                  <td className="px-6 py-4">{sale.buyer}</td>
                  <td className="px-6 py-4 font-bold text-slate-950">EGP {sale.amount}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                        sale.status === "Completed"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {sale.status}
                    </span>
                  </td>
                </tr>
              ))}
              {sales.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    No sales recorded yet.
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
