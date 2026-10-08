import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { paymentAPI } from '../../lib/api';
import { formatCurrency, formatDate } from '../../lib/utils';
import StatusBadge from '../../components/common/StatusBadge';
import { CreditCard, DollarSign, CheckCircle2, Clock, RotateCcw, AlertCircle, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CustomerPayments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const res = await paymentAPI.getMyPayments();
      setPayments(res.data?.data?.payments || res.data?.payments || []);
    } catch (err) {
      toast.error('Failed to load payment history');
    } finally {
      setLoading(false);
    }
  };

  const totalSettled = payments
    .filter((p) => (p.paymentStatus || p.status) === 'SUCCESSFUL')
    .reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);

  const pendingCount = payments.filter((p) => (p.paymentStatus || p.status) === 'PENDING').length;
  const refundedCount = payments.filter((p) => (p.paymentStatus || p.status) === 'REFUNDED').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 font-sans">
      <div>
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-[#003896] text-[10px] font-bold uppercase tracking-wider mb-1">
          <Sparkles className="w-3 h-3 text-[#FFC50F]" /> Billing Ledger
        </div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          Billing & Payment Receipts
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Review your delivery payment receipts, transaction references, and settlement statuses across Lagos
        </p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Settled</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">{formatCurrency(totalSettled)}</h3>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Pending Settlement</p>
            <h3 className="text-2xl font-black text-amber-600 mt-1">{pendingCount}</h3>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Clock className="w-5 h-5 text-[#FFC50F]" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Refunded</p>
            <h3 className="text-2xl font-black text-purple-600 mt-1">{refundedCount}</h3>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
            <RotateCcw className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-bold text-slate-900 text-sm uppercase tracking-wider">Transaction History</h2>
          <span className="text-xs text-slate-400 font-bold">Total: {payments.length}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-[11px] uppercase font-bold text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-5 py-3.5">Reference ID</th>
                <th className="px-5 py-3.5">Shipment Order</th>
                <th className="px-5 py-3.5">Amount</th>
                <th className="px-5 py-3.5">Payment Method</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5">Recorded At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-5 py-12 text-center text-slate-400">
                    <div className="w-6 h-6 border-2 border-[#003896] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Loading billing history...
                  </td>
                </tr>
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-5 py-12 text-center text-slate-400">
                    No payment transactions recorded yet.
                  </td>
                </tr>
              ) : (
                payments.map((p) => {
                  const ref = p.transactionReference || p.transaction_reference || `TX-${p.id}`;
                  const tracking = p.delivery?.trackingCode || p.delivery?.tracking_number;
                  const method = p.paymentMethod || p.payment_method || 'CARD';
                  const status = p.paymentStatus || p.status || 'PENDING';

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/70">
                      <td className="px-5 py-4 font-mono font-bold text-xs text-[#003896]">
                        {ref}
                      </td>
                      <td className="px-5 py-4">
                        {p.delivery ? (
                          <Link
                            to={`/customer/deliveries/${p.delivery.id}`}
                            className="font-mono text-xs font-bold text-[#003896] hover:underline"
                          >
                            {tracking}
                          </Link>
                        ) : (
                          <span className="text-xs text-slate-400">N/A</span>
                        )}
                      </td>
                      <td className="px-5 py-4 font-black text-slate-900">
                        {formatCurrency(p.amount)}
                      </td>
                      <td className="px-5 py-4 font-semibold text-slate-800">
                        {method}
                      </td>
                      <td className="px-5 py-4">
                        <StatusBadge status={status} type="payment" size="sm" />
                      </td>
                      <td className="px-5 py-4 text-[11px] text-slate-400 whitespace-nowrap font-mono">
                        {formatDate(p.createdAt)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
