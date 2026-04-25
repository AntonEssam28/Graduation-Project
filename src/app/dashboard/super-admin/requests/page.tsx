'use client';
import { useEffect, useState } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  User, 
  Mail, 
  Phone, 
  Building2, 
  Info,
  ShieldAlert,
  Loader2,
  LayoutDashboard
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function RequestsDashboard() {
  const [requests, setRequests] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/requests`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const result = await res.json();
      setRequests(Array.isArray(result) ? result : result.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleStatusUpdate = async (id: string, status: string) => {

    if (!confirm(`Are you sure you want to ${status.toLowerCase()} this request?`)) return;
    
    setProcessingId(id);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/requests/${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ status })
      });
      
      if (res.ok) {
        setRequests(requests.map((req: any) => req._id === id ? { ...req, status } : req));

      } else {
        alert('Failed to update request');
      }
    } catch (err) {
      console.error(err);
      alert('Error processing request');
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusBadge = (status: string) => {

    switch (status) {
      case 'Approved':
        return <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-700"><CheckCircle2 className="h-3 w-3" /> APPROVED</span>;
      case 'Rejected':
        return <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-2.5 py-1 text-xs font-bold text-red-700"><XCircle className="h-3 w-3" /> REJECTED</span>;
      default:
        return <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-700"><Clock className="h-3 w-3" /> PENDING</span>;
    }
  };

  const getTypeIcon = (type: string) => {

    if (type === 'Suspension') return <ShieldAlert className="h-5 w-5 text-red-500" />;
    if (type === 'Shelter Creation') return <Building2 className="h-5 w-5 text-emerald-500" />;
    return <User className="h-5 w-5 text-blue-500" />;
  };

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');

  const filteredRequests = requests.filter((req: any) => {

    const matchesSearch = req.shelter.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         req.requesterName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || req.status === statusFilter;
    const matchesType = typeFilter === 'All' || req.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700 uppercase tracking-widest">
            <LayoutDashboard className="h-3.5 w-3.5" />
            ADMINISTRATION
          </div>
          <h1 className="text-4xl font-black text-slate-950 mt-4 tracking-tight">Requests Management</h1>
          <p className="text-sm text-slate-500 mt-2">Handle Adoption, Foster, and Shelter Suspension requests from all locations.</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm grid gap-4 md:grid-cols-3">
        <div className="relative">
          <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search shelter or name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-2xl border border-slate-200 outline-none focus:border-blue-500 transition"
          />
        </div>
        <select 
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full px-4 py-3 rounded-2xl border border-slate-200 outline-none focus:border-blue-500 transition appearance-none bg-white"
        >
          <option value="All">All Statuses</option>
          <option value="Pending">Pending Only</option>
          <option value="Approved">Approved Only</option>
          <option value="Rejected">Rejected Only</option>
        </select>
        <select 
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="w-full px-4 py-3 rounded-2xl border border-slate-200 outline-none focus:border-blue-500 transition appearance-none bg-white"
        >
          <option value="All">All Types</option>
          <option value="Adoption">Adoption</option>
          <option value="Foster">Foster</option>
          <option value="Suspension">Suspension</option>
          <option value="Shelter Creation">Shelter Creation</option>
        </select>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center p-20 bg-white rounded-3xl border border-slate-200">
          <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
          <p className="mt-4 text-slate-600 font-medium">Loading requests...</p>
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="p-20 text-center bg-white rounded-3xl border border-slate-200">
          <Info className="h-12 w-12 text-slate-300 mx-auto" />
          <h3 className="mt-4 text-xl font-bold text-slate-950">No requests found</h3>
          <p className="mt-1 text-slate-500">Try adjusting your filters or search terms.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {filteredRequests.map((request) => (
            <div key={request._id} className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition group">
              <div className="flex flex-col lg:flex-row justify-between gap-6">
                <div className="space-y-4 flex-1">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-slate-100 rounded-2xl group-hover:bg-slate-200 transition">
                      {getTypeIcon(request.type)}
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-slate-950 flex items-center gap-3">
                        {request.type} Request
                        {getStatusBadge(request.status)}
                      </h3>
                      <p className="text-xs text-slate-500 font-mono">ID: {request._id}</p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 py-2">
                    <div className="flex items-center gap-2 text-slate-600">
                      <User className="h-4 w-4 text-slate-400" />
                      <span className="text-sm font-semibold">{request.requesterName}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600">
                      <Mail className="h-4 w-4 text-slate-400" />
                      <span className="text-sm">{request.requesterEmail}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600">
                      <Building2 className="h-4 w-4 text-slate-400" />
                      <span className="text-sm font-bold text-slate-800">{request.shelter}</span>
                    </div>
                  </div>

                  {request.message && (
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      <p className="text-sm text-slate-600 italic">"{request.message}"</p>
                    </div>
                  )}

                  {request.type === 'Shelter Creation' && request.shelterData && (
                    <div className="mt-4 grid gap-4 p-5 rounded-2xl border border-emerald-100 bg-emerald-50/30 md:grid-cols-2">
                       <div className="space-y-1">
                          <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Proposed Shelter Name</p>
                          <p className="text-sm font-black text-slate-900 uppercase">{request.shelterData.name}</p>
                       </div>
                       <div className="space-y-1">
                          <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Contact Phone</p>
                          <p className="text-sm font-semibold text-slate-900">{request.shelterData.phone}</p>
                       </div>
                       <div className="space-y-1">
                          <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Location</p>
                          <p className="text-sm font-medium text-slate-800">{request.shelterData.city}, {request.shelterData.address}</p>
                       </div>
                       <div className="space-y-1 md:col-span-2">
                          <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Description</p>
                          <p className="text-sm text-slate-700 leading-relaxed">{request.shelterData.description}</p>
                       </div>
                    </div>
                  )}

                  <div className="text-xs text-slate-400">
                    Created: {new Date(request.createdAt).toLocaleString()}
                  </div>
                </div>

                {request.status === 'Pending' && (
                  <div className="flex flex-row lg:flex-col gap-3 justify-center">
                    <button
                      disabled={processingId === request._id}
                      onClick={() => handleStatusUpdate(request._id, 'Approved')}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white hover:bg-emerald-700 transition disabled:opacity-50"
                    >
                      {processingId === request._id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                      Approve
                    </button>
                    <button
                      disabled={processingId === request._id}
                      onClick={() => handleStatusUpdate(request._id, 'Rejected')}
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-6 py-3 text-sm font-bold text-red-700 hover:bg-red-100 transition disabled:opacity-50"
                    >
                      <XCircle className="h-4 w-4" />
                      Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
