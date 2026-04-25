"use client";

import Link from "next/link";
import { useState, useEffect, type FormEvent } from "react";
import AuthCard from "@/components/auth/AuthCard";
import AuthInput from "@/components/auth/AuthInput";
import AuthButton from "@/components/auth/AuthButton";

export default function ChangePasswordPage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  useEffect(() => {
    // Basic check to see if user is logged in
    if (!localStorage.getItem("token")) {
      window.location.href = "/signin";
    }
  }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const response = await fetch(`${API_URL}/api/auth/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword,
          newPassword: password
        })
      });

      const data = await response.json();

      if (response.ok) {
        alert("Password updated successfully!");
        setCurrentPassword("");
        setPassword("");
        setConfirmPassword("");
        window.location.href = "/";
      } else {
        alert(data.message || "Failed to update password");
      }
    } catch (error) {
      console.error("Change password error:", error);
      alert("An error occurred. Please try again.");
    }
  };

  return (
    <AuthCard
      title="Change password"
      description="Choose a new password for your account."
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <AuthInput
          label="Current password"
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          placeholder="Enter current password"
          required
        />

        <AuthInput
          label="New password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter new password"
          required
        />

        <AuthInput
          label="Confirm new password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Confirm new password"
          required
        />

        <AuthButton type="submit">Update password</AuthButton>
      </form>

      <p className="mt-6 text-center text-sm text-slate-600">
        Back to{" "}
        <Link href="/" className="font-semibold text-slate-900 hover:underline">
          home
        </Link>
      </p>
    </AuthCard>
  );
}