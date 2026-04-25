"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent, type ComponentType } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  CreditCard,
  ShieldCheck,
  Wallet,
  Truck,
  ShoppingCart,
  LockKeyhole,
  User,
  Phone,
  MapPin,
  CalendarDays,
  Banknote,
} from "lucide-react";
import { initialCart, type CartItem } from "@/lib/cart";

const CART_KEY = "pawcare_cart";
const CHECKOUT_KEY = "pawcare_checkout";
const ORDER_KEY = "pawcare_order";

type PaymentMethod = "Card" | "Cash on Delivery" | "Wallet";

export default function PaymentPage() {
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [mounted, setMounted] = useState(false);

  const [checkout, setCheckout] = useState({
    fullName: "",
    email: "",
    phone: "",
    city: "",
    address: "",
    notes: "",
    deliveryMethod: "Standard Delivery",
    paymentMethod: "Card" as PaymentMethod,
  });

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("Card");

  const [form, setForm] = useState({
    cardName: "",
    cardNumber: "",
    expiry: "",
    cvv: "",
    walletProvider: "Paymob",
    walletPhone: "",
  });

  useEffect(() => {
    setMounted(true);

    const savedCart = localStorage.getItem(CART_KEY);
    const savedCheckout = localStorage.getItem(CHECKOUT_KEY);

    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch {
        setCart(initialCart);
      }
    } else {
      setCart(initialCart);
    }

    if (savedCheckout) {
      try {
        const parsed = JSON.parse(savedCheckout);
        setCheckout((prev) => ({ ...prev, ...parsed }));
        setPaymentMethod(parsed.paymentMethod || "Card");
      } catch {
        // ignore
      }
    }
  }, []);

  const subtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [cart]);

  const deliveryFee =
    checkout.deliveryMethod === "Express Delivery"
      ? 80
      : checkout.deliveryMethod === "Standard Delivery"
      ? 50
      : 0;

  const tax = Math.round(subtotal * 0.14);
  const total = subtotal + deliveryFee + tax;

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePay = (e: FormEvent) => {
    e.preventDefault();

    if (cart.length === 0) {
      alert("Your cart is empty.");
      return;
    }

    const orderData = {
      checkout,
      paymentMethod,
      paymentForm: form,
      cart,
      subtotal,
      deliveryFee,
      tax,
      total,
      status: "Paid",
      orderDate: new Date().toISOString(),
    };

    localStorage.setItem(ORDER_KEY, JSON.stringify(orderData));

    router.push("/order-success");
  };

  if (!mounted) return null;

  if (cart.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 py-16 text-center">
        <ShoppingCart className="mx-auto h-12 w-12 text-slate-400" />
        <h1 className="mt-4 text-2xl font-bold text-slate-950">
          No items to pay for
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Please add items to your cart first.
        </p>

        <Link
          href="/cart"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Cart
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
              <CreditCard className="h-3.5 w-3.5" />
              Payment
            </div>

            <h1 className="mt-4 text-3xl font-bold text-slate-950">
              Complete Your Payment
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Choose a payment method and confirm your order.
            </p>
          </div>

          <Link
            href="/checkout"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Checkout
          </Link>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        {/* Payment Form */}
        <form
          onSubmit={handlePay}
          className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          {/* Payment Method */}
          <section>
            <SectionTitle
              icon={CreditCard}
              title="Payment Method"
              desc="Select how you want to pay."
            />

            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <MethodCard
                icon={CreditCard}
                title="Card"
                subtitle="Visa / Mastercard"
                checked={paymentMethod === "Card"}
                onClick={() => setPaymentMethod("Card")}
              />
              <MethodCard
                icon={Wallet}
                title="Wallet"
                subtitle="Paymob / Fawry"
                checked={paymentMethod === "Wallet"}
                onClick={() => setPaymentMethod("Wallet")}
              />
              <MethodCard
                icon={Banknote}
                title="Cash on Delivery"
                subtitle="Pay upon receipt"
                checked={paymentMethod === "Cash on Delivery"}
                onClick={() => setPaymentMethod("Cash on Delivery")}
              />
            </div>
          </section>

          {/* Card form */}
          {paymentMethod === "Card" && (
            <section>
              <SectionTitle
                icon={LockKeyhole}
                title="Card Details"
                desc="Enter your card information securely."
              />

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <Field
                  label="Card Holder Name"
                  name="cardName"
                  value={form.cardName}
                  onChange={handleChange}
                  placeholder="Name on card"
                  icon={User}
                />
                <Field
                  label="Card Number"
                  name="cardNumber"
                  value={form.cardNumber}
                  onChange={handleChange}
                  placeholder="1234 5678 9012 3456"
                  icon={CreditCard}
                />
                <Field
                  label="Expiry Date"
                  name="expiry"
                  value={form.expiry}
                  onChange={handleChange}
                  placeholder="MM/YY"
                  icon={CalendarDays}
                />
                <Field
                  label="CVV"
                  name="cvv"
                  value={form.cvv}
                  onChange={handleChange}
                  placeholder="123"
                  icon={LockKeyhole}
                />
              </div>
            </section>
          )}

          {/* Wallet form */}
          {paymentMethod === "Wallet" && (
            <section>
              <SectionTitle
                icon={Wallet}
                title="Wallet Payment"
                desc="Enter wallet info to continue."
              />

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <Field
                  label="Wallet Provider"
                  name="walletProvider"
                  value={form.walletProvider}
                  onChange={handleChange}
                  as="select"
                  options={["Paymob", "Fawry", "Vodafone Cash", "Orange Money"]}
                  icon={Wallet}
                />
                <Field
                  label="Phone Number"
                  name="walletPhone"
                  value={form.walletPhone}
                  onChange={handleChange}
                  placeholder="+20 ..."
                  icon={Phone}
                />
              </div>
            </section>
          )}

          {/* COD */}
          {paymentMethod === "Cash on Delivery" && (
            <section className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white">
                  <Truck className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-950">
                    Cash on Delivery
                  </h3>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    You will pay when the order is delivered.
                  </p>
                </div>
              </div>
            </section>
          )}

          <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              Secure payment processing
            </div>
            <div className="mt-2 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              Order details are saved locally for now
            </div>
          </div>

          <div className="flex flex-wrap gap-3 border-t border-slate-200 pt-6">
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Pay Now
              <CreditCard className="h-4 w-4" />
            </button>

            <Link
              href="/checkout"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
            >
              Back to Checkout
            </Link>
          </div>
        </form>

        {/* Summary */}
        <aside className="h-fit rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:sticky lg:top-6">
          <h2 className="text-xl font-bold text-slate-950">Order Summary</h2>

          <div className="mt-5 space-y-4">
            {cart.map((item) => (
              <div key={item.id} className="flex items-center gap-3">
                <div className="relative h-14 w-14 overflow-hidden rounded-2xl bg-slate-100">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
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
            <Row label="Tax" value={`${tax} EGP`} />

            <div className="border-t border-slate-200 pt-3">
              <Row label="Total" value={`${total} EGP`} strong />
            </div>
          </div>

          <div className="mt-6 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
            <p className="font-semibold text-slate-950">Delivery Info</p>
            <p className="mt-2">{checkout.fullName || "Customer name"}</p>
            <p>{checkout.phone || "Phone number"}</p>
            <p>{checkout.address || "Address"}</p>
            <p className="mt-2">{checkout.deliveryMethod}</p>
          </div>
        </aside>
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
    <div className="flex items-start gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-950 text-white">
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
  as = "input",
  options = [],
}: {
  label: string;
  name: string;
  value: string;
  onChange: (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;
  placeholder?: string;
  icon?: React.ComponentType<{ className?: string }>;
  as?: "input" | "select";
  options?: string[];
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-700">
        {label}
      </span>
      <div className="relative">
        {Icon ? (
          <Icon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
        ) : null}

        {as === "select" ? (
          <select
            name={name}
            value={value}
            onChange={onChange}
            className="w-full rounded-2xl border border-slate-300 bg-white py-3 pl-12 pr-4 outline-none transition focus:border-slate-950"
          >
            {options.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        ) : (
          <input
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className="w-full rounded-2xl border border-slate-300 bg-white py-3 pl-12 pr-4 outline-none transition focus:border-slate-950"
          />
        )}
      </div>
    </label>
  );
}

function MethodCard({
  icon: Icon,
  title,
  subtitle,
  checked,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>;
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
          ? "border-slate-950 bg-slate-950 text-white"
          : "border-slate-200 bg-white text-slate-950 hover:bg-slate-50"
      }`}
    >
      <Icon className={`h-5 w-5 ${checked ? "text-white" : "text-slate-500"}`} />
      <p className="mt-3 font-semibold">{title}</p>
      <p className={`mt-1 text-sm ${checked ? "text-slate-200" : "text-slate-600"}`}>
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