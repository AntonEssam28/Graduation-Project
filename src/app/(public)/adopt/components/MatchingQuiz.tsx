"use client";

import type { FormEvent } from "react";
import { CalendarDays, Dog, HeartHandshake, Home, Sparkles, Users } from "lucide-react";

export type QuizAnswers = {
  homeType: string;
  hasKids: string;
  hasPets: string;
  activityLevel: string;
  experienceLevel: string;
  dailyTime: string;
  dogPreference: string;
};

type MatchingQuizProps = {
  answers: QuizAnswers;
  onChange: (field: keyof QuizAnswers, value: string) => void;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
};

const homeTypeOptions = ["Apartment", "House", "Villa", "Shared place"];
const yesNoOptions = ["Yes", "No"];
const activityOptions = ["Low", "Medium", "High"];
const experienceOptions = ["First time", "Some experience", "Experienced"];
const timeOptions = ["Less than 1 hour", "1-2 hours", "3+ hours"];
const dogPreferenceOptions = ["Any", "Calm", "Playful", "Active", "Social"];

export default function MatchingQuiz({
  answers,
  onChange,
  onSubmit,
}: MatchingQuizProps) {
  return (
    <form
      onSubmit={onSubmit}
      className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <div className="mb-6 flex items-start gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white">
          <Sparkles className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-950">Smart Dog Matching Quiz</h2>
          <p className="mt-1 text-sm text-slate-600">
            Answer a few questions and we&apos;ll recommend dogs that fit your lifestyle.
          </p>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <QuestionSelect
          icon={Home}
          label="Home type"
          value={answers.homeType}
          options={homeTypeOptions}
          onChange={(value) => onChange("homeType", value)}
        />

        <QuestionSelect
          icon={Users}
          label="Do you have kids?"
          value={answers.hasKids}
          options={yesNoOptions}
          onChange={(value) => onChange("hasKids", value)}
        />

        <QuestionSelect
          icon={HeartHandshake}
          label="Do you have other pets?"
          value={answers.hasPets}
          options={yesNoOptions}
          onChange={(value) => onChange("hasPets", value)}
        />

        <QuestionSelect
          icon={Dog}
          label="Your activity level"
          value={answers.activityLevel}
          options={activityOptions}
          onChange={(value) => onChange("activityLevel", value)}
        />

        <QuestionSelect
          icon={Sparkles}
          label="Dog experience"
          value={answers.experienceLevel}
          options={experienceOptions}
          onChange={(value) => onChange("experienceLevel", value)}
        />

        <QuestionSelect
          icon={CalendarDays}
          label="Daily time for the dog"
          value={answers.dailyTime}
          options={timeOptions}
          onChange={(value) => onChange("dailyTime", value)}
        />

        <div className="md:col-span-2">
          <QuestionSelect
            icon={Dog}
            label="Preferred dog personality"
            value={answers.dogPreference}
            options={dogPreferenceOptions}
            onChange={(value) => onChange("dogPreference", value)}
          />
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="submit"
          className="inline-flex items-center justify-center rounded-xl bg-slate-950 px-6 py-3 font-semibold text-white transition hover:bg-slate-800"
        >
          Find My Match
        </button>

        <p className="text-sm text-slate-500">
          This matching is based on smart rules for now and can later be upgraded to AI.
        </p>
      </div>
    </form>
  );
}

function QuestionSelect({
  icon: Icon,
  label,
  value,
  options,
  onChange,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
        <Icon className="h-4 w-4 text-slate-500" />
        {label}
      </label>

      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-slate-950"
        required
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