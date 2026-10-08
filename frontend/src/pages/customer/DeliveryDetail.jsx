import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { deliveryAPI, paymentAPI } from '../../lib/api';
import { formatCurrency, formatDate, getPaymentStatus, getPaymentMethod } from '../../lib/utils';
import StatusBadge from '../../components/common/StatusBadge';
import DeliveryStepper from '../../components/common/DeliveryStepper';
import Modal from '../../components/common/Modal';
import {
  ArrowLeft,
  Package,
  MapPin,
  Clock,
  Bike,
  CreditCard,
  XCircle,
  Share2,
  DollarSign,
  AlertTriangle,
  Receipt,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function DeliveryDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [delivery, setDelivery] = useState(null);
  const [loading, setLoading] = useState(true);

  // Payment modal state
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('CARD');
  const [paying, setPaying] = useState(false);

  // Cancel modal state
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    fetchDelivery();
  }, [id]);

  const fetchDelivery = async () => {
    setLoading(true);
    try {
      const res = await deliveryAPI.getById(id);
      setDelivery(res.data?.data || res.data?.delivery);
    } catch (err) {
      toast.error('Failed to load delivery details');
      navigate('/customer/deliveries');
    } finally {
      setLoading(false);
    }
  };

  const handlePayNow = async () => {
    setPaying(true);
    try {
      await paymentAPI.processPayment({
        delivery_id: delivery.id,
        amount: delivery.deliveryFee || delivery.delivery_fee,
        payment_method: paymentMethod
      });
      toast.success('Payment recorded successfully!');
      setPayModalOpen(false);
      await fetchDelivery();
    } catch (err) {
      const msg = err.response?.data?.message || 'Payment processing failed';
      toast.error(msg);
    } finally {
      setPaying(false);
    }
  };

  const handleCancel = async () => {
    setCancelling(true);
    try {
      await deliveryAPI.cancel(delivery.id, cancelReason);
      toast.success('Delivery cancelled.');
      setCancelModalOpen(false);
      await fetchDelivery();
    } catch (err) {
      const msg = err.response?.data?.message || 'Cancellation failed';
      toast.error(msg);
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center text-slate-500 font-sans">
        <div className="w-8 h-8 border-4 border-[#003896] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        Loading shipment details...
      </div>
    );
  }

  if (!delivery) return null;

  const trackingCode = delivery.trackingCode || delivery.tracking_number;
  const deliveryFee = delivery.deliveryFee || delivery.delivery_fee || 5.0;
  const pickupAddr = delivery.pickupAddress || delivery.pickup_address;
  const dropAddr = delivery.deliveryAddress || delivery.delivery_address;
  const pickupName = delivery.pickupContactName || delivery.sender_name || 'Sender';
  const pickupPhone = delivery.pickupContactPhone || delivery.sender_phone;
  const recipientName = delivery.recipientName || delivery.recipient_name || 'Recipient';
  const recipientPhone = delivery.recipientPhone || delivery.recipient_phone;
  const packageDesc = delivery.packageDescription || delivery.package_description;
  const packageWeight = delivery.packageWeight || delivery.weight || '1.0';
  const packageType = delivery.packageType || delivery.package_type || 'PARCEL';
  const paymentStatus = getPaymentStatus(delivery);
  const paymentMethodDisplay = getPaymentMethod(delivery);
  const statusLogs = delivery.statusLogs || delivery.status_logs || [];

  const isPaid = paymentStatus === 'SUCCESSFUL' || paymentStatus === 'PAID';
  const canCancel = ['PENDING', 'CONFIRMED'].includes(delivery.status);
  const needsPayment = !isPaid && delivery.status !== 'CANCELLED';

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 font-sans">
      {/* Top Back Nav & Quick Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link
          to="/customer/deliveries"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-[#003896] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to My Shipments
        </Link>

        <div className="flex items-center gap-2">
          <Link
            to={`/track?tracking=${trackingCode}`}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
          >
            <Share2 className="w-3.5 h-3.5" /> Public Tracking Link
          </Link>

          {isPaid && delivery.status !== 'CANCELLED' ? (
            <div className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200 shadow-xs">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Paid ({formatCurrency(deliveryFee)})
            </div>
          ) : needsPayment ? (
            <button
              onClick={() => setPayModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#003896] hover:bg-[#002c77] text-white text-xs font-extrabold shadow-sm transition-all cursor-pointer"
            >
              <CreditCard className="w-3.5 h-3.5 text-[#FFC50F]" /> Pay Now ({formatCurrency(deliveryFee)})
            </button>
          ) : null}

          {canCancel && (
            <button
              onClick={() => setCancelModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold transition-colors cursor-pointer"
            >
              <XCircle className="w-3.5 h-3.5" /> Cancel Request
            </button>
          )}
        </div>
      </div>

      {/* Main Delivery Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-blue-900/5 overflow-hidden">
        {/* Banner */}
        <div className="p-6 sm:p-7 bg-[#003896] text-white flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="text-[10px] uppercase font-bold text-blue-200 tracking-wider">
              SwiftShip Shipment Order
            </span>
            <h1 className="text-2xl font-mono font-black tracking-wide mt-0.5">
              {trackingCode}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status={delivery.status} type="delivery" size="md" />
            <StatusBadge status={paymentStatus} type="payment" size="md" />
          </div>
        </div>

        {/* Stepper */}
        <div className="p-6 sm:p-8 border-b border-slate-100 bg-[#F8FAFC]">
          <DeliveryStepper
            currentStatus={delivery.status}
            statusLogs={statusLogs}
            cancellationReason={delivery.cancellationReason}
          />
        </div>

        {/* Detailed Grid */}
        <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Route details */}
          <div className="space-y-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#003896]" /> Pickup & Dropoff Route
            </h3>

            <div className="relative pl-6 border-l-2 border-blue-200 space-y-6 text-xs">
              <div>
                <div className="absolute -left-2 top-0 w-4 h-4 rounded-full bg-[#003896] border-2 border-white shadow" />
                <span className="text-[10px] font-bold text-slate-400 uppercase">Pickup Location</span>
                <p className="font-bold text-slate-900 text-sm mt-0.5">{pickupAddr}</p>
                <p className="text-slate-500 mt-0.5">Contact: {pickupName} {pickupPhone && `(${pickupPhone})`}</p>
                {delivery.pickup_notes && (
                  <p className="text-[11px] bg-slate-50 p-2 rounded-lg mt-1 italic text-slate-600">
                    Notes: {delivery.pickup_notes}
                  </p>
                )}
              </div>

              <div>
                <div className="absolute -left-2 top-20 w-4 h-4 rounded-full bg-emerald-600 border-2 border-white shadow" />
                <span className="text-[10px] font-bold text-slate-400 uppercase">Dropoff Destination</span>
                <p className="font-bold text-slate-900 text-sm mt-0.5">{dropAddr}</p>
                <p className="text-slate-500 mt-0.5">Recipient: {recipientName} {recipientPhone && `(${recipientPhone})`}</p>
                {delivery.delivery_notes && (
                  <p className="text-[11px] bg-slate-50 p-2 rounded-lg mt-1 italic text-slate-600">
                    Notes: {delivery.delivery_notes}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Package, Billing & Courier */}
          <div className="space-y-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
              <Package className="w-4 h-4 text-[#003896]" /> Parcel & Billing Summary
            </h3>

            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 text-xs space-y-2.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Package Description</span>
                <span className="font-bold text-slate-900">{packageDesc}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Category</span>
                <span className="font-semibold text-slate-800">{packageType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Weight</span>
                <span className="font-semibold text-slate-800">{packageWeight} kg</span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-2">
                <span className="text-slate-500">Delivery Fee</span>
                <span className="font-black text-[#003896] text-sm">{formatCurrency(deliveryFee)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Payment Status</span>
                <StatusBadge status={paymentStatus} type="payment" size="sm" />
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Payment Preference</span>
                <span className="font-bold text-slate-900">{paymentMethodDisplay}</span>
              </div>
            </div>

            {/* Courier Section */}
            {delivery.rider ? (
              <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                  <Bike className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-emerald-800">Assigned Courier</div>
                  <div className="font-bold text-slate-900 text-xs">
                    {delivery.rider.name || `${delivery.rider.first_name || ''} ${delivery.rider.last_name || ''}`}
                  </div>
                  <div className="text-[11px] text-slate-600">Phone: {delivery.rider.phone || 'Available via portal'}</div>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-blue-50/60 border border-blue-200 rounded-2xl text-blue-900 text-xs flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#003896] shrink-0" />
                Awaiting courier claim or dispatcher assignment.
              </div>
            )}
          </div>
        </div>

        {/* Audit Timeline */}
        {statusLogs && statusLogs.length > 0 && (
          <div className="p-6 sm:p-8 bg-[#F8FAFC] border-t border-slate-100">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">
              Status Change History
            </h4>
            <div className="space-y-2.5">
              {statusLogs.map((log) => (
                <div key={log.id} className="flex items-start gap-3 text-xs bg-white p-3 rounded-xl border border-slate-200/60">
                  <div className="w-2 h-2 rounded-full bg-[#003896] mt-1.5 flex-shrink-0" />
                  <div className="flex-1">
                    <span className="font-bold text-slate-900">
                      Status updated to {log.status || log.to_status}
                    </span>
                    {log.notes && <span className="text-slate-500 ml-2">({log.notes})</span>}
                  </div>
                  <div className="text-slate-400 font-mono text-[11px]">{formatDate(log.createdAt)}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Pay Modal */}
      <Modal
        isOpen={payModalOpen}
        onClose={() => setPayModalOpen(false)}
        title="Record Delivery Payment"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600">
            Complete settlement for order <strong>{trackingCode}</strong>.
            Amount due: <strong className="text-slate-900">{formatCurrency(deliveryFee)}</strong>.
          </p>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Choose Payment Method
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod('CARD')}
                className={`p-3 rounded-xl border text-center text-xs font-bold cursor-pointer ${
                  paymentMethod === 'CARD'
                    ? 'border-[#003896] bg-blue-50 text-[#003896]'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                Debit / Credit Card
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('TRANSFER')}
                className={`p-3 rounded-xl border text-center text-xs font-bold cursor-pointer ${
                  paymentMethod === 'TRANSFER'
                    ? 'border-[#003896] bg-blue-50 text-[#003896]'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                Bank Transfer
              </button>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => setPayModalOpen(false)}
              className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={paying}
              onClick={handlePayNow}
              className="px-5 py-2 bg-[#003896] hover:bg-[#002c77] text-white rounded-xl text-xs font-black disabled:opacity-50 cursor-pointer"
            >
              {paying ? 'Processing...' : `Pay ${formatCurrency(deliveryFee)}`}
            </button>
          </div>
        </div>
      </Modal>

      {/* Cancel Modal */}
      <Modal
        isOpen={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        title="Cancel Delivery Request"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 bg-rose-50 text-rose-800 rounded-xl text-xs">
            <AlertTriangle className="w-5 h-5 shrink-0 text-rose-600" />
            <span>
              Are you sure you want to cancel delivery <strong>{trackingCode}</strong>?
            </span>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Reason for Cancellation
            </label>
            <textarea
              rows="3"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="e.g. Schedule changed, booked by error..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setCancelModalOpen(false)}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
            >
              Back
            </button>
            <button
              type="button"
              disabled={cancelling}
              onClick={handleCancel}
              className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-black rounded-xl text-xs disabled:opacity-50 cursor-pointer"
            >
              {cancelling ? 'Cancelling...' : 'Confirm Cancellation'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
