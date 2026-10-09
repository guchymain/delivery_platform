import React, { useState, useEffect } from 'react';
import { riderAPI } from '../../lib/api';
import { formatCurrency, formatDate } from '../../lib/utils';
import StatusBadge from '../../components/common/StatusBadge';
import { History, CheckCircle2, DollarSign, Package, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

export default function RiderHistory() {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await riderAPI.getDeliveries();
      setDeliveries(res.data?.data?.deliveries || []);
    } catch (err) {
      toast.error('Failed to load delivery history');
    } finally {
      setLoading(false);
    }
  };

  const completedCount = deliveries.filter((d) => d.status === 'DELIVERED').length;
  const totalEarned = deliveries
    .filter((d) => d.status === 'DELIVERED')
    .reduce((sum, d) => sum + parseFloat(d.deliveryFee || d.delivery_fee || 0), 0);

  return (
    <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-yellow/15 text-brand-dark text-xs font-bold mb-2">
          <span>⚡ Lagos Fleet Logs</span>
        </div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <History className="w-7 h-7 text-brand-blue" /> Delivery Job History
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Review your completed courier runs, delivery payouts, and intra-city route archives
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Completed Jobs</p>
            <h3 className="text-3xl font-black text-slate-900 mt-1.5">{completedCount}</h3>
            <span className="text-[11px] text-emerald-600 font-bold mt-1 inline-block">100% Verified Delivery</span>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-7 h-7" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Gross Delivery Payout</p>
            <h3 className="text-3xl font-black text-brand-blue mt-1.5">{formatCurrency(totalEarned)}</h3>
            <span className="text-[11px] text-slate-500 font-semibold mt-1 inline-block">Settled to rider account</span>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-brand-yellow/20 text-brand-dark flex items-center justify-center">
            <DollarSign className="w-7 h-7" />
          </div>
        </div>
      </div>

      {/* History Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 className="font-black text-slate-900">Delivered Orders Archive</h2>
            <p className="text-xs text-slate-500">Intra-city dispatch records across Lagos</p>
          </div>
          <span className="text-xs font-bold text-brand-blue bg-brand-blue/10 px-3 py-1 rounded-full">
            Total Runs: {deliveries.length}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-[11px] uppercase font-bold text-slate-500 border-b border-slate-200/80 tracking-wider">
              <tr>
                <th className="px-5 py-4">Tracking Number</th>
                <th className="px-5 py-4">Package</th>
                <th className="px-5 py-4">Destination</th>
                <th className="px-5 py-4">Rider Payout</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Completed Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-5 py-16 text-center text-slate-400">
                    <div className="w-7 h-7 border-3 border-brand-blue border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                    Loading delivery archive...
                  </td>
                </tr>
              ) : deliveries.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-5 py-16 text-center text-slate-400">
                    <Package className="w-10 h-10 mx-auto mb-3 text-slate-300" />
                    No delivery jobs recorded in your history yet.
                  </td>
                </tr>
              ) : (
                deliveries.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-4 font-mono font-black text-xs text-brand-blue">
                      {d.tracking_number || d.trackingCode}
                    </td>
                    <td className="px-5 py-4 font-semibold text-slate-900 max-w-xs truncate">
                      {d.package_description || d.packageDescription}
                    </td>
                    <td className="px-5 py-4 text-slate-600 max-w-xs truncate text-xs">
                      {d.delivery_address || d.deliveryAddress}
                    </td>
                    <td className="px-5 py-4 font-black text-slate-900">
                      {formatCurrency(d.deliveryFee || d.delivery_fee)}
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={d.status} type="delivery" />
                    </td>
                    <td className="px-5 py-4 text-xs text-slate-400 whitespace-nowrap font-medium">
                      {formatDate(d.updatedAt || d.createdAt)}
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
