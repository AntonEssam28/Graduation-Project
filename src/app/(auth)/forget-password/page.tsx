"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";

import AuthCard from "@/components/auth/AuthCard";
import AuthInput from "@/components/auth/AuthInput";
import AuthButton from "@/components/auth/AuthButton";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const response = await fetch(`${API_URL}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });

      const data = await response.json();
      setLoading(false);

      if (response.ok) {
        localStorage.setItem("resetEmail", email);
        if (data.developmentCode) {
          console.log("TESTING CODE:", data.developmentCode);
          alert(`Verification code sent! (Dev Mode: ${data.developmentCode})`);
        } else {
          alert("Verification code sent! Check your email.");
        }
        window.location.href = "/verify-code";
      } else {
        alert(data.message || "Failed to send verification code");
      }
    } catch (error) {
      console.error(error);
      setLoading(false);
      alert("Network error, please try again.");
    }
  };

  return (
    <AuthCard
      title="Forgot password"
      description="Enter your email and we&apos;ll send you a reset link."
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <AuthInput
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          required
        />

        <AuthButton type="submit">Send Code</AuthButton>
      </form>

      <p className="mt-6 text-center text-sm text-slate-600">
        Back to{" "}
        <Link href="/signin" className="font-semibold text-slate-900 hover:underline">
          sign in
        </Link>
      </p>
    </AuthCard>
  );
}