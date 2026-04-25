"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  PawPrint,
  LayoutDashboard,
  Dog,
  HeartHandshake,
  Users,
  ShieldCheck,
  FileText,
  Package,
  HandCoins,
  Settings,
  LogOut,
  ShoppingBag,
  Building2,
  AlertTriangle,
  Stethoscope,
} from "lucide-react";

import { cn } from "@/lib/utils";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

type Role = "user" | "shelter-admin" | "super-admin";

type SidebarProps = {
  role?: Role;
};

export default function Sidebar({ role = "user" }: SidebarProps) {
  const pathname = usePathname();
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetch(`${API_URL}/api/settings`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => setSettings(data))
      .catch(console.error);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/signin";
  };

  // Helper to map UI role to internal settings role key
  const roleKey = role === 'shelter-admin' ? 'shelterAdmin' : role === 'super-admin' ? 'superAdmin' : 'user';

  const checkPermission = (perm: string) => {
    if (!settings) return false; 
    const permKey = `${roleKey}_${perm}`;
    // For super-admin role, we generally show everything unless explicitly false (unlikely for super-admin)
    if (role === 'super-admin') return true;
    return settings[permKey] === true; 
  };

  const getLinks = () => {
    // 1. Start with their own role's core links
    let links: any[] = [];

    if (role === 'super-admin') {
      links = [
        { href: "/dashboard/super-admin", label: "Overview", icon: LayoutDashboard },
        { href: "/dashboard/super-admin/shelters", label: "Shelters", icon: ShieldCheck },
        { href: "/dashboard/super-admin/users", label: "Users", icon: Users },
        { href: "/dashboard/super-admin/dog", label: "Dogs Management", icon: Dog },
        { href: "/dashboard/super-admin/requests", label: "System Requests", icon: HeartHandshake },
        { href: "/dashboard/super-admin/donations", label: "Donations", icon: HandCoins },
        { href: "/dashboard/super-admin/settings", label: "Platform Settings", icon: Settings },
      ];
      return links;
    }

    if (role === 'shelter-admin') {
      links = [
        { href: "/dashboard/shelter-admin", label: "Dashboard", icon: LayoutDashboard },
        { href: "/dashboard/shelter-admin/dogs", label: "My Dogs", icon: Dog },
        { href: "/dashboard/shelter-admin/reports", label: "Reports", icon: FileText },
        { href: "/dashboard/shelter-admin/requests", label: "Requests", icon: HeartHandshake },
        { href: "/dashboard/shelter-admin/clinic", label: "My Clinic", icon: Stethoscope },
        { href: "/dashboard/shelter-admin/clinic-requests", label: "Clinic Requests", icon: HeartHandshake },
        { href: "/dashboard/shelter-admin/orders", label: "Store Orders", icon: ShoppingBag },
        { href: "/dashboard/shelter-admin/supplies", label: "Supplies", icon: Package },
        { href: "/dashboard/shelter-admin/store", label: "My Store", icon: ShoppingBag },
        { href: "/dashboard/shelter-admin/staff", label: "Shelter Team", icon: Users },
        { href: "/dashboard/shelter-admin/settings", label: "Shelter Settings", icon: Settings },
      ];
    } else {
      // Basic User links
      links = [
        { href: "/dashboard/user", label: "Dashboard", icon: LayoutDashboard },
        { href: "/dashboard/user/requests", label: "My Requests", icon: FileText },
        { href: "/dashboard/user/donations", label: "My Donations", icon: HandCoins },
        { href: "/dashboard/user/orders", label: "My Orders", icon: ShoppingBag },
        { href: "/dashboard/user/requests/new-shelter", label: "Join as Shelter", icon: Building2 },
        { href: "/dashboard/user/profile", label: "My Profile", icon: Settings },
      ];
    }

    // 2. Add "Admin Power" links if the role permissions allow it
    // These act as "Cross-Role" permissions
    
    // Check if they should see Super Admin modules
    if (checkPermission('shelters')) {
      links.push({ href: "/dashboard/super-admin/shelters", label: "Manage Shelters", icon: ShieldCheck, isExtra: true });
    }
    if (checkPermission('users')) {
      links.push({ href: "/dashboard/super-admin/users", label: "Manage Users", icon: Users, isExtra: true });
    }
    if (checkPermission('dogs') && role === 'user') {
       // If user has 'dogs' permission, they can see global dog management
       links.push({ href: "/dashboard/super-admin/dog", label: "Manage Dogs", icon: Dog, isExtra: true });
    }
    if (checkPermission('reports') && role === 'user') {
       // If user has 'reports' permission, they can see global reports management
       links.push({ href: "/dashboard/super-admin/reports", label: "Manage Reports", icon: AlertTriangle, isExtra: true });
    }
    if (checkPermission('donations') && role === 'user') {
       // If user has donation permission they might see the super admin view
       links.push({ href: "/dashboard/super-admin/donations", label: "Platform Donations", icon: HandCoins, isExtra: true });
    }

    return links;
  };

  const links = getLinks();

  return (
    <aside className="flex h-screen w-72 flex-col border-r bg-white">
      {/* Brand */}
      <div className="flex items-center gap-3 border-b px-6 py-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-white shadow-lg">
          <PawPrint className="h-5 w-5" />
        </div>
        <div>
          <h2 className="font-bold text-slate-900">Street2Home</h2>
          <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">{role.replace("-", " ")}</p>
        </div>
      </div>

      {/* Links */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <div className="space-y-1">
          {links.map((link, idx) => {
            const Icon = link.icon;
            const active = pathname === link.href;

            return (
              <Link
                key={link.href + idx}
                href={link.href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200",
                  active
                    ? "bg-slate-950 text-white shadow-md shadow-slate-200"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-950",
                  link.isExtra && !active ? "border-l-2 border-emerald-500 bg-emerald-50/20" : ""
                )}
              >
                <Icon className={cn("h-4 w-4", link.isExtra && !active ? "text-emerald-600" : "")} />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Bottom */}
      <div className="border-t p-4">
        <button 
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-red-600 transition-colors hover:bg-red-50"
        >
          <LogOut className="h-4 w-4" />
          <span>Logout Session</span>
        </button>
      </div>
    </aside>
  );
}