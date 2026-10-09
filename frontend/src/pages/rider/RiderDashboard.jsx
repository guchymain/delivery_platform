import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { riderAPI } from '../../lib/api';
import { formatCurrency, formatDate } from '../../lib/utils';
import StatusBadge from '../../components/common/StatusBadge';
import {
  Bike,
  CheckCircle2,
  Clock,
  DollarSign,
  MapPin,
  ArrowRight,
  AlertCircle,
  Briefcase,
  Power,
  Navigation,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function RiderDashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [activeDelivery, setActiveDelivery] = useState(null);
  const [availableJobs, setAvailableJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    fetchRiderData();
  }, []);

  const fetchRiderData = async () => {
    setLoading(true);
    try {
      const [profileRes, activeRes, availableRes] = await Promise.all([
        riderAPI.getProfile().catch(() => ({ data: { data: null } })),
        riderAPI.getActiveDelivery().catch(() => ({ data: { data: null } })),
        riderAPI.getAvailableDeliveries().catch(() => ({ data: { data: [] } }))
      ]);

      const prof = profileRes.data?.data || profileRes.data?.profile || null;
      const act = activeRes.data?.data || activeRes.data?.delivery || null;
      const avail = availableRes.data?.data || availableRes.data?.jobs || [];

      setProfile(prof);
      setActiveDelivery(act);
      setAvailableJobs(avail);
    } catch (err) {
      toast.error('Failed to load courier console');
    } finally {
      setLoading(false);
    }
  };

  const handleAvailabilityChange = async (newStatus) => {
    setUpdatingStatus(true);
    try {
      await riderAPI.updateAvailability(newStatus);
      toast.success(`Availability updated to ${newStatus}`);
      setProfile((prev) => ({
        ...prev,
        availabilityStatus: newStatus,
        availability_status: newStatus
      }));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not update availability');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const currentAvailability =
    profile?.availabilityStatus || profile?.availability_status || 'AVAILABLE';

  return (
    <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 font-sans">
      {/* SwiftShip Courier Header Banner */}
      <div className="bg-[#003896] rounded-3xl p-7 sm:p-8 text-white shadow-xl shadow-blue-900/10 flex flex-col md:flex-row md:items-center md:justify-between gap-6 relative overflow-hidden">
        <div className="space-y-1 relative z-10">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white/10 text-[#FFC50F]">
              SwiftShip Fleet • Courier Dispatch
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-black/30 font-mono font-bold text-blue-100">
              {profile?.vehicleType || profile?.vehicle_type || 'MOTORCYCLE'} • {profile?.plateNumber || profile?.vehicle_number || 'ACTIVE'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Courier Console: {user?.name || user?.first_name || 'Rider'}
          </h1>
          <p className="text-blue-100 text-xs sm:text-sm max-w-xl">
            Toggle your shift availability to receive instant doorstep and hub dispatches.
          </p>
        </div>

        {/* Live Availability Switch */}
        <div className="bg-white/10 backdrop-blur-md p-1.5 rounded-2xl border border-white/20 flex items-center gap-1.5 relative z-10">
          <button
            type="button"
            disabled={updatingStatus}
            onClick={() => handleAvailabilityChange('AVAILABLE')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
              currentAvailability === 'AVAILABLE'
                ? 'bg-emerald-500 text-white shadow-sm'
                : 'text-blue-200 hover:text-white hover:bg-white/10'
            }`}
          >
            AVAILABLE
          </button>
          <button
            type="button"
            disabled={updatingStatus}
            onClick={() => handleAvailabilityChange('OFFLINE')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
              currentAvailability === 'OFFLINE'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-blue-200 hover:text-white hover:bg-white/10'
            }`}
          >
            OFFLINE
          </button>
        </div>
      </div>

      {/* Active Job Alert Card */}
      {activeDelivery && (
        <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center md:justify-between gap-6 border border-blue-900/40">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="animate-pulse w-2.5 h-2.5 rounded-full bg-emerald-400" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#FFC50F]">
                Active Run in Progress
              </span>
              <StatusBadge status={activeDelivery.status} type="delivery" size="sm" />
            </div>
            <h3 className="text-xl sm:text-2xl font-black tracking-tight">
              Order: {activeDelivery.trackingCode || activeDelivery.tracking_number}
            </h3>
            <p className="text-xs text-slate-300 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="truncate">Destination: {activeDelivery.deliveryAddress || activeDelivery.delivery_address}</span>
            </p>
          </div>

          <Link
            to="/rider/active"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs shadow-md transition-all cursor-pointer"
          >
            <Navigation className="w-4 h-4" /> Open Transit Console &rarr;
          </Link>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Completed Dropoffs</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">
              {profile?.totalDeliveries || profile?.total_deliveries || 0}
            </h3>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Courier Rating</p>
            <h3 className="text-2xl font-black text-amber-500 mt-1">
              ★ {profile?.rating || '5.00'}
            </h3>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Bike className="w-5 h-5 text-[#FFC50F]" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Available Board</p>
            <h3 className="text-2xl font-black text-[#003896] mt-1">
              {availableJobs.length}
            </h3>
          </div>
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-[#003896] flex items-center justify-center font-bold">
            <Briefcase className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Shift Status</p>
            <div className="mt-1.5">
              <StatusBadge status={currentAvailability} type="availability" size="sm" />
            </div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-slate-50 text-slate-600 flex items-center justify-center font-bold">
            <Power className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Open Jobs Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-black text-slate-900 flex items-center gap-2 uppercase tracking-wider">
            <Briefcase className="w-4 h-4 text-[#003896]" /> Open Dispatch Orders
          </h2>
          <Link
            to="/rider/jobs"
            className="text-xs font-bold text-[#003896] hover:underline flex items-center gap-1"
          >
            All Available Jobs <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {availableJobs.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center shadow-xs">
            <Bike className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h4 className="font-bold text-slate-800 text-sm">No unclaimed jobs right now</h4>
            <p className="text-xs text-slate-500 mt-1">
              Ensure your availability is set to <strong>AVAILABLE</strong> to receive automated dispatches.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {availableJobs.slice(0, 3).map((job) => {
              const trackingCode = job.trackingCode || job.tracking_number;
              const fee = job.deliveryFee || job.delivery_fee;
              const desc = job.packageDescription || job.package_description;
              const pickup = job.pickupAddress || job.pickup_address;
              const drop = job.deliveryAddress || job.delivery_address;
              const weight = job.packageWeight || job.weight;

              return (
                <div
                  key={job.id}
                  className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-xs font-bold text-[#003896]">{trackingCode}</span>
                      <span className="font-black text-sm text-emerald-600">{formatCurrency(fee)}</span>
                    </div>
                    <h4 className="font-bold text-slate-900 text-sm line-clamp-1">{desc}</h4>
                    <div className="text-xs text-slate-500 mt-2 space-y-1">
                      <p className="truncate">From: {pickup}</p>
                      <p className="truncate">To: {drop}</p>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400 font-medium">
                      {weight ? `${weight} kg` : 'Standard'}
                    </span>
                    <Link
                      to="/rider/jobs"
                      className="text-xs font-bold text-[#003896] hover:underline flex items-center gap-1"
                    >
                      Accept Job <ArrowRight className="w-3 h-3 text-[#FFC50F]" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
