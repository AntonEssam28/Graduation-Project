"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Dog,
  HeartHandshake,
  PawPrint,
  ShieldCheck,
  Sparkles,
  Star,
  Loader2,
} from "lucide-react";

import MatchingQuiz, { type QuizAnswers } from "./components/MatchingQuiz";
import RecommendedDog from "./components/RecommendedDog";
import AdoptionForm from "./components/AdaptionForm";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

type DogProfile = {
  _id: string;
  name: string;
  breed: string;
  age: number;
  shelter: string;
  sex: string;
  size: string;
  notes: string;
  photo?: string;
};

type Recommendation = DogProfile & {
  score: number;
  matchLabel: "Best Match" | "Great Match" | "Good Match" | "Possible Match";
  reasons: string[];
};

const initialAnswers: QuizAnswers = {
  homeType: "",
  hasKids: "",
  hasPets: "",
  activityLevel: "",
  experienceLevel: "",
  dailyTime: "",
  dogPreference: "",
};

function getMatchLabel(score: number): Recommendation["matchLabel"] {
  if (score >= 40) return "Best Match";
  if (score >= 25) return "Great Match";
  if (score >= 10) return "Good Match";
  return "Possible Match";
}

function scoreDog(dog: DogProfile, answers: QuizAnswers): Recommendation {
  let score = 0;
  const reasons: string[] = [];

  // Very simplified scoring for real data
  if (answers.experienceLevel === "First time") {
    score += 10;
    reasons.push("Safe choice for beginners");
  }

  if (answers.hasKids === "Yes") {
    score += 10;
    reasons.push("Good with kids");
  }

  if (dog.size === "Small" && answers.homeType === "Apartment") {
    score += 20;
    reasons.push("Fits apartment lifestyle");
  }

  if (reasons.length === 0) {
    reasons.push("Interested in meeting you");
  }

  return {
    ...dog,
    score,
    matchLabel: getMatchLabel(score),
    reasons: Array.from(new Set(reasons)).slice(0, 2),
  };
}

export default function AdoptPage() {
  const [dogs, setDogs] = useState<DogProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState<QuizAnswers>(initialAnswers);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [selectedDog, setSelectedDog] = useState<Recommendation | null>(null);
  const [hasMatched, setHasMatched] = useState(false);

  useEffect(() => {
    const fetchDogs = async () => {
      try {
        const res = await fetch(`${API_URL}/api/dogs`);
        const data = await res.json();
        setDogs(Array.isArray(data) ? data : (data.data || []));
      } catch (err) {
        console.error("Failed to fetch dogs", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDogs();
  }, []);

  const handleAnswerChange = (field: keyof QuizAnswers, value: string) => {
    setAnswers((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleFindMatches = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const results = dogs
      .map((dog) => scoreDog(dog, answers))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);

    setRecommendations(results);
    setSelectedDog(results[0] ?? null);
    setHasMatched(true);
  };

  const handleReset = () => {
    setAnswers(initialAnswers);
    setRecommendations([]);
    setSelectedDog(null);
    setHasMatched(false);
  };

  if (loading) return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Loader2 className="h-10 w-10 animate-spin text-slate-400" />
    </div>
  );

  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="bg-slate-950 text-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-20">
          <div className="flex flex-col justify-center">
            <div className="mb-4 inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200">
              <PawPrint className="h-4 w-4 text-emerald-400" />
              Smart adoption matching
            </div>

            <h1 className="text-4xl font-bold leading-tight sm:text-5xl tracking-tight">
              Find the best dog for your home
            </h1>

            <p className="mt-5 max-w-xl text-base leading-7 text-slate-400 italic">
              "A dog is the only thing on earth that loves you more than he loves himself." — Josh Billings
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/dog"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-8 py-4 font-bold text-slate-950 transition hover:bg-slate-100"
              >
                Browse Gallery
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="flex items-center justify-center">
             <div className="bg-white/5 border border-white/10 p-10 rounded-[40px] backdrop-blur-sm w-full max-w-md">
                <h3 className="text-2xl font-bold mb-4">How it works</h3>
                <div className="space-y-6">
                   <Step num="1" title="Lifestyle Quiz" desc="Tell us about your home and routine." />
                   <Step num="2" title="Dog Match" desc="We recommend dogs that fit you best." />
                   <Step num="3" title="Apply" desc="Submit a request to the shelter." />
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* Main content */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <MatchingQuiz
              answers={answers}
              onChange={handleAnswerChange}
              onSubmit={handleFindMatches}
            />

            {hasMatched && (
              <div className="flex items-center justify-between rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <div className="flex items-start gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white">
                    <Star className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-950">
                      Matches Found
                    </h3>
                    <p className="text-sm text-slate-600">
                      We've identified potential friends for you.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleReset}
                  className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
                >
                  Reset
                </button>
              </div>
            )}

            {recommendations.length > 0 ? (
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-slate-950">
                    Recommended Friends
                  </h2>
                  <p className="mt-1 text-sm text-slate-600">
                    Select a dog to proceed with the application.
                  </p>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  {recommendations.map((dog) => (
                    <div 
                      key={dog._id}
                      onClick={() => setSelectedDog(dog)}
                      className={`cursor-pointer group overflow-hidden rounded-2xl border transition-all ${selectedDog?._id === dog._id ? 'border-emerald-500 ring-2 ring-emerald-100 shadow-lg scale-[1.02]' : 'border-slate-200 hover:border-slate-300 shadow-sm'}`}
                    >
                       <div className="p-5 flex gap-4">
                          <div className="h-20 w-20 rounded-xl bg-slate-100 flex items-center justify-center overflow-hidden">
                             {dog.photo ? <img src={dog.photo} alt={dog.name} className="h-full w-full object-cover" /> : <Dog className="h-10 w-10 text-slate-300" />}
                          </div>
                          <div>
                             <h4 className="font-bold text-slate-900">{dog.name}</h4>
                             <p className="text-xs text-blue-600 font-bold uppercase">{dog.breed}</p>
                             <div className="mt-2 inline-flex px-2 py-0.5 rounded-full bg-slate-100 text-[10px] font-black uppercase text-slate-500 tracking-tighter">
                                {dog.matchLabel}
                             </div>
                          </div>
                       </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-12 text-center">
                <Dog className="mx-auto h-12 w-12 text-slate-400" />
                <h3 className="mt-4 text-xl font-bold text-slate-950">
                  Ready to start?
                </h3>
                <p className="mt-2 text-sm text-slate-600">
                  Complete the quiz on the left to find your perfect match.
                </p>
              </div>
            )}

            {selectedDog ? (
              <AdoptionForm
                selectedDogId={selectedDog._id}
                selectedDogName={selectedDog.name}
                selectedDogBreed={selectedDog.breed}
                selectedDogLocation={selectedDog.shelter}
              />
            ) : (
              <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
                <HeartHandshake className="mx-auto h-10 w-10 text-slate-200 mb-4" />
                <h3 className="text-xl font-bold text-slate-950">
                  Select a dog to continue
                </h3>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-slate-900 rounded-[32px] p-8 text-white">
               <h3 className="text-xl font-bold mb-4">Why Smart Matching?</h3>
               <p className="text-slate-400 text-sm leading-relaxed">Our system analyzes your living conditions and experience to ensure the dog goes to an environment where they can thrive.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function Step({ num, title, desc }: any) {
    return (
        <div className="flex gap-4">
           <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center font-bold">{num}</div>
           <div>
              <p className="font-bold">{title}</p>
              <p className="text-xs text-slate-400 mt-1">{desc}</p>
           </div>
        </div>
    )
}