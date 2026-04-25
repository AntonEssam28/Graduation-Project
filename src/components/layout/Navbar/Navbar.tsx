"use client";

import { useState, useEffect } from "react";
// Manual JWT decode (no external library)
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  PawPrint,
  UserRound,
  ShoppingCart,
  LogIn,
  UserPlus,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/dog", label: "Dogs" },
  { href: "/adopt", label: "Adopt" },
  { href: "/host", label: "Host" },
  { href: "/report", label: "Report" },
  { href: "/donate", label: "Donate" },
  { href: "/store", label: "Store" },
  { href: "/clinic", label: "Clinic" },
];

export default function Navbar() {
  // Helper to decode JWT payload without external lib
  const decodeToken = (token: string) => {
    try {
      const payload = token.split('.')[1];
      const decoded = JSON.parse(atob(payload));
      return decoded;
    } catch (e) {
      console.error('Failed to decode token', e);
      return {} as any;
    }
  };

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');
  const [userRole, setUserRole] = useState('');

  // Check token on mount / when token changes
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = decodeToken(token) as { name?: string; email?: string; role?: string };
        setUserName(decoded.name || decoded.email || 'User');
        setUserRole(decoded.role || 'User');
        setIsLoggedIn(true);
      } catch (e) {
        console.error('Invalid token', e);
        setIsLoggedIn(false);
        setUserName('');
        setUserRole('');
      }
    } else {
      setIsLoggedIn(false);
      setUserName('');
      setUserRole('');
    }
  }, []);

  const getDashboardPath = (role: string) => {
    switch (role) {
      case "Super Admin":
        return "/dashboard/super-admin";
      case "Shelter Admin":
        return "/dashboard/shelter-admin";
      default:
        return "/dashboard/user";
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    setUserName('');
    setUserRole('');
    // Optionally redirect to home
    window.location.href = '/';
  };
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-slate-900">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-white">
            <PawPrint className="h-5 w-5" />
          </div>
          <span className="text-lg">Street2Home</span>
        </Link>

        {/* Desktop Links */}
        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive(link.href)
                  ? "bg-slate-900 text-white"
                  : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden items-center gap-3 md:flex">
          {/* Cart */}
          <Link
            href="/cart"
            className={cn(
              "inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-700 transition hover:bg-slate-100 hover:text-slate-950",
              pathname === "/cart" ? "bg-slate-900 text-white hover:bg-slate-800 hover:text-white" : ""
            )}
            aria-label="Cart"
          >
            <ShoppingCart className="h-5 w-5" />
          </Link>

          {/* User dropdown */}
          <div className="relative group">
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-700 transition-colors duration-200 hover:bg-slate-200 hover:text-slate-900 hover:scale-105"
              aria-label="Account"
            >
              <UserRound className="h-5 w-5" />
            </button>

            <div className="invisible absolute right-0 top-full z-50 mt-2 w-48 rounded-2xl border border-slate-200 bg-white p-2 shadow-lg opacity-0 transition-all duration-150 group-hover:visible group-hover:opacity-100">
              {isLoggedIn ? (
                <>
                  <div className="px-3 py-2 border-b border-slate-100 mb-1">
                    <p className="text-sm font-medium text-slate-900 truncate">
                      {userName}
                    </p>
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                      {userRole}
                    </p>
                  </div>
                  <Link
                    href={getDashboardPath(userRole)}
                    className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-slate-950"
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/change-password"
                    className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-slate-950"
                  >
                    Change password
                  </Link>
                  <Link
                    href="/update-profile"
                    className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-slate-950"
                  >
                    Update profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
                  >
                    Log out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/signin"
                    className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-slate-950"
                  >
                    <LogIn className="h-4 w-4" /> Sign in
                  </Link>
                  <Link
                    href="/signup"
                    className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-slate-950"
                  >
                    <UserPlus className="h-4 w-4" /> Sign up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="inline-flex items-center justify-center rounded-md p-2 text-slate-700 hover:bg-slate-100 md:hidden"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="border-t bg-white md:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive(link.href)
                    ? "bg-slate-900 text-white"
                    : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                )}
              >
                {link.label}
              </Link>
            ))}

            <div className="mt-3 grid grid-cols-2 gap-3">
              <Button variant="outline" asChild>
                <Link href="/cart" onClick={() => setMobileOpen(false)} className="inline-flex items-center gap-2">
                  <ShoppingCart className="h-4 w-4" />
                  Cart
                </Link>
              </Button>

              {isLoggedIn ? (
                <>
                  <Button variant="outline" asChild>
                    <Link href={getDashboardPath(userRole)} onClick={() => setMobileOpen(false)}>
                      Dashboard
                    </Link>
                  </Button>
                  <Button
                    variant="destructive"
                    className="col-span-2"
                    onClick={() => {
                      handleLogout();
                      setMobileOpen(false);
                    }}
                  >
                    Log out
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" asChild>
                    <Link href="/signin" onClick={() => setMobileOpen(false)} className="inline-flex items-center gap-2">
                      <LogIn className="h-4 w-4" />
                      Sign in
                    </Link>
                  </Button>

                  <Button asChild className="col-span-2">
                    <Link href="/signup" onClick={() => setMobileOpen(false)} className="inline-flex items-center justify-center gap-2">
                      <UserPlus className="h-4 w-4" />
                      Sign up
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}