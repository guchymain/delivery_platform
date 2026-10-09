import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../../lib/api';
import { formatCurrency } from '../../lib/utils';
import {
  ShieldAlert,
  Users,
  Bike,
  Package,
  DollarSign,
  Send,
  CreditCard,
  TrendingUp,
  AlertCircle,
  Clock,
  CheckCircle2,
  ArrowRight,
  Compass,
  Sparkles
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getMetrics();
      setMetrics(res.data?.data || res.data?.metrics);
    } catch (err) {
      toast.error('Failed to load system metrics');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 font-sans">
      {/* SwiftShip Operations Banner */}
      <div className="bg-[#003896] rounded-3xl p-7 sm:p-8 text-white shadow-xl shadow-blue-900/10 flex flex-col md:flex-row md:items-center md:justify-between gap-6 relative overflow-hidden">
        <div className="space-y-1 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 text-[#FFC50F] text-[10px] font-bold uppercase tracking-wider mb-1">
            <Sparkles className="w-3 h-3" /> SwiftShip Operations & Control Tower
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Logistics Command Center
          </h1>
          <p className="text-blue-100 text-xs sm:text-sm max-w-xl">
            Monitor real-time courier dispatching across Nigeria, international shipments, and revenue settlement ledgers.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 relative z-10">
          <Link
            to="/admin/dispatch"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#FFC50F] hover:bg-[#e5b00b] text-slate-900 font-extrabold text-xs shadow-md transition-all cursor-pointer"
          >
            <Compass className="w-4 h-4 text-slate-900" /> Dispatch Hub
          </Link>
          <Link
            to="/admin/deliveries"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition-all"
          >
            <Package className="w-4 h-4" /> All Shipments
          </Link>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Revenue</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">
              {metrics ? formatCurrency(metrics.totalRevenue || metrics.financials?.totalRevenue || 0) : '$0.00'}
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Settled payments
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Shipments</p>
            <h3 className="text-2xl font-black text-[#003896] mt-1">
              {metrics?.totalDeliveries || metrics?.deliveries?.total || 0}
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Active: {metrics?.activeDeliveries || metrics?.deliveries?.active || 0}
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-[#003896] flex items-center justify-center font-bold">
            <Package className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Courier Fleet</p>
            <h3 className="text-2xl font-black text-amber-600 mt-1">
              {metrics?.totalRiders || metrics?.ridersFleet?.total || 0}
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Verified riders</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Bike className="w-5 h-5 text-[#FFC50F]" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Registered Users</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">
              {metrics?.totalUsers || metrics?.users?.total || 0}
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Active accounts</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
            <Users className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          to="/admin/dispatch"
          className="group bg-white p-6 rounded-3xl border border-slate-200 shadow-xs hover:border-[#003896] hover:shadow-md transition-all flex flex-col justify-between"
        >
          <div>
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-[#003896] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
              <Compass className="w-5 h-5 text-[#003896]" />
            </div>
            <h3 className="font-black text-slate-900 text-base">Fleet Dispatch Console</h3>
            <p className="text-xs text-slate-500 mt-1">
              Match unassigned customer delivery requests with active and available couriers in real time.
            </p>
          </div>
          <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#003896]">
            <span>Launch Dispatcher</span>
            <ArrowRight className="w-4 h-4 text-[#FFC50F] group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        <Link
          to="/admin/users"
          className="group bg-white p-6 rounded-3xl border border-slate-200 shadow-xs hover:border-[#003896] hover:shadow-md transition-all flex flex-col justify-between"
        >
          <div>
            <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="font-black text-slate-900 text-base">User Governance & Status</h3>
            <p className="text-xs text-slate-500 mt-1">
              Inspect user roles, enforce account status controls (ACTIVE, INACTIVE, SUSPENDED).
            </p>
          </div>
          <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#003896]">
            <span>Manage Users</span>
            <ArrowRight className="w-4 h-4 text-[#FFC50F] group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        <Link
          to="/admin/payments"
          className="group bg-white p-6 rounded-3xl border border-slate-200 shadow-xs hover:border-[#003896] hover:shadow-md transition-all flex flex-col justify-between"
        >
          <div>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
              <CreditCard className="w-5 h-5" />
            </div>
            <h3 className="font-black text-slate-900 text-base">Financial Audit & Refunds</h3>
            <p className="text-xs text-slate-500 mt-1">
              Track settlement ledgers across CASH, CARD, and TRANSFER with instant transaction reference lookups.
            </p>
          </div>
          <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#003896]">
            <span>Audit Ledger</span>
            <ArrowRight className="w-4 h-4 text-[#FFC50F] group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>
      </div>
    </div>
  );
}
