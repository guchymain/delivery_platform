import React, { useState, useEffect } from 'react';
import { adminAPI, deliveryAPI } from '../../lib/api';
import { formatCurrency } from '../../lib/utils';
import StatusBadge from '../../components/common/StatusBadge';
import {
  Send,
  Bike,
  Package,
  MapPin,
  CheckCircle,
  RefreshCw,
  AlertCircle,
  UserCheck,
  Compass,
  Sparkles
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminDispatch() {
  const [unassignedDeliveries, setUnassignedDeliveries] = useState([]);
  const [riders, setRiders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Assignment selection
  const [selectedDeliveryId, setSelectedDeliveryId] = useState('');
  const [selectedRiderId, setSelectedRiderId] = useState('');
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    fetchDispatchData();
  }, []);

  const fetchDispatchData = async () => {
    setLoading(true);
    try {
      const [delRes, riderRes] = await Promise.all([
        deliveryAPI.getAll({ status: 'PENDING' }),
        adminAPI.getRiders()
      ]);

      const pendings = delRes.data?.data?.deliveries || delRes.data?.deliveries || [];
      const confirmedRes = await deliveryAPI
        .getAll({ status: 'CONFIRMED' })
        .catch(() => ({ data: { data: { deliveries: [] } } }));
      const confirmeds = confirmedRes.data?.data?.deliveries || confirmedRes.data?.deliveries || [];

      // Combine unassigned
      const combined = [...pendings, ...confirmeds].filter((d) => !d.riderId && !d.rider_id);
      setUnassignedDeliveries(combined);

      const fleet = riderRes.data?.data?.riders || riderRes.data?.riders || [];
      setRiders(fleet);
    } catch (err) {
      toast.error('Failed to load dispatch queue');
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async (e) => {
    e.preventDefault();
    if (!selectedDeliveryId || !selectedRiderId) {
      toast.error('Please select both a delivery order and an available courier');
      return;
    }

    setAssigning(true);
    try {
      await adminAPI.assignRider(selectedDeliveryId, selectedRiderId);
      toast.success('Courier successfully dispatched to delivery!');
      setSelectedDeliveryId('');
      setSelectedRiderId('');
      fetchDispatchData();
    } catch (err) {
      const msg = err.response?.data?.message || 'Assignment failed';
      toast.error(msg);
    } finally {
      setAssigning(false);
    }
  };

  const availableRiders = riders.filter(
    (r) => (r.availabilityStatus || r.availability_status) === 'AVAILABLE'
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-[#003896] text-[10px] font-bold uppercase tracking-wider mb-1">
            <Compass className="w-3 h-3 text-[#FFC50F]" /> Courier Fleet Dispatch
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            Active Dispatch Console
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manually match pending and confirmed shipments with active couriers
          </p>
        </div>

        <button
          onClick={fetchDispatchData}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold shadow-xs transition-colors cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#003896]' : ''}`} />
          Refresh Queue
        </button>
      </div>

      {/* Manual Quick Dispatch Card */}
      <div className="bg-[#003896] text-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-blue-900/10">
        <h2 className="text-base font-bold flex items-center gap-2 mb-4 uppercase tracking-wider">
          <UserCheck className="w-4 h-4 text-[#FFC50F]" /> Instant Courier Dispatch
        </h2>

        <form onSubmit={handleAssign} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-[11px] font-bold text-blue-200 mb-1 uppercase tracking-wider">
              1. Unassigned Shipment
            </label>
            <select
              value={selectedDeliveryId}
              onChange={(e) => setSelectedDeliveryId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#FFC50F] [&>option]:text-slate-900"
            >
              <option value="">Select an unassigned order...</option>
              {unassignedDeliveries.map((d) => {
                const code = d.trackingCode || d.tracking_number;
                const desc = d.packageDescription || d.package_description;
                const fee = d.deliveryFee || d.delivery_fee;
                return (
                  <option key={d.id} value={d.id}>
                    {code} - {desc} ({formatCurrency(fee)})
                  </option>
                );
              })}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-blue-200 mb-1 uppercase tracking-wider">
              2. Available Courier
            </label>
            <select
              value={selectedRiderId}
              onChange={(e) => setSelectedRiderId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#FFC50F] [&>option]:text-slate-900"
            >
              <option value="">Select an available courier...</option>
              {availableRiders.map((r) => {
                const riderId = r.userId || r.user_id || r.id;
                const name = r.name || `${r.first_name || ''} ${r.last_name || ''}`.trim() || r.user?.name || 'Courier';
                const vehicle = r.vehicleType || r.vehicle_type || 'MOTORCYCLE';
                const plate = r.plateNumber || r.vehicle_number || '';
                return (
                  <option key={riderId} value={riderId}>
                    {name} ({vehicle} {plate && `- ${plate}`})
                  </option>
                );
              })}
            </select>
          </div>

          <div>
            <button
              type="submit"
              disabled={assigning || !selectedDeliveryId || !selectedRiderId}
              className="w-full py-2.5 px-4 bg-[#FFC50F] hover:bg-[#e5b00b] text-slate-900 font-black text-xs rounded-xl shadow transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {assigning ? (
                <div className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Send className="w-3.5 h-3.5 text-slate-900" /> Dispatch Courier
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Grid of Two Columns: Unassigned Queue vs Courier Fleet */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Unassigned Deliveries */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 uppercase tracking-wider">
              <Package className="w-4 h-4 text-[#003896]" /> Pending Dispatch Queue
            </h3>
            <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-blue-50 text-[#003896] font-bold">
              {unassignedDeliveries.length} waiting
            </span>
          </div>

          {unassignedDeliveries.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-600">All orders are currently dispatched!</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
              {unassignedDeliveries.map((d) => {
                const code = d.trackingCode || d.tracking_number;
                const fee = d.deliveryFee || d.delivery_fee;
                const desc = d.packageDescription || d.package_description;
                const pickup = d.pickupAddress || d.pickup_address;
                const dest = d.deliveryAddress || d.delivery_address;

                return (
                  <div
                    key={d.id}
                    onClick={() => setSelectedDeliveryId(d.id)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                      selectedDeliveryId === d.id
                        ? 'border-[#003896] bg-blue-50/50 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-[#003896]">
                        {code}
                      </span>
                      <span className="font-black text-xs text-slate-900">
                        {formatCurrency(fee)}
                      </span>
                    </div>
                    <h4 className="font-bold text-slate-900 text-xs mt-1">{desc}</h4>
                    <div className="text-[11px] text-slate-500 mt-2 space-y-0.5">
                      <p className="truncate">From: {pickup}</p>
                      <p className="truncate">To: {dest}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Courier Fleet Availability */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 uppercase tracking-wider">
              <Bike className="w-4 h-4 text-amber-600" /> Active Couriers
            </h3>
            <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold">
              {availableRiders.length} available
            </span>
          </div>

          {riders.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <p className="text-xs">No registered couriers on the platform yet.</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
              {riders.map((r) => {
                const riderId = r.userId || r.user_id || r.id;
                const status = r.availabilityStatus || r.availability_status;
                const isAvail = status === 'AVAILABLE';
                const name = r.name || `${r.first_name || ''} ${r.last_name || ''}`.trim() || r.user?.name || 'Courier';
                const vehicle = r.vehicleType || r.vehicle_type || 'MOTORCYCLE';
                const plate = r.plateNumber || r.vehicle_number || '';
                const rating = r.rating || '5.00';
                const done = r.totalDeliveries ?? r.total_deliveries ?? 0;

                return (
                  <div
                    key={riderId}
                    onClick={() => isAvail && setSelectedRiderId(riderId)}
                    className={`p-4 rounded-2xl border transition-all ${
                      selectedRiderId === riderId
                        ? 'border-[#003896] bg-blue-50/50 shadow-xs cursor-pointer'
                        : isAvail
                        ? 'border-slate-200 hover:border-slate-300 bg-white cursor-pointer'
                        : 'border-slate-100 bg-slate-50 opacity-60 cursor-not-allowed'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-slate-900 text-xs">
                        {name}
                      </div>
                      <StatusBadge status={status} type="availability" size="sm" />
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
                      <span>{vehicle} {plate && `(${plate})`}</span>
                      <span>★ {rating} • {done} runs</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
