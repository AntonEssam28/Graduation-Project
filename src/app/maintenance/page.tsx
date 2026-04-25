"use client";

import { Hammer, Home, LogOut } from "lucide-react";
import Link from "next/link";

export default function MaintenancePage() {
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/signin";
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-6 text-center">
      <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-slate-950 text-white shadow-2xl shadow-slate-200 animate-pulse">
        <Hammer className="h-12 w-12" />
      </div>

      <h1 className="mt-8 text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">
        Platform Maintenance
      </h1>
      
      <p className="mt-6 max-w-lg text-lg leading-relaxed text-slate-600">
        Street2Home is currently undergoing scheduled maintenance to improve our services for the street dogs. We'll be back shortly!
      </p>

      <div className="mt-10 flex flex-wrap justify-center gap-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-2xl bg-white border border-slate-200 px-8 py-4 text-sm font-bold text-slate-900 shadow-sm transition hover:bg-slate-50"
        >
          <Home className="h-5 w-5" />
          Back Home
        </Link>
        <button
          onClick={handleLogout}
          className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-8 py-4 text-sm font-bold text-white shadow-lg transition hover:bg-slate-800"
        >
          <LogOut className="h-5 w-5" />
          Logout Session
        </button>
      </div>

      <p className="mt-12 text-sm font-medium text-slate-400">
        Administrator? Please contact the lead super admin for access tokens.
      </p>
    </div>
  );
}
