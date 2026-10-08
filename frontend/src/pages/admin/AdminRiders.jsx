import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../lib/api';
import { formatDate } from '../../lib/utils';
import StatusBadge from '../../components/common/StatusBadge';
import {
  Bike,
  Star,
  CheckCircle2,
  RefreshCw,
  Search,
  Filter,
  Shield,
  Phone
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminRiders() {
  const [riders, setRiders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchRiders();
  }, [statusFilter]);

  const fetchRiders = async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      const res = await adminAPI.getRiders(params);
      setRiders(res.data?.data?.riders || []);
    } catch (err) {
      toast.error('Failed to load courier fleet');
    } finally {
      setLoading(false);
    }
  };

  const filteredRiders = riders.filter((r) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      r.user?.first_name?.toLowerCase().includes(term) ||
      r.user?.last_name?.toLowerCase().includes(term) ||
      r.user?.email?.toLowerCase().includes(term) ||
      r.vehicle_number?.toLowerCase().includes(term) ||
      r.license_number?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-yellow/15 text-brand-dark text-xs font-bold mb-2">
            <span>⚡ Fleet Oversight</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Bike className="w-7 h-7 text-brand-blue" /> Courier Fleet Management
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Monitor real-time courier availability, rating quality, and vehicle compliance across active transit zones
          </p>
        </div>

        <button
          onClick={fetchRiders}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold shadow-xs transition-colors cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-brand-blue' : ''}`} />
          Refresh Fleet
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search rider name, plate, license..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full md:w-48 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all"
          >
            <option value="">All Availabilities</option>
            <option value="AVAILABLE">AVAILABLE</option>
            <option value="BUSY">BUSY</option>
            <option value="OFFLINE">OFFLINE</option>
          </select>
        </div>
      </div>

      {/* Riders Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-[11px] uppercase font-bold text-slate-500 border-b border-slate-200/80 tracking-wider">
              <tr>
                <th className="px-5 py-4">Courier Name</th>
                <th className="px-5 py-4">Vehicle Specs</th>
                <th className="px-5 py-4">Driver License</th>
                <th className="px-5 py-4">Shift Availability</th>
                <th className="px-5 py-4">Total Deliveries</th>
                <th className="px-5 py-4">Rating</th>
                <th className="px-5 py-4">Account Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-5 py-16 text-center text-slate-400">
                    <div className="w-7 h-7 border-3 border-brand-blue border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                    Loading fleet records...
                  </td>
                </tr>
              ) : filteredRiders.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-5 py-16 text-center text-slate-400">
                    <Bike className="w-10 h-10 mx-auto mb-3 text-slate-300" />
                    No riders match your query.
                  </td>
                </tr>
              ) : (
                filteredRiders.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-4">
                      <div className="font-bold text-slate-900">
                        {r.user?.first_name} {r.user?.last_name}
                      </div>
                      <div className="text-xs text-slate-500 font-mono">{r.user?.phone || r.user?.email}</div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-bold text-slate-800">{r.vehicle_type || r.vehicleType}</div>
                      <div className="text-xs text-slate-400 font-mono">{r.vehicle_number || r.vehicleNumber}</div>
                    </td>
                    <td className="px-5 py-4 font-mono text-xs text-slate-600 font-semibold">
                      {r.license_number || r.licenseNumber}
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={r.availability_status || r.availabilityStatus} type="availability" />
                    </td>
                    <td className="px-5 py-4 font-black text-slate-900">
                      {r.total_deliveries || r.totalDeliveries || 0}
                    </td>
                    <td className="px-5 py-4 font-black text-amber-500">
                      <span className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 fill-amber-500" /> {r.rating || '5.00'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={r.user?.status} type="account" />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
