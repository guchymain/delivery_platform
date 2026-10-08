import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { riderAPI } from '../../lib/api';
import { formatCurrency, formatDate } from '../../lib/utils';
import StatusBadge from '../../components/common/StatusBadge';
import {
  Briefcase,
  MapPin,
  Package,
  CheckCircle,
  RefreshCw,
  AlertCircle,
  Navigation,
  Clock,
  ArrowRight,
  Sparkles,
  Zap
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function AvailableJobs() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [acceptingId, setAcceptingId] = useState(null);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const res = await riderAPI.getAvailableDeliveries();
      setJobs(res.data?.data || res.data?.jobs || []);
    } catch (err) {
      toast.error('Failed to load available jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptJob = async (jobId) => {
    setAcceptingId(jobId);
    try {
      await riderAPI.acceptDelivery(jobId);
      toast.success('Shipment claimed! Navigating to live transit console...');
      navigate('/rider/active');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to accept delivery job';
      toast.error(msg);
    } finally {
      setAcceptingId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-[#003896] text-[10px] font-bold uppercase tracking-wider mb-1">
            <Zap className="w-3 h-3 text-[#FFC50F]" /> Lagos Dispatch Board
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            Available Lagos Delivery Jobs
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Claim unassigned doorstep pickups across Lagos and earn immediate delivery payouts
          </p>
        </div>

        <button
          onClick={fetchJobs}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold shadow-xs transition-colors cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#003896]' : ''}`} />
          Refresh Board
        </button>
      </div>

      {loading ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-16 text-center shadow-xs">
          <div className="w-8 h-8 border-4 border-[#003896] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-500 font-semibold">Scanning for open Lagos dispatch orders...</p>
        </div>
      ) : jobs.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-16 text-center shadow-xs max-w-lg mx-auto">
          <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No Open Jobs Available</h3>
          <p className="text-xs text-slate-500 mt-1">
            All customer requests have been claimed. As soon as a new delivery is confirmed, it will appear here instantly.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map((job) => {
            const trackingCode = job.trackingCode || job.tracking_number;
            const fee = job.deliveryFee || job.delivery_fee;
            const desc = job.packageDescription || job.package_description;
            const pickup = job.pickupAddress || job.pickup_address;
            const drop = job.deliveryAddress || job.delivery_address;
            const weight = job.packageWeight || job.weight;

            return (
              <div
                key={job.id}
                className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <span className="font-mono text-xs font-bold text-[#003896] bg-blue-50 px-2.5 py-1 rounded-lg">
                      {trackingCode}
                    </span>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 uppercase font-bold">Payout</span>
                      <div className="text-base font-black text-emerald-600">
                        {formatCurrency(fee)}
                      </div>
                    </div>
                  </div>

                  {/* Package description */}
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm line-clamp-1">{desc}</h3>
                    <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                      <Package className="w-3.5 h-3.5 text-slate-400" />
                      <span>{job.packageType || job.package_type || 'PARCEL'} • {weight ? `${weight} kg` : 'Standard'}</span>
                    </div>
                  </div>

                  {/* Route */}
                  <div className="space-y-2 text-xs bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 rounded-full bg-[#003896] mt-1 shrink-0" />
                      <div>
                        <span className="font-bold text-slate-500 uppercase text-[9px]">Pickup:</span>
                        <p className="font-medium text-slate-800 line-clamp-1">{pickup}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-600 mt-1 shrink-0" />
                      <div>
                        <span className="font-bold text-slate-500 uppercase text-[9px]">Dropoff:</span>
                        <p className="font-medium text-slate-800 line-clamp-1">{drop}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Accept CTA */}
                <div className="pt-4 mt-4 border-t border-slate-100">
                  <button
                    type="button"
                    disabled={acceptingId === job.id}
                    onClick={() => handleAcceptJob(job.id)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-[#FFC50F] hover:bg-[#e5b00b] text-slate-900 font-black text-xs rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50"
                  >
                    {acceptingId === job.id ? (
                      <div className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 text-slate-900" />
                        <span>Claim & Accept Job</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
