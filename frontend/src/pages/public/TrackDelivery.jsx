import React, { useState, useEffect } from 'react';
import { useSearchParams, useParams, Link } from 'react-router-dom';
import { deliveryAPI } from '../../lib/api';
import { formatCurrency, formatDate, getPaymentStatus, getPaymentMethod } from '../../lib/utils';
import StatusBadge from '../../components/common/StatusBadge';
import DeliveryStepper from '../../components/common/DeliveryStepper';
import {
  Search,
  Package,
  MapPin,
  Calendar,
  Clock,
  Bike,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  ShieldCheck,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function TrackDelivery() {
  const [searchParams] = useSearchParams();
  const { trackingNumber: paramTracking } = useParams();
  const queryTracking = searchParams.get('tracking') || paramTracking || '';

  const [inputCode, setInputCode] = useState(queryTracking);
  const [delivery, setDelivery] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [copied, setCopied] = useState(false);

  const fetchTracking = async (code) => {
    if (!code || !code.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const res = await deliveryAPI.track(code.trim());
      setDelivery(res.data?.data || null);
    } catch (err) {
      setDelivery(null);
      const msg = err.response?.data?.message || 'Could not find delivery with that tracking code';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (queryTracking) {
      setInputCode(queryTracking);
      fetchTracking(queryTracking);
    }
  }, [queryTracking]);

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchTracking(inputCode);
  };

  const trackingCodeDisplay =
    delivery?.trackingCode || delivery?.tracking_number || inputCode;

  const copyToClipboard = () => {
    if (trackingCodeDisplay) {
      navigator.clipboard.writeText(trackingCodeDisplay);
      setCopied(true);
      toast.success('Tracking code copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Robust field extractors supporting camelCase and snake_case
  const pickupAddr = delivery?.pickupAddress || delivery?.pickup_address || '';
  const dropoffAddr = delivery?.deliveryAddress || delivery?.delivery_address || '';
  const pickupName = delivery?.pickupContactName || delivery?.sender_name || 'Sender';
  const pickupPhone = delivery?.pickupContactPhone || delivery?.sender_phone || '';
  const recipientName = delivery?.recipientName || delivery?.recipient_name || 'Recipient';
  const recipientPhone = delivery?.recipientPhone || delivery?.recipient_phone || '';
  const packageWeight = delivery?.packageWeight || delivery?.weight || '1.0';
  const packageDesc = delivery?.packageDescription || delivery?.package_description || 'Standard Delivery Package';
  const paymentStatus = getPaymentStatus(delivery);
  const paymentMethod = getPaymentMethod(delivery);
  const deliveryFee = delivery?.deliveryFee || delivery?.delivery_fee || 5.0;
  const statusLogs = delivery?.statusLogs || delivery?.status_logs || [];

  return (
    <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
      {/* Top Header */}
      <div className="text-center max-w-2xl mx-auto mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 text-[#003896] text-xs sm:text-sm font-bold uppercase tracking-wider mb-4 border border-blue-100">
          <Sparkles className="w-4 h-4 text-[#FFC50F]" />
          Nationwide & Global Express Tracking
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
          Track Your Delivery
        </h1>
        <p className="mt-3 text-base sm:text-lg text-slate-600 leading-relaxed">
          Enter your unique tracking code below for live milestone tracking across Nigeria and worldwide.
        </p>

        {/* Tracking Input Bar */}
        <form onSubmit={handleSubmit} className="mt-8 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
              <Search className="w-5 h-5 text-[#003896]" />
            </div>
            <input
              type="text"
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value)}
              placeholder="e.g. DEL-DEMO-001"
              className="w-full pl-12 pr-4 py-4 bg-white border border-slate-300 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[#003896] font-mono text-base tracking-wide uppercase font-semibold"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-4 bg-[#003896] hover:bg-[#002c77] text-white font-bold text-sm sm:text-base rounded-2xl shadow-md shadow-blue-900/20 transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2 shrink-0 whitespace-nowrap"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              'Track Shipment'
            )}
          </button>
        </form>

        <div className="flex items-center justify-center gap-2 mt-3 text-xs sm:text-sm text-slate-500">
          <span>Demo codes:</span>
          <button
            type="button"
            onClick={() => {
              setInputCode('DEL-DEMO-001');
              fetchTracking('DEL-DEMO-001');
            }}
            className="text-[#003896] font-mono font-bold hover:underline cursor-pointer"
          >
            DEL-DEMO-001
          </button>
          <span>•</span>
          <button
            type="button"
            onClick={() => {
              setInputCode('DEL-DEMO-002');
              fetchTracking('DEL-DEMO-002');
            }}
            className="text-[#003896] font-mono font-bold hover:underline cursor-pointer"
          >
            DEL-DEMO-002
          </button>
        </div>
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 shadow-sm flex flex-col items-center justify-center py-20">
          <div className="w-12 h-12 border-4 border-[#003896] border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-slate-700 font-bold text-base">Querying SwiftShip delivery records...</p>
        </div>
      )}

      {/* No Result */}
      {!loading && searched && !delivery && (
        <div className="bg-white rounded-3xl border border-slate-200 p-14 text-center shadow-sm max-w-xl mx-auto">
          <AlertCircle className="w-14 h-14 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-900">No Delivery Found</h3>
          <p className="text-sm text-slate-600 mt-2 leading-relaxed">
            We couldn't locate any shipment associated with "{inputCode}". Please confirm the tracking code or contact support.
          </p>
        </div>
      )}

      {/* Delivery Result Card */}
      {!loading && delivery && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-blue-900/5 overflow-hidden">
          {/* SwiftShip Header Card */}
          <div className="p-6 sm:p-8 bg-[#003896] text-white flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-blue-200 uppercase tracking-wider">
                  Tracking ID
                </span>
                <button
                  onClick={copyToClipboard}
                  className="p-1 hover:bg-white/10 rounded text-blue-200 hover:text-white transition-colors cursor-pointer"
                  title="Copy code"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
              <div className="text-2xl sm:text-3xl font-mono font-black tracking-wide mt-0.5 break-all sm:break-normal">
                {trackingCodeDisplay}
              </div>
              <p className="text-xs text-blue-100 mt-1">
                Booked on {formatDate(delivery.createdAt)}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <StatusBadge status={delivery.status} type="delivery" size="lg" />
              <StatusBadge status={paymentStatus} type="payment" size="lg" />
            </div>
          </div>

          {/* Stepper Progression */}
          <div className="p-6 sm:p-8 border-b border-slate-100 bg-[#F8FAFC]">
            <DeliveryStepper
              currentStatus={delivery.status}
              statusLogs={statusLogs}
              cancellationReason={delivery.cancellationReason}
            />
          </div>

          {/* Route & Details Grid */}
          <div className="p-8 sm:p-10 grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Pickup & Delivery */}
            <div className="space-y-6">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 uppercase tracking-wider">
                <MapPin className="w-5 h-5 text-[#003896]" /> Delivery Transit Route
              </h3>

              <div className="relative pl-7 border-l-2 border-blue-200 space-y-7">
                <div className="relative">
                  <div className="absolute -left-[39px] top-1 w-5 h-5 rounded-full bg-[#003896] border-2 border-white shadow" />
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Pickup Location
                  </span>
                  <div className="font-bold text-slate-900 text-base mt-1">{pickupAddr}</div>
                  <div className="text-sm text-slate-500 mt-0.5">
                    Contact: {pickupName} {pickupPhone && `(${pickupPhone})`}
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute -left-[39px] top-1 w-5 h-5 rounded-full bg-emerald-600 border-2 border-white shadow" />
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Drop-off Destination
                  </span>
                  <div className="font-bold text-slate-900 text-base mt-1">{dropoffAddr}</div>
                  <div className="text-sm text-slate-500 mt-0.5">
                    Recipient: {recipientName} {recipientPhone && `(${recipientPhone})`}
                  </div>
                </div>
              </div>
            </div>

            {/* Package & Courier Card */}
            <div className="space-y-6">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 uppercase tracking-wider">
                <Package className="w-5 h-5 text-[#003896]" /> Package & Dispatch Status
              </h3>

              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200/80 space-y-3.5 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Package Description:</span>
                  <span className="font-semibold text-slate-800">{packageDesc}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Weight:</span>
                  <span className="font-semibold text-slate-800">{packageWeight} kg</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Delivery Fee:</span>
                  <span className="font-black text-lg text-[#003896]">{formatCurrency(deliveryFee)}</span>
                </div>
                <div className="flex justify-between items-center pt-1 border-t border-slate-200/60">
                  <span className="text-slate-500">Payment Status:</span>
                  <StatusBadge status={paymentStatus} type="payment" size="sm" />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Payment Mode:</span>
                  <span className="font-semibold text-slate-800">{paymentMethod}</span>
                </div>
              </div>

              {/* Rider details */}
              {delivery.rider ? (
                <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold">
                      <Bike className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-[10px] font-bold uppercase text-emerald-800">
                        Assigned Courier
                      </div>
                      <div className="font-bold text-slate-900 text-xs">
                        {delivery.rider.name || `${delivery.rider.first_name || ''} ${delivery.rider.last_name || ''}`}
                      </div>
                      <div className="text-[11px] text-slate-600">
                        Phone: {delivery.rider.phone || 'Available via portal'}
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] px-2.5 py-1 bg-emerald-200 text-emerald-900 rounded-full font-bold">
                    Dispatched
                  </span>
                </div>
              ) : (
                <div className="p-4 bg-blue-50/60 border border-blue-200 rounded-2xl text-blue-900 text-xs flex items-center gap-2.5">
                  <Clock className="w-4 h-4 text-[#003896] shrink-0" />
                  <span>
                    Pending courier assignment. A verified rider will claim this shipment shortly.
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Audit Timeline */}
          {statusLogs && statusLogs.length > 0 && (
            <div className="p-6 sm:p-8 bg-[#F8FAFC] border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-[#003896]" /> Milestone Log
              </h4>
              <div className="space-y-3">
                {statusLogs.map((log) => (
                  <div key={log.id} className="flex items-start gap-3 text-xs bg-white p-3 rounded-xl border border-slate-200/60">
                    <div className="w-2 h-2 rounded-full bg-[#003896] mt-1.5 flex-shrink-0" />
                    <div className="flex-1">
                      <span className="font-bold text-slate-900">
                        Status changed to {log.status || log.to_status}
                      </span>
                      {log.notes && (
                        <span className="text-slate-500 ml-2">({log.notes})</span>
                      )}
                    </div>
                    <div className="text-slate-400 font-mono text-[11px]">
                      {formatDate(log.createdAt)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
