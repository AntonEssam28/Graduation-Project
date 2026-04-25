"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Mail,
  MapPin,
  Phone,
  ShoppingCart,
  Truck,
  User,
  Heart,
  ShoppingBag,
  Upload,
  Camera,
  FileCheck,
} from "lucide-react";
import { CART_STORAGE_KEY, getCart, type CartItem } from "@/lib/cart";

type PaymentMethod = "Instapay" | "Cash on Delivery" | "Wallet";

export default function CheckoutPage() {
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    city: "",
    address: "",
    notes: "",
    deliveryMethod: "Standard Delivery",
    paymentMethod: "Instapay" as PaymentMethod,
    isDonation: true,
    screenshot: null as File | null,
    screenshotPreview: "",
  });

  const [readOnlyFields, setReadOnlyFields] = useState({
    fullName: false,
    email: false,
    phone: false,
    city: false,
  });

  useEffect(() => {
    setMounted(true);
    setCart(getCart());

    const userJson = localStorage.getItem("user");
    if (userJson) {
      try {
        const user = JSON.parse(userJson);
        setForm(prev => ({
          ...prev,
          fullName: user.name || user.fullName || "",
          email: user.email || "",
          phone: user.phone || "",
          city: user.city || "",
        }));
        
        setReadOnlyFields({
          fullName: !!(user.name || user.fullName),
          email: !!user.email,
          phone: !!user.phone,
          city: !!user.city,
        });
      } catch (err) {}
    }
  }, []);

  const uniqueShelters = useMemo(() => {
    const map = new Map();
    cart.forEach(item => {
      if (item.shelterId && !map.has(item.shelterId)) {
        map.set(item.shelterId, {
          name: item.shelterName || "Official Store",
          phone: item.shelterPhone || "01222222228"
        });
      }
    });
    // If no shelters in cart, show default
    if (map.size === 0) return [{ name: "Official Store", phone: "01000000000" }];
    return Array.from(map.values());
  }, [cart]);

  const subtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [cart]);

  const deliveryFee = form.isDonation ? 0 : (cart.length > 0 ? 50 : 0);

  const tax = Math.round(subtotal * 0.14);
  const total = subtotal + deliveryFee + tax;

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setForm((prev) => ({
        ...prev,
        screenshot: file,
        screenshotPreview: URL.createObjectURL(file), // Create a preview URL
      }));
    }
  };

  const handleToggleDonation = () => {
    setForm(prev => ({ 
      ...prev, 
      isDonation: !prev.isDonation,
      paymentMethod: !prev.isDonation ? "Instapay" : prev.paymentMethod
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (cart.length === 0) {
      alert("Your cart is empty.");
      return;
    }

    setLoading(true);

    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      
      const orderData = {
        userId: user.id || user._id || null,
        items: cart.map(item => ({
          productId: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          shelterId: item.shelterId,
        })),
        totalAmount: total,
        shippingDetails: {
          fullName: form.fullName,
          email: form.email,
          phone: form.phone,
          city: form.city,
          address: form.address,
          notes: form.notes,
        },
        paymentMethod: form.paymentMethod,
        orderType: form.isDonation ? "Donation" : "Purchase",
      };

      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const res = await fetch(`${API_URL}/api/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      if (res.ok) {
        localStorage.removeItem(CART_STORAGE_KEY);
        alert("Order placed successfully!");
        router.push("/store");
      } else {
        const err = await res.json();
        alert(err.message || "Failed to place order");
      }
    } catch (error) {
      console.error(error);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;

  if (cart.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-24 text-center">
        <ShoppingCart className="mx-auto h-16 w-16 text-slate-300" />
        <h1 className="mt-6 text-2xl font-bold text-slate-950">Your cart is empty</h1>
        <p className="mt-2 text-slate-600">Add items to your cart before checking out.</p>
        <Link href="/store" className="mt-8 inline-flex items-center gap-2 rounded-xl bg-slate-950 px-6 py-3 font-semibold text-white transition hover:bg-slate-800">
          <ArrowLeft className="h-4 w-4" />
          Back to Store
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="space-y-6">
        {/* Header */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Checkout
              </div>

              <h1 className="mt-4 text-3xl font-bold text-slate-950">
                Shipping & Payment
              </h1>
              <p className="mt-2 text-sm text-slate-600">
                Complete your order and support our shelters.
              </p>
            </div>

            <Link
              href="/cart"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Cart
            </Link>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            {/* Donation Toggle */}
            <div 
              onClick={handleToggleDonation}
              className={`cursor-pointer rounded-2xl border-2 p-5 transition ${form.isDonation ? "border-emerald-500 bg-emerald-50" : "border-slate-200 bg-white hover:border-slate-300"}`}
            >
              <div className="flex items-center gap-4">
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${form.isDonation ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-500"}`}>
                  <Heart className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-slate-950">Donate to Shelter</h3>
                  <p className="text-sm text-slate-600">Buying these items as a gift for the shelter(s)</p>
                </div>
                <div className={`h-6 w-12 rounded-full p-1 transition ${form.isDonation ? "bg-emerald-500" : "bg-slate-200"}`}>
                   <div className={`h-4 w-4 rounded-full bg-white transition ${form.isDonation ? "translate-x-6" : "translate-x-0"}`}></div>
                </div>
              </div>
            </div>

            {/* Contact Info */}
            <SectionTitle
              icon={User}
              title="Contact Information"
              desc="We’ll use this to confirm your order."
            />

            <div className="grid gap-4 md:grid-cols-2">
              <Field
                label="Full Name"
                name="fullName"
                required
                readOnly={readOnlyFields.fullName}
                value={form.fullName}
                onChange={handleChange}
                placeholder="Your full name"
                icon={User}
              />
              <Field
                label="Email"
                name="email"
                required
                readOnly={readOnlyFields.email}
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                icon={Mail}
              />
              <Field
                label="Phone"
                name="phone"
                required
                readOnly={readOnlyFields.phone}
                value={form.phone}
                onChange={handleChange}
                placeholder="+20 ..."
                icon={Phone}
              />
              <Field
                label="City"
                name="city"
                readOnly={readOnlyFields.city}
                value={form.city}
                onChange={handleChange}
                placeholder="Cairo"
                icon={MapPin}
              />
            </div>

            {/* Address */}
            {!form.isDonation && (
              <>
                <SectionTitle
                  icon={MapPin}
                  title="Delivery Address"
                  desc="Where should we send the items?"
                />

                <div className="grid gap-4">
                  <Field
                    label="Address"
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    placeholder="Street, building, floor..."
                    icon={MapPin}
                  />

                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-slate-700">
                      Notes
                    </span>
                    <textarea
                      name="notes"
                      value={form.notes}
                      onChange={handleChange}
                      rows={4}
                      placeholder="Any special delivery notes..."
                      className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-slate-950"
                    />
                  </label>
                </div>
              </>
            )}

            {/* Delivery */}
            {!form.isDonation && (
              <div className="rounded-2xl bg-slate-50 p-6">
                 <div className="flex items-center justify-between">
                    <div>
                       <h3 className="font-bold text-slate-950 text-lg">Flat Rate Delivery</h3>
                       <p className="text-sm text-slate-600">Standard delivery to your address</p>
                    </div>
                    <p className="text-xl font-bold text-slate-950">50 EGP</p>
                 </div>
              </div>
            )}

            {/* Payment */}
            <SectionTitle
              icon={ShoppingBag}
              title="Payment Method"
              desc="Choose your preferred payment option."
            />

            <div className="grid gap-3 md:grid-cols-3">
              <PaymentOption
                title="Instapay"
                subtitle="Fast transfer"
                checked={form.paymentMethod === "Instapay"}
                onClick={() =>
                  setForm((prev) => ({ ...prev, paymentMethod: "Instapay" }))
                }
              />
              {!form.isDonation && (
                <>
                  <PaymentOption
                    title="Cash on Delivery"
                    subtitle="Pay when received"
                    checked={form.paymentMethod === "Cash on Delivery"}
                    onClick={() =>
                      setForm((prev) => ({
                        ...prev,
                        paymentMethod: "Cash on Delivery",
                      }))
                    }
                  />
                  <PaymentOption
                    title="Wallet"
                    subtitle="Paymob / Fawry / Vodafone Cash"
                    checked={form.paymentMethod === "Wallet"}
                    onClick={() =>
                      setForm((prev) => ({ ...prev, paymentMethod: "Wallet" }))
                    }
                  />
                </>
              )}
            </div>

            {/* Payment Instructions & Upload */}
            {(form.paymentMethod === "Instapay" || form.paymentMethod === "Wallet") && (
              <div className="space-y-4">
                <div className="rounded-2xl bg-slate-950 p-6 text-white shadow-xl">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                      {form.paymentMethod === "Instapay" ? <CheckCircle2 className="h-6 w-6 text-emerald-400" /> : <Phone className="h-6 w-6 text-amber-400" />}
                    </div>
                    <div>
                      <h4 className="font-bold text-lg">
                        {form.paymentMethod === "Instapay" ? "Transfer via Instapay" : "Vodafone Cash Transfer"}
                      </h4>
                      <p className="text-sm text-slate-400">Please send total amount: <span className="text-white font-bold">{total} EGP</span></p>
                    </div>
                  </div>

                  <div className="mt-6 space-y-4">
                    {form.paymentMethod === "Instapay" && (
                       <div className="flex items-center justify-between rounded-xl bg-white/5 p-4 border border-white/10">
                          <div>
                            <p className="text-[10px] text-slate-400 uppercase tracking-widest">Main Instapay Address</p>
                            <p className="mt-1 font-mono font-bold text-lg">pawcare@instapay</p>
                          </div>
                       </div>
                    )}

                    <div className="space-y-3">
                       <p className="text-xs text-slate-400 uppercase font-semibold">Shelter Contact(s)</p>
                       {uniqueShelters.map((s, idx) => (
                         <div key={idx} className="flex items-center justify-between rounded-xl bg-white/5 p-4 border border-white/10">
                            <div>
                               <p className="text-sm font-semibold">{s.name}</p>
                               <p className="mt-1 font-mono text-slate-300">{s.phone}</p>
                            </div>
                            <span className="text-[10px] bg-white/10 px-2 py-1 rounded-md text-slate-300">
                               {form.paymentMethod === "Wallet" ? "V-Cash" : "Shelter Account"}
                            </span>
                         </div>
                       ))}
                    </div>
                  </div>

                  <p className="mt-6 text-xs text-slate-400 italic">
                    Note: Your order will be processed once we verify the transfer statement.
                  </p>
                </div>

                {/* Screenshot Upload Section */}
                <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white p-8">
                  <div className="flex flex-col items-center text-center">
                    {form.screenshotPreview ? (
                       <div className="relative h-40 w-full max-w-xs overflow-hidden rounded-xl border border-slate-200 shadow-lg">
                          <Image src={form.screenshotPreview} alt="Screenshot" fill className="object-cover" />
                          <button 
                             onClick={() => setForm(p => ({ ...p, screenshot: null, screenshotPreview: "" }))}
                             className="absolute top-2 right-2 rounded-full bg-slate-950/50 p-1 text-white hover:bg-slate-950"
                          >
                             <ArrowLeft className="h-4 w-4" />
                          </button>
                       </div>
                    ) : (
                      <>
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50 text-slate-400">
                           <Camera className="h-8 w-8" />
                        </div>
                        <h5 className="mt-4 font-bold text-slate-950">Upload Payment Statement</h5>
                        <p className="mt-1 text-sm text-slate-600">Please upload a screenshot of your payment confirmation</p>
                      </>
                    )}

                    <label className="mt-6 flex cursor-pointer items-center gap-2 rounded-xl bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
                      <Upload className="h-4 w-4" />
                      {form.screenshot ? "Change Screenshot" : "Choose File"}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileChange}
                        required={(form.paymentMethod === "Instapay" || form.paymentMethod === "Wallet")}
                      />
                    </label>
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-wrap gap-3 border-t border-slate-200 pt-6">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-8 py-4 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-50"
              >
                {loading ? "Processing..." : form.paymentMethod === "Instapay" ? "I have Paid" : "Place Order"}
                <ArrowRight className="h-4 w-4" />
              </button>

              <Link
                href="/cart"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-8 py-4 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
              >
                Back to Cart
              </Link>
            </div>
          </form>

          {/* Summary */}
          <aside className="h-fit rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:sticky lg:top-6">
            <h2 className="text-xl font-bold text-slate-950">Order Summary</h2>

            <div className="mt-5 space-y-4">
              {cart.map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  <div className="relative h-14 w-14 overflow-hidden rounded-2xl bg-slate-100 flex items-center justify-center">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <ShoppingBag className="h-6 w-6 text-slate-400" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-slate-950">
                      {item.name}
                    </p>
                    <p className="text-sm text-slate-600">
                      Qty {item.quantity} × {item.price} EGP
                    </p>
                  </div>

                  <p className="text-sm font-semibold text-slate-950">
                    {item.quantity * item.price} EGP
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-6 space-y-3 border-t border-slate-200 pt-5 text-sm">
              <Row label="Subtotal" value={`${subtotal} EGP`} />
              <Row label="Delivery Fee" value={`${deliveryFee} EGP`} />
              <Row label="Tax Fee" value={`${tax} EGP`} />

              <div className="border-t border-slate-200 pt-3">
                <Row label="Total" value={`${total} EGP`} strong />
              </div>
            </div>

            {form.isDonation && (
              <div className="mt-6 rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-800">
                <div className="flex items-center gap-2 font-bold">
                  <Heart className="h-4 w-4" />
                  Supply Donation
                </div>
                <p className="mt-1 text-xs opacity-90">
                  You are purchasing these items for the shelter. We will deliver them directly.
                </p>
              </div>
            )}

            
            <div className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                Secure checkout
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function SectionTitle({
  icon: Icon,
  title,
  desc,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  desc: string;
}) {
  return (
    <div className="flex items-start gap-3 pt-4 first:pt-0">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-white">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <h2 className="text-lg font-bold text-slate-950">{title}</h2>
        <p className="mt-1 text-sm text-slate-600">{desc}</p>
      </div>
    </div>
  );
}

function Field({
  label,
  name,
  value,
  onChange,
  placeholder,
  icon: Icon,
  required = false,
  readOnly = false,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => void;
  placeholder?: string;
  icon?: React.ComponentType<{ className?: string }>;
  required?: boolean;
  readOnly?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-700">
        {label} {required && <span className="text-red-500">*</span>}
      </span>
      <div className="relative">
        {Icon ? (
          <Icon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
        ) : null}
        <input
          name={name}
          value={value}
          required={required}
          readOnly={readOnly}
          onChange={onChange}
          placeholder={placeholder}
          className={`w-full rounded-2xl border border-slate-300 bg-white py-3 pl-12 pr-4 outline-none transition focus:border-slate-950 ${readOnly ? "cursor-not-allowed bg-slate-50 opacity-75" : ""}`}
        />
      </div>
    </label>
  );
}

function DeliveryOption({
  title,
  subtitle,
  price,
  checked,
  onClick,
}: {
  title: string;
  subtitle: string;
  price: string;
  checked: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-3xl border p-4 text-left transition ${
        checked
          ? "border-slate-950 bg-slate-950 text-white shadow-lg"
          : "border-slate-200 bg-white text-slate-950 hover:bg-slate-50"
      }`}
    >
      <p className="font-semibold">{title}</p>
      <p
        className={`mt-1 text-sm ${
          checked ? "text-slate-200" : "text-slate-600"
        }`}
      >
        {subtitle}
      </p>
      <p
        className={`mt-3 text-sm font-semibold ${
          checked ? "text-white" : "text-slate-950"
        }`}
      >
        {price}
      </p>
    </button>
  );
}

function PaymentOption({
  title,
  subtitle,
  checked,
  onClick,
}: {
  title: string;
  subtitle: string;
  checked: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-3xl border p-4 text-left transition ${
        checked
          ? "border-slate-950 bg-slate-950 text-white shadow-lg"
          : "border-slate-200 bg-white text-slate-950 hover:bg-slate-50"
      }`}
    >
      <p className="font-semibold">{title}</p>
      <p
        className={`mt-1 text-sm ${
          checked ? "text-slate-200" : "text-slate-600"
        }`}
      >
        {subtitle}
      </p>
    </button>
  );
}

function Row({
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
        className={
          strong
            ? "text-lg font-bold text-slate-950"
            : "font-semibold text-slate-950"
        }
      >
        {value}
      </span>
    </div>
  );
}
