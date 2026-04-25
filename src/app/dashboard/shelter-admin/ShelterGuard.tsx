"use client";

import { useEffect, useState, type ReactNode } from "react";
import { 
  ShieldAlert, 
  Loader2, 
  Send, 
  CheckCircle2, 
  ChevronRight, 
  LogOut 
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function ShelterGuard({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<string>("Loading");
  const [shelterName, setShelterName] = useState("");
  const [requestSent, setRequestSent] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const checkStatus = async () => {
      const userStr = localStorage.getItem("user");
      const token = localStorage.getItem("token");
      if (!userStr || !token) return;

      const user = JSON.parse(userStr);
      setShelterName(user.assignedShelter);

      if (!user.assignedShelter) {
        setStatus("Active"); // Fallback for admins without shelter
        return;
      }

      try {
        const res = await fetch(`${API_URL}/api/shelters?name=${encodeURIComponent(user.assignedShelter)}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setStatus(data[0].status);
        } else {
          setStatus("Active");
        }
      } catch (err) {
        console.error("Failed to check shelter status", err);
        setStatus("Active");
      }
    };

    checkStatus();
  }, []);

  const handleRequestActivation = async () => {
    setSending(true);
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(`${API_URL}/api/requests`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({
          requesterName: user.name,
          requesterEmail: user.email,
          requesterPhone: user.phone || "N/A",
          type: "Activation",
          shelter: shelterName,
          message: "Shelter admin requested re-activation of the suspended shelter."
        })
      });
      if (res.ok) setRequestSent(true);
    } catch (err) {
      alert("Error sending request");
    } finally {
      setSending(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/signin";
  };

  if (status === "Loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-blue-600 mx-auto" />
          <p className="mt-4 text-slate-600 font-bold">Verifying shelter status...</p>
        </div>
      </div>
    );
  }

  if (status === "Suspended") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-900 p-6">
        <div className="max-w-xl w-full bg-white rounded-[40px] p-10 shadow-2xl overflow-hidden relative border border-slate-200">
          <div className="absolute top-0 left-0 w-full h-2 bg-red-500" />
          
          <div className="text-center">
            <div className="inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-red-50 text-red-500 mb-6">
              <ShieldAlert className="h-10 w-10" />
            </div>

            <h1 className="text-4xl font-black text-slate-950 tracking-tight mb-4">
              Shelter Deactivated
            </h1>
            
            <p className="text-slate-600 leading-relaxed text-lg mb-8">
              Your shelter <span className="font-bold text-slate-900">"{shelterName}"</span> has been suspended by the administration. Access to your dashboard is restricted until reactivation.
            </p>

            <div className="space-y-4">
              {requestSent ? (
                <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-3xl flex items-center gap-4 text-left">
                  <div className="h-10 w-10 shrink-0 bg-emerald-500 rounded-full flex items-center justify-center text-white">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-emerald-900 text-lg">Request Sent!</h3>
                    <p className="text-emerald-700 text-sm">Wait for Super Admin approval.</p>
                  </div>
                </div>
              ) : (
                <button
                  onClick={handleRequestActivation}
                  disabled={sending}
                  className="w-full flex items-center justify-center gap-3 bg-blue-600 text-white rounded-2xl py-5 font-black text-lg hover:bg-blue-700 transition transform hover:-translate-y-1 shadow-xl shadow-blue-100 disabled:opacity-50"
                >
                  {sending ? <Loader2 className="h-6 w-6 animate-spin" /> : <Send className="h-6 w-6" />}
                  Request Reactivation
                </button>
              )}

              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-3 bg-slate-100 text-slate-700 rounded-2xl py-4 font-bold hover:bg-slate-200 transition"
              >
                <LogOut className="h-5 w-5" />
                Sign Out
              </button>
            </div>

            <div className="mt-8 pt-8 border-t border-slate-100 flex items-center justify-center gap-2 text-slate-400 text-sm font-medium">
              <ChevronRight className="h-4 w-4" />
              Need help? Contact support@pawcare.com
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
