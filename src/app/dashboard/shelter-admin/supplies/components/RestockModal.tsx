"use client";

import { X, Package, CalendarDays, Tag } from "lucide-react";

export type SupplyStatus = "Available" | "Low Stock" | "Out of Stock" | "Requested";
export type SupplyCategory =
  | "Food"
  | "Medicine"
  | "Bedding"
  | "Accessories"
  | "Care"
  | "Toys";

export type SupplyHistoryEntry = {
  date: string;
  quantity: number;
  source: string;
  notes: string;
};

export type SupplyItem = {
  _id: string;
  name: string;
  category: SupplyCategory;
  quantity: number;
  unit: string;
  status: SupplyStatus;
  shelter: string;
  requestedBy: string;
  createdAt: string;
  description?: string;
  usedFor?: string;
  history?: SupplyHistoryEntry[];
};

type RestockModalProps = {
  open: boolean;
  item: SupplyItem | null;
  quantity: string;
  source: string;
  notes: string;
  onClose: () => void;
  onQuantityChange: (value: string) => void;
  onSourceChange: (value: string) => void;
  onNotesChange: (value: string) => void;
  onConfirm: () => void;
};

export default function RestockModal({
  open,
  item,
  quantity,
  source,
  notes,
  onClose,
  onQuantityChange,
  onSourceChange,
  onNotesChange,
  onConfirm,
}: RestockModalProps) {
  if (!open || !item) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-slate-700" />
              <h2 className="text-2xl font-bold text-slate-950">Restock Item</h2>
            </div>
            <p className="mt-2 text-sm text-slate-600">
              Add stock for <span className="font-semibold">{item.name}</span>
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">Current Item</p>
            <p className="mt-2 text-lg font-semibold text-slate-950">{item.name}</p>
            <p className="mt-1 text-sm text-slate-600">
              Stock: {item.quantity} {item.unit}
            </p>
            <p className="mt-1 text-sm text-slate-600">Status: {item.status}</p>
          </div>

          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">Shelter</p>
            <p className="mt-2 text-lg font-semibold text-slate-950">{item.shelter}</p>
            <div className="mt-2 flex items-center gap-2 text-sm text-slate-600">
              <CalendarDays className="h-4 w-4" />
              Last update: {new Date(item.createdAt).toLocaleDateString()}
            </div>
            <div className="mt-2 flex items-center gap-2 text-sm text-slate-600">
              <Tag className="h-4 w-4" />
              Category: {item.category}
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Quantity to add
            </label>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => onQuantityChange(e.target.value)}
              placeholder="Enter quantity"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-950"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Source
            </label>
            <select
              value={source}
              onChange={(e) => onSourceChange(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-slate-950"
            >
              <option value="Purchase">Purchase</option>
              <option value="Donation">Donation</option>
              <option value="Store">Store</option>
              <option value="Supplier">Supplier</option>
            </select>
          </div>
        </div>

        <div className="mt-4">
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Notes
          </label>
          <textarea
            value={notes}
            onChange={(e) => onNotesChange(e.target.value)}
            rows={4}
            placeholder="Add restock notes..."
            className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-950"
          />
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            onClick={onClose}
            className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Confirm Restock
          </button>
        </div>
      </div>
    </div>
  );
}