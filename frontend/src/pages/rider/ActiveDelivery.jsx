import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { riderAPI } from '../../lib/api';
import { formatCurrency, formatDate } from '../../lib/utils';
import StatusBadge from '../../components/common/StatusBadge';
import DeliveryStepper from '../../components/common/DeliveryStepper';
import {
  Navigation,
  MapPin,
  Package,
  Phone,
  User,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Banknote,
  Clock,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function ActiveDelivery() {
  const navigate = useNavigate();
  const [delivery, setDelivery] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [notes, setNotes] = useState('');
  const [releasing, setReleasing] = useState(false);

  useEffect(() => {
    fetchActive();
  }, []);

  const fetchActive = async () => {
    setLoading(true);
    try {
      const res = await riderAPI.getActiveDelivery();
      setDelivery(res.data?.data || res.data?.delivery || null);
    } catch (err) {
      setDelivery(null);
    } finally {
      setLoading(false);
    }
  };

  const handleReleaseJob = async () => {
    if (!delivery) return;
    const confirmed = window.confirm(
      'Are you sure you want to release this job back to the open pool? Use this only for vehicle issues or emergencies before pickup.'
    );
    if (!confirmed) return;

    setReleasing(true);
    try {
      await riderAPI.releaseDelivery(delivery.id, notes || 'Rider emergency release');
      toast.success('Job released back to dispatch pool. You are now AVAILABLE.');
      navigate('/rider/jobs');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to release job';
      toast.error(msg);
    } finally {
      setReleasing(false);
    }
  };

  const handleUpdateStatus = async (nextStatus) => {
    if (!delivery) return;
    setUpdating(true);
    try {
      await riderAPI.updateDeliveryStatus(
        delivery.id,
        nextStatus,
        notes || `Status updated to ${nextStatus}`
      );
      toast.success(`Shipment progressed to ${nextStatus}!`);
      setNotes('');

      if (nextStatus === 'DELIVERED') {
        toast.success('Congratulations! Delivery completed. You are now AVAILABLE.');
        navigate('/rider');
      } else {
        fetchActive();
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update status';
      toast.error(msg);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center text-slate-500 font-sans">
        <div className="w-8 h-8 border-4 border-[#003896] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        Checking active transit status...
      </div>
    );
  }

  if (!delivery) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center font-sans">
        <div className="bg-white rounded-3xl border border-slate-200 p-10 shadow-xs space-y-4">
          <Clock className="w-12 h-12 text-slate-300 mx-auto" />
          <h2 className="text-xl font-bold text-slate-800">No Active Job In Progress</h2>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            You do not currently have an assigned shipment in transit. Claim one from the open job board.
          </p>
          <div className="pt-2">
            <Link
              to="/rider/jobs"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#FFC50F] hover:bg-[#e5b00b] text-slate-900 font-black text-xs rounded-xl shadow-xs transition-all cursor-pointer"
            >
              Browse Open Jobs <ArrowRight className="w-4 h-4 text-slate-900" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const trackingCode = delivery.trackingCode || delivery.tracking_number;
  const deliveryFee = delivery.deliveryFee || delivery.delivery_fee || 5.0;
  const pickupAddr = delivery.pickupAddress || delivery.pickup_address;
  const dropAddr = delivery.deliveryAddress || delivery.delivery_address;
  const pickupName = delivery.pickupContactName || delivery.sender_name || 'Sender';
  const pickupPhone = delivery.pickupContactPhone || delivery.sender_phone;
  const recipientName = delivery.recipientName || delivery.recipient_name || 'Recipient';
  const recipientPhone = delivery.recipientPhone || delivery.recipient_phone;
  const paymentMethod = delivery.payments?.[0]?.paymentMethod || delivery.payment_method || 'CASH';

  // Determine next action
  let nextAction = null;
  if (delivery.status === 'ASSIGNED') {
    nextAction = {
      target: 'PICKED_UP',
      label: 'Mark as Picked Up (Package in Hand)',
      color: 'bg-[#003896] hover:bg-[#002c77]'
    };
  } else if (delivery.status === 'PICKED_UP') {
    nextAction = {
      target: 'IN_TRANSIT',
      label: 'Start Transit (En Route to Destination)',
      color: 'bg-indigo-600 hover:bg-indigo-700'
    };
  } else if (delivery.status === 'IN_TRANSIT') {
    nextAction = {
      target: 'DELIVERED',
      label: 'Complete Delivery (Handed to Recipient)',
      color: 'bg-emerald-600 hover:bg-emerald-700'
    };
  }

  const isCashPayment = paymentMethod === 'CASH';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[10px] uppercase font-bold text-[#003896] tracking-wider">
            Topship Courier Transit Console
          </span>
          <h1 className="text-2xl font-black text-slate-900 mt-0.5">
            Order #{trackingCode}
          </h1>
        </div>
        <StatusBadge status={delivery.status} type="delivery" size="md" />
      </div>

      {/* Stepper */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <DeliveryStepper currentStatus={delivery.status} statusLogs={delivery.statusLogs || delivery.status_logs} />
      </div>

      {/* Cash Alert Banner if COD */}
      {isCashPayment && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-between text-amber-900">
          <div className="flex items-center gap-3">
            <Banknote className="w-6 h-6 text-amber-600 shrink-0" />
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider">Cash on Delivery Notice</h4>
              <p className="text-xs mt-0.5">
                Collect <strong className="text-slate-900 font-black">{formatCurrency(deliveryFee)}</strong> directly from recipient upon delivery.
              </p>
            </div>
          </div>
          <span className="text-xs font-black px-3 py-1 bg-amber-200 text-amber-900 rounded-lg">
            COD
          </span>
        </div>
      )}

      {/* Route & Contact Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pickup Details */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <span className="text-xs font-bold uppercase tracking-wider text-[#003896] flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-[#003896]" /> 1. Pickup Origin
            </span>
            <span className="text-xs text-slate-400 font-bold">Step 1</span>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase">Pickup Location</label>
            <p className="font-bold text-slate-900 text-sm mt-0.5">{pickupAddr}</p>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl space-y-1.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Contact:</span>
              <span className="font-semibold text-slate-800">{pickupName}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Phone:</span>
              <a
                href={`tel:${pickupPhone}`}
                className="font-bold text-[#003896] flex items-center gap-1 hover:underline"
              >
                <Phone className="w-3 h-3" /> {pickupPhone || 'N/A'}
              </a>
            </div>
            {delivery.pickup_notes && (
              <div className="pt-1.5 border-t border-slate-200/60 text-slate-600 italic">
                Notes: {delivery.pickup_notes}
              </div>
            )}
          </div>
        </div>

        {/* Dropoff Details */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-emerald-600" /> 2. Dropoff Destination
            </span>
            <span className="text-xs text-slate-400 font-bold">Step 2</span>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase">Destination</label>
            <p className="font-bold text-slate-900 text-sm mt-0.5">{dropAddr}</p>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl space-y-1.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Recipient:</span>
              <span className="font-semibold text-slate-800">{recipientName}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Phone:</span>
              <a
                href={`tel:${recipientPhone}`}
                className="font-bold text-emerald-600 flex items-center gap-1 hover:underline"
              >
                <Phone className="w-3 h-3" /> {recipientPhone}
              </a>
            </div>
            {delivery.delivery_notes && (
              <div className="pt-1.5 border-t border-slate-200/60 text-slate-600 italic">
                Notes: {delivery.delivery_notes}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Progress Action Console */}
      {nextAction && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
            Next Transit Action
          </h3>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Status Transition Note (Optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Package collected safely from sender..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#003896]"
            />
          </div>

          <button
            type="button"
            disabled={updating || releasing}
            onClick={() => handleUpdateStatus(nextAction.target)}
            className={`w-full py-3.5 px-6 rounded-2xl text-white font-black text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 ${nextAction.color}`}
          >
            {updating ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                {nextAction.label}
              </>
            )}
          </button>

          {delivery.status === 'ASSIGNED' && (
            <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <span className="text-[11px] text-slate-500">
                Experiencing vehicle breakdown or emergency before pickup?
              </span>
              <button
                type="button"
                disabled={releasing || updating}
                onClick={handleReleaseJob}
                className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl transition-all cursor-pointer disabled:opacity-50 text-center"
              >
                {releasing ? 'Releasing job...' : 'Release Job to Pool'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
