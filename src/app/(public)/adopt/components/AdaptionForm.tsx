"use client";

import { useState, useEffect, type ChangeEvent, type FormEvent } from "react";

import { Dog, HeartHandshake, MapPin, ShieldCheck, Loader2 } from "lucide-react";

type AdoptionFormProps = {
  selectedDogId: string;
  selectedDogName: string;
  selectedDogBreed: string;
  selectedDogLocation: string;
};

type AdoptionFormState = {
  fullName: string;
  email: string;
  phone: string;
  city: string;
  address: string;
  experience: string;
  reason: string;
  agree: boolean;
};

const experienceOptions = ["First time", "Some experience", "Experienced"];

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function AdoptionForm({
  selectedDogId,
  selectedDogName,
  selectedDogBreed,
  selectedDogLocation,
}: AdoptionFormProps) {
  const [readOnlyFields, setReadOnlyFields] = useState({
    fullName: false,
    email: false,
    phone: false,
    city: false,
  });

  const [formData, setFormData] = useState<AdoptionFormState>({
    fullName: "",
    email: "",
    phone: "",
    city: "",
    address: "",
    experience: "",
    reason: "",
    agree: false,
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          setFormData(prev => ({
            ...prev,
            fullName: user.name || user.fullName || "",
            email: user.email || "",
            phone: user.phone || "",
            city: user.city || "",
            address: user.address || "",
          }));

          setReadOnlyFields({
            fullName: !!(user.name || user.fullName),
            email: !!user.email,
            phone: !!user.phone,
            city: !!user.city,
          });
        } catch (err) {}
      }
    }
  }, []);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(`${API_URL}/api/requests`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          type: "Adoption",
          dogId: selectedDogId,
          requesterName: formData.fullName,
          requesterEmail: formData.email,
          requesterPhone: formData.phone,
          message: `Experience: ${formData.experience}. Reason: ${formData.reason}. Address: ${formData.address}`,
          shelter: selectedDogLocation
        })
      });

      if (res.ok) {
        alert("Adoption request submitted successfully! You can track it in your dashboard.");
        window.location.href = "/dashboard/user/requests";
      } else {
        const err = await res.json();
        alert(err.message || "Failed to submit request");
      }
    } catch (err) {
      alert("Error submitting request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-start gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white">
          <HeartHandshake className="h-6 w-6" />
        </div>

        <div>
          <h2 className="text-2xl font-bold text-slate-950">Adoption Request</h2>
          <p className="mt-1 text-sm text-slate-600">
            Final step: complete the adoption form for your selected dog.
          </p>
        </div>
      </div>

      <div className="mb-6 rounded-2xl bg-slate-50 p-4">
        <p className="text-sm font-semibold text-slate-500">Selected dog</p>
        <div className="mt-2 flex items-start gap-3">
          <Dog className="mt-1 h-5 w-5 text-slate-700" />
          <div>
            <p className="font-semibold text-slate-950">{selectedDogName}</p>
            <p className="text-sm text-slate-600">{selectedDogBreed}</p>
            <div className="mt-1 flex items-center gap-2 text-sm text-slate-600">
              <MapPin className="h-4 w-4" />
              <span>{selectedDogLocation}</span>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-5">
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
          label="Address"
          name="address"
          value={formData.address}
          onChange={handleChange}
          placeholder="Enter your full address"
        />

        <SelectField
          label="Dog adoption experience"
          name="experience"
          value={formData.experience}
          onChange={handleChange}
          options={experienceOptions}
        />

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Why do you want to adopt?
          </label>
          <textarea
            name="reason"
            value={formData.reason}
            onChange={handleChange}
            rows={5}
            placeholder="Tell us why you want to adopt this dog..."
            className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-950"
          />
        </div>

        <label className="flex items-start gap-3 rounded-2xl bg-slate-50 p-4">
          <input
            type="checkbox"
            name="agree"
            checked={formData.agree}
            onChange={handleChange}
            className="mt-1 h-4 w-4 rounded border-slate-300"
            required
          />
          <span className="text-sm leading-6 text-slate-600">
            I agree that the shelter will review my request and contact me if the
            application is approved.
          </span>
        </label>

        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center justify-center rounded-xl bg-slate-950 px-6 py-3 font-semibold text-white transition hover:bg-slate-800 disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            "Submit Adoption Request"
          )}
        </button>

        <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <ShieldCheck className="mt-0.5 h-5 w-5 text-slate-600" />
          <p className="text-sm leading-6 text-slate-600">
            We review adoption requests to make sure every dog goes to a safe and
            loving home.
          </p>
        </div>
      </form>
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
        className={`w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-950 ${props.readOnly ? "cursor-not-allowed bg-slate-50 opacity-75" : ""}`}
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
        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-slate-950"
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