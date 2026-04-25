'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { LayoutDashboard } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function SuppliesDashboard() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_URL}/api/supplies`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const result = await res.json();
        setData(Array.isArray(result) ? result : result.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
           <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                <LayoutDashboard className="h-3.5 w-3.5" />
                Module Workspace
            </div>
          <h1 className="text-3xl font-bold text-slate-950 mt-4">Manage Supplies</h1>
          <p className="text-sm text-slate-500 mt-2">Overview of all supplies records on the platform.</p>
        </div>
      </div>

      <div className="bg-white border text-sm border-slate-200 rounded-3xl overflow-hidden shadow-sm">
        {loading ? (
           <div className="p-10 text-center text-slate-500">Loading...</div>
        ) : data.length === 0 ? (
           <div className="p-10 text-center text-slate-500">No supplies found in database.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <tr>
                  <th className="p-4">Entity ID</th>
                  <th className="p-4">Created Date</th>
                  <th className="p-4">Data Source</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.map((item) => (
                  <tr key={item._id} className="hover:bg-slate-50/50">
                    <td className="p-4 font-mono text-xs text-blue-600">{item._id}</td>
                    <td className="p-4">{new Date(item.createdAt || Date.now()).toLocaleString()}</td>
                    <td className="p-4 font-mono text-xs">{JSON.stringify(item).substring(0, 50)}...</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
