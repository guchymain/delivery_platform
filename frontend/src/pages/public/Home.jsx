import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Package,
  Search,
  ArrowRight,
  ShieldCheck,
  Zap,
  Globe,
  Clock,
  MapPin,
  CheckCircle2,
  Calculator,
  Check,
  Plane,
  Truck,
  Sparkles,
  ShoppingBag,
  Box,
  Compass
} from 'lucide-react'
import { calculateDeliveryFee, formatCurrency, formatNaira } from '../../lib/utils'

const NIGERIA_DOMESTIC_HUBS = [
  'Lagos (Island & Mainland)',
  'Abuja (FCT / Central District)',
  'Port Harcourt (Rivers State)',
  'Ibadan (Oyo State)',
  'Kano (Commercial Hub)',
  'Enugu (South East Hub)',
  'Benin City (Edo State)',
  'Calabar (Cross River)',
  'Kaduna (North Central)',
  'Abeokuta (Ogun State)',
  'Asaba / Warri (Delta State)',
  'Uyo (Akwa Ibom)'
]

const INTERNATIONAL_DESTINATIONS = [
  'United Kingdom (London & Nationwide)',
  'United States (New York, Texas, California)',
  'Canada (Toronto, Vancouver, Ottawa)',
  'Ghana (Accra / Kumasi)',
  'Germany (Frankfurt / Berlin)',
  'United Arab Emirates (Dubai / Abu Dhabi)',
  'South Africa (Johannesburg / Cape Town)',
  'China (Guangzhou / Shanghai / Beijing)',
  'Kenya (Nairobi / Mombasa)',
  'France (Paris & Regions)'
]

const SHOP_N_SHIP_ORIGINS = [
  'United States (Delaware Tax-Free Warehouse)',
  'United Kingdom (London Transit Hub)',
  'China (Guangzhou Consolidation Hub)'
]

