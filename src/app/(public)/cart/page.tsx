"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ShoppingCart,
  Trash2,
  Minus,
  Plus,
  ArrowRight,
  ShieldCheck,
  Truck,
  CreditCard,
  HeartHandshake,
  ShoppingBag,
} from "lucide-react";
import { CART_STORAGE_KEY, getCart, type CartItem } from "@/lib/cart";

export default function CartPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    const syncCart = async () => {
      const savedCart = getCart();
      if (savedCart.length === 0) {
        setCart([]);
        return;
      }

      try {
        const res = await fetch("http://localhost:5000/api/store");
        if (res.ok) {
          const products = await res.json();
          const syncedCart = savedCart.map(item => {
            const realProduct = products.find((p: any) => p._id === item.id);
            if (realProduct) {
              return {
                ...item,
                name: realProduct.name,
                price: realProduct.price,
                shelterName: realProduct.shelter?.name || "Official Store",
                shelterPhone: realProduct.shelter?.phone || "",
                shelterId: realProduct.shelter?._id || item.shelterId,
                image: realProduct.photo || item.image
              };
            }
            return item;
          });
          
          setCart(syncedCart);
          localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(syncedCart));
        } else {
          setCart(savedCart);
        }
      } catch (error) {
        console.error("Sync error:", error);
        setCart(savedCart);
      }
    };

    syncCart();

    const handleUpdate = () => {
      setCart(getCart());
    };

    window.addEventListener("cart-updated", handleUpdate);
    return () => window.removeEventListener("cart-updated", handleUpdate);
  }, []);

  const subtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [cart]);

  const deliveryFee = cart.length > 0 ? 50 : 0;
  const tax = Math.round(subtotal * 0.14);
  const total = subtotal + deliveryFee + tax;

  const updateQuantity = (id: string, action: "increase" | "decrease") => {
    const updated = cart
      .map((item) => {
        if (item.id !== id) return item;
        if (action === "increase") {
          return { ...item, quantity: item.quantity + 1 };
        }
        return { ...item, quantity: Math.max(0, item.quantity - 1) };
      })
      .filter((item) => item.quantity > 0);

    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(updated));
    setCart(updated);
    window.dispatchEvent(new Event("cart-updated"));
  };

  const removeItem = (id: string) => {
    const ok = window.confirm("Remove this item from cart?");
    if (!ok) return;

    const updated = cart.filter((item) => item.id !== id);
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(updated));
    setCart(updated);
    window.dispatchEvent(new Event("cart-updated"));
  };

  const clearCart = () => {
    const ok = window.confirm("Clear all cart items?");
    if (!ok) return;

    localStorage.removeItem(CART_STORAGE_KEY);
    setCart([]);
    window.dispatchEvent(new Event("cart-updated"));
  };

  if (!mounted) return null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="space-y-6">
        {/* Header */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                <ShoppingCart className="h-3.5 w-3.5" />
                Your Cart
              </div>

              <h1 className="mt-4 text-3xl font-bold text-slate-950">
                Shopping Cart
              </h1>
              <p className="mt-2 text-sm text-slate-600">
                Review your items before checkout.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={clearCart}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
              >
                <Trash2 className="h-4 w-4" />
                Clear Cart
              </button>

              <Link
                href="/checkout"
                className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Go to Checkout
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>

        {cart.length > 0 ? (
          <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
            {/* Items */}
            <div className="space-y-4">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-start gap-4">
                      <div className="relative h-24 w-24 overflow-hidden rounded-2xl bg-slate-100 flex items-center justify-center">
                        {item.image ? (
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <ShoppingBag className="h-8 w-8 text-slate-400" />
                        )}
                      </div>

                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-xl font-bold text-slate-950">
                            {item.name}
                          </h3>
                          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                            {item.type}
                          </span>
                        </div>

                        <p className="mt-2 text-sm text-slate-600">
                          From: <span className="font-semibold">{item.shelterName || "Official Store"}</span>
                        </p>

                        <p className="mt-2 text-sm text-slate-600">
                          Price:{" "}
                          <span className="font-semibold text-slate-950">
                            {item.price} EGP
                          </span>
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col items-start gap-4 md:items-end">
                      <div className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-2">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, "decrease")}
                          className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-slate-700 transition hover:bg-slate-100"
                        >
                          <Minus className="h-4 w-4" />
                        </button>

                        <span className="min-w-10 text-center text-sm font-semibold text-slate-950">
                          {item.quantity}
                        </span>

                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, "increase")}
                          className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-slate-700 transition hover:bg-slate-100"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>

                      <p className="text-lg font-bold text-slate-950">
                        {item.price * item.quantity} EGP
                      </p>

                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="inline-flex items-center gap-2 rounded-xl border border-red-300 bg-white px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="h-fit rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:sticky lg:top-6">
              <h2 className="text-xl font-bold text-slate-950">Order Summary</h2>

              <div className="mt-6 space-y-4 text-sm">
                <SummaryRow label="Subtotal" value={`${subtotal} EGP`} />
                <SummaryRow label="Delivery Fee" value={`${deliveryFee} EGP`} />
                <SummaryRow label="Tax Fee" value={`${tax} EGP`} />
                <div className="border-t border-slate-200 pt-4">
                  <SummaryRow
                    label="Total"
                    value={`${total} EGP`}
                    strong
                  />
                </div>
              </div>

              <div className="mt-6 space-y-3 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
                <InfoItem icon={ShieldCheck} text="Secure checkout" />
                <InfoItem icon={Truck} text="Fast delivery to shelter" />
                <InfoItem icon={CreditCard} text="Multiple payment methods" />
                <InfoItem icon={HeartHandshake} text="Supports animals in need" />
              </div>

              <Link
                href="/checkout"
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Proceed to Checkout
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                href="/store"
                className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 py-24 text-center">
            <ShoppingCart className="mx-auto h-16 w-16 text-slate-400" />
            <h3 className="mt-4 text-xl font-semibold text-slate-950">
              Your cart is empty
            </h3>
            <p className="mt-2 text-sm text-slate-600">
              Add items to your cart to continue.
            </p>

            <Link
              href="/store"
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Start Shopping
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

function SummaryRow({
  label,
  value,
  strong = false,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-slate-600">{label}</span>
      <span
        className={strong ? "text-lg font-bold text-slate-950" : "font-semibold text-slate-950"}
      >
        {value}
      </span>
    </div>
  );
}

function InfoItem({
  icon: Icon,
  text,
}: {
  icon: React.ComponentType<{ className?: string }>;
  text: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="h-4 w-4 text-slate-500" />
      <span>{text}</span>
    </div>
  );
}