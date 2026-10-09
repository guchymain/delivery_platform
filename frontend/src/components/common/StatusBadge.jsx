import React from 'react'
import {
  Clock,
  CheckCircle2,
  UserCheck,
  Package,
  Truck,
  CheckCheck,
  XCircle,
  CreditCard,
  RotateCcw,
  CircleDot
} from 'lucide-react'

export const StatusBadge = ({ status, type = 'delivery', size = 'md' }) => {
  if (!status) return null

  const s = String(status).toUpperCase()

  const sizeClasses = {
    sm: 'text-xs px-2.5 py-0.5 gap-1 whitespace-nowrap shrink-0 font-medium',
    md: 'text-xs font-semibold px-2.5 py-1 gap-1.5 whitespace-nowrap shrink-0',
    lg: 'text-sm font-semibold px-3 py-1.5 gap-2 whitespace-nowrap shrink-0'
  }[size] || 'text-xs px-2.5 py-1 gap-1.5 whitespace-nowrap shrink-0 font-medium'

  // Delivery status configuration
  if (type === 'delivery') {
    switch (s) {
      case 'PENDING':
        return (
          <span className={`inline-flex items-center rounded-full bg-amber-50 text-amber-700 border border-amber-200/80 ${sizeClasses}`}>
            <Clock className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
            Pending Confirmation
          </span>
        )
      case 'CONFIRMED':
        return (
          <span className={`inline-flex items-center rounded-full bg-blue-50 text-blue-700 border border-blue-200/80 ${sizeClasses}`}>
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" />
            Confirmed
          </span>
        )
      case 'ASSIGNED':
        return (
          <span className={`inline-flex items-center rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/80 ${sizeClasses}`}>
            <UserCheck className="w-3.5 h-3.5 text-indigo-500" />
            Rider Assigned
          </span>
        )
      case 'PICKED_UP':
        return (
          <span className={`inline-flex items-center rounded-full bg-purple-50 text-purple-700 border border-purple-200/80 ${sizeClasses}`}>
            <Package className="w-3.5 h-3.5 text-purple-500" />
            Picked Up
          </span>
        )
      case 'IN_TRANSIT':
        return (
          <span className={`inline-flex items-center rounded-full bg-sky-50 text-sky-700 border border-sky-200/80 ${sizeClasses}`}>
            <Truck className="w-3.5 h-3.5 text-sky-500 animate-bounce" />
            In Transit
          </span>
        )
      case 'DELIVERED':
        return (
          <span className={`inline-flex items-center rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 ${sizeClasses}`}>
            <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
            Delivered
          </span>
        )
      case 'CANCELLED':
        return (
          <span className={`inline-flex items-center rounded-full bg-rose-50 text-rose-700 border border-rose-200/80 ${sizeClasses}`}>
            <XCircle className="w-3.5 h-3.5 text-rose-500" />
            Cancelled
          </span>
        )
      default:
        return (
          <span className={`inline-flex items-center rounded-full bg-slate-100 text-slate-700 border border-slate-200 ${sizeClasses}`}>
            <CircleDot className="w-3.5 h-3.5" />
            {s}
          </span>
        )
    }
  }

  // Payment status configuration
  if (type === 'payment') {
    switch (s) {
      case 'SUCCESSFUL':
        return (
          <span className={`inline-flex items-center rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 ${sizeClasses}`}>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Paid
          </span>
        )
      case 'PENDING':
        return (
          <span className={`inline-flex items-center rounded-full bg-amber-50 text-amber-700 border border-amber-200 ${sizeClasses}`}>
            <Clock className="w-3.5 h-3.5 text-amber-500" />
            Payment Pending
          </span>
        )
      case 'REFUNDED':
        return (
          <span className={`inline-flex items-center rounded-full bg-purple-50 text-purple-700 border border-purple-200 ${sizeClasses}`}>
            <RotateCcw className="w-3.5 h-3.5 text-purple-500" />
            Refunded
          </span>
        )
      case 'FAILED':
        return (
          <span className={`inline-flex items-center rounded-full bg-rose-50 text-rose-700 border border-rose-200 ${sizeClasses}`}>
            <XCircle className="w-3.5 h-3.5 text-rose-500" />
            Failed
          </span>
        )
      default:
        return (
          <span className={`inline-flex items-center rounded-full bg-slate-100 text-slate-700 ${sizeClasses}`}>
            <CreditCard className="w-3.5 h-3.5" />
            {s}
          </span>
        )
    }
  }

  // Rider availability configuration
  if (type === 'availability') {
    switch (s) {
      case 'AVAILABLE':
        return (
          <span className={`inline-flex items-center rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 ${sizeClasses}`}>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse mr-1"></span>
            Available
          </span>
        )
      case 'BUSY':
        return (
          <span className={`inline-flex items-center rounded-full bg-amber-50 text-amber-700 border border-amber-200 ${sizeClasses}`}>
            <span className="w-2 h-2 rounded-full bg-amber-500 mr-1"></span>
            Busy (On Job)
          </span>
        )
      case 'OFFLINE':
      default:
        return (
          <span className={`inline-flex items-center rounded-full bg-slate-100 text-slate-600 border border-slate-200 ${sizeClasses}`}>
            <span className="w-2 h-2 rounded-full bg-slate-400 mr-1"></span>
            Offline
          </span>
        )
    }
  }

  // User Account status
  if (type === 'account') {
    switch (s) {
      case 'ACTIVE':
        return (
          <span className={`inline-flex items-center rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 ${sizeClasses}`}>
            Active
          </span>
        )
      case 'INACTIVE':
        return (
          <span className={`inline-flex items-center rounded-full bg-slate-100 text-slate-600 border border-slate-200 ${sizeClasses}`}>
            Inactive
          </span>
        )
      case 'SUSPENDED':
        return (
          <span className={`inline-flex items-center rounded-full bg-rose-50 text-rose-700 border border-rose-200 ${sizeClasses}`}>
            Suspended
          </span>
        )
      default:
        return <span>{s}</span>
    }
  }

  return (
    <span className={`inline-flex items-center rounded-full bg-slate-100 text-slate-700 ${sizeClasses}`}>
      {s}
    </span>
  )
}

export default StatusBadge
