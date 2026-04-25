"use client";

import Link from "next/link";
import { useState, useEffect, type ChangeEvent, type FormEvent, type ComponentType } from "react";

import {
  AlertTriangle,
  PawPrint,
  MapPin,
  Camera,
  ShieldAlert,
  Clock3,
  ArrowRight,
  CheckCircle2,
  Dog,
} from "lucide-react";

type ReportForm = {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  city: string;
  dogDescription: string;
  urgency: string;
  notes: string;
  photo: File | null;
};

const reportBenefits = [
  "Help rescue stray dogs from the street",
  "Send accurate location details to the shelter",
  "Add a photo to make the report clearer",
  "Track urgent cases faster",
];

const urgencyOptions = ["Low", "Medium", "High", "Critical"];

export default function ReportPage() {
  const [formData, setFormData] = useState<ReportForm>({
    fullName: "",
    email: "",
    phone: "",
    location: "",
    city: "",
    dogDescription: "",
    urgency: "",
    notes: "",
    photo: null,
  });

  const [readOnlyFields, setReadOnlyFields] = useState({
    fullName: false,
    email: false,
    phone: false,
    city: false
  });

  useEffect(() => {
    const userJson = localStorage.getItem("user");
    if (userJson) {
      try {
        const user = JSON.parse(userJson);
        setFormData((prev) => ({
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
          city: !!user.city
        });
      } catch (err) {
        console.error("Failed to parse user from localStorage", err);
      }
    }
  }, []);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;

    setFormData((prev) => ({
      ...prev,
      photo: file,
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      
      const payload = {
        title: `Stray Dog Report: ${formData.dogDescription.substring(0, 30)}...`,
        description: formData.dogDescription,
        location: formData.location,
        city: formData.city,
        reporterName: formData.fullName,
        reporterEmail: formData.email,
        reporterPhone: formData.phone,
        priority: formData.urgency || "Medium",
        dogCondition: formData.notes,
        photoAvailable: !!formData.photo,
        shelter: "" // Global report
      };

      const token = localStorage.getItem("token");
      if (!token) {
        alert("Please log in to submit a report.");
        setIsSubmitting(false);
        return;
      }

      const res = await fetch(`${API_URL}/api/reports`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setIsSuccess(true);
        setFormData({
          fullName: "",
          email: "",
          phone: "",
          location: "",
          city: "",
          dogDescription: "",
          urgency: "",
          notes: "",
          photo: null,
        });
      } else {
        const errorData = await res.json();
        alert(`Failed to submit report: ${errorData.message}`);
      }
    } catch (err) {
      console.error("Submission error:", err);
      alert("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center bg-white px-4 text-center">
        <div className="rounded-full bg-emerald-100 p-6 text-emerald-600">
          <CheckCircle2 className="h-16 w-16" />
        </div>
        <h2 className="mt-8 text-3xl font-bold text-slate-950">Report Submitted Successfully</h2>
        <p className="mt-4 max-w-md text-slate-600">
          Thank you for your report. Local shelters have been notified and will review the case as soon as possible.
        </p>
        <button
          onClick={() => setIsSuccess(false)}
          className="mt-8 inline-flex items-center justify-center rounded-xl bg-slate-950 px-8 py-3 font-semibold text-white transition hover:bg-slate-800"
        >
          Submit Another Report
        </button>
        <Link href="/" className="mt-4 text-sm font-medium text-slate-600 hover:text-slate-950">
          Back to Home
        </Link>
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
              Report a stray dog
            </div>

            <h1 className="text-4xl font-bold leading-tight sm:text-5xl">
              Help us rescue dogs from the street
            </h1>

            <p className="mt-5 max-w-xl text-base leading-7 text-slate-300">
              If you see a stray dog in need, send us the location and details.
              The shelter team will review the report and act as soon as possible.
            </p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/dogs"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 font-semibold text-slate-950 transition hover:bg-slate-100"
              >
                Browse Dogs
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                href="/donate"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-6 py-3 font-semibold text-white transition hover:bg-white/10"
              >
                Donate to Help
              </Link>
            </div>
          </div>

          {/* Hero card */}
          <div className="flex items-center justify-center">
            <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-white/10 p-6 shadow-2xl backdrop-blur-xl">
              <div className="rounded-2xl bg-gradient-to-br from-red-500 to-orange-500 p-6 text-white">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium">Reporting Flow</p>
                    <h3 className="mt-1 text-2xl font-bold">3 simple steps</h3>
                  </div>
                  <div className="rounded-full bg-white/20 p-3">
                    <AlertTriangle className="h-7 w-7" />
                  </div>
                </div>

                <div className="mt-6 space-y-4">
                  <div className="rounded-2xl bg-white/15 p-4">
                    <p className="text-sm font-medium">1. Submit report</p>
                    <p className="mt-1 text-sm">
                      Fill in the dog’s location and description.
                    </p>
                  </div>

                  <div className="rounded-2xl bg-white/15 p-4">
                    <p className="text-sm font-medium">2. Shelter review</p>
                    <p className="mt-1 text-sm">
                      The shelter checks urgency and nearby teams.
                    </p>
                  </div>

                  <div className="rounded-2xl bg-white/15 p-4">
                    <p className="text-sm font-medium">3. Rescue action</p>
                    <p className="mt-1 text-sm">
                      A rescue team is assigned to help the dog.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-3 gap-3">
                <div className="rounded-2xl bg-slate-900 p-4 text-center">
                  <p className="text-2xl font-bold">250+</p>
                  <p className="text-xs text-slate-400">Rescues</p>
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
              <h2 className="text-2xl font-bold text-slate-950">
                Stray Dog Report Form
              </h2>
              <p className="mt-2 text-sm text-slate-600">
                Please provide as many details as possible so the shelter can locate the dog quickly.
              </p>

              <form onSubmit={handleSubmit} className="mt-8 grid gap-5">
                <div className="grid gap-5 md:grid-cols-2">
                  <InputField
                    label="Full name"
                    name="fullName"
                    readOnly={readOnlyFields.fullName}
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                  />

                  <InputField
                    label="Email"
                    name="email"
                    type="email"
                    readOnly={readOnlyFields.email}
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                  />
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <InputField
                    label="Phone"
                    name="phone"
                    type="tel"
                    readOnly={readOnlyFields.phone}
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Enter your phone number"
                  />

                  <InputField
                    label="City"
                    name="city"
                    readOnly={readOnlyFields.city}
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="Enter your city"
                  />
                </div>

                <InputField
                  label="Exact location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="Street / landmark / area"
                />

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Dog description
                  </label>
                  <textarea
                    name="dogDescription"
                    value={formData.dogDescription}
                    onChange={handleChange}
                    rows={5}
                    placeholder="Describe the dog: color, size, behavior, injuries, etc."
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-900"
                  />
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <SelectField
                    label="Urgency level"
                    name="urgency"
                    value={formData.urgency}
                    onChange={handleChange}
                    options={urgencyOptions}
                  />

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Upload photo
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition file:mr-4 file:rounded-lg file:border-0 file:bg-slate-950 file:px-4 file:py-2 file:text-white hover:border-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Additional notes
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Any extra details that may help the rescue team..."
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-900"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`inline-flex items-center justify-center rounded-xl bg-slate-950 px-6 py-3 font-semibold text-white transition hover:bg-slate-800 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {isSubmitting ? "Submitting..." : "Submit Report"}
                </button>
              </form>
            </div>
          </div>

          {/* Side content */}
          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
              <h3 className="text-xl font-bold text-slate-950">
                Why report with us?
              </h3>

              <div className="mt-5 space-y-4">
                {reportBenefits.map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-500" />
                    <p className="text-sm leading-6 text-slate-700">{item}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-xl font-bold text-slate-950">
                What makes a good report?
              </h3>

              <div className="mt-5 space-y-4 text-sm text-slate-600">
                <InfoItem icon={MapPin} text="Use an accurate location or landmark" />
                <InfoItem icon={Camera} text="Add a clear photo if possible" />
                <InfoItem icon={Dog} text="Describe the dog’s color and size" />
                <InfoItem icon={Clock3} text="Mention if the dog is injured or in danger" />
              </div>
            </div>

            <div className="rounded-3xl border border-amber-200 bg-amber-50 p-6 shadow-sm">
              <h3 className="text-xl font-bold text-amber-900">
                Need immediate help?
              </h3>
              <p className="mt-3 text-sm leading-6 text-amber-800">
                For very urgent cases, set the urgency level to Critical so the shelter can prioritize it.
              </p>
              <div className="mt-5 rounded-2xl bg-white p-4 text-sm text-slate-700">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="h-4 w-4 text-amber-600" />
                  <span className="font-semibold">Critical cases</span>
                </div>
                <p className="mt-2">
                  Injured dogs, traffic danger, or extreme heat exposure.
                </p>
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

function SelectField({
  label,
  options,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  options: string[];
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-700">
        {label}
      </label>
      <select
        {...props}
        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-slate-900"
      >
        <option value="">Select an option</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
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
    <div className="flex items-start gap-3">
      <Icon className="mt-0.5 h-5 w-5 text-slate-500" />
      <p>{text}</p>
    </div>
  );
}