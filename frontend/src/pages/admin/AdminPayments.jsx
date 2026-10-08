import React, { useState, useEffect } from 'react';
import { paymentAPI } from '../../lib/api';
import { formatCurrency, formatDate } from '../../lib/utils';
import StatusBadge from '../../components/common/StatusBadge';
import Modal from '../../components/common/Modal';
import {
  CreditCard,
  Search,
  Filter,
  RotateCcw,
  RefreshCw,
  AlertTriangle,
  DollarSign
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminPayments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Refund modal state
  const [refundModalOpen, setRefundModalOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [refundReason, setRefundReason] = useState('');
  const [refunding, setRefunding] = useState(false);

  useEffect(() => {
    fetchPayments();
  }, [statusFilter]);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      const res = await paymentAPI.getAllPayments(params);
      setPayments(res.data?.data?.payments || []);
    } catch (err) {
      toast.error('Failed to load payments ledger');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenRefund = (pay) => {
    setSelectedPayment(pay);
    setRefundReason('');
    setRefundModalOpen(true);
  };

  const handleConfirmRefund = async () => {
    if (!selectedPayment) return;
    setRefunding(true);
    try {
      await paymentAPI.refund(selectedPayment.id, refundReason);
      toast.success('Payment successfully refunded.');
      setRefundModalOpen(false);
      fetchPayments();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Refund failed');
    } finally {
      setRefunding(false);
    }
  };

  const filteredPayments = payments.filter((p) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      p.transaction_reference?.toLowerCase().includes(term) ||
      p.user?.email?.toLowerCase().includes(term) ||
      p.delivery?.tracking_number?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-yellow/15 text-brand-dark text-xs font-bold mb-2">
            <span>💳 Settlement Engine</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <CreditCard className="w-7 h-7 text-brand-blue" /> Platform Financial Ledger
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Global payment transactions, escrow reconciliation, and payment refunds across Lagos deliveries
          </p>
        </div>

        <button
          onClick={fetchPayments}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold shadow-xs transition-colors cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-brand-blue' : ''}`} />
          Refresh Ledger
        </button>
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
            placeholder="Search reference, customer email, tracking..."
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
            <option value="PENDING">PENDING</option>
            <option value="SUCCESSFUL">SUCCESSFUL</option>
            <option value="FAILED">FAILED</option>
            <option value="REFUNDED">REFUNDED</option>
          </select>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-[11px] uppercase font-bold text-slate-500 border-b border-slate-200/80 tracking-wider">
              <tr>
                <th className="px-5 py-4">Transaction Ref</th>
                <th className="px-5 py-4">Customer</th>
                <th className="px-5 py-4">Tracking Code</th>
                <th className="px-5 py-4">Amount</th>
                <th className="px-5 py-4">Method</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Timestamp</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {loading ? (
                <tr>
                  <td colSpan="8" className="px-5 py-16 text-center text-slate-400">
                    <div className="w-7 h-7 border-3 border-brand-blue border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                    Fetching financial ledger...
                  </td>
                </tr>
              ) : filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-5 py-16 text-center text-slate-400">
                    <CreditCard className="w-10 h-10 mx-auto mb-3 text-slate-300" />
                    No transactions match criteria.
                  </td>
                </tr>
              ) : (
                filteredPayments.map((p) => {
                  const canRefund = p.status === 'SUCCESSFUL';
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-5 py-4 font-mono font-black text-xs text-brand-blue">
                        {p.transaction_reference || p.transactionReference}
                      </td>
                      <td className="px-5 py-4">
                        <div className="font-bold text-slate-900">
                          {p.user?.first_name} {p.user?.last_name}
                        </div>
                        <div className="text-xs text-slate-500 font-mono">{p.user?.email}</div>
                      </td>
                      <td className="px-5 py-4 font-mono text-xs text-brand-blue font-bold">
                        {p.delivery?.tracking_number || p.delivery?.trackingCode || 'N/A'}
                      </td>
                      <td className="px-5 py-4 font-black text-slate-900">
                        {formatCurrency(p.amount)}
                      </td>
                      <td className="px-5 py-4 font-bold text-slate-700 text-xs">
                        <span className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200">
                          {p.payment_method || p.paymentMethod}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <StatusBadge status={p.status} type="payment" />
                      </td>
                      <td className="px-5 py-4 text-xs text-slate-400 whitespace-nowrap font-medium">
                        {formatDate(p.createdAt)}
                      </td>
                      <td className="px-5 py-4 text-right">
                        {canRefund && (
                          <button
                            onClick={() => handleOpenRefund(p)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-brand-blue/30 text-brand-blue hover:bg-brand-blue hover:text-white text-xs font-bold transition-all cursor-pointer shadow-xs"
                          >
                            <RotateCcw className="w-3.5 h-3.5" /> Refund
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Refund Modal */}
      <Modal
        isOpen={refundModalOpen}
        onClose={() => setRefundModalOpen(false)}
        title="Issue Payment Refund"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-brand-blue/5 border border-brand-blue/15 text-slate-800 rounded-2xl text-xs">
            <AlertTriangle className="w-5 h-5 shrink-0 text-amber-500" />
            <span>
              Issue refund of <strong className="text-brand-blue font-black">{formatCurrency(selectedPayment?.amount)}</strong> for reference <strong className="font-mono">{selectedPayment?.transaction_reference || selectedPayment?.transactionReference}</strong>?
            </span>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Refund Reason (Optional)
            </label>
            <input
              type="text"
              value={refundReason}
              onChange={(e) => setRefundReason(e.target.value)}
              placeholder="e.g. Order cancelled, dispute settlement"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setRefundModalOpen(false)}
              className="px-4 py-2.5 border border-slate-200 text-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={refunding}
              onClick={handleConfirmRefund}
              className="px-5 py-2.5 bg-brand-blue hover:bg-blue-900 text-white font-bold rounded-xl text-sm shadow-xs disabled:opacity-50 transition-all cursor-pointer"
            >
              {refunding ? 'Refunding...' : 'Confirm Refund'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
