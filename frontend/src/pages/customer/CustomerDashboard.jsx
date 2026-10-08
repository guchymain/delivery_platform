import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { deliveryAPI, paymentAPI } from '../../lib/api';
import { formatCurrency, formatDate, getPaymentStatus } from '../../lib/utils';
import StatusBadge from '../../components/common/StatusBadge';
import {
  Package,
  PlusCircle,
  Clock,
  CheckCircle2,
  CreditCard,
  ArrowRight,
  TrendingUp,
  MapPin,
  Search,
  Sparkles,
  Zap,
  Bike
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function CustomerDashboard() {
  const { user } = useAuth();
  const [deliveries, setDeliveries] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [delRes, payRes] = await Promise.all([
        deliveryAPI.getAll({ limit: 15 }),
        paymentAPI.getMyPayments({ limit: 15 })
      ]);
      const dels = delRes.data?.data?.deliveries || delRes.data?.deliveries || [];
      const pays = payRes.data?.data?.payments || payRes.data?.payments || [];
      setDeliveries(dels);
      setPayments(pays);
    } catch (err) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const activeDeliveries = deliveries.filter((d) =>
    ['PENDING', 'CONFIRMED', 'ASSIGNED', 'PICKED_UP', 'IN_TRANSIT'].includes(d.status)
  );
  const completedDeliveries = deliveries.filter((d) => d.status === 'DELIVERED');
  const totalSpent = payments
    .filter((p) => (p.paymentStatus || p.status) === 'SUCCESSFUL')
    .reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 font-sans">
      {/* SwiftShip Welcome Banner */}
      <div className="bg-[#003896] rounded-3xl p-7 sm:p-8 text-white shadow-xl shadow-blue-900/10 flex flex-col md:flex-row md:items-center md:justify-between gap-6 relative overflow-hidden">
        <div className="space-y-1 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 text-[#FFC50F] text-[10px] font-bold uppercase tracking-wider mb-1">
            <Sparkles className="w-3 h-3" /> SwiftShip Customer Hub
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Welcome, {user?.name || user?.first_name || 'Customer'}!
          </h1>
          <p className="text-blue-100 text-xs sm:text-sm max-w-xl">
            Dispatch packages across Nigeria, send global express shipments, track progress in real time, and manage your billing ledger.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 relative z-10">
          <Link
            to="/customer/create-delivery"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#FFC50F] hover:bg-[#e5b00b] text-slate-900 font-extrabold text-xs shadow-md transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4 text-slate-900" />
            Book Delivery
          </Link>
          <Link
            to="/track"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition-all cursor-pointer"
          >
            <Search className="w-4 h-4" />
            Track Package
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Shipments</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">{deliveries.length}</h3>
          </div>
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-[#003896] flex items-center justify-center font-bold">
            <Package className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Active In Transit</p>
            <h3 className="text-2xl font-black text-[#003896] mt-1">{activeDeliveries.length}</h3>
          </div>
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-[#003896] flex items-center justify-center font-bold">
            <Clock className="w-5 h-5 text-[#FFC50F]" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Completed Dropoffs</p>
            <h3 className="text-2xl font-black text-emerald-600 mt-1">{completedDeliveries.length}</h3>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Settled Billing</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">{formatCurrency(totalSpent)}</h3>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <CreditCard className="w-5 h-5 text-[#003896]" />
          </div>
        </div>
      </div>

      {/* Active Deliveries Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-black text-slate-900 flex items-center gap-2 uppercase tracking-wider">
            <Clock className="w-4 h-4 text-[#003896]" /> Active Shipments
          </h2>
          <Link
            to="/customer/deliveries"
            className="text-xs font-bold text-[#003896] hover:underline flex items-center gap-1"
          >
            All Shipments <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-500 text-xs">Loading active shipments...</div>
        ) : activeDeliveries.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center shadow-xs">
            <Package className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h4 className="font-bold text-slate-800 text-sm">No active shipments in transit</h4>
            <p className="text-xs text-slate-500 mt-1">Ready to book a pickup across Lagos today?</p>
            <Link
              to="/customer/create-delivery"
              className="inline-block mt-4 px-4 py-2 bg-[#003896] hover:bg-[#002c77] text-white font-bold text-xs rounded-xl shadow-xs transition-all"
            >
              Book Delivery Now
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {activeDeliveries.map((del) => {
              const trackingCode = del.trackingCode || del.tracking_number;
              const deliveryFee = del.deliveryFee || del.delivery_fee;
              const packageDesc = del.packageDescription || del.package_description;
              const dropAddress = del.deliveryAddress || del.delivery_address;
              const payStatus = getPaymentStatus(del);

              return (
                <div
                  key={del.id}
                  className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-mono text-xs font-bold text-[#003896]">
                        {trackingCode}
                      </span>
                      <StatusBadge status={del.status} type="delivery" size="sm" />
                    </div>
                    <h4 className="font-bold text-slate-900 text-sm line-clamp-1">{packageDesc}</h4>
                    <div className="text-xs text-slate-500 mt-2 space-y-1">
                      <div className="flex items-center gap-1.5 truncate">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">To: {dropAddress}</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-600 pt-1">
                        <span>Fee: <strong className="text-slate-900">{formatCurrency(deliveryFee)}</strong></span>
                        <StatusBadge status={payStatus} type="payment" size="sm" />
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400 font-mono">{formatDate(del.createdAt)}</span>
                    <Link
                      to={`/customer/deliveries/${del.id}`}
                      className="text-xs font-bold text-[#003896] hover:underline flex items-center gap-1"
                    >
                      Track Details <ArrowRight className="w-3 h-3 text-[#FFC50F]" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Recent Deliveries Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider">
            Recent Delivery History
          </h3>
          <Link
            to="/customer/deliveries"
            className="text-xs font-bold text-[#003896] hover:underline"
          >
            Full Ledger
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-[11px] uppercase font-bold text-slate-500">
              <tr>
                <th className="px-5 py-3">Tracking Code</th>
                <th className="px-5 py-3">Package</th>
                <th className="px-5 py-3">Destination</th>
                <th className="px-5 py-3">Delivery Fee</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Payment</th>
                <th className="px-5 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {deliveries.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-5 py-8 text-center text-slate-400">
                    No orders recorded yet.
                  </td>
                </tr>
              ) : (
                deliveries.slice(0, 6).map((d) => {
                  const trackingCode = d.trackingCode || d.tracking_number;
                  const fee = d.deliveryFee || d.delivery_fee;
                  const desc = d.packageDescription || d.package_description;
                  const dest = d.deliveryAddress || d.delivery_address;
                  const payStatus = getPaymentStatus(d);

                  return (
                    <tr key={d.id} className="hover:bg-slate-50/50">
                      <td className="px-5 py-3 font-mono font-bold text-[#003896]">
                        {trackingCode}
                      </td>
                      <td className="px-5 py-3 text-slate-900 font-semibold">{desc}</td>
                      <td className="px-5 py-3 text-slate-600 max-w-[200px] truncate">{dest}</td>
                      <td className="px-5 py-3 font-bold text-slate-900">{formatCurrency(fee)}</td>
                      <td className="px-5 py-3">
                        <StatusBadge status={d.status} type="delivery" size="sm" />
                      </td>
                      <td className="px-5 py-3">
                        <StatusBadge status={payStatus} type="payment" size="sm" />
                      </td>
                      <td className="px-5 py-3 text-right">
                        <Link
                          to={`/customer/deliveries/${d.id}`}
                          className="font-bold text-[#003896] hover:underline"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
