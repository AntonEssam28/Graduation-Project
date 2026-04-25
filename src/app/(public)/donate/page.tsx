"use client";

import Link from "next/link";
import { useState, useEffect, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  HandCoins,
  HeartHandshake,
  PawPrint,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Gift,
  CreditCard,
  Wallet,
  CalendarDays,
  CheckCircle2,
  Loader2,
  MapPin,
} from "lucide-react";

type DonationType = "Cash" | "Food" | "Medicine" | "Supplies";
type DonationFrequency = "one-time" | "monthly";

const presetAmounts = [50, 100, 250, 500, 1000];

const causes = [
  {
    title: "Food & Water",
    description: "Help cover daily meals and fresh water for rescued dogs.",
  },
  {
    title: "Medicine & Vet Care",
    description: "Support treatment, vaccines, and medical checkups.",
  },
  {
    title: "Shelter Needs",
    description: "Provide blankets, beds, cleaning tools, and safe spaces.",
  },
  {
    title: "Rescue Operations",
    description: "Fund travel, fuel, and rescue equipment for pickup missions.",
  },
];

const impactItems = [
  "EGP 100 can provide food for a dog for several days",
  "EGP 250 can help cover basic medical supplies",
  "EGP 500 can support a rescue mission",
  "Monthly donations help shelters plan ahead",
];

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function DonatePage() {
  const router = useRouter();
  const [donationType, setDonationType] = useState<DonationType>("Cash");
  const [frequency, setFrequency] = useState<DonationFrequency>("one-time");
  const [selectedAmount, setSelectedAmount] = useState<number | null>(100);
  const [customAmount, setCustomAmount] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [selectedShelter, setSelectedShelter] = useState("");
  const [shelters, setShelters] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const [readOnlyFields, setReadOnlyFields] = useState({
    fullName: false,
    email: false,
    phone: false,
  });

  useEffect(() => {
    // Pre-fill user data
    const userJson = localStorage.getItem("user");
    if (userJson) {
      try {
        const user = JSON.parse(userJson);
        setFullName(user.name || user.fullName || "");
        setEmail(user.email || "");
        setPhone(user.phone || "");
        
        setReadOnlyFields({
          fullName: !!(user.name || user.fullName),
          email: !!user.email,
          phone: !!user.phone,
        });
      } catch (err) {}
    }

    // Fetch shelters
    const fetchShelters = async () => {
      try {
        const res = await fetch(`${API_URL}/api/shelters`);
        const data = await res.json();
        setShelters(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to fetch shelters", err);
      }
    };
    fetchShelters();
  }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please log in to make a donation.");
      return;
    }

    if (!selectedShelter) {
      alert("Please select a shelter to donate to.");
      return;
    }

    setIsSubmitting(true);

    const amount = selectedAmount ?? Number(customAmount);

    try {
      const payload = {
        donorName: fullName,
        donorEmail: email,
        phone: phone,
        type: donationType,
        value: amount || 0,
        shelter: selectedShelter,
        notes: `${frequency === 'monthly' ? '[Monthly] ' : ''}${notes}`,
        status: "Pending"
      };

      // 1. Create Donation Record (Backend will automatically create a Request record)
      const resDonation = await fetch(`${API_URL}/api/donations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload),
      });

      if (resDonation.ok) {
        setIsSuccess(true);
      } else {
        const err = await resDonation.json();
        alert(err.message || "Failed to process donation");
      }
    } catch (err) {
      console.error("Donation error:", err);
      alert("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center bg-white px-4 text-center">
        <div className="rounded-full bg-emerald-100 p-8 text-emerald-600">
          <CheckCircle2 className="h-20 w-20" />
        </div>
        <h2 className="mt-8 text-4xl font-extrabold text-slate-950">Thank You for Your Donation!</h2>
        <p className="mt-4 max-w-lg text-slate-600 text-lg">
          Your support means the world to our furry friends at <span className="font-bold text-slate-950">{selectedShelter}</span>. 
          The shelter will review your donation and update your history soon.
        </p>
        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <Link
              href="/dashboard/user/requests"
              className="inline-flex items-center justify-center rounded-2xl bg-slate-950 px-8 py-4 font-bold text-white transition hover:bg-slate-800"
            >
              View Donation History
            </Link>
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-8 py-4 font-bold text-slate-900 transition hover:bg-slate-50"
            >
              Back to Home
            </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="bg-slate-950 text-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-20">
          <div className="flex flex-col justify-center">
            <div className="mb-4 inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200">
              <PawPrint className="h-4 w-4 text-amber-400" />
              Support dog rescue and shelter care
            </div>

            <h1 className="text-4xl font-bold leading-tight sm:text-5xl">
              Donate to help dogs get food, care, and safety
            </h1>

            <p className="mt-5 max-w-xl text-base leading-7 text-slate-300">
              Your donation helps us rescue dogs, provide food and medicine,
              and support shelters that care for them every day.
            </p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/report"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 font-semibold text-slate-950 transition hover:bg-slate-100"
              >
                Report a Dog
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                href="/adopt"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-6 py-3 font-semibold text-white transition hover:bg-white/10"
              >
                Adopt Instead
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap gap-6 text-sm text-slate-300">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                Secure donation flow
              </div>
              <div className="flex items-center gap-2">
                <HeartHandshake className="h-4 w-4 text-amber-400" />
                Shelter support
              </div>
              <div className="flex items-center gap-2">
                <Gift className="h-4 w-4 text-pink-400" />
                One-time or monthly
              </div>
            </div>
          </div>

          {/* Hero card */}
          <div className="flex items-center justify-center">
            <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-white/10 p-6 shadow-2xl backdrop-blur-xl">
              <div className="rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 p-6 text-slate-950">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium">Your impact matters</p>
                    <h3 className="mt-1 text-2xl font-bold">Every donation helps</h3>
                  </div>
                  <div className="rounded-full bg-white/30 p-3">
                    <HandCoins className="h-7 w-7" />
                  </div>
                </div>

                <div className="mt-6 space-y-4">
                  <div className="rounded-2xl bg-white/25 p-4">
                    <p className="text-sm font-medium">Food support</p>
                    <p className="mt-1 text-sm">Meals and water for rescued dogs.</p>
                  </div>
                  <div className="rounded-2xl bg-white/25 p-4">
                    <p className="text-sm font-medium">Medical support</p>
                    <p className="mt-1 text-sm">Vaccines, treatment, and checkups.</p>
                  </div>
                  <div className="rounded-2xl bg-white/25 p-4">
                    <p className="text-sm font-medium">Rescue support</p>
                    <p className="mt-1 text-sm">Fuel and tools for rescue missions.</p>
                  </div>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-3 gap-3">
                <div className="rounded-2xl bg-slate-900 p-4 text-center">
                  <p className="text-2xl font-bold">250+</p>
                  <p className="text-xs text-slate-400">Rescued</p>
                </div>
                <div className="rounded-2xl bg-slate-900 p-4 text-center">
                  <p className="text-2xl font-bold">8</p>
                  <p className="text-xs text-slate-400">Shelters</p>
                </div>
                <div className="rounded-2xl bg-slate-900 p-4 text-center">
                  <p className="text-2xl font-bold">24/7</p>
                  <p className="text-xs text-slate-400">Support</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main content */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Form */}
          <div className="lg:col-span-2">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-2xl font-bold text-slate-950">Donation Form</h2>
              <p className="mt-2 text-sm text-slate-600">
                Choose how you want to support the shelter.
              </p>

              <form onSubmit={handleSubmit} className="mt-8 grid gap-5">
                {/* Donation type */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Donation type
                  </label>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {["Cash", "Food", "Medicine", "Supplies"].map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setDonationType(t as DonationType)}
                        className={`rounded-xl border px-3 py-3 text-sm font-semibold transition ${
                          donationType === t
                            ? "border-slate-950 bg-slate-950 text-white"
                            : "border-slate-300 bg-white text-slate-900 hover:bg-slate-100"
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Shelter selection */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Choose Shelter to Support
                  </label>
                  <div className="relative">
                    <MapPin className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                    <select
                      value={selectedShelter}
                      onChange={(e) => setSelectedShelter(e.target.value)}
                      required
                      className="w-full rounded-2xl border border-slate-300 bg-white py-3 pl-12 pr-4 outline-none transition focus:border-slate-950 text-sm font-medium"
                    >
                      <option value="">Select a shelter...</option>
                      {shelters.map((s) => (
                        <option key={s._id} value={s.name}>
                          {s.name} ({s.location || s.city})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Frequency */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Donation frequency
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setFrequency("one-time")}
                      className={`rounded-xl border px-4 py-3 font-bold transition ${
                        frequency === "one-time"
                          ? "border-slate-950 bg-slate-950 text-white"
                          : "border-slate-300 bg-white text-slate-900 hover:bg-slate-100"
                      }`}
                    >
                      One-time
                    </button>
                    <button
                      type="button"
                      onClick={() => setFrequency("monthly")}
                      className={`rounded-xl border px-4 py-3 font-bold transition ${
                        frequency === "monthly"
                          ? "border-slate-950 bg-slate-950 text-white"
                          : "border-slate-300 bg-white text-slate-900 hover:bg-slate-100"
                      }`}
                    >
                      Monthly
                    </button>
                  </div>
                </div>

                {/* Amounts */}
                {donationType === "Cash" ? (
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Select amount
                    </label>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                      {presetAmounts.map((amount) => (
                        <button
                          key={amount}
                          type="button"
                          onClick={() => {
                            setSelectedAmount(amount);
                            setCustomAmount("");
                          }}
                          className={`rounded-xl border px-4 py-3 font-semibold transition ${
                            selectedAmount === amount
                              ? "border-slate-950 bg-slate-950 text-white"
                              : "border-slate-300 bg-white text-slate-900 hover:bg-slate-100"
                          }`}
                        >
                          EGP {amount}
                        </button>
                      ))}
                    </div>

                    <div className="mt-4">
                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        Or enter custom amount
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={customAmount}
                        onChange={(e) => {
                          setCustomAmount(e.target.value);
                          setSelectedAmount(null);
                        }}
                        placeholder="Enter custom amount"
                        className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-900"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                    <h3 className="text-lg font-bold text-slate-950">
                      Supplies Support
                    </h3>
                    <p className="mt-2 text-sm text-slate-600">
                      You've selected to donate <span className="font-bold text-slate-950">{donationType}</span> to <span className="font-bold text-slate-950">{selectedShelter || "the shelter"}</span>. 
                      The shelter team will contact you to coordinate the delivery or pickup.
                    </p>

                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <SupplyTag label="Dog food" />
                      <SupplyTag label="Medicine" />
                      <SupplyTag label="Blankets" />
                      <SupplyTag label="Collars / Leashes" />
                    </div>
                  </div>
                )}

                {/* Donor info */}
                 <div className="grid gap-5 md:grid-cols-2">
                  <InputField
                    label="Full name"
                    type="text"
                    readOnly={readOnlyFields.fullName}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                  />

                  <InputField
                    label="Email"
                    type="email"
                    readOnly={readOnlyFields.email}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                  />
                </div>

                <InputField
                    label="Phone Number"
                    type="tel"
                    readOnly={readOnlyFields.phone}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="01xxxxxxxxx"
                  />

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Notes
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={4}
                    placeholder="Any special notes or preferences..."
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-900"
                  />
                </div>

                <div className="flex items-start gap-3 rounded-2xl bg-slate-50 p-4">
                  <CalendarDays className="mt-0.5 h-5 w-5 text-slate-600" />
                  <p className="text-sm leading-6 text-slate-600">
                    Monthly donations help shelters plan food, medicine, and rescue needs ahead of time.
                  </p>
                </div>

                 <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center justify-center rounded-2xl bg-slate-950 px-6 py-4 font-bold text-white transition hover:bg-slate-800 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Submit Donation"
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Side content */}
          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
              <h3 className="text-xl font-bold text-slate-950">How your money helps</h3>
              <div className="mt-5 space-y-4">
                {impactItems.map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-500" />
                    <p className="text-sm leading-6 text-slate-700">{item}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-xl font-bold text-slate-950">What we use donations for</h3>
              <div className="mt-5 space-y-4">
                {causes.map((cause) => (
                  <div key={cause.title} className="rounded-2xl bg-slate-50 p-4">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-amber-500" />
                      <p className="font-semibold text-slate-950">{cause.title}</p>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {cause.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-amber-200 bg-amber-50 p-6 shadow-sm">
              <h3 className="text-xl font-bold text-amber-900">Prefer to help differently?</h3>
              <p className="mt-3 text-sm leading-6 text-amber-800">
                You can also adopt, foster, or donate supplies through the store.
              </p>

              <div className="mt-5 flex flex-col gap-3">
                <Link
                  href="/adopt"
                  className="inline-flex items-center justify-center rounded-xl bg-amber-500 px-4 py-3 font-semibold text-white transition hover:bg-amber-600"
                >
                  Adopt a Dog
                </Link>

                <Link
                  href="/host"
                  className="inline-flex items-center justify-center rounded-xl border border-amber-300 bg-white px-4 py-3 font-semibold text-amber-900 transition hover:bg-amber-100"
                >
                  Host / Foster
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function InputField({
  label,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-700">
        {label}
      </label>
      <input
        {...props}
        className={`w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-900 ${props.readOnly ? "cursor-not-allowed bg-slate-50 opacity-75" : ""}`}
      />
    </div>
  );
}

function SupplyTag({ label }: { label: string }) {
  return (
    <div className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-center text-sm font-medium text-slate-800">
      {label}
    </div>
  );
}