import type { ReactNode } from "react";
import Sidebar from "@/components/layout/Sidebar/Sidebar";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

import ShelterGuard from "./ShelterGuard";

export default function ShelterAdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <ProtectedRoute>
      <ShelterGuard>
        <div className="flex min-h-screen">
          <Sidebar role="shelter-admin" />
          <main className="flex-1 p-6">{children}</main>
        </div>
      </ShelterGuard>
    </ProtectedRoute>
  );
}