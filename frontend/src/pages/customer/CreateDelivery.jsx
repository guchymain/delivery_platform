import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { deliveryAPI, paymentAPI } from '../../lib/api';
import { calculateDeliveryFee, formatCurrency, formatNaira } from '../../lib/utils';
import { useAuth } from '../../context/AuthContext';
import {
  PackagePlus,
  MapPin,
  User,
  Phone,
  FileText,
  DollarSign,
  ShieldCheck,
  CreditCard,
  Banknote,
  Building,
  Sparkles,
  Clock,
  ArrowRight,
  Globe
} from 'lucide-react';
import toast from 'react-hot-toast';

const NIGERIA_PICKUP_PRESETS = [
  'Lekki Phase 1, Lagos, Nigeria',
  'Victoria Island, Lagos, Nigeria',
  'Central Business District, Abuja, Nigeria',
  'GRA Phase 2, Port Harcourt, Rivers State, Nigeria',
  'Bodija, Ibadan, Oyo State, Nigeria',
  'Commercial Area, Kano, Nigeria'
];

const DESTINATION_PRESETS = [
  'Ikeja GRA, Lagos, Nigeria',
  'Maitama, Abuja FCT, Nigeria',
  'Trans-Amadi, Port Harcourt, Nigeria',
  'Oxford Street, London, United Kingdom',
  'Broadway, New York, NY, United States',
  'Bay Street, Toronto, ON, Canada'
];

