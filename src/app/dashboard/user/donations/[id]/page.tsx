"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Gift,
  HandCoins,
  Package,
  BadgeDollarSign,
  FileText,
  Printer,
  ShieldCheck,
  Building2,
  User,
  Mail,
  Phone,
  Loader2,
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function DonationDetailsPage() {
  const { id } = useParams();
  const [donation, setDonation] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDonation = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const res = await fetch(`${API_URL}/api/donations/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        setDonation(data);
      } catch (err) {
        console.error("Failed to fetch donation", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDonation();
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) return (
    <div className="flex h-[60vh] items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
    </div>
  );

  if (!donation) return (
    <div className="text-center py-20">
      <h2 className="text-2xl font-bold text-slate-950">Donation not found</h2>
      <Link href="/dashboard/user/donations" className="text-blue-600 mt-4 inline-block">Back to My Donations</Link>
    </div>
  );

  const getStatusClass = (status: string) => {
    switch (status) {
      case "Pending":
        return "bg-amber-100 text-amber-700";
      case "Approved":
      case "Received":
        return "bg-emerald-100 text-emerald-700";
      case "Rejected":
        return "bg-red-100 text-red-700";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center print:hidden">
        <Link
          href="/dashboard/user/donations"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-slate-950"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to My Donations
        </Link>
        <button 
          onClick={handlePrint}
          className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 transition"
        >
          <Printer className="h-4 w-4" />
          Print Receipt
        </button>
      </div>

      <div className="overflow-hidden rounded-[40px] border border-slate-200 bg-white shadow-xl">
        {/* Receipt Header */}
        <div className="bg-slate-950 p-10 text-white flex flex-col md:flex-row justify-between items-start gap-6">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-full bg-amber-500 flex items-center justify-center">
                <PawPrint className="h-6 w-6 text-slate-950" />
              </div>
              <span className="text-xl font-black tracking-tighter uppercase">Street<span className="text-amber-500 font-black">2</span>Home</span>
            </div>
            <h1 className="text-4xl font-black tracking-tight">Official Receipt</h1>
            <p className="text-slate-400 mt-2">Thank you for your generous contribution.</p>
          </div>
          
          <div className="text-left md:text-right">
            <span className={`inline-block rounded-full px-4 py-1 text-xs font-black uppercase tracking-widest ${getStatusClass(donation.status)}`}>
              {donation.status}
            </span>
            <p className="text-sm text-slate-400 mt-4 uppercase font-bold tracking-tighter">Receipt No.</p>
            <p className="text-lg font-mono">{donation._id.substring(donation._id.length - 8).toUpperCase()}</p>
          </div>
        </div>

        <div className="p-10">
          <div className="grid gap-10 md:grid-cols-2">
            {/* Donor Info */}
            <div className="space-y-6">
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Donor Information</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-slate-700">
                    <User className="h-4 w-4 text-slate-300" />
                    <span className="font-bold">{donation.donorName}</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-700">
                    <Mail className="h-4 w-4 text-slate-300" />
                    <span className="text-sm">{donation.donorEmail}</span>
                  </div>
                  {donation.phone && (
                    <div className="flex items-center gap-3 text-slate-700">
                      <Phone className="h-4 w-4 text-slate-300" />
                      <span className="text-sm">{donation.phone}</span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Supported Shelter</h3>
                <div className="flex items-center gap-3 text-slate-700">
                  <Building2 className="h-4 w-4 text-slate-300" />
                  <span className="font-bold">{donation.shelter || 'General Rescue Fund'}</span>
                </div>
              </div>
            </div>

            {/* Donation Details */}
            <div className="rounded-3xl bg-slate-50 p-8 border border-slate-100">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Summary</h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm border-b border-slate-200 pb-4">
                  <span className="text-slate-500">Donation Type</span>
                  <span className="font-bold text-slate-950">{donation.type}</span>
                </div>
                <div className="flex justify-between items-center text-sm border-b border-slate-200 pb-4">
                  <span className="text-slate-500">Date</span>
                  <span className="font-bold text-slate-950">{new Date(donation.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-lg font-bold text-slate-950">Grand Total</span>
                  <div className="text-right">
                    <p className="text-3xl font-black text-slate-950">
                      {donation.type === 'Cash' ? `EGP ${donation.value}` : donation.type}
                    </p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Inclusive of care & support</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 pt-10 border-t border-slate-100">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Notes</h3>
            <p className="text-slate-600 bg-slate-50 p-6 rounded-2xl italic">
              "{donation.notes || 'Your donation helps us provide food, medical care, and safe shelters for rescued dogs across the country.'}"
            </p>
          </div>

          <div className="mt-12 flex flex-col md:flex-row justify-between items-center gap-6 opacity-60">
             <div className="flex items-center gap-3">
                <ShieldCheck className="h-10 w-10 text-emerald-600" />
                <div>
                   <p className="text-sm font-bold text-slate-900 leading-tight">Verified Donation</p>
                   <p className="text-[10px] text-slate-500">Processed by Street2Home Security</p>
                </div>
             </div>
             <div className="text-right">
                <img src="/signature.png" alt="" className="h-12 invert brightness-0 mb-2 opacity-20" />
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Shelter Admin Signature</p>
             </div>
          </div>
        </div>
      </div>

      <div className="text-center text-slate-400 text-xs py-10 print:hidden">
        <p>© 2026 Street2Home Rescue Network. This is an automatically generated receipt.</p>
      </div>

      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-receipt, .print-receipt * {
            visibility: visible;
          }
          .print-receipt {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .print\\:hidden {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}

function TimelineItem({
  title,
  description,
  active,
}: {
  title: string;
  description: string;
  active: boolean;
}) {
  return (
    <div className="flex items-start gap-3">
      <div
        className={`mt-1 flex h-5 w-5 items-center justify-center rounded-full ${
          active ? "bg-emerald-500" : "bg-slate-300"
        }`}
      >
        {active ? (
          <CheckCircle2 className="h-3.5 w-3.5 text-white" />
        ) : (
          <Clock3 className="h-3.5 w-3.5 text-white" />
        )}
      </div>

      <div>
        <p className="font-semibold text-slate-950">{title}</p>
        <p className="text-sm text-slate-600">{description}</p>
      </div>
    </div>
  );
}

function PawPrint(props: any) {
    return (
      <svg
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="11" cy="5" r="2" />
        <circle cx="18" cy="9" r="2" />
        <circle cx="7" cy="9" r="2" />
        <circle cx="14" cy="5" r="2" />
        <path d="M12 13c-4 0-6 2-6 6 0 2.2 1.8 4 4 4h4c2.2 0 4-1.8 4-4 0-4-2-6-6-6Z" />
      </svg>
    )
  }