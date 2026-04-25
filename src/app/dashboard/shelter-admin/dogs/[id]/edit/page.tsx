"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Dog,
  Save,
  ShieldCheck,
  Eye,
  HeartHandshake,
  PawPrint,
} from "lucide-react";

type DogForm = {
  name: string;
  breed: string;
  age: string;
  gender: string;
  location: string;
  shelter: string;
  status: string;
  health: string;
  visibility: string;
  vaccinated: string;
  featured: string;
  description: string;
  photo: string;
};

export default function EditDogPage() {
  const [formData, setFormData] = useState<DogForm>({
    name: "Buddy",
    breed: "Mixed Breed",
    age: "2 years",
    gender: "Male",
    location: "Cairo",
    shelter: "Cairo Shelter",
    status: "Available",
    health: "Good health",
    visibility: "Show on website",
    vaccinated: "Yes",
    featured: "Yes",
    description: "Friendly dog that loves people and gets along well with kids.",
    photo: "",
  });
  
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingPhoto(true);
      const uploadData = new FormData();
      uploadData.append("image", file);

      const res = await fetch(`${API_URL}/api/upload`, {
        method: "POST",
        body: uploadData,
      });

      const data = await res.json();
      if (res.ok && data.url) {
        setFormData({ ...formData, photo: data.url });
      } else {
        alert(data.message || "Failed to upload image");
      }
    } catch (error) {
      console.error(error);
      alert("An error occurred during upload.");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      // Assuming URL pattern includes [id]
      const pathname = window.location.pathname;
      const id = pathname.split('/').slice(-2, -1)[0]; // extracts [id] from .../dogs/[id]/edit

      const payload = {
        name: formData.name,
        breed: formData.breed,
        age: Number(formData.age.replace(/\D/g, '')) || 2, // remove non-digits
        sex: formData.gender,
        size: "Medium",
        shelter: formData.shelter,
        city: formData.location,
        status: formData.status,
        vaccinated: formData.vaccinated === "Yes",
        notes: formData.description,
        photo: formData.photo,
      };

      const res = await fetch(`${API_URL}/api/dogs/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        alert("Dog updated successfully");
        window.location.href = "/dashboard/shelter-admin/dogs";
      }
    } catch (err) {
      console.error(err);
      alert("Failed to update dog");
    }
  };

  return (
    <div className="space-y-6">
      <Link
        href="/dashboard/shelter-admin/dogs"
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-slate-950"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Dogs
      </Link>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-950 text-white">
            <Dog className="h-7 w-7" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-950">Edit Dog</h1>
            <p className="mt-2 text-sm text-slate-600">
              Update the dog info, status, health, and visibility.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="lg:col-span-2 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <div className="mb-6 flex items-start gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white">
              <PawPrint className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-950">
                Dog Information
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Edit the fields below and save the changes.
              </p>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <InputField
              label="Dog name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter dog name"
            />

            <InputField
              label="Breed"
              name="breed"
              value={formData.breed}
              onChange={handleChange}
              placeholder="Enter breed"
            />
          </div>

          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <InputField
              label="Age"
              name="age"
              value={formData.age}
              onChange={handleChange}
              placeholder="e.g. 2 years"
            />

            <SelectField
              label="Gender"
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              options={["Male", "Female"]}
            />
          </div>

          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <InputField
              label="Location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="Enter location"
            />

            <InputField
              label="Shelter name"
              name="shelter"
              value={formData.shelter}
              onChange={handleChange}
              placeholder="Enter shelter name"
            />
          </div>

          {/* Important fields */}
          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <SelectField
              label="Status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              options={["Available", "Fostered", "Adopted", "Pending", "Medical Hold"]}
            />

            <SelectField
              label="Health"
              name="health"
              value={formData.health}
              onChange={handleChange}
              options={["Good health", "Needs vet check", "Under treatment", "Recovering"]}
            />
          </div>

          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <SelectField
              label="Visibility"
              name="visibility"
              value={formData.visibility}
              onChange={handleChange}
              options={["Show on website", "Hide from website"]}
            />

            <SelectField
              label="Vaccinated"
              name="vaccinated"
              value={formData.vaccinated}
              onChange={handleChange}
              options={["Yes", "No"]}
            />
          </div>

          <div className="mt-5">
            <SelectField
              label="Featured"
              name="featured"
              value={formData.featured}
              onChange={handleChange}
              options={["Yes", "No"]}
            />
          </div>

          <div className="mt-5">
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={5}
              placeholder="Write a short description about the dog..."
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-950"
            />
          </div>

          <div className="mt-5">
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Dog Photo
            </label>
            
            {formData.photo && (
              <div className="mb-3 flex items-center gap-4">
                <div className="h-16 w-16 overflow-hidden rounded-xl border border-slate-200">
                  <img src={formData.photo} alt="Preview" className="h-full w-full object-cover" />
                </div>
                <button type="button" onClick={() => setFormData({...formData, photo: ""})} className="text-sm font-medium text-red-600 hover:text-red-700">Remove</button>
              </div>
            )}
            
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              disabled={uploadingPhoto}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition file:mr-4 file:rounded-lg file:border-0 file:bg-slate-950 file:px-4 file:py-2 file:text-white file:text-sm file:font-semibold hover:border-slate-950 disabled:opacity-50"
            />
            {uploadingPhoto && <p className="mt-2 text-sm text-slate-500">Uploading photo...</p>}
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-6 py-3 font-semibold text-white transition hover:bg-slate-800"
            >
              <Save className="h-4 w-4" />
              Save Changes
            </button>

            <Link
              href="/dashboard/shelter-admin/dogs"
              className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-6 py-3 font-semibold text-slate-900 transition hover:bg-slate-100"
            >
              Cancel
            </Link>
          </div>
        </form>

        {/* Side info */}
        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
            <h3 className="text-xl font-bold text-slate-950">What these fields mean</h3>

            <div className="mt-5 space-y-4 text-sm text-slate-700">
              <InfoItem
                icon={HeartHandshake}
                text="Status = dog is available, fostered, adopted, pending, etc."
              />
              <InfoItem
                icon={ShieldCheck}
                text="Health = current medical condition of the dog."
              />
              <InfoItem
                icon={Eye}
                text="Visibility = show or hide this dog from the public website."
              />
              <InfoItem
                icon={PawPrint}
                text="Featured = highlight the dog on the website."
              />
            </div>
          </div>

          <div className="rounded-3xl border border-amber-200 bg-amber-50 p-6 shadow-sm">
            <h3 className="text-xl font-bold text-amber-900">Important</h3>
            <p className="mt-3 text-sm leading-6 text-amber-800">
              If you set the status to <span className="font-semibold">Adopted</span> or
              hide the dog from the website, it won&apos;t appear in the public list later.
            </p>
          </div>
        </div>
      </div>
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
        className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-950"
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
  icon: React.ComponentType<{ className?: string }>;
  text: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="mt-0.5 h-5 w-5 text-slate-500" />
      <p>{text}</p>
    </div>
  );
}