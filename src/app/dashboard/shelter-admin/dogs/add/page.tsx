"use client";

import { useState, useEffect, type ChangeEvent, type FormEvent } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Dog,
  PawPrint,
  ShieldCheck,
  MapPin,
  CalendarDays,
  HeartHandshake,
  Sparkles,
  Upload,
  Save,
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
  temperament: string;
  description: string;
  vaccinated: string;
  featured: string;
  photo: string;
};

const statusOptions = ["Available", "Fostered", "Adopted", "Pending"];
const genderOptions = ["Male", "Female"];
const vaccinatedOptions = ["Yes", "No"];
const featuredOptions = ["Yes", "No"];

export default function AddNewDogPage() {
  const [formData, setFormData] = useState<DogForm>({
    name: "",
    breed: "",
    age: "",
    gender: "",
    location: "",
    shelter: "",
    status: "Available",
    health: "",
    temperament: "",
    description: "",
    vaccinated: "Yes",
    featured: "No",
    photo: "",
  });
  
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (user.assignedShelter || user.city) {
      setFormData(prev => ({
        ...prev,
        shelter: user.assignedShelter || prev.shelter,
        location: user.city || prev.location
      }));
    }
  }, []);
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
      const payload = {
        name: formData.name,
        breed: formData.breed,
        age: Number(formData.age),
        sex: formData.gender, // Maps gender to sex
        size: "Medium", // Defaulting as frontend currently lacks size 
        shelter: formData.shelter,
        city: formData.location, // Maps location to city
        status: formData.status,
        vaccinated: formData.vaccinated === "Yes",
        neutered: false,
        notes: formData.description,
        photo: formData.photo,
      };

      const res = await fetch(`${API_URL}/api/dogs`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        alert("Dog added successfully");
        window.location.href = "/dashboard/shelter-admin/dogs";
      }
    } catch (err) {
      console.error(err);
      alert("Failed to add dog");
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

      {/* Header */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-950 text-white">
              <Dog className="h-8 w-8" />
            </div>

            <div>
              <h1 className="text-3xl font-bold text-slate-950">Add New Dog</h1>
              <p className="mt-2 text-sm text-slate-600">
                Add a new dog to your shelter list and set its status.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-2xl bg-slate-50 px-4 py-3">
            <PawPrint className="h-5 w-5 text-slate-700" />
            <span className="text-sm font-medium text-slate-700">
              Shelter Admin Panel
            </span>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <form
            onSubmit={handleSubmit}
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <div className="mb-6 flex items-start gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white">
                <Sparkles className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-950">
                  Dog Information
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  Fill in the dog details carefully.
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
                options={genderOptions}
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

            <div className="mt-5 grid gap-5 md:grid-cols-2">
              <SelectField
                label="Status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                options={statusOptions}
              />

              <InputField
                label="Health status"
                name="health"
                value={formData.health}
                onChange={handleChange}
                placeholder="e.g. Good health"
              />
            </div>

            <div className="mt-5 grid gap-5 md:grid-cols-2">
              <InputField
                label="Temperament"
                name="temperament"
                value={formData.temperament}
                onChange={handleChange}
                placeholder="e.g. calm, friendly, playful"
              />

              <SelectField
                label="Vaccinated"
                name="vaccinated"
                value={formData.vaccinated}
                onChange={handleChange}
                options={vaccinatedOptions}
              />
            </div>

            <div className="mt-5">
              <SelectField
                label="Featured"
                name="featured"
                value={formData.featured}
                onChange={handleChange}
                options={featuredOptions}
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
                Save Dog
              </button>

              <Link
                href="/dashboard/shelter-admin/dogs"
                className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-6 py-3 font-semibold text-slate-900 transition hover:bg-slate-100"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>

        {/* Side card */}
        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
            <h3 className="text-xl font-bold text-slate-950">Tips before adding</h3>

            <div className="mt-5 space-y-4 text-sm text-slate-700">
              <InfoItem icon={MapPin} text="Use the correct shelter and location" />
              <InfoItem
                icon={CalendarDays}
                text="Set the age clearly like 1 year, 2 years, etc."
              />
              <InfoItem
                icon={ShieldCheck}
                text="Mark vaccinated status correctly"
              />
              <InfoItem
                icon={HeartHandshake}
                text="Set status to Available / Pending / Fostered"
              />
            </div>
          </div>

          <div className="rounded-3xl border border-amber-200 bg-amber-50 p-6 shadow-sm">
            <h3 className="text-xl font-bold text-amber-900">What happens next?</h3>
            <p className="mt-3 text-sm leading-6 text-amber-800">
              After saving, the dog will appear in the shelter admin dogs list.
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