"use client";

import {
  CalendarDays,
  Dog,
  MapPin,
  PawPrint,
  Star,
  Sparkles,
} from "lucide-react";

type RecommendedDogProps = {
  name: string;
  breed: string;
  age: string;
  location: string;
  temperament: string;
  size: string;
  energyLevel: string;
  description: string;
  matchLabel: "Best Match" | "Great Match" | "Good Match" | "Possible Match";
  score: number;
  reasons: string[];
  selected: boolean;
  onSelect: () => void;
};

export default function RecommendedDog({
  name,
  breed,
  age,
  location,
  temperament,
  size,
  energyLevel,
  description,
  matchLabel,
  score,
  reasons,
  selected,
  onSelect,
}: RecommendedDogProps) {
  return (
    <article
      className={`overflow-hidden rounded-3xl border bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg ${
        selected ? "border-slate-950 ring-2 ring-slate-950" : "border-slate-200"
      }`}
    >
      <div className="flex h-48 items-center justify-center bg-gradient-to-br from-slate-200 to-slate-100">
        <Dog className="h-16 w-16 text-slate-400" />
      </div>

      <div className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-2xl font-bold text-slate-950">{name}</h3>
            <p className="mt-1 text-sm text-slate-600">{breed}</p>
          </div>

          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
            <Star className="h-3.5 w-3.5" />
            {matchLabel}
          </span>
        </div>

        <p className="mt-4 text-sm leading-6 text-slate-600">{description}</p>

        <div className="mt-5 flex flex-wrap gap-2">
          <Tag label={temperament} icon={PawPrint} />
          <Tag label={size} icon={Sparkles} />
          <Tag label={energyLevel} icon={CalendarDays} />
        </div>

        <div className="mt-5 space-y-2 text-sm text-slate-600">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4" />
            <span>Age: {age}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            <span>{location}</span>
          </div>
        </div>

        <div className="mt-5 rounded-2xl bg-slate-50 p-4">
          <div className="mb-2 flex items-center justify-between text-sm text-slate-600">
            <span>Match score</span>
            <span className="font-semibold text-slate-950">{score}%</span>
          </div>

          <div className="h-2 rounded-full bg-slate-200">
            <div
              className="h-2 rounded-full bg-slate-950 transition-all"
              style={{ width: `${Math.min(score, 100)}%` }}
            />
          </div>

          <ul className="mt-3 space-y-1 text-sm text-slate-600">
            {reasons.map((reason) => (
              <li key={reason}>• {reason}</li>
            ))}
          </ul>
        </div>

        <button
          type="button"
          onClick={onSelect}
          className={`mt-6 inline-flex w-full items-center justify-center rounded-xl px-4 py-3 text-sm font-semibold transition ${
            selected
              ? "bg-slate-950 text-white"
              : "border border-slate-300 bg-white text-slate-900 hover:bg-slate-100"
          }`}
        >
          {selected ? "Selected" : "Choose this dog"}
        </button>
      </div>
    </article>
  );
}

function Tag({
  label,
  icon: Icon,
}: {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
      <Icon className="h-3.5 w-3.5" />
      {formatLabel(label)}
    </span>
  );
}

function formatLabel(value: string) {
  if (!value) return value;
  return value.charAt(0).toUpperCase() + value.slice(1);
}