"use client";

import Link from "next/link";
import { useState, useEffect, type FormEvent } from "react";

import AuthCard from "@/components/auth/AuthCard";
import AuthInput from "@/components/auth/AuthInput";
import AuthButton from "@/components/auth/AuthButton";

export default function VerifyCodePage() {
  const [code, setCode] = useState("");
  const [email, setEmail] = useState("");
  const [isVerified, setIsVerified] = useState(false);

  // Stage 2 state
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedEmail = localStorage.getItem("resetEmail");
    if (!savedEmail) {
      window.location.href = "/forget-password";
    } else {
      setEmail(savedEmail);
    }
  }, []);

  const handleVerifyCode = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/auth/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code })
      });

      const data = await response.json();
      setLoading(false);

      if (response.ok) {
        setIsVerified(true);
      } else {
        alert(data.message || "Invalid or expired code");
      }
    } catch (error) {
      console.error(error);
      setLoading(false);
      alert("Network error. Please try again.");
    }
  };

  const handleResetPassword = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code, newPassword: password })
      });

      const data = await response.json();
      setLoading(false);

      if (response.ok) {
        alert("Password reset successfully! Please sign in with your new password.");
        localStorage.removeItem("resetEmail");
        window.location.href = "/signin";
      } else {
        alert(data.message || "Failed to reset password");
      }
    } catch (error) {
      console.error(error);
      setLoading(false);
      alert("Network error. Please try again.");
    }
  };

  if (isVerified) {
    return (
      <AuthCard
        title="Create new password"
        description="Your code was verified. Please enter your new password below."
      >
        <form onSubmit={handleResetPassword} className="space-y-5">
          <AuthInput
            label="New password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Create a password"
            required
          />

          <AuthInput
            label="Confirm password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm your password"
            required
          />

          <AuthButton type="submit" disabled={loading}>
            {loading ? "Resetting..." : "Reset Password"}
          </AuthButton>
        </form>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Verify code"
      description="Enter the 6-digit code sent to your email."
    >
      <form onSubmit={handleVerifyCode} className="space-y-5">
        <AuthInput
          label="Verification code"
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Enter code"
          maxLength={6}
          required
        />

        <AuthButton type="submit" disabled={loading}>
          {loading ? "Verifying..." : "Verify"}
        </AuthButton>
      </form>

      <p className="mt-6 text-center text-sm text-slate-600">
        Didn&apos;t receive it?{" "}
        <Link href="/forget-password" className="font-semibold text-slate-900 hover:underline">
          Go back & block request again
        </Link>
      </p>
    </AuthCard>
  );
}