export default function CreateDelivery() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Read pre-filled state if coming from Home rate calculator
  const initialEstimate = location.state || {};

  const [formData, setFormData] = useState({
    pickup_address: initialEstimate.pickupArea || '',
    delivery_address: initialEstimate.dropoffArea || '',
    sender_name: user?.name || `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || '',
    sender_phone: user?.phone || '',
    recipient_name: '',
    recipient_phone: '',
    package_description: '',
    weight: initialEstimate.packageWeight ? String(initialEstimate.packageWeight) : '1.0',
    package_type: 'PARCEL',
    pickup_notes: '',
    delivery_notes: '',
    payment_method: 'CASH',
    immediate_payment: false
  });

  const [loading, setLoading] = useState(false);

  const parsedWeight = parseFloat(formData.weight) || 1.0;
  const estimatedFee = calculateDeliveryFee(parsedWeight);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleApplyPreset = (field, preset) => {
    setFormData((prev) => ({
      ...prev,
      [field]: preset
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.pickup_address || !formData.delivery_address) {
      toast.error('Both pickup and delivery addresses are required');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        pickup_address: formData.pickup_address,
        delivery_address: formData.delivery_address,
        sender_name: formData.sender_name || user?.name || 'Customer',
        sender_phone: formData.sender_phone || user?.phone || '08000000000',
        recipient_name: formData.recipient_name,
        recipient_phone: formData.recipient_phone,
        package_description: formData.package_description,
        weight: parseFloat(formData.weight) || 1.0,
        package_type: formData.package_type,
        pickup_notes: formData.pickup_notes || undefined,
        delivery_notes: formData.delivery_notes || undefined,
        payment_method: formData.payment_method
      };

      const res = await deliveryAPI.create(payload);
      const newDelivery = res.data?.data || res.data?.delivery || res.data;
      const trackingCode =
        newDelivery?.trackingCode || newDelivery?.tracking_number || 'New Order';

      toast.success(`Shipment requested! Tracking ID: ${trackingCode}`);

      // If user chose instant payment for CARD or TRANSFER
      if (formData.immediate_payment && formData.payment_method !== 'CASH') {
        try {
          await paymentAPI.processPayment({
            delivery_id: newDelivery.id,
            amount: newDelivery.deliveryFee || newDelivery.delivery_fee || estimatedFee,
            payment_method: formData.payment_method
          });
          toast.success(`Payment verified successfully via ${formData.payment_method}!`);
        } catch (payErr) {
          toast.error('Delivery booked, but immediate simulated payment did not complete.');
        }
      }

      navigate(`/customer/deliveries/${newDelivery.id}`);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to submit delivery request';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 font-sans">
      {/* Page Header */}
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 text-[#003896] text-xs sm:text-sm font-bold uppercase tracking-wider mb-3 border border-blue-100">
          <Globe className="w-4 h-4 text-[#FFC50F]" />
          Nigeria & International Logistics Gateway
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
          <PackagePlus className="w-8 h-8 text-[#003896]" /> Book a New Shipment
        </h1>
        <p className="mt-2 text-sm sm:text-base text-slate-600 leading-relaxed">
          Enter pickup coordinates in Nigeria, and dropoff anywhere in Nigeria or over 200 global destinations.
        </p>

        {/* Dispatch Window Alert */}
        <div className="mt-5 p-4 bg-white rounded-2xl border border-blue-100 shadow-xs flex items-center gap-3.5 text-xs sm:text-sm text-slate-700">
          <Clock className="w-5 h-5 text-[#FFC50F] shrink-0" />
          <span>
            <strong>Express Dispatch Window:</strong> Metro shipments requested before <strong>2:00 PM (WAT)</strong> qualify for same-day collection. Inter-state & international air express departs on scheduled daily transit cycles.
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Route Section */}
        <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-10 shadow-sm space-y-6">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2.5 border-b border-slate-100 pb-4 uppercase tracking-wider">
            <MapPin className="w-5 h-5 text-[#003896]" /> 1. Origin & Destination Addresses
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Pickup */}
            <div className="space-y-4 bg-slate-50/70 p-6 rounded-2xl border border-slate-200/70">
              <span className="text-xs font-bold text-[#003896] uppercase tracking-wider">
                Pickup Origin (Nigeria)
              </span>
              <div>
                <label className="block text-sm font-bold text-slate-800 mb-1.5">
                  Pickup Address *
                </label>
                <input
                  type="text"
                  name="pickup_address"
                  required
                  value={formData.pickup_address}
                  onChange={handleChange}
                  placeholder="e.g. 14 Admiralty Way, Lekki Phase 1, Lagos, Nigeria"
                  className="w-full px-4 py-3 bg-white border border-slate-300 rounded-2xl text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-[#003896] font-medium transition-all"
                />
                {/* Nigeria quick presets */}
                <div className="flex flex-wrap gap-1.5 mt-2.5">
                  <span className="text-xs text-slate-400 font-medium">Quick pick:</span>
                  {NIGERIA_PICKUP_PRESETS.slice(0, 3).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => handleApplyPreset('pickup_address', p)}
                      className="text-xs text-[#003896] bg-blue-50 px-2.5 py-1 rounded-lg hover:bg-blue-100 font-medium cursor-pointer transition-colors"
                    >
                      {p.split(',')[0]}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Sender Name</label>
                  <input
                    type="text"
                    name="sender_name"
                    value={formData.sender_name}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Sender Phone</label>
                  <input
                    type="tel"
                    name="sender_phone"
                    value={formData.sender_phone}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Pickup Notes (Optional)</label>
                <input
                  type="text"
                  name="pickup_notes"
                  value={formData.pickup_notes}
                  onChange={handleChange}
                  placeholder="Gate code, landmark, or apartment floor"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm"
                />
              </div>
            </div>

            {/* Destination */}
            <div className="space-y-4 bg-slate-50/70 p-6 rounded-2xl border border-slate-200/70">
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                Destination (Nigeria or International)
              </span>
              <div>
                <label className="block text-sm font-bold text-slate-800 mb-1.5">
                  Delivery Address *
                </label>
                <input
                  type="text"
                  name="delivery_address"
                  required
                  value={formData.delivery_address}
                  onChange={handleChange}
                  placeholder="e.g. 5 Isaac John Street, GRA Ikeja, Lagos OR London, UK"
                  className="w-full px-4 py-3 bg-white border border-slate-300 rounded-2xl text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-[#003896] font-medium transition-all"
                />
                {/* Destination quick presets */}
                <div className="flex flex-wrap gap-1.5 mt-2.5">
                  <span className="text-xs text-slate-400 font-medium">Quick pick:</span>
                  {DESTINATION_PRESETS.slice(0, 3).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => handleApplyPreset('delivery_address', p)}
                      className="text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg hover:bg-emerald-100 font-medium cursor-pointer transition-colors"
                    >
                      {p.split(',')[0]}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Recipient Name *</label>
                  <input
                    type="text"
                    name="recipient_name"
                    required
                    value={formData.recipient_name}
                    onChange={handleChange}
                    placeholder="Recipient name"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Recipient Phone *</label>
                  <input
                    type="tel"
                    name="recipient_phone"
                    required
                    value={formData.recipient_phone}
                    onChange={handleChange}
                    placeholder="080XXXXXXXX"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Delivery Notes (Optional)</label>
                <input
                  type="text"
                  name="delivery_notes"
                  value={formData.delivery_notes}
                  onChange={handleChange}
                  placeholder="Leave with receptionist, call upon arrival"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Package & Pricing Section */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3 uppercase tracking-wider">
            <FileText className="w-4 h-4 text-[#003896]" /> 2. Package Specifications & Live Fee
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Item Description *
              </label>
              <input
                type="text"
                name="package_description"
                required
                value={formData.package_description}
                onChange={handleChange}
                placeholder="e.g. Legal documents envelope, Laptop accessories box, Merchandise"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#003896]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Package Category
              </label>
              <select
                name="package_type"
                value={formData.package_type}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#003896]"
              >
                <option value="PARCEL">Standard Parcel</option>
                <option value="DOCUMENTS">Documents / Paperwork</option>
                <option value="BOX">Standard Box</option>
                <option value="FRAGILE">Fragile Items</option>
                <option value="ELECTRONICS">Electronics / Gadgets</option>
                <option value="FOOD">Food / Perishables</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Estimated Weight (kg) *
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  name="weight"
                  step="0.5"
                  min="0.5"
                  max="50"
                  required
                  value={formData.weight}
                  onChange={handleChange}
                  className="w-28 px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-bold text-slate-800"
                />
                <span className="text-xs text-slate-500">
                  $5.00 base up to 1.0 kg + $1.50/kg additional
                </span>
              </div>
            </div>

            {/* Calculated Delivery Fee Card */}
            <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#003896] tracking-wider">
                  Guaranteed Delivery Fee
                </span>
                <p className="text-xs text-slate-500 mt-0.5">Calculated transparently</p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-black text-[#003896]">
                  {formatCurrency(estimatedFee)}
                </span>
                <span className="block text-xs font-bold text-slate-600">
                  ≈ {formatNaira(estimatedFee)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Preference */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3 uppercase tracking-wider">
            <DollarSign className="w-4 h-4 text-[#003896]" /> 3. Payment Preference
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <label
              className={`p-4 rounded-2xl border-2 cursor-pointer flex flex-col items-center justify-center gap-1.5 transition-all ${
                formData.payment_method === 'CASH'
                  ? 'border-[#003896] bg-blue-50/40 text-[#003896]'
                  : 'border-slate-200 hover:border-slate-300 text-slate-700'
              }`}
            >
              <input
                type="radio"
                name="payment_method"
                value="CASH"
                checked={formData.payment_method === 'CASH'}
                onChange={handleChange}
                className="sr-only"
              />
              <Banknote className="w-6 h-6 text-emerald-600" />
              <span className="font-bold text-xs sm:text-sm">Cash on Delivery</span>
              <span className="text-[10px] text-slate-500 text-center">Hand cash to rider</span>
            </label>

            <label
              className={`p-4 rounded-2xl border-2 cursor-pointer flex flex-col items-center justify-center gap-1.5 transition-all ${
                formData.payment_method === 'CARD'
                  ? 'border-[#003896] bg-blue-50/40 text-[#003896]'
                  : 'border-slate-200 hover:border-slate-300 text-slate-700'
              }`}
            >
              <input
                type="radio"
                name="payment_method"
                value="CARD"
                checked={formData.payment_method === 'CARD'}
                onChange={handleChange}
                className="sr-only"
              />
              <CreditCard className="w-6 h-6 text-[#003896]" />
              <span className="font-bold text-xs sm:text-sm">Debit / Credit Card</span>
              <span className="text-[10px] text-slate-500 text-center">Instant card settlement</span>
            </label>

            <label
              className={`p-4 rounded-2xl border-2 cursor-pointer flex flex-col items-center justify-center gap-1.5 transition-all ${
                formData.payment_method === 'TRANSFER'
                  ? 'border-[#003896] bg-blue-50/40 text-[#003896]'
                  : 'border-slate-200 hover:border-slate-300 text-slate-700'
              }`}
            >
              <input
                type="radio"
                name="payment_method"
                value="TRANSFER"
                checked={formData.payment_method === 'TRANSFER'}
                onChange={handleChange}
                className="sr-only"
              />
              <Building className="w-6 h-6 text-purple-600" />
              <span className="font-bold text-xs sm:text-sm">Bank Transfer</span>
              <span className="text-[10px] text-slate-500 text-center">Direct bank transfer</span>
            </label>
          </div>

          {formData.payment_method !== 'CASH' && (
            <div className="pt-2 p-3 bg-slate-50 rounded-xl border border-slate-200/60">
              <label className="flex items-center gap-2.5 text-xs text-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  name="immediate_payment"
                  checked={formData.immediate_payment}
                  onChange={handleChange}
                  className="rounded border-slate-300 text-[#003896] focus:ring-[#003896] h-4 w-4"
                />
                <span className="font-bold">
                  Simulate instant online payment now ({formatCurrency(estimatedFee)})
                </span>
              </label>
              <p className="text-[11px] text-slate-500 mt-1 pl-6.5">
                Automatically transitions status to CONFIRMED and readies package for immediate rider dispatch.
              </p>
            </div>
          )}
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-4 pt-4">
          <button
            type="button"
            onClick={() => navigate('/customer')}
            className="px-8 py-4 rounded-2xl border border-slate-300 text-slate-700 font-bold text-sm sm:text-base hover:bg-slate-50 cursor-pointer transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-10 py-4 rounded-2xl bg-[#003896] hover:bg-[#002c77] text-white font-bold text-sm sm:text-base shadow-md shadow-blue-900/20 transition-all disabled:opacity-50 cursor-pointer flex items-center gap-2.5"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>Confirm & Book Delivery</span>
                <ArrowRight className="w-5 h-5 text-[#FFC50F]" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
