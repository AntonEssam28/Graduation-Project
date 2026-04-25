"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: string[];
  permission?: string; // e.g., 'shelters', 'users', 'dogs'
}

export default function ProtectedRoute({ children, allowedRoles, permission }: ProtectedRouteProps) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");
      const userStr = localStorage.getItem("user");

      if (!token || !userStr) {
        router.push("/signin");
        return;
      }

      try {
        const user = JSON.parse(userStr);

        // 1. Fetch Global Settings First (For Maintenance Mode & Permissions)
        const settingsRes = await fetch(`${API_URL}/api/settings`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const settings = await settingsRes.json();

        // 2. Global Maintenance Check (Bypasses even role checks if active, except for Super Admin)
        if (settings.isMaintenanceMode && user.role !== 'Super Admin') {
          router.push('/maintenance');
          return;
        }

        // 3. Direct role match
        if (allowedRoles && allowedRoles.includes(user.role)) {
          setIsAuthorized(true);
          return;
        }

        // 4. Dynamic Permission Check
        if (permission) {
          const roleKey = user.role === 'Shelter Admin' ? 'shelterAdmin' : 
                        user.role === 'Super Admin' ? 'superAdmin' : 'user';
          const permKey = `${roleKey}_${permission}`;
          if (settings[permKey] === true) {
            setIsAuthorized(true);
            return;
          }
        }

        // 5. If no specific restrictions provided (empty allowedRoles/permission), authorize logged in user
        if (!allowedRoles && !permission) {
          setIsAuthorized(true);
          return;
        }

        // 6. Fallback: Unauthorized redirection
        if (user.role === "Super Admin") {
          router.push("/dashboard/super-admin");
        } else if (user.role === "Shelter Admin") {
          router.push("/dashboard/shelter-admin");
        } else {
          router.push("/dashboard/user");
        }
        
      } catch (error) {
        console.error("Auth error:", error);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        router.push("/signin");
      }
    };

    checkAuth();
  }, [router, allowedRoles, permission]);

  if (!isAuthorized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-slate-900 border-t-transparent mx-auto"></div>
          <p className="text-slate-600 font-medium italic">Synchronizing with Platform Standards...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
