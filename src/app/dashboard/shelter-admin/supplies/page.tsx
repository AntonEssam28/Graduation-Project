"use client";

import Link from "next/link";
import { useMemo, useState, useEffect, type ComponentType } from "react";
import {
  Package,
  Search,
  Filter,
  AlertTriangle,
  CheckCircle2,
  Clock3,
  ShoppingBag,
  HandCoins,
  ArrowRight,
  Boxes,
  Pill,
  UtensilsCrossed,
  BedDouble,
  Tag,
  HeartHandshake,
  FileText,
} from "lucide-react";

import RestockModal, {
  type SupplyItem,
  type SupplyStatus,
  type SupplyCategory,
  type SupplyHistoryEntry,
} from "./components/RestockModal";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const categoryFilters = [
  "All",
  "Food",
  "Medicine",
  "Bedding",
  "Accessories",
  "Care",
  "Toys",
] as const;

const statusFilters = [
  "All",
  "Available",
  "Low Stock",
  "Out of Stock",
  "Requested",
] as const;

export default function ShelterAdminSuppliesPage() {
  const [supplies, setSupplies] = useState<SupplyItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] =
    useState<(typeof categoryFilters)[number]>("All");
  const [selectedStatus, setSelectedStatus] =
    useState<(typeof statusFilters)[number]>("All");

  const [restockOpen, setRestockOpen] = useState(false);
  const [restockTarget, setRestockTarget] = useState<SupplyItem | null>(null);
  const [restockQuantity, setRestockQuantity] = useState("10");
  const [restockSource, setRestockSource] = useState("Purchase");
  const [restockNotes, setRestockNotes] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");
    const user = userStr ? JSON.parse(userStr) : {};

    const fetchAll = async () => {
      try {
        const [suppliesRes, storeRes] = await Promise.all([
          fetch(`${API_URL}/api/supplies`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_URL}/api/store`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        const rawSupplies = await suppliesRes.json();
        const rawStore = await storeRes.json();

        const suppliesData = Array.isArray(rawSupplies) ? rawSupplies : (rawSupplies.data || []);
        const storeData = Array.isArray(rawStore) ? rawStore : (rawStore.data || []);

        // Filter by shelter
        const filteredSupplies = suppliesData.filter((item: any) => 
          !user.assignedShelter || item.shelter === user.assignedShelter
        );
        const filteredStore = storeData.filter((item: any) => 
          !user.assignedShelter || item.shelter === user.assignedShelter
        );

        // Map store items to supply format
        const mappedStore = filteredStore.map((item: any) => ({
          ...item,
          quantity: item.stock,
          unit: "units",
          isStoreItem: true,
          status: getSupplyStatus(item.stock),
        }));

        setSupplies([...filteredSupplies, ...mappedStore]);
      } catch (err) {
        console.error("Failed to fetch inventory", err);
      }
    };

    fetchAll();
  }, []);

  const filteredSupplies = useMemo(() => {
    return supplies.filter((item) => {
      const name = item.name || "";
      const category = item.category || "";
      const shelter = item.shelter || "";
      const description = item.description || "";
      
      const search = searchTerm.toLowerCase();
      const matchesSearch =
        name.toLowerCase().includes(search) ||
        category.toLowerCase().includes(search) ||
        shelter.toLowerCase().includes(search) ||
        description.toLowerCase().includes(search);

      const matchesCategory =
        selectedCategory === "All" ? true : item.category === selectedCategory;

      const matchesStatus =
        selectedStatus === "All" ? true : item.status === selectedStatus;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [supplies, searchTerm, selectedCategory, selectedStatus]);

  const stats = [
    { label: "Total Supplies", value: supplies.length, icon: Package },
    {
      label: "Available",
      value: supplies.filter((s) => s.status === "Available").length,
      icon: CheckCircle2,
    },
    {
      label: "Low Stock",
      value: supplies.filter((s) => s.status === "Low Stock").length,
      icon: Clock3,
    },
    {
      label: "Out of Stock",
      value: supplies.filter((s) => s.status === "Out of Stock").length,
      icon: AlertTriangle,
    },
  ];

  const getStatusClass = (status: SupplyStatus) => {
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

  const getCategoryIcon = (category: SupplyCategory) => {
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

  const today = () => new Date().toISOString().slice(0, 10);

  const openRestockModal = (item: SupplyItem) => {
    setRestockTarget(item);
    setRestockQuantity("10");
    setRestockSource("Purchase");
    setRestockNotes("");
    setRestockOpen(true);
  };

  const closeRestockModal = () => {
    setRestockOpen(false);
    setRestockTarget(null);
  };

  const getSupplyStatus = (stock: number): SupplyStatus => {
    if (stock <= 0) return "Out of Stock";
    if (stock <= 5) return "Low Stock";
    return "Available";
  };

  const confirmRestock = async () => {
    if (!restockTarget) return;

    const qty = Number(restockQuantity);
    if (isNaN(qty) || qty < 1) return;

    const newDate = today();
    const newStock = (restockTarget.quantity || 0) + qty;
    const newHistoryEntry: SupplyHistoryEntry = {
      date: newDate,
      quantity: qty,
      source: restockSource,
      notes: restockNotes.trim() || "No notes provided",
    };
    
    const updatedHistory = [newHistoryEntry, ...(restockTarget.history ?? [])];

    try {
      const isStore = (restockTarget as any).isStoreItem;
      const url = isStore 
        ? `${API_URL}/api/store/${restockTarget._id}`
        : `${API_URL}/api/supplies/${restockTarget._id}`;
      
      const updatePayload = isStore
        ? { stock: newStock }
        : { 
            quantity: newStock, 
            status: getSupplyStatus(newStock),
            history: updatedHistory,
          };

      const res = await fetch(url, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json", 
          Authorization: `Bearer ${localStorage.getItem("token")}` 
        },
        body: JSON.stringify(updatePayload),
      });

      if (res.ok) {
        setSupplies((prev) =>
          prev.map((item) => {
            if (item._id !== restockTarget._id) return item;
            return {
              ...item,
              quantity: newStock,
              status: getSupplyStatus(newStock),
              history: isStore ? [] : updatedHistory,
            };
          })
        );
      }
    } catch (error) {
      console.error("Failed to restock", error);
    }

    closeRestockModal();
  };

  const markRequested = async (id: string) => {
    try {
      const res = await fetch(`${API_URL}/api/supplies/${id}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json", 
          Authorization: `Bearer ${localStorage.getItem("token")}` 
        },
        body: JSON.stringify({ status: "Requested" }),
      });
      if (res.ok) {
        setSupplies((prev) =>
          prev.map((item) =>
            item._id === id
              ? { ...item, status: "Requested" }
              : item
          )
        );
      }
    } catch (error) {
      console.error("Failed to mark requested", error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-950">Supplies</h1>
          <p className="mt-2 text-sm text-slate-600">
            Manage shelter supplies, stock levels, and requests.
          </p>
        </div>

        <Link
          href="/donate"
          className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          <HandCoins className="h-4 w-4" />
          Donation Page
        </Link>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.label}
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-600">{item.label}</p>
                <Icon className="h-5 w-5 text-slate-500" />
              </div>
              <p className="mt-3 text-3xl font-bold text-slate-950">{item.value}</p>
            </div>
          );
        })}
      </div>

      {/* Search / Filters */}
      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="relative lg:col-span-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search supplies..."
              className="w-full rounded-2xl border border-slate-300 bg-white py-3 pl-12 pr-4 outline-none transition focus:border-slate-950"
            />
          </div>

          <div className="relative">
            <Filter className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <select
              value={selectedCategory}
              onChange={(e) =>
                setSelectedCategory(e.target.value as (typeof categoryFilters)[number])
              }
              className="w-full rounded-2xl border border-slate-300 bg-white py-3 pl-12 pr-4 outline-none transition focus:border-slate-950"
            >
              {categoryFilters.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="relative">
            <Filter className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <select
              value={selectedStatus}
              onChange={(e) =>
                setSelectedStatus(e.target.value as (typeof statusFilters)[number])
              }
              className="w-full rounded-2xl border border-slate-300 bg-white py-3 pl-12 pr-4 outline-none transition focus:border-slate-950"
            >
              {statusFilters.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* List */}
      <div className="space-y-4">
        {filteredSupplies.length > 0 ? (
          filteredSupplies.map((item) => {
            const Icon = getCategoryIcon(item.category);

            return (
              <div
                key={item._id}
                className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md"
              >
                <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                  <div className="flex items-start gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-950 text-white">
                      <Icon className="h-7 w-7" />
                    </div>

                    <div className="max-w-3xl">
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="text-2xl font-bold text-slate-950">{item.name}</h3>

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(
                            item.status
                          )}`}
                        >
                          {item.status}
                        </span>

                        {(item as any).isStoreItem && (
                          <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                            Store Product
                          </span>
                        )}

                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                          {item.category}
                        </span>
                      </div>

                      <p className="mt-2 text-sm text-slate-600">
                        Shelter: <span className="font-semibold">{item.shelter}</span>
                      </p>

                      <p className="mt-3 text-sm leading-6 text-slate-600">
                        {item.description}
                      </p>

                      <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-600">
                        <InfoItem icon={Package} text={`${item.quantity} ${item.unit} in stock`} />
                        <InfoItem icon={Clock3} text={`Last update: ${new Date(item.createdAt).toLocaleDateString()}`} />
                        {item.usedFor && <InfoItem icon={HeartHandshake} text={item.usedFor} />}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 lg:min-w-56">
                    <Link
                      href={`/dashboard/shelter-admin/supplies/${item._id}`}
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
                    >
                      <FileText className="h-4 w-4" />
                      View Details
                    </Link>
 
                    <button
                      onClick={() => openRestockModal(item)}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                    >
                      <ArrowRight className="h-4 w-4" />
                      Restock
                    </button>

                    <button
                      onClick={() => markRequested(item._id)}
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700 transition hover:bg-blue-100"
                    >
                      Mark Requested
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 py-16 text-center">
            <Package className="mx-auto h-12 w-12 text-slate-400" />
            <h3 className="mt-4 text-xl font-semibold text-slate-950">
              No supplies found
            </h3>
            <p className="mt-2 text-sm text-slate-600">
              Try another search term or change the filters.
            </p>
          </div>
        )}
      </div>

      {/* Bottom info */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
          <h3 className="text-xl font-bold text-slate-950">Stock Guide</h3>
          <div className="mt-5 space-y-4 text-sm text-slate-700">
            <InfoItem icon={CheckCircle2} text="Available = enough stock in storage" />
            <InfoItem icon={Clock3} text="Low Stock = needs restocking soon" />
            <InfoItem icon={AlertTriangle} text="Out of Stock = item unavailable" />
            <InfoItem icon={HeartHandshake} text="Requested = shelter needs this item" />
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-xl font-bold text-slate-950">What you can do</h3>
          <div className="mt-5 space-y-4 text-sm text-slate-700">
            <InfoItem icon={Search} text="Search supplies by name or shelter" />
            <InfoItem icon={Filter} text="Filter by category and status" />
            <InfoItem icon={Package} text="Track stock and last update date" />
            <InfoItem icon={HandCoins} text="Connect supply needs to donations" />
          </div>
        </div>

        <div className="rounded-3xl border border-amber-200 bg-amber-50 p-6 shadow-sm">
          <h3 className="text-xl font-bold text-amber-900">Next step</h3>
          <p className="mt-3 text-sm leading-6 text-amber-800">
            Later we can connect this page to real store orders and donation requests.
          </p>
          <Link
            href="/dashboard/shelter-admin/dogs"
            className="mt-5 inline-flex items-center justify-center rounded-xl bg-amber-500 px-4 py-3 font-semibold text-white transition hover:bg-amber-600"
          >
            Go to Dogs
          </Link>
        </div>
      </div>

      <RestockModal
        open={restockOpen}
        item={restockTarget}
        quantity={restockQuantity}
        source={restockSource}
        notes={restockNotes}
        onClose={closeRestockModal}
        onQuantityChange={setRestockQuantity}
        onSourceChange={setRestockSource}
        onNotesChange={setRestockNotes}
        onConfirm={confirmRestock}
      />
    </div>
  );
}

function InfoItem({
  icon: Icon,
  text,
}: {
  icon: ComponentType<{ className?: string }>;
  text: string;
}) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1">
      <Icon className="h-4 w-4 text-slate-500" />
      <span>{text}</span>
    </div>
  );
}