export const Home = () => {
  const [trackingCode, setTrackingCode] = useState('')
  const navigate = useNavigate()

  // Shipping Calculator State
  const [shippingMode, setShippingMode] = useState('DOMESTIC') // 'DOMESTIC' | 'INTERNATIONAL' | 'SHOP_N_SHIP'
  const [pickupLocation, setPickupLocation] = useState('Lagos (Island & Mainland)')
  const [dropoffLocation, setDropoffLocation] = useState('Abuja (FCT / Central District)')
  const [packageWeight, setPackageWeight] = useState(2.0)
  const [selectedSpeed, setSelectedSpeed] = useState('EXPRESS')

  const estimatedFee = calculateDeliveryFee(packageWeight)

  const handleTrack = (e) => {
    e.preventDefault()
    if (trackingCode.trim()) {
      navigate(`/track/${encodeURIComponent(trackingCode.trim())}`)
    }
  }

  const handleModeSwitch = (mode) => {
    setShippingMode(mode)
    if (mode === 'DOMESTIC') {
      setPickupLocation('Lagos (Island & Mainland)')
      setDropoffLocation('Abuja (FCT / Central District)')
    } else if (mode === 'INTERNATIONAL') {
      setPickupLocation('Nigeria (Doorstep Collection)')
      setDropoffLocation('United Kingdom (London & Nationwide)')
    } else if (mode === 'SHOP_N_SHIP') {
      setPickupLocation('United States (Delaware Tax-Free Warehouse)')
      setDropoffLocation('Nigeria (Doorstep Handover)')
    }
  }

  const handleBookWithEstimate = () => {
    navigate('/customer/create-delivery', {
      state: {
        pickupArea: pickupLocation,
        dropoffArea: dropoffLocation,
        packageWeight,
        shippingMode
      }
    })
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans selection:bg-[#FFC50F] selection:text-slate-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-10 pb-20 md:pt-16 md:pb-28 bg-gradient-to-b from-blue-50/70 via-white to-[#F8FAFC] border-b border-slate-200/80">
        {/* Decorative background glow */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-tr from-[#003896]/5 via-[#FFC50F]/10 to-transparent blur-3xl rounded-full -z-10 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Headlines & Positioning */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#003896]/10 border border-[#003896]/20 text-[#003896] text-xs font-bold tracking-wide">
                <span className="w-2 h-2 rounded-full bg-[#FFC50F] animate-pulse"></span>
                <span>GLOBAL & DOMESTIC SHIPPING FROM NIGERIA</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.12]">
                Ship Cargo, Freight <br className="hidden sm:inline" />
                & Doorstep Deliveries <br className="hidden sm:inline" />
                <span className="text-[#003896]">Across Nigeria & Worldwide.</span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl">
                Send packages from your doorstep anywhere in Nigeria to 200+ global destinations or between all 36 states. Enjoy transparent upfront pricing, verified couriers, and live milestone tracking.
              </p>

              {/* Service Capabilities Highlight */}
              <div className="p-4 bg-white rounded-2xl border border-blue-100 shadow-xs flex items-center gap-3.5 max-w-xl">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 font-bold">
                  <Plane className="w-5 h-5 text-[#FFC50F]" />
                </div>
                <div className="text-xs">
                  <span className="font-bold text-slate-900">Doorstep Logistics Everywhere: </span>
                  <span className="text-slate-600">
                    Same-day intra-city delivery, 24–48hr nationwide interstate transit, and express air freight to the UK, US, Canada & beyond.
                  </span>
                </div>
              </div>

              {/* Quick Tracking Form */}
              <div className="pt-2 max-w-xl">
                <p className="text-sm font-bold uppercase tracking-wider text-slate-700 mb-2.5">
                  Track Any Shipment Live
                </p>
                <form
                  onSubmit={handleTrack}
                  className="flex flex-col sm:flex-row items-center gap-2 p-2 bg-white rounded-2xl shadow-xl shadow-blue-900/5 border border-slate-200"
                >
                  <div className="flex items-center gap-3 w-full px-3 py-2">
                    <Search className="w-5 h-5 text-[#003896] shrink-0" />
                    <input
                      type="text"
                      value={trackingCode}
                      onChange={(e) => setTrackingCode(e.target.value)}
                      placeholder="Enter Tracking ID (e.g., DEL-DEMO-001)"
                      className="w-full text-sm sm:text-base text-slate-900 placeholder-slate-400 bg-transparent focus:outline-none font-medium"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full sm:w-auto px-7 py-3.5 bg-[#003896] hover:bg-[#002c77] text-white text-sm font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-md shadow-blue-900/20 shrink-0 cursor-pointer"
                  >
                    <span>Track</span>
                    <ArrowRight className="w-4 h-4 text-[#FFC50F]" />
                  </button>
                </form>
              </div>
            </div>

            {/* Right Column: Multi-Scope Interactive Shipping Rate & Transit Calculator */}
            <div className="lg:col-span-5">
              <div className="bg-white rounded-3xl p-7 sm:p-9 shadow-xl shadow-blue-900/10 border border-blue-100/80 relative">
                {/* Header */}
                <div className="flex items-center justify-between pb-5 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#003896] text-white flex items-center justify-center shadow-xs">
                      <Calculator className="w-5 h-5 text-[#FFC50F]" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-base sm:text-lg">
                        Shipping Rate Estimator
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-500">
                        Instant transparent price check
                      </p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Live Rates
                  </span>
                </div>

                {/* Service Mode Tabs (Domestic / International / Shop & Ship) */}
                <div className="grid grid-cols-3 gap-2 bg-slate-100 p-1.5 rounded-2xl mt-5">
                  <button
                    type="button"
                    onClick={() => handleModeSwitch('DOMESTIC')}
                    className={`py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer ${
                      shippingMode === 'DOMESTIC'
                        ? 'bg-white text-[#003896] shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Nigeria
                  </button>
                  <button
                    type="button"
                    onClick={() => handleModeSwitch('INTERNATIONAL')}
                    className={`py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer ${
                      shippingMode === 'INTERNATIONAL'
                        ? 'bg-white text-[#003896] shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    International
                  </button>
                  <button
                    type="button"
                    onClick={() => handleModeSwitch('SHOP_N_SHIP')}
                    className={`py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer ${
                      shippingMode === 'SHOP_N_SHIP'
                        ? 'bg-white text-[#003896] shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Shop & Ship
                  </button>
                </div>

                <div className="space-y-4 pt-5">
                  {/* Origin Location */}
                  <div>
                    <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-[#003896]" />
                      {shippingMode === 'SHOP_N_SHIP' ? 'Overseas Origin Store' : 'Pickup Location (Nigeria)'}
                    </label>

                    {shippingMode === 'DOMESTIC' && (
                      <select
                        value={pickupLocation}
                        onChange={(e) => setPickupLocation(e.target.value)}
                        className="w-full text-sm font-medium bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#003896]"
                      >
                        {NIGERIA_DOMESTIC_HUBS.map((hub) => (
                          <option key={hub} value={hub}>{hub}</option>
                        ))}
                      </select>
                    )}

                    {shippingMode === 'INTERNATIONAL' && (
                      <select
                        value={pickupLocation}
                        onChange={(e) => setPickupLocation(e.target.value)}
                        className="w-full text-sm font-medium bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#003896]"
                      >
                        <option value="Nigeria (Lagos Hub)">Nigeria (Lagos Hub)</option>
                        <option value="Nigeria (Abuja FCT Hub)">Nigeria (Abuja FCT Hub)</option>
                        <option value="Nigeria (Port Harcourt Hub)">Nigeria (Port Harcourt Hub)</option>
                        <option value="Nigeria (Doorstep Collection Nationwide)">Nigeria (Doorstep Collection Nationwide)</option>
                      </select>
                    )}

                    {shippingMode === 'SHOP_N_SHIP' && (
                      <select
                        value={pickupLocation}
                        onChange={(e) => setPickupLocation(e.target.value)}
                        className="w-full text-sm font-medium bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#003896]"
                      >
                        {SHOP_N_SHIP_ORIGINS.map((hub) => (
                          <option key={hub} value={hub}>{hub}</option>
                        ))}
                      </select>
                    )}
                  </div>

                  {/* Destination Location */}
                  <div>
                    <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-emerald-600" />
                      {shippingMode === 'INTERNATIONAL' ? 'Global Destination Country' : 'Destination Address'}
                    </label>

                    {shippingMode === 'DOMESTIC' && (
                      <select
                        value={dropoffLocation}
                        onChange={(e) => setDropoffLocation(e.target.value)}
                        className="w-full text-sm font-medium bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#003896]"
                      >
                        {NIGERIA_DOMESTIC_HUBS.map((hub) => (
                          <option key={hub} value={hub}>{hub}</option>
                        ))}
                      </select>
                    )}

                    {shippingMode === 'INTERNATIONAL' && (
                      <select
                        value={dropoffLocation}
                        onChange={(e) => setDropoffLocation(e.target.value)}
                        className="w-full text-sm font-medium bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#003896]"
                      >
                        {INTERNATIONAL_DESTINATIONS.map((country) => (
                          <option key={country} value={country}>{country}</option>
                        ))}
                      </select>
                    )}

                    {shippingMode === 'SHOP_N_SHIP' && (
                      <select
                        value={dropoffLocation}
                        onChange={(e) => setDropoffLocation(e.target.value)}
                        className="w-full text-sm font-medium bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#003896]"
                      >
                        <option value="Nigeria (Doorstep Delivery in Lagos)">Nigeria (Doorstep Delivery in Lagos)</option>
                        <option value="Nigeria (Doorstep Delivery in Abuja)">Nigeria (Doorstep Delivery in Abuja)</option>
                        <option value="Nigeria (Doorstep Delivery in Port Harcourt)">Nigeria (Doorstep Delivery in Port Harcourt)</option>
                        <option value="Nigeria (Nationwide Last-Mile Delivery)">Nigeria (Nationwide Last-Mile Delivery)</option>
                      </select>
                    )}
                  </div>

                  {/* Weight Slider */}
                  <div>
                    <div className="flex justify-between text-xs sm:text-sm font-bold text-slate-700 mb-1.5">
                      <span>Package Weight</span>
                      <span className="text-[#003896] font-mono text-sm sm:text-base">{packageWeight.toFixed(1)} kg</span>
                    </div>
                    <input
                      type="range"
                      min="0.5"
                      max="20"
                      step="0.5"
                      value={packageWeight}
                      onChange={(e) => setPackageWeight(parseFloat(e.target.value))}
                      className="w-full accent-[#003896] cursor-pointer h-2 bg-slate-200 rounded-lg"
                    />
                    <div className="flex justify-between text-xs text-slate-400 font-mono mt-1">
                      <span>0.5 kg</span>
                      <span>5 kg</span>
                      <span>10 kg</span>
                      <span>20 kg</span>
                    </div>
                  </div>

                  {/* Speed & Transit Guarantee */}
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <button
                      type="button"
                      onClick={() => setSelectedSpeed('EXPRESS')}
                      className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                        selectedSpeed === 'EXPRESS'
                          ? 'border-[#003896] bg-blue-50/50 text-[#003896]'
                          : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      <p className="text-xs sm:text-sm font-bold flex items-center justify-between">
                        Express Dispatch
                        {selectedSpeed === 'EXPRESS' && (
                          <Check className="w-4 h-4 text-[#003896]" />
                        )}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        {shippingMode === 'DOMESTIC' ? 'Same-day / 24 hrs' : '3–5 business days'}
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedSpeed('STANDARD')}
                      className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                        selectedSpeed === 'STANDARD'
                          ? 'border-[#003896] bg-blue-50/50 text-[#003896]'
                          : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      <p className="text-xs sm:text-sm font-bold flex items-center justify-between">
                        Economy Freight
                        {selectedSpeed === 'STANDARD' && (
                          <Check className="w-4 h-4 text-[#003896]" />
                        )}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        {shippingMode === 'DOMESTIC' ? '2–3 business days' : '5–7 business days'}
                      </p>
                    </button>
                  </div>

                  {/* Calculated Price Display */}
                  <div className="p-4 sm:p-5 bg-slate-50 rounded-2xl border border-slate-200/80">
                    <div className="flex items-baseline justify-between mb-1.5">
                      <span className="text-xs sm:text-sm text-slate-600 font-semibold">Estimated Delivery Fee:</span>
                      <div className="text-right">
                        <span className="text-2xl sm:text-3xl font-black text-[#003896]">
                          {formatCurrency(estimatedFee)}
                        </span>
                        <span className="block text-xs sm:text-sm font-bold text-slate-700">
                          ≈ {formatNaira(estimatedFee)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-200/60">
                      <span>Transparent: $5.00 base + $1.50/kg</span>
                      <span className="text-emerald-700 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> No hidden fees
                      </span>
                    </div>
                  </div>

                  {/* CTA Book Button */}
                  <button
                    onClick={handleBookWithEstimate}
                    className="w-full py-4 bg-[#003896] hover:bg-[#002c77] text-white text-sm sm:text-base font-bold rounded-2xl shadow-md shadow-blue-900/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <span>Book Shipment with This Rate</span>
                    <ArrowRight className="w-4 h-4 text-[#FFC50F]" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Key Metrics Strip */}
      <section className="bg-white border-b border-slate-200/80 py-10 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="p-2">
              <p className="text-3xl sm:text-4xl font-black text-[#003896]">200+</p>
              <p className="text-sm font-medium text-slate-600 mt-1.5">Global Cities & Countries</p>
            </div>
            <div className="p-2">
              <p className="text-3xl sm:text-4xl font-black text-slate-900">36 States</p>
              <p className="text-sm font-medium text-slate-600 mt-1.5">Nationwide Nigeria Coverage</p>
            </div>
            <div className="p-2">
              <p className="text-3xl sm:text-4xl font-black text-[#003896]">99.4%</p>
              <p className="text-sm font-medium text-slate-600 mt-1.5">On-Time Completion Rate</p>
            </div>
            <div className="p-2">
              <p className="text-3xl sm:text-4xl font-black text-emerald-600">100%</p>
              <p className="text-sm font-medium text-slate-600 mt-1.5">Verified Drivers & Escrow</p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Service Pillars */}
      <section className="py-20 md:py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#003896] bg-blue-50 px-4 py-1.5 rounded-full border border-blue-100">
            Logistics Infrastructure Built for Africa & Beyond
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight mt-4">
            Why Individuals & Businesses Choose SwiftShip
          </h2>
          <p className="text-base sm:text-lg text-slate-600 mt-3 leading-relaxed">
            Eliminate shipping delays, lost packages, and opaque customs charges across Nigeria and worldwide.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-sm hover:shadow-lg transition-all min-h-[300px] flex flex-col justify-start">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-[#003896] flex items-center justify-center mb-6">
              <Truck className="w-7 h-7 text-[#003896]" />
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-3">Nationwide Nigerian Logistics</h3>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              Fast, direct courier dispatch. Move parcels, merchandise, and food across Lagos, Abuja, Port Harcourt, and all 36 states with priority door-to-door matching.
            </p>
          </div>

          <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-sm hover:shadow-lg transition-all min-h-[300px] flex flex-col justify-start">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-6">
              <Globe className="w-7 h-7 text-[#FFC50F]" />
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-3">Global Export to 200+ Countries</h3>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              Express air cargo and courier shipping from Nigeria to the UK, US, Canada, Europe, and Asia with customs clearance and door-to-door delivery.
            </p>
          </div>

          <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-sm hover:shadow-lg transition-all min-h-[300px] flex flex-col justify-start">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-6">
              <ShieldCheck className="w-7 h-7 text-emerald-600" />
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-3">Secure Payments & COD Escrow</h3>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              Pay with Debit Card, Bank Transfer, or Cash upon delivery (COD). Automated transaction receipts and balance reconciliations keep bookkeeping effortless.
            </p>
          </div>
        </div>
      </section>

      {/* How SwiftShip Works (3 Steps) */}
      <section className="bg-white py-20 md:py-28 border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-500">
              Simple 3-Step Process
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight mt-3">
              How SwiftShip Delivery Works
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div className="text-center p-8 bg-slate-50/70 rounded-3xl border border-slate-200/60 space-y-4">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-[#003896] text-white flex items-center justify-center text-xl font-black shadow-md shadow-blue-900/20">
                1
              </div>
              <h3 className="text-xl font-bold text-slate-900">Request Pickup in 60 Seconds</h3>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                Enter your pickup and destination locations, package weight, and payment preference. Upfront pricing is computed instantly.
              </p>
            </div>

            <div className="text-center p-8 bg-slate-50/70 rounded-3xl border border-slate-200/60 space-y-4">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-[#FFC50F] text-slate-900 flex items-center justify-center text-xl font-black shadow-md">
                2
              </div>
              <h3 className="text-xl font-bold text-slate-900">Courier Arrives & Dispatches</h3>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                A verified courier claims the delivery request, navigates to your doorstep, and collects the packaged item for rapid transit.
              </p>
            </div>

            <div className="text-center p-8 bg-slate-50/70 rounded-3xl border border-slate-200/60 space-y-4">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-600 text-white flex items-center justify-center text-xl font-black shadow-md">
                3
              </div>
              <h3 className="text-xl font-bold text-slate-900">Verified Handover & Live Proof</h3>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                The package is delivered safely to the recipient with status confirmation logs updated instantly in your live dashboard.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Coverage & Global Gateway Strip */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="bg-[#003896] rounded-3xl p-10 sm:p-16 text-white relative overflow-hidden shadow-2xl shadow-blue-950/20">
          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 text-[#FFC50F] text-xs sm:text-sm font-bold mb-4">
              <MapPin className="w-4 h-4" /> Nationwide & Global Gateways
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight mb-4">
              Connecting Nigerian Commerce to Global Markets.
            </h2>
            <p className="text-base sm:text-lg text-blue-100 leading-relaxed mb-8">
              Our network covers commercial centers across Lagos, Abuja, Port Harcourt, Kano, Ibadan, and Enugu, while connecting daily to air freight hubs in London, New York, Toronto, Dubai, and Guangzhou.
            </p>

            <div className="flex flex-wrap gap-2.5 pt-2">
              {['Lagos', 'Abuja FCT', 'Port Harcourt', 'Ibadan', 'Kano', 'London (UK)', 'New York (USA)', 'Toronto (CAN)', 'Dubai (UAE)', 'Accra (GHA)'].map((hub) => (
                <span
                  key={hub}
                  className="px-4 py-2 rounded-full bg-white/15 text-white text-xs sm:text-sm font-semibold backdrop-blur-xs border border-white/20"
                >
                  ✓ {hub}
                </span>
              ))}
            </div>

            <div className="mt-10 pt-8 border-t border-white/15 flex flex-wrap items-center gap-4">
              <Link
                to="/register"
                className="px-8 py-4 rounded-full bg-[#FFC50F] hover:bg-[#e5b00b] text-slate-900 font-bold text-sm sm:text-base shadow-lg transition-all cursor-pointer"
              >
                Create Free Shipping Account
              </Link>
              <Link
                to="/track"
                className="px-8 py-4 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold text-sm sm:text-base border border-white/20 transition-all cursor-pointer"
              >
                Track Live Shipment
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Role Cockpits Strip: Tall, Spacious, Beautiful Cards */}
      <section className="bg-slate-100/70 py-20 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs sm:text-sm font-bold text-[#003896] uppercase tracking-wider bg-blue-50 px-3.5 py-1 rounded-full border border-blue-100">
              Tailored Portals for Every Stakeholder
            </span>
            <h3 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 mt-3">
              Platform Roles & Capabilities
            </h3>
            <p className="text-base sm:text-lg text-slate-600 mt-2">
              Dedicated interfaces optimized for individual shippers, courier riders on the road, and operations administrators.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Customer Role Card */}
            <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-md hover:shadow-xl transition-all duration-300 min-h-[480px] sm:min-h-[500px] flex flex-col justify-between">
              <div>
                <span className="px-3.5 py-1 rounded-full bg-blue-50 text-[#003896] text-xs font-black uppercase tracking-wider border border-blue-100">
                  Customer Portal
                </span>
                <h4 className="font-black text-slate-900 text-2xl mt-4">Book & Track Shipments</h4>
                <p className="text-sm sm:text-base text-slate-600 mt-2 leading-relaxed">
                  Create delivery requests across Nigeria, calculate transparent upfront pricing, and track parcel milestones in real-time.
                </p>

                <div className="mt-6 space-y-3 pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-2.5 text-sm text-slate-700 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-[#003896] shrink-0" />
                    <span>Instant dynamic delivery fee calculation</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-sm text-slate-700 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-[#003896] shrink-0" />
                    <span>Live status timeline & proof of pickup</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-sm text-slate-700 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-[#003896] shrink-0" />
                    <span>Debit card, bank transfer & COD escrow</span>
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <Link
                  to="/login"
                  className="w-full py-4 px-6 bg-[#003896] hover:bg-[#002c77] text-white text-sm sm:text-base font-bold rounded-2xl text-center transition-all shadow-md flex items-center justify-center gap-2"
                >
                  <span>Customer Sign In</span>
                  <ArrowRight className="w-4 h-4 text-[#FFC50F]" />
                </Link>
              </div>
            </div>

            {/* Rider Role Card */}
            <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-md hover:shadow-xl transition-all duration-300 min-h-[480px] sm:min-h-[500px] flex flex-col justify-between">
              <div>
                <span className="px-3.5 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-black uppercase tracking-wider border border-amber-200">
                  Courier Fleet
                </span>
                <h4 className="font-black text-slate-900 text-2xl mt-4">Driver Dispatch Cockpit</h4>
                <p className="text-sm sm:text-base text-slate-600 mt-2 leading-relaxed">
                  Real-time mobile cockpit for verified riders to manage job queues, toggle availability, and record handover signatures.
                </p>

                <div className="mt-6 space-y-3 pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-2.5 text-sm text-slate-700 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Instant 1-tap availability toggle (Online/Offline)</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-sm text-slate-700 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Step-by-step pickup & dropoff milestone logs</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-sm text-slate-700 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Completed runs history & earnings tracking</span>
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <Link
                  to="/login"
                  className="w-full py-4 px-6 bg-slate-900 hover:bg-amber-600 text-white text-sm sm:text-base font-bold rounded-2xl text-center transition-all shadow-md flex items-center justify-center gap-2"
                >
                  <span>Courier Sign In</span>
                  <ArrowRight className="w-4 h-4 text-[#FFC50F]" />
                </Link>
              </div>
            </div>

            {/* Admin Role Card */}
            <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-md hover:shadow-xl transition-all duration-300 min-h-[480px] sm:min-h-[500px] flex flex-col justify-between">
              <div>
                <span className="px-3.5 py-1 rounded-full bg-purple-50 text-purple-800 text-xs font-black uppercase tracking-wider border border-purple-200">
                  Operations Console
                </span>
                <h4 className="font-black text-slate-900 text-2xl mt-4">Fleet & Governance Center</h4>
                <p className="text-sm sm:text-base text-slate-600 mt-2 leading-relaxed">
                  Full command over dispatch queues, automated rider matching, ledger payments reconciliation, and security governance.
                </p>

                <div className="mt-6 space-y-3 pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-2.5 text-sm text-slate-700 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" />
                    <span>Real-time dispatch board & manual re-assignment</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-sm text-slate-700 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" />
                    <span>Financial ledger audit & payment verification</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-sm text-slate-700 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" />
                    <span>User account status controls (Active/Suspended)</span>
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <Link
                  to="/login"
                  className="w-full py-4 px-6 bg-slate-900 hover:bg-purple-700 text-white text-sm sm:text-base font-bold rounded-2xl text-center transition-all shadow-md flex items-center justify-center gap-2"
                >
                  <span>Operations Sign In</span>
                  <ArrowRight className="w-4 h-4 text-[#FFC50F]" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home

