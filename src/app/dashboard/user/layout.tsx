import type { ReactNode } from "react";
import Sidebar from "@/components/layout/Sidebar/Sidebar";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

export default function UserDashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <ProtectedRoute>
      <div className="flex min-h-screen">
        <Sidebar role="user" />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </ProtectedRoute>
  );
}