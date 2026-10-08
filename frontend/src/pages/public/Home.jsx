import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Package,
  Truck,
  ShieldCheck,
  Zap,
  Search,
  ArrowRight,
  Clock,
  MapPin,
  CheckCircle2,
  Users,
  Sparkles,
  Calculator,
  ChevronRight,
  Bike,
  Shield,
  CreditCard,
  PhoneCall,
  Check,
  HelpCircle,
  ExternalLink
} from 'lucide-react'
import { calculateDeliveryFee, formatCurrency } from '../../lib/utils'

const LAGOS_AREAS = [
  'Lekki Phase 1',
  'Victoria Island (VI)',
  'Ikoyi',
  'Ikeja GRA / Alausa',
  'Yaba Tech Cluster',
  'Surulere',
  'Maryland / Anthony',
  'Gbagada',
  'Magodo Phase 2',
  'Ajah / Sangotedo'
]

export const Home = () => {
  const [trackingCode, setTrackingCode] = useState('')
  const navigate = useNavigate()

  // Rate Estimator State (Topship Style)
  const [pickupArea, setPickupArea] = useState('Lekki Phase 1')
  const [dropoffArea, setDropoffArea] = useState('Ikeja GRA / Alausa')
  const [packageWeight, setPackageWeight] = useState(2.0)
  const [selectedSpeed, setSelectedSpeed] = useState('SAME_DAY')

  const estimatedFee = calculateDeliveryFee(packageWeight)

  const handleTrack = (e) => {
    e.preventDefault()
    if (trackingCode.trim()) {
      navigate(`/track/${encodeURIComponent(trackingCode.trim())}`)
    }
  }

  const handleBookWithEstimate = () => {
    navigate('/customer/create-delivery', {
      state: {
        pickupArea,
        dropoffArea,
        packageWeight
      }
    })
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans selection:bg-[#FFC50F] selection:text-slate-900">
      {/* Hero Section (Topship Lagos Style) */}
      <section className="relative overflow-hidden pt-10 pb-20 md:pt-16 md:pb-28 bg-gradient-to-b from-blue-50/70 via-white to-[#F8FAFC] border-b border-slate-200/80">
        {/* Subtle decorative background circles */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-tr from-[#003896]/5 via-[#FFC50F]/10 to-transparent blur-3xl rounded-full -z-10 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Headlines & Value Prop */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#003896]/10 border border-[#003896]/20 text-[#003896] text-xs font-bold tracking-wide">
                <span className="w-2 h-2 rounded-full bg-[#FFC50F] animate-pulse"></span>
                <span>LAGOS LOCAL & SAME-DAY DELIVERY</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.1]">
                Doorstep Delivery <br className="hidden sm:inline" />
                Within <span className="text-[#003896]">Lagos</span> & Beyond.
              </h1>

              <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl">
                Send parcels, documents, and merchandise across Lagos same-day or next-day.
                Get verified couriers at your doorstep, transparent upfront rates, and live milestone tracking.
              </p>

              {/* Topship Cut-off time alert banner */}
              <div className="p-3.5 bg-white rounded-xl border border-blue-100 shadow-xs flex items-center gap-3 max-w-xl">
                <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0 font-bold">
                  <Clock className="w-5 h-5 text-[#FFC50F]" />
                </div>
                <div className="text-xs">
                  <span className="font-bold text-slate-900">Same-Day Dispatch Guarantee: </span>
                  <span className="text-slate-600">
                    Book orders before <strong className="text-[#003896]">2:00 PM (WAT)</strong> for guaranteed same-day delivery across Island & Mainland.
                  </span>
                </div>
              </div>

              {/* Fast Tracking Form */}
              <div className="pt-2 max-w-xl">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Quick Track A Shipment
                </p>
                <form
                  onSubmit={handleTrack}
                  className="flex flex-col sm:flex-row items-center gap-2 p-1.5 bg-white rounded-2xl shadow-lg shadow-blue-900/5 border border-slate-200"
                >
                  <div className="flex items-center gap-2.5 w-full px-3 py-2">
                    <Search className="w-4 h-4 text-[#003896] flex-shrink-0" />
                    <input
                      type="text"
                      value={trackingCode}
                      onChange={(e) => setTrackingCode(e.target.value)}
                      placeholder="Enter Tracking ID (e.g., DEL-DEMO-001)"
                      className="w-full text-xs sm:text-sm text-slate-900 placeholder-slate-400 bg-transparent focus:outline-none font-medium"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full sm:w-auto px-5 py-2.5 bg-[#003896] hover:bg-[#002c77] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md shadow-blue-900/20 flex-shrink-0 cursor-pointer"
                  >
                    <span>Track</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </form>

                <div className="flex items-center gap-2 mt-2 text-[11px] text-slate-500">
                  <span className="font-medium">Try demo codes:</span>
                  <button
                    type="button"
                    onClick={() => navigate('/track/DEL-DEMO-001')}
                    className="text-[#003896] font-mono font-bold hover:underline"
                  >
                    DEL-DEMO-001
                  </button>
                  <span>•</span>
                  <button
                    type="button"
                    onClick={() => navigate('/track/DEL-DEMO-002')}
                    className="text-[#003896] font-mono font-bold hover:underline"
                  >
                    DEL-DEMO-002
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column: Topship Interactive Rate & Time Calculator */}
            <div className="lg:col-span-5">
              <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-xl shadow-blue-900/10 border border-blue-100/80 relative">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[#003896] text-white flex items-center justify-center shadow-xs">
                      <Calculator className="w-4 h-4 text-[#FFC50F]" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-sm">
                        Lagos Rate Estimator
                      </h3>
                      <p className="text-[11px] text-slate-500">
                        Instant transparent price check
                      </p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Live Rates
                  </span>
                </div>

                <div className="space-y-4 pt-4">
                  {/* Pickup Area */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#003896]" /> Pickup Location
                    </label>
                    <select
                      value={pickupArea}
                      onChange={(e) => setPickupArea(e.target.value)}
                      className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#003896]"
                    >
                      {LAGOS_AREAS.map((area) => (
                        <option key={area} value={area}>
                          {area}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Drop-off Area */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600" /> Destination
                    </label>
                    <select
                      value={dropoffArea}
                      onChange={(e) => setDropoffArea(e.target.value)}
                      className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#003896]"
                    >
                      {LAGOS_AREAS.map((area) => (
                        <option key={area} value={area}>
                          {area}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Weight Slider */}
                  <div>
                    <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                      <span>Package Weight</span>
                      <span className="text-[#003896] font-mono">{packageWeight.toFixed(1)} kg</span>
                    </div>
                    <input
                      type="range"
                      min="0.5"
                      max="20"
                      step="0.5"
                      value={packageWeight}
                      onChange={(e) => setPackageWeight(parseFloat(e.target.value))}
                      className="w-full accent-[#003896] cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-0.5">
                      <span>0.5 kg</span>
                      <span>5 kg</span>
                      <span>10 kg</span>
                      <span>20 kg</span>
                    </div>
                  </div>

                  {/* Speed Selector */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setSelectedSpeed('SAME_DAY')}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        selectedSpeed === 'SAME_DAY'
                          ? 'border-[#003896] bg-blue-50/50 text-[#003896]'
                          : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      <p className="text-[11px] font-bold flex items-center justify-between">
                        Same-Day Express
                        {selectedSpeed === 'SAME_DAY' && (
                          <Check className="w-3 h-3 text-[#003896]" />
                        )}
                      </p>
                      <p className="text-[10px] text-slate-500 mt-0.5">Under 4 hours</p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedSpeed('NEXT_DAY')}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        selectedSpeed === 'NEXT_DAY'
                          ? 'border-[#003896] bg-blue-50/50 text-[#003896]'
                          : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      <p className="text-[11px] font-bold flex items-center justify-between">
                        Next-Day Standard
                        {selectedSpeed === 'NEXT_DAY' && (
                          <Check className="w-3 h-3 text-[#003896]" />
                        )}
                      </p>
                      <p className="text-[10px] text-slate-500 mt-0.5">Economy slot</p>
                    </button>
                  </div>

                  {/* Calculated Price Display */}
                  <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80">
                    <div className="flex items-baseline justify-between mb-1">
                      <span className="text-xs text-slate-500 font-medium">Estimated Delivery Fee:</span>
                      <span className="text-2xl font-black text-[#003896]">
                        {formatCurrency(estimatedFee)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200/60">
                      <span>Formula: $5.00 base + $1.50/kg</span>
                      <span className="text-emerald-700 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> No surge pricing
                      </span>
                    </div>
                  </div>

                  {/* CTA Book Button */}
                  <button
                    onClick={handleBookWithEstimate}
                    className="w-full py-3 bg-[#003896] hover:bg-[#002c77] text-white text-xs font-bold rounded-xl shadow-md shadow-blue-900/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <span>Book Delivery with This Rate</span>
                    <ArrowRight className="w-4 h-4 text-[#FFC50F]" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Key Stats Strip */}
      <section className="bg-white border-b border-slate-200/80 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="p-2">
              <p className="text-2xl sm:text-3xl font-black text-[#003896]">50,000+</p>
              <p className="text-xs text-slate-500 font-medium mt-1">Lagos Deliveries Handled</p>
            </div>
            <div className="p-2">
              <p className="text-2xl sm:text-3xl font-black text-slate-900">35 mins</p>
              <p className="text-xs text-slate-500 font-medium mt-1">Average Courier Pickup</p>
            </div>
            <div className="p-2">
              <p className="text-2xl sm:text-3xl font-black text-[#003896]">99.4%</p>
              <p className="text-xs text-slate-500 font-medium mt-1">On-Time Completion Rate</p>
            </div>
            <div className="p-2">
              <p className="text-2xl sm:text-3xl font-black text-emerald-600">100%</p>
              <p className="text-xs text-slate-500 font-medium mt-1">Verified Couriers & Fleet</p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Topship in Lagos (Core Service Features) */}
      <section className="py-16 md:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-[#003896] bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
            Intra-City Logistics Built for Lagos
          </span>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight mt-3">
            Why Individuals & Businesses Choose Topship
          </h2>
          <p className="text-sm text-slate-600 mt-2">
            Eliminate delivery delays, untracked packages, and unpredictable pricing across Lagos.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-7 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#003896] flex items-center justify-center mb-5">
              <Zap className="w-6 h-6 text-[#003896]" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Same-Day Island & Mainland Express</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Fast, direct motorcycle dispatch. Move packages from Ikeja to Lekki or Yaba to Victoria Island in under 4 hours with priority matching.
            </p>
          </div>

          <div className="bg-white p-7 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-5">
              <MapPin className="w-6 h-6 text-[#FFC50F]" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Live Real-Time Milestone Tracking</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Full visibility on every shipment. Track from confirmation to rider assignment, collection, in-transit progress, and recipient handover.
            </p>
          </div>

          <div className="bg-white p-7 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-5">
              <ShieldCheck className="w-6 h-6 text-emerald-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Secure & Transparent Payments</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Pay via Debit Card, Bank Transfer, or Cash upon delivery. Automatic transaction references and receipt generation for easy bookkeeping.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works (3 Steps) */}
      <section className="bg-white py-16 md:py-24 border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Simple 3-Step Process
            </span>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight mt-2">
              How Topship Lagos Delivery Works
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div className="text-center p-6 space-y-4">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-[#003896] text-white flex items-center justify-center text-lg font-black shadow-md shadow-blue-900/20">
                1
              </div>
              <h3 className="text-base font-bold text-slate-900">Request Pickup in 60 Seconds</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Enter pickup and drop-off addresses, package weight, and choose your payment method. Instant price guaranteed.
              </p>
            </div>

            <div className="text-center p-6 space-y-4">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-[#FFC50F] text-slate-900 flex items-center justify-center text-lg font-black shadow-md">
                2
              </div>
              <h3 className="text-base font-bold text-slate-900">Courier Arrives & Collects</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                A nearby verified courier claims the delivery request, navigates to your doorstep, and collects the packaged item.
              </p>
            </div>

            <div className="text-center p-6 space-y-4">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-600 text-white flex items-center justify-center text-lg font-black shadow-md">
                3
              </div>
              <h3 className="text-base font-bold text-slate-900">Doorstep Handover & Proof</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                The parcel is swiftly delivered to the recipient with status confirmation logs updated instantly in your dashboard.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Lagos Coverage Areas */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="bg-[#003896] rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden">
          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[#FFC50F] text-xs font-bold mb-4">
              <MapPin className="w-3.5 h-3.5" /> Full Lagos Metropolitan Coverage
            </div>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight mb-4">
              Island to Mainland, We Cover Every Corner of Lagos.
            </h2>
            <p className="text-sm text-blue-100 leading-relaxed mb-6">
              Our fleet operates active dispatch zones across Lagos Island, Victoria Island, Ikoyi, Lekki Phase 1, Ajah, Ikeja, Yaba, Surulere, Maryland, Magodo, and surrounding districts.
            </p>

            <div className="flex flex-wrap gap-2 pt-2">
              {LAGOS_AREAS.map((hub) => (
                <span
                  key={hub}
                  className="px-3 py-1.5 rounded-full bg-white/15 text-white text-xs font-semibold backdrop-blur-xs border border-white/20"
                >
                  ✓ {hub}
                </span>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t border-white/15 flex flex-wrap items-center gap-4">
              <Link
                to="/register"
                className="px-6 py-3 rounded-full bg-[#FFC50F] hover:bg-[#e5b00b] text-slate-900 font-bold text-xs shadow-lg transition-all"
              >
                Create Delivery Account
              </Link>
              <Link
                to="/track"
                className="px-6 py-3 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition-all"
              >
                Track Live Shipment
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 1-Click Role Switcher & Demo Access Strip */}
      <section className="bg-slate-100/70 py-14 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-8">
            <span className="text-xs font-bold text-[#003896] uppercase tracking-wider">
              Experience Every Perspective
            </span>
            <h3 className="text-2xl font-black text-slate-900 mt-1">
              Explore Role Cockpits with 1-Click Demo Logins
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-[#003896] text-[10px] font-black uppercase">
                  Customer Role
                </span>
                <h4 className="font-bold text-slate-900 text-base mt-2">Book & Track Shipments</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Create delivery requests, estimate fees, simulate card payments, and view orders.
                </p>
                <div className="mt-3 p-2 bg-slate-50 rounded-lg text-[11px] font-mono text-slate-600">
                  customer1@delivery.com
                </div>
              </div>
              <Link
                to="/login"
                className="mt-4 w-full py-2 bg-slate-900 hover:bg-[#003896] text-white text-xs font-bold rounded-xl text-center transition-colors"
              >
                Login as Customer &rarr;
              </Link>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 text-[10px] font-black uppercase">
                  Rider Role
                </span>
                <h4 className="font-bold text-slate-900 text-base mt-2">Driver Dispatch Cockpit</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Toggle availability (AVAILABLE/OFFLINE), accept jobs, and update package transit milestones.
                </p>
                <div className="mt-3 p-2 bg-slate-50 rounded-lg text-[11px] font-mono text-slate-600">
                  rider1@delivery.com
                </div>
              </div>
              <Link
                to="/login"
                className="mt-4 w-full py-2 bg-slate-900 hover:bg-amber-600 text-white text-xs font-bold rounded-xl text-center transition-colors"
              >
                Login as Rider &rarr;
              </Link>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <span className="px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-800 text-[10px] font-black uppercase">
                  Administrator Role
                </span>
                <h4 className="font-bold text-slate-900 text-base mt-2">Fleet & Governance Center</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Assign couriers, manage user statuses, audit ledger payments, and oversee shipments.
                </p>
                <div className="mt-3 p-2 bg-slate-50 rounded-lg text-[11px] font-mono text-slate-600">
                  admin@delivery.com
                </div>
              </div>
              <Link
                to="/login"
                className="mt-4 w-full py-2 bg-slate-900 hover:bg-purple-700 text-white text-xs font-bold rounded-xl text-center transition-colors"
              >
                Login as Admin &rarr;
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Topship Footer */}
      <footer className="bg-slate-900 text-white py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#003896] flex items-center justify-center text-white">
                  <Package className="w-4 h-4 text-[#FFC50F]" />
                </div>
                <span className="font-black text-lg text-white">
                  Topship<span className="text-[#FFC50F]">.</span>
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Modern intra-city doorstep delivery for Lagos. Built with Express 5 REST API & React 19 SPA.
              </p>
            </div>

            <div>
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3">
                Services
              </h5>
              <ul className="space-y-2 text-xs text-slate-400">
                <li>Same-Day Lagos Delivery</li>
                <li>Next-Day Doorstep Courier</li>
                <li>Island & Mainland Express</li>
                <li>E-commerce Merchant Fulfillment</li>
              </ul>
            </div>

            <div>
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3">
                Quick Links
              </h5>
              <ul className="space-y-2 text-xs text-slate-400">
                <li><Link to="/track" className="hover:text-white">Track Delivery</Link></li>
                <li><Link to="/register" className="hover:text-white">Customer Registration</Link></li>
                <li><Link to="/login" className="hover:text-white">Sign In</Link></li>
              </ul>
            </div>

            <div>
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3">
                Hub Locations
              </h5>
              <p className="text-xs text-slate-400 leading-relaxed">
                Central Operations: Lagos Island, Victoria Island, Ikeja GRA, Lekki Phase 1, Nigeria.
              </p>
              <p className="text-[11px] text-[#FFC50F] font-bold mt-2">
                Support: hello@topship.africa
              </p>
            </div>
          </div>

          <div className="mt-10 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
            <p>© {new Date().getFullYear()} Topship Delivery Platform. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <span>PostgreSQL & Sequelize</span>
              <span>•</span>
              <span>Express 5 & React 19</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Home
