import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
  Package,
  Truck,
  PlusCircle,
  Clock,
  Shield,
  User,
  LogOut,
  Menu,
  X,
  CreditCard,
  Briefcase,
  Users,
  Compass,
  Search,
  Bike,
  Sparkles,
  MapPin
} from 'lucide-react'
import StatusBadge from './StatusBadge'

export const Navbar = () => {
  const { user, isAuthenticated, role, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const isActive = (path) => location.pathname === path

  const navLinkClass = (path) =>
    `px-3 py-1.5 xl:px-4 xl:py-2 rounded-full text-xs xl:text-sm font-semibold tracking-wide transition-all whitespace-nowrap ${
      isActive(path)
        ? 'bg-[#003896] text-white shadow-sm shadow-blue-900/20'
        : 'text-slate-600 hover:text-[#003896] hover:bg-blue-50/80'
    }`

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-xs">
      {/* Top micro-announcement bar (SwiftShip Nigeria & Global delivery highlight) */}
      <div className="bg-[#003896] text-white py-2 px-4 text-xs font-medium text-center flex flex-wrap sm:flex-nowrap items-center justify-center gap-1.5 sm:gap-2">
        <span className="inline-flex items-center gap-1 font-semibold text-[#FFC50F] whitespace-nowrap">
          <Sparkles className="w-3.5 h-3.5" /> Nigeria & Worldwide Delivery:
        </span>
        <span className="text-blue-100 hidden sm:inline">
          Doorstep pickup across Nigeria • Express delivery to 200+ global destinations.
        </span>
        <Link to="/track" className="underline text-[#FFC50F] hover:text-white ml-1 font-bold whitespace-nowrap">
          Track a shipment &rarr;
        </Link>
      </div>

      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="w-10 h-10 rounded-xl bg-[#003896] flex items-center justify-center text-white shadow-md shadow-blue-900/20 group-hover:bg-[#002c77] transition-all shrink-0">
              <Package className="w-5 h-5 text-[#FFC50F]" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5 leading-none">
                <span className="font-extrabold text-xl tracking-tight text-slate-900 whitespace-nowrap">
                  SwiftShip<span className="text-[#FFC50F]">.</span>
                </span>
                <span className="px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider rounded bg-[#FFC50F]/20 text-[#003896] border border-[#FFC50F]/40 whitespace-nowrap">
                  NIGERIA &bull; GLOBAL
                </span>
              </div>
              <span className="text-[10px] font-medium text-slate-500 tracking-tight whitespace-nowrap">
                Doorstep & International Logistics
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-1.5">
            <Link to="/" className={navLinkClass('/')}>
              Home
            </Link>
            <Link to="/track" className={navLinkClass('/track')}>
              <span className="flex items-center gap-1.5">
                <Search className="w-3.5 h-3.5 text-slate-400" />
                Track Delivery
              </span>
            </Link>

            {/* Customer Links */}
            {isAuthenticated && role === 'CUSTOMER' && (
              <>
                <Link to="/customer" className={navLinkClass('/customer')}>
                  Dashboard
                </Link>
                <Link to="/customer/create-delivery" className={navLinkClass('/customer/create-delivery')}>
                  <span className="flex items-center gap-1.5 text-[#003896] font-bold">
                    <PlusCircle className="w-3.5 h-3.5 text-[#FFC50F]" />
                    Book Delivery
                  </span>
                </Link>
                <Link to="/customer/deliveries" className={navLinkClass('/customer/deliveries')}>
                  My Shipments
                </Link>
                <Link to="/customer/payments" className={navLinkClass('/customer/payments')}>
                  Payments
                </Link>
              </>
            )}

            {/* Rider Links */}
            {isAuthenticated && role === 'RIDER' && (
              <>
                <Link to="/rider" className={navLinkClass('/rider')}>
                  Rider Cockpit
                </Link>
                <Link to="/rider/jobs" className={navLinkClass('/rider/jobs')}>
                  <span className="flex items-center gap-1.5 text-amber-700 font-bold">
                    <Briefcase className="w-3.5 h-3.5 text-amber-500" />
                    Open Jobs
                  </span>
                </Link>
                <Link to="/rider/active" className={navLinkClass('/rider/active')}>
                  Active Run
                </Link>
                <Link to="/rider/history" className={navLinkClass('/rider/history')}>
                  Completed Runs
                </Link>
              </>
            )}

            {/* Admin Links */}
            {isAuthenticated && role === 'ADMIN' && (
              <>
                <Link to="/admin" className={navLinkClass('/admin')}>
                  Overview
                </Link>
                <Link to="/admin/dispatch" className={navLinkClass('/admin/dispatch')}>
                  <span className="flex items-center gap-1.5 text-[#003896] font-bold">
                    <Compass className="w-3.5 h-3.5 text-[#FFC50F]" />
                    Dispatch Hub
                  </span>
                </Link>
                <Link to="/admin/deliveries" className={navLinkClass('/admin/deliveries')}>
                  Deliveries
                </Link>
                <Link to="/admin/users" className={navLinkClass('/admin/users')}>
                  Users
                </Link>
                <Link to="/admin/riders" className={navLinkClass('/admin/riders')}>
                  Fleet
                </Link>
                <Link to="/admin/payments" className={navLinkClass('/admin/payments')}>
                  Finance
                </Link>
              </>
            )}
          </nav>

          {/* Right Action / Auth Buttons */}
          <div className="hidden lg:flex items-center gap-3 shrink-0">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                {/* Rider Availability pill */}
                {role === 'RIDER' && user?.riderProfile && (
                  <div className="hidden xl:block">
                    <StatusBadge
                      status={user.riderProfile.availabilityStatus || 'AVAILABLE'}
                      type="availability"
                      size="sm"
                    />
                  </div>
                )}

                {/* Profile Link */}
                <Link
                  to={
                    role === 'CUSTOMER'
                      ? '/customer/profile'
                      : role === 'RIDER'
                      ? '/rider/profile'
                      : '/customer/profile'
                  }
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 hover:border-[#003896]/30 transition-all shrink-0"
                >
                  <div className="w-6 h-6 rounded-full bg-[#003896] text-white flex items-center justify-center text-xs font-bold shrink-0">
                    {user?.name?.[0]?.toUpperCase() || user?.first_name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div className="text-left leading-tight pr-1">
                    <p className="text-xs font-bold text-slate-800 whitespace-nowrap">
                      {user?.name || `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || 'User'}
                    </p>
                    <p className="text-[10px] text-[#003896] font-bold tracking-wider">{role}</p>
                  </div>
                </Link>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-full transition-colors cursor-pointer shrink-0"
                  title="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3 shrink-0">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-bold text-slate-700 hover:text-[#003896] transition-colors whitespace-nowrap"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-5 py-2.5 text-sm font-bold text-white bg-[#003896] hover:bg-[#002c77] rounded-full shadow-sm shadow-blue-900/20 transition-all flex items-center gap-2 whitespace-nowrap shrink-0"
                >
                  <span>Start Shipping</span>
                  <span className="w-2 h-2 rounded-full bg-[#FFC50F]"></span>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-700 hover:bg-slate-100 cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-2">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:bg-blue-50"
          >
            Home
          </Link>
          <Link
            to="/track"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:bg-blue-50"
          >
            Track Delivery
          </Link>

          {isAuthenticated ? (
            <>
              {role === 'CUSTOMER' && (
                <>
                  <Link
                    to="/customer"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Customer Dashboard
                  </Link>
                  <Link
                    to="/customer/create-delivery"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg text-sm font-bold text-[#003896] bg-blue-50/60"
                  >
                    + Book New Delivery
                  </Link>
                  <Link
                    to="/customer/deliveries"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    My Shipments
                  </Link>
                  <Link
                    to="/customer/payments"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Payment History
                  </Link>
                  <Link
                    to="/customer/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    My Profile
                  </Link>
                </>
              )}

              {role === 'RIDER' && (
                <>
                  <Link
                    to="/rider"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Rider Cockpit
                  </Link>
                  <Link
                    to="/rider/jobs"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg text-sm font-bold text-amber-700 bg-amber-50"
                  >
                    Browse Available Jobs
                  </Link>
                  <Link
                    to="/rider/active"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Active Delivery
                  </Link>
                  <Link
                    to="/rider/history"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Completed Runs
                  </Link>
                  <Link
                    to="/rider/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Vehicle Profile
                  </Link>
                </>
              )}

              {role === 'ADMIN' && (
                <>
                  <Link
                    to="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Admin Overview
                  </Link>
                  <Link
                    to="/admin/dispatch"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg text-sm font-bold text-[#003896] bg-blue-50"
                  >
                    Dispatch Center
                  </Link>
                  <Link
                    to="/admin/deliveries"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Deliveries Management
                  </Link>
                  <Link
                    to="/admin/users"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Users Management
                  </Link>
                  <Link
                    to="/admin/riders"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Fleet Management
                  </Link>
                  <Link
                    to="/admin/payments"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Financial Ledger
                  </Link>
                </>
              )}

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-slate-900">
                    {user?.name || `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || 'User'}
                  </p>
                  <p className="text-xs text-slate-500">{user?.email}</p>
                </div>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false)
                    handleLogout()
                  }}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 cursor-pointer"
                >
                  Logout
                </button>
              </div>
            </>
          ) : (
            <div className="pt-4 border-t border-slate-100 flex flex-col gap-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 text-xs font-bold text-slate-700 bg-slate-100 rounded-lg"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 text-xs font-bold text-white bg-[#003896] rounded-lg shadow-sm"
              >
                Start Shipping
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  )
}

export default Navbar
