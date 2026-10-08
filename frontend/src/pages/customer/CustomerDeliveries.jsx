import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { deliveryAPI } from '../../lib/api';
import { formatCurrency, formatDate } from '../../lib/utils';
import StatusBadge from '../../components/common/StatusBadge';
import Modal from '../../components/common/Modal';
import {
  Package,
  Search,
  Filter,
  PlusCircle,
  Eye,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function CustomerDeliveries() {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Cancel modal state
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    fetchDeliveries();
  }, [statusFilter]);

  const fetchDeliveries = async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      const res = await deliveryAPI.getAll(params);
      setDeliveries(res.data?.data?.deliveries || res.data?.deliveries || []);
    } catch (err) {
      toast.error('Failed to load shipments');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCancel = (del) => {
    setSelectedDelivery(del);
    setCancelReason('');
    setCancelModalOpen(true);
  };

  const handleConfirmCancel = async () => {
    if (!selectedDelivery) return;
    setCancelling(true);
    try {
      const tracking = selectedDelivery.trackingCode || selectedDelivery.tracking_number;
      await deliveryAPI.cancel(selectedDelivery.id, cancelReason);
      toast.success(`Shipment ${tracking} cancelled.`);
      setCancelModalOpen(false);
      fetchDeliveries();
    } catch (err) {
      const msg = err.response?.data?.message || 'Could not cancel delivery';
      toast.error(msg);
    } finally {
      setCancelling(false);
    }
  };

  const filteredDeliveries = deliveries.filter((d) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    const tracking = (d.trackingCode || d.tracking_number || '').toLowerCase();
    const desc = (d.packageDescription || d.package_description || '').toLowerCase();
    const addr = (d.deliveryAddress || d.delivery_address || '').toLowerCase();
    const recipient = (d.recipientName || d.recipient_name || '').toLowerCase();

    return (
      tracking.includes(term) ||
      desc.includes(term) ||
      addr.includes(term) ||
      recipient.includes(term)
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-[#003896] text-[10px] font-bold uppercase tracking-wider mb-1">
            <Sparkles className="w-3 h-3 text-[#FFC50F]" /> Customer Shipments
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            My Delivery Shipments
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Track, filter, and monitor all your packages moving across Lagos
          </p>
        </div>
        <Link
          to="/customer/create-delivery"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#003896] hover:bg-[#002c77] text-white font-black text-xs shadow-md shadow-blue-900/20 transition-all cursor-pointer"
        >
          <PlusCircle className="w-4 h-4 text-[#FFC50F]" />
          Book New Shipment
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4 text-[#003896]" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by tracking code, parcel description, address, or recipient..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#003896] focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full md:w-44 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#003896]"
          >
            <option value="">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="ASSIGNED">Assigned</option>
            <option value="PICKED_UP">Picked Up</option>
            <option value="IN_TRANSIT">In Transit</option>
            <option value="DELIVERED">Delivered</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
          <button
            onClick={fetchDeliveries}
            title="Refresh"
            className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#003896]' : ''}`} />
          </button>
        </div>
      </div>

      {/* Table List */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-[11px] uppercase font-bold text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-5 py-3.5">Tracking Code</th>
                <th className="px-5 py-3.5">Description</th>
                <th className="px-5 py-3.5">Destination</th>
                <th className="px-5 py-3.5">Fee</th>
                <th className="px-5 py-3.5">Delivery Status</th>
                <th className="px-5 py-3.5">Payment</th>
                <th className="px-5 py-3.5">Booked On</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {loading ? (
                <tr>
                  <td colSpan="8" className="px-5 py-12 text-center text-slate-400">
                    <div className="w-6 h-6 border-2 border-[#003896] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Fetching shipments...
                  </td>
                </tr>
              ) : filteredDeliveries.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-5 py-12 text-center text-slate-400">
                    No shipments found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredDeliveries.map((del) => {
                  const tracking = del.trackingCode || del.tracking_number;
                  const fee = del.deliveryFee || del.delivery_fee;
                  const desc = del.packageDescription || del.package_description;
                  const dest = del.deliveryAddress || del.delivery_address;
                  const payStatus = del.payments?.[0]?.paymentStatus || del.payment_status || 'PENDING';
                  const canCancel = ['PENDING', 'CONFIRMED'].includes(del.status);

                  return (
                    <tr key={del.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-5 py-4 font-mono font-bold text-xs text-[#003896]">
                        {tracking}
                      </td>
                      <td className="px-5 py-4 font-bold text-slate-900 max-w-xs truncate">
                        {desc}
                      </td>
                      <td className="px-5 py-4 text-slate-600 max-w-xs truncate">
                        {dest}
                      </td>
                      <td className="px-5 py-4 font-bold text-slate-900">
                        {formatCurrency(fee)}
                      </td>
                      <td className="px-5 py-4">
                        <StatusBadge status={del.status} type="delivery" size="sm" />
                      </td>
                      <td className="px-5 py-4">
                        <StatusBadge status={payStatus} type="payment" size="sm" />
                      </td>
                      <td className="px-5 py-4 text-[11px] text-slate-400 whitespace-nowrap font-mono">
                        {formatDate(del.createdAt)}
                      </td>
                      <td className="px-5 py-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            to={`/customer/deliveries/${del.id}`}
                            className="p-1.5 text-[#003896] hover:bg-blue-50 rounded-lg transition-colors font-bold"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          {canCancel && (
                            <button
                              onClick={() => handleOpenCancel(del)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              title="Cancel Request"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cancellation Modal */}
      <Modal
        isOpen={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        title="Cancel Delivery Request"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 bg-rose-50 text-rose-800 rounded-xl text-xs">
            <AlertTriangle className="w-5 h-5 shrink-0 text-rose-600" />
            <span>
              Are you sure you want to cancel shipment <strong>{selectedDelivery?.trackingCode || selectedDelivery?.tracking_number}</strong>?
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
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setCancelModalOpen(false)}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-50 cursor-pointer"
            >
              Keep Delivery
            </button>
            <button
              type="button"
              disabled={cancelling}
              onClick={handleConfirmCancel}
              className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-black rounded-xl text-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              {cancelling ? 'Cancelling...' : 'Confirm Cancellation'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
