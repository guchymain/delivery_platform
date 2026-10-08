import React from 'react'
import { Check, Clock, AlertTriangle, Sparkles } from 'lucide-react'
import { formatDate, STATUS_STEPS } from '../../lib/utils'

const STEP_METADATA = {
  PENDING: { label: 'Order Placed', desc: 'Awaiting confirmation' },
  CONFIRMED: { label: 'Confirmed', desc: 'Ready for rider dispatch' },
  ASSIGNED: { label: 'Rider Dispatched', desc: 'Courier heading to pickup' },
  PICKED_UP: { label: 'Package Picked Up', desc: 'Item collected by rider' },
  IN_TRANSIT: { label: 'In Transit', desc: 'En route to destination' },
  DELIVERED: { label: 'Delivered', desc: 'Handed over to recipient' }
}

const STEPS = STATUS_STEPS.map((status) => ({
  key: status,
  label: STEP_METADATA[status]?.label || status,
  desc: STEP_METADATA[status]?.desc || ''
}))

const STATUS_ORDER = Object.fromEntries(
  STATUS_STEPS.map((status, index) => [status, index])
)
STATUS_ORDER.CANCELLED = -1

export const DeliveryStepper = ({ currentStatus, statusLogs = [], cancellationReason }) => {
  if (currentStatus === 'CANCELLED') {
    return (
      <div className="bg-rose-50 border border-rose-200 rounded-3xl p-6 text-rose-800">
        <div className="flex items-center gap-3 mb-2">
          <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0" />
          <h3 className="font-bold text-base text-rose-900">Delivery Cancelled</h3>
        </div>
        <p className="text-xs text-rose-700">
          {cancellationReason ? `Reason: ${cancellationReason}` : 'This delivery request has been cancelled.'}
        </p>
      </div>
    )
  }

  const currentIndex = STATUS_ORDER[currentStatus] ?? 0

  // Match timestamps from statusLogs if available
  const getLogForStep = (stepKey) => {
    return statusLogs.find((l) => (l.status || l.to_status) === stepKey)
  }

  return (
    <div className="w-full py-3">
      <div className="relative">
        {/* Mobile vertical layout / Desktop horizontal */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 md:gap-2">
          {STEPS.map((step, idx) => {
            const isCompleted = idx <= currentIndex
            const isCurrent = idx === currentIndex
            const log = getLogForStep(step.key)

            return (
              <div key={step.key} className="flex md:flex-col items-start md:items-center relative group">
                {/* Horizontal connector line on desktop */}
                {idx < STEPS.length - 1 && (
                  <div
                    className={`hidden md:block absolute top-4 left-1/2 w-full h-0.5 z-0 transition-colors duration-300 ${
                      idx < currentIndex ? 'bg-[#003896]' : 'bg-slate-200'
                    }`}
                  />
                )}

                {/* Step Circle Indicator */}
                <div
                  className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-300 ${
                    isCurrent
                      ? 'bg-[#003896] text-[#FFC50F] ring-4 ring-[#FFC50F]/30 shadow-md shadow-blue-900/20'
                      : isCompleted
                      ? 'bg-[#003896] text-white shadow-xs'
                      : 'bg-white border-2 border-slate-300 text-slate-400'
                  }`}
                >
                  {isCompleted && !isCurrent ? (
                    <Check className="w-4 h-4 text-white" />
                  ) : isCurrent ? (
                    <span className="w-2.5 h-2.5 rounded-full bg-[#FFC50F] animate-pulse"></span>
                  ) : (
                    <span>{idx + 1}</span>
                  )}
                </div>

                {/* Step Label & Meta */}
                <div className="ml-3 md:ml-0 md:mt-2.5 md:text-center">
                  <p
                    className={`text-xs font-bold ${
                      isCurrent
                        ? 'text-[#003896]'
                        : isCompleted
                        ? 'text-slate-800'
                        : 'text-slate-400'
                    }`}
                  >
                    {step.label}
                  </p>
                  <p className="text-[10px] text-slate-500 hidden md:block mt-0.5">{step.desc}</p>
                  {log && (
                    <p className="text-[9px] text-[#003896] mt-1 font-mono font-medium">
                      {formatDate(log.createdAt)}
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default DeliveryStepper
