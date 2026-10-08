import React from 'react';
import { Link } from 'react-router-dom';
import { Package, Globe, ShieldCheck, Mail, MapPin, ArrowRight } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#0A1128] text-white border-t border-slate-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-12">
          {/* Brand & Purpose */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2.5 group inline-flex">
              <div className="w-10 h-10 rounded-xl bg-[#003896] flex items-center justify-center text-white shadow-md shadow-blue-900/30 group-hover:bg-[#002c77] transition-colors">
                <Package className="w-5 h-5 text-[#FFC50F]" />
              </div>
              <span className="font-black text-2xl text-white tracking-tight">
                SwiftShip<span className="text-[#FFC50F]">.</span>
              </span>
            </Link>
            <p className="text-sm text-slate-300 leading-relaxed max-w-sm">
              Nigeria-based nationwide logistics and express air courier connecting commercial hubs across all 36 states to over 200 destinations worldwide.
            </p>
            <div className="flex items-center gap-3 pt-2 text-xs text-slate-400">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                order bike: They move like they have nothing to loose
              </span>
            </div>
          </div>

          {/* Logistics Services */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-white mb-4">
              Services
            </h4>
            <ul className="space-y-3 text-sm text-slate-300">
              <li>
                <Link to="/customer/create-delivery" className="hover:text-[#FFC50F] transition-colors">
                  Nationwide Doorstep Delivery
                </Link>
              </li>
              <li>
                <Link to="/customer/create-delivery" className="hover:text-[#FFC50F] transition-colors">
                  International Air Express (200+ Countries)
                </Link>
              </li>
              <li>
                <Link to="/customer/create-delivery" className="hover:text-[#FFC50F] transition-colors">
                  Shop & Ship Concierge Hubs
                </Link>
              </li>
              <li>
                <Link to="/track" className="hover:text-[#FFC50F] transition-colors">
                  Live Milestone Tracking
                </Link>
              </li>
            </ul>
          </div>

          {/* Quick Platform Navigation */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-white mb-4">
              Quick Links
            </h4>
            <ul className="space-y-3 text-sm text-slate-300">
              <li>
                <Link to="/track" className="hover:text-[#FFC50F] transition-colors">
                  Track a Shipment
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-[#FFC50F] transition-colors">
                  Sign In to Account
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-[#FFC50F] transition-colors">
                  Create Shipping Account
                </Link>
              </li>
              <li>
                <Link to="/rider" className="hover:text-[#FFC50F] transition-colors">
                  Courier Rider Fleet
                </Link>
              </li>
              <li>
                <Link to="/admin" className="hover:text-[#FFC50F] transition-colors">
                  Operations Console
                </Link>
              </li>
            </ul>
          </div>

          {/* Operations & Hubs */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-white mb-4">
              Commercial Hubs
            </h4>
            <div className="space-y-3 text-sm text-slate-300">
              <p className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#FFC50F] shrink-0 mt-0.5" />
                <span>Victoria Island, Lagos & CBD, Abuja, Nigeria</span>
              </p>
              <p className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-[#003896] shrink-0" />
                <span>Global Hubs: London • New York • Dubai</span>
              </p>
              <p className="flex items-center gap-2 pt-1 text-xs text-[#FFC50F] font-bold">
                <Mail className="w-4 h-4" />
                <a href="mailto:support@swiftship.africa" className="hover:underline">
                  support@swiftship.africa
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Grounded Bar */}
        <div className="mt-14 pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-sm text-slate-400 gap-4">
          <p>© {new Date().getFullYear()} SwiftShip Delivery Platform. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-4 text-xs">
            <span className="text-slate-300 font-medium">PostgreSQL 18 • Express 5 REST API • React 19 SPA</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
