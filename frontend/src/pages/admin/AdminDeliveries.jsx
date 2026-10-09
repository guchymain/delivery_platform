import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI, deliveryAPI } from '../../lib/api';
import { formatCurrency, formatDate, getPaymentStatus } from '../../lib/utils';
import StatusBadge from '../../components/common/StatusBadge';
import Modal from '../../components/common/Modal';
import {
  Package,
  Search,
  Filter,
  Eye,
  Send,
  RefreshCw,
  Edit,
  MapPin,
  AlertTriangle
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminDeliveries() {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Status edit modal
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [statusNotes, setStatusNotes] = useState('');
  const [savingStatus, setSavingStatus] = useState(false);

  useEffect(() => {
    fetchDeliveries();
  }, [statusFilter]);

  const fetchDeliveries = async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      const res = await deliveryAPI.getAll(params);
      setDeliveries(res.data?.data?.deliveries || []);
    } catch (err) {
      toast.error('Failed to load platform deliveries');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenStatusModal = (del) => {
    setSelectedDelivery(del);
    setNewStatus(del.status);
    setStatusNotes('');
    setStatusModalOpen(true);
  };

  const handleUpdateStatus = async () => {
    if (!selectedDelivery || !newStatus) return;
    setSavingStatus(true);
    try {
      await adminAPI.updateDeliveryStatus(selectedDelivery.id, newStatus, statusNotes || 'Administrative override');
      toast.success(`Delivery status updated to ${newStatus}`);
      setStatusModalOpen(false);
      fetchDeliveries();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Status update failed');
    } finally {
      setSavingStatus(false);
    }
  };

  const filteredDeliveries = deliveries.filter((d) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      d.tracking_number?.toLowerCase().includes(term) ||
      d.package_description?.toLowerCase().includes(term) ||
      d.recipient_name?.toLowerCase().includes(term) ||
      d.pickup_address?.toLowerCase().includes(term) ||
      d.delivery_address?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-yellow/15 text-brand-dark text-xs font-bold mb-2">
            <span>🛡️ Operations Control</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Package className="w-7 h-7 text-brand-blue" /> Platform Deliveries Monitor
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Global delivery oversight, status compliance, and nationwide route dispatch management
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/admin/dispatch"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-yellow hover:bg-yellow-400 text-slate-950 font-black text-xs shadow-xs transition-all cursor-pointer"
          >
            <Send className="w-4 h-4" /> Dispatch Orders
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search tracking, recipient, route..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full md:w-48 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all"
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
            className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-brand-blue' : ''}`} />
          </button>
        </div>
      </div>

      {/* Deliveries Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-[11px] uppercase font-bold text-slate-500 border-b border-slate-200/80 tracking-wider">
              <tr>
                <th className="px-5 py-4">Tracking Code</th>
                <th className="px-5 py-4">Package Details</th>
                <th className="px-5 py-4">Sender / Recipient</th>
                <th className="px-5 py-4">Assigned Courier</th>
                <th className="px-5 py-4">Delivery Fee</th>
                <th className="px-5 py-4">Order Status</th>
                <th className="px-5 py-4">Payment</th>
                <th className="px-5 py-4 text-right whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {loading ? (
                <tr>
                  <td colSpan="8" className="px-5 py-16 text-center text-slate-400">
                    <div className="w-7 h-7 border-3 border-brand-blue border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                    Loading deliveries...
                  </td>
                </tr>
              ) : filteredDeliveries.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-5 py-16 text-center text-slate-400">
                    <Package className="w-10 h-10 mx-auto mb-3 text-slate-300" />
                    No delivery records match your query.
                  </td>
                </tr>
              ) : (
                filteredDeliveries.map((del) => (
                  <tr key={del.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-4 font-mono font-black text-xs text-brand-blue">
                      {del.tracking_number || del.trackingCode}
                    </td>
                    <td className="px-5 py-4 font-semibold text-slate-900 max-w-xs truncate">
                      {del.package_description || del.packageDescription}
                    </td>
                    <td className="px-5 py-4 text-xs text-slate-600">
                      <div>To: <strong className="text-slate-800">{del.recipient_name || del.recipientName}</strong></div>
                      <div className="text-slate-400 truncate max-w-xs">{del.delivery_address || del.deliveryAddress}</div>
                    </td>
                    <td className="px-5 py-4 text-xs font-semibold text-slate-800">
                      {del.rider ? (
                        `${del.rider.first_name} ${del.rider.last_name}`
                      ) : (
                        <span className="text-amber-600 font-bold bg-amber-50 px-2 py-0.5 rounded-full">Unassigned</span>
                      )}
                    </td>
                    <td className="px-5 py-4 font-black text-slate-900">
                      {formatCurrency(del.deliveryFee || del.delivery_fee)}
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={del.status} type="delivery" />
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={getPaymentStatus(del)} type="payment" />
                    </td>
                    <td className="px-5 py-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenStatusModal(del)}
                          className="p-2 text-slate-500 hover:text-brand-blue hover:bg-brand-blue/10 rounded-xl transition-colors cursor-pointer"
                          title="Override Status"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <Link
                          to={`/track?tracking=${del.tracking_number || del.trackingCode}`}
                          className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
                          title="View Live Stepper"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Admin Status Override Modal */}
      <Modal
        isOpen={statusModalOpen}
        onClose={() => setStatusModalOpen(false)}
        title="Admin Status Override"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600">
            Override lifecycle status for package <strong className="text-slate-900">{selectedDelivery?.tracking_number || selectedDelivery?.trackingCode}</strong>.
          </p>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Select New Status
            </label>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all"
            >
              <option value="PENDING">PENDING</option>
              <option value="CONFIRMED">CONFIRMED</option>
              <option value="ASSIGNED">ASSIGNED</option>
              <option value="PICKED_UP">PICKED_UP</option>
              <option value="IN_TRANSIT">IN_TRANSIT</option>
              <option value="DELIVERED">DELIVERED</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Audit Notes
            </label>
            <input
              type="text"
              value={statusNotes}
              onChange={(e) => setStatusNotes(e.target.value)}
              placeholder="e.g. Administrative manual intervention"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setStatusModalOpen(false)}
              className="px-4 py-2.5 border border-slate-200 text-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={savingStatus}
              onClick={handleUpdateStatus}
              className="px-5 py-2.5 bg-brand-blue hover:bg-blue-900 text-white font-bold rounded-xl text-sm shadow-xs disabled:opacity-50 transition-all cursor-pointer"
            >
              {savingStatus ? 'Updating...' : 'Save Override'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
