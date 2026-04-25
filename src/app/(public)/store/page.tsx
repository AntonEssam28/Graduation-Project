"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ShoppingBag,
  Search,
  Filter,
  HeartHandshake,
  Package,
  ArrowRight,
  PawPrint,
  Star,
  BadgeDollarSign,
  Plus,
  ShoppingCart,
  Heart,
} from "lucide-react";
import { addToCart } from "@/lib/cart";

type Product = {
  _id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  photo: string;
  description: string;
  status: string;
  shelter: {
    _id: string;
    name: string;
  };
  featured?: boolean;
};

const categories = ["All", "Food", "Medicine", "Bedding", "Accessories", "Care", "Toys"];

export default function StorePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/store");
        const data = await res.json();
        const mapped = data.map((p: any) => ({
          ...p,
          shelterName: p.shelter?.name || "Official Store"
        }));
        setProducts(mapped);
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory =
        selectedCategory === "All" ? true : product.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, selectedCategory, products]);

  const featuredCount = products.filter((p) => p.status === "Active").length;
  const totalStock = products.reduce((sum, p) => sum + p.stock, 0);

  const handleAddToCart = (product: Product) => {
    addToCart(product, 1);
    alert(`${product.name} added to cart!`);
  };

  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="bg-slate-950 text-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-20">
          <div className="flex flex-col justify-center">
            <div className="mb-4 inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200">
              <PawPrint className="h-4 w-4 text-amber-400" />
              Supplies store for shelters and dogs
            </div>

            <h1 className="text-4xl font-bold leading-tight sm:text-5xl">
              Donate or request supplies for dogs in need
            </h1>

            <p className="mt-5 max-w-xl text-base leading-7 text-slate-300">
              Browse shelter supplies, view product details, and request items
              that help rescue dogs stay healthy and safe.
            </p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/donate"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 font-semibold text-slate-950 transition hover:bg-slate-100"
              >
                Donate Now
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                href="/report"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-6 py-3 font-semibold text-white transition hover:bg-white/10"
              >
                Report a Dog
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap gap-6 text-sm text-slate-300">
              <div className="flex items-center gap-2">
                <HeartHandshake className="h-4 w-4 text-emerald-400" />
                Shelter support
              </div>
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-amber-400" />
                Product requests
              </div>
              <div className="flex items-center gap-2">
                <BadgeDollarSign className="h-4 w-4 text-cyan-400" />
                Affordable supplies
              </div>
            </div>
          </div>

          {/* Hero card */}
          <div className="flex items-center justify-center">
            <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-white/10 p-6 shadow-2xl backdrop-blur-xl">
              <div className="rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 p-6 text-slate-950">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium">Store stats</p>
                    <h3 className="mt-1 text-2xl font-bold">Ready to help</h3>
                  </div>
                  <div className="rounded-full bg-white/30 p-3">
                    <ShoppingBag className="h-7 w-7" />
                  </div>
                </div>

                <div className="mt-6 space-y-4">
                  <div className="rounded-2xl bg-white/25 p-4">
                    <p className="text-sm font-medium">Available products</p>
                    <p className="mt-1 text-sm">{products.length} items available</p>
                  </div>

                  <div className="rounded-2xl bg-white/25 p-4">
                    <p className="text-sm font-medium">Available stock</p>
                    <p className="mt-1 text-sm">{totalStock} total items in stock</p>
                  </div>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-3 gap-3">
                <div className="rounded-2xl bg-slate-900 p-4 text-center">
                  <p className="text-2xl font-bold">{products.length}</p>
                  <p className="text-xs text-slate-400">Products</p>
                </div>
                <div className="rounded-2xl bg-slate-900 p-4 text-center">
                  <p className="text-2xl font-bold">{featuredCount}</p>
                  <p className="text-xs text-slate-400">Active</p>
                </div>
                <div className="rounded-2xl bg-slate-900 p-4 text-center">
                  <p className="text-2xl font-bold">{totalStock}</p>
                  <p className="text-xs text-slate-400">Stock</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Search & filter */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search products..."
                className="w-full rounded-2xl border border-slate-300 bg-white py-3 pl-12 pr-4 outline-none transition focus:border-slate-950"
              />
            </div>

            <div className="relative">
              <Filter className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full rounded-2xl border border-slate-300 bg-white py-3 pl-12 pr-4 outline-none transition focus:border-slate-950"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Products */}
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-slate-500">
              Store Products
            </p>
            <h2 className="mt-2 text-3xl font-bold text-slate-950">
              Supplies available for dogs
            </h2>
          </div>
          <p className="text-sm text-slate-500">
            Showing {filteredProducts.length} item{filteredProducts.length !== 1 ? "s" : ""}
          </p>
        </div>

        {loading ? (
          <div className="py-20 text-center">
             <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-slate-950"></div>
             <p className="mt-4 text-slate-600">Loading products...</p>
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filteredProducts.map((product) => (
              <div
                key={product._id}
                className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="relative flex h-48 items-center justify-center bg-gradient-to-br from-slate-200 to-slate-100">
                  {product.photo ? (
                    <img src={product.photo} alt={product.name} className="h-full w-full object-cover" />
                  ) : (
                    <ShoppingBag className="h-16 w-16 text-slate-400" />
                  )}
                  <div className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-900 shadow-sm backdrop-blur">
                    {product.shelter?.name || "Official Store"}
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-2xl font-bold text-slate-950">
                        {product.name}
                      </h3>
                      <p className="mt-1 text-sm text-slate-600">{product.category}</p>
                    </div>

                    {product.status === "Active" && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                      In Stock
                    </span>
                  )}
                  </div>

                  <p className="mt-4 line-clamp-2 text-sm leading-6 text-slate-600">
                    {product.description}
                  </p>

                  <div className="mt-5 flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-500">Price</p>
                      <p className="text-2xl font-bold text-slate-950">
                        EGP {product.price}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-slate-500">Stock</p>
                      <p className="text-lg font-semibold text-slate-950">
                        {product.stock} left
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 grid grid-cols-2 gap-3">
                    <button
                      onClick={() => handleAddToCart(product)}
                      disabled={product.stock === 0}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-200 disabled:opacity-50"
                    >
                      <ShoppingCart className="h-4 w-4" />
                      Add to Cart
                    </button>

                    <button
                      onClick={() => {
                        handleAddToCart(product);
                        window.location.href = "/checkout";
                      }}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                    >
                      <Heart className="h-4 w-4 text-rose-400" />
                      Donate
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 py-16 text-center">
            <ShoppingBag className="mx-auto h-12 w-12 text-slate-400" />
            <h3 className="mt-4 text-xl font-semibold text-slate-950">
              No products found
            </h3>
            <p className="mt-2 text-sm text-slate-600">
              Try another search term or change the category filter.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}