import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LogIn, Mail, Lock, ShieldAlert, ArrowRight, UserCheck, Package, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter both email and password');
      return;
    }

    setLoading(true);
    try {
      const user = await login(email, password);
      toast.success(`Welcome back, ${user.name || user.first_name || 'User'}!`);

      if (from) {
        navigate(from, { replace: true });
        return;
      }

      // Route according to role
      if (user.role === 'ADMIN') navigate('/admin');
      else if (user.role === 'RIDER') navigate('/rider');
      else navigate('/customer');
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Login failed';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const fillDemoAccount = (role) => {
    if (role === 'ADMIN') {
      setEmail('admin@delivery.com');
      setPassword('Admin@123');
    } else if (role === 'RIDER') {
      setEmail('rider1@delivery.com');
      setPassword('Rider@123');
    } else {
      setEmail('customer1@delivery.com');
      setPassword('Customer@123');
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-[#F8FAFC]">
      <div className="max-w-md w-full space-y-7 bg-white p-8 sm:p-10 rounded-3xl shadow-xl shadow-blue-900/5 border border-slate-200">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#003896] text-white mb-3 shadow-md shadow-blue-900/20">
            <Package className="w-7 h-7 text-[#FFC50F]" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Sign in to Topship
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            Access your customer shipments, rider console, or dispatch cockpit
          </p>
        </div>

        {/* Topship Demo Fill Helper */}
        <div className="bg-blue-50/60 border border-blue-200/80 rounded-2xl p-3.5 text-xs text-slate-700">
          <div className="font-bold text-[#003896] flex items-center gap-1.5 mb-2 text-[11px] uppercase tracking-wider">
            <UserCheck className="w-3.5 h-3.5 text-[#FFC50F]" /> 1-Click Demo Login Fill:
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => fillDemoAccount('CUSTOMER')}
              className="px-2 py-1.5 rounded-xl bg-white border border-blue-200 hover:border-[#003896] hover:text-[#003896] text-slate-800 font-bold transition-all text-center text-xs shadow-2xs cursor-pointer"
            >
              Customer
            </button>
            <button
              type="button"
              onClick={() => fillDemoAccount('RIDER')}
              className="px-2 py-1.5 rounded-xl bg-white border border-amber-200 hover:border-amber-600 hover:text-amber-700 text-slate-800 font-bold transition-all text-center text-xs shadow-2xs cursor-pointer"
            >
              Rider
            </button>
            <button
              type="button"
              onClick={() => fillDemoAccount('ADMIN')}
              className="px-2 py-1.5 rounded-xl bg-white border border-purple-200 hover:border-purple-600 hover:text-purple-700 text-slate-800 font-bold transition-all text-center text-xs shadow-2xs cursor-pointer"
            >
              Admin
            </button>
          </div>
        </div>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Email Address
            </label>
            <div className="relative rounded-xl shadow-xs">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail className="h-4 w-4 text-[#003896]" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="block w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#003896] focus:bg-white transition-all font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Password
            </label>
            <div className="relative rounded-xl shadow-xs">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="h-4 w-4 text-[#003896]" />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="block w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#003896] focus:bg-white transition-all font-medium"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl shadow-md text-xs font-bold text-white bg-[#003896] hover:bg-[#002c77] focus:outline-none focus:ring-2 focus:ring-[#003896] transition-all disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>Sign in to Platform</span>
                <ArrowRight className="w-4 h-4 text-[#FFC50F]" />
              </>
            )}
          </button>
        </form>

        <div className="pt-2 text-center border-t border-slate-100">
          <p className="text-xs text-slate-600">
            Don't have an account yet?{' '}
            <Link to="/register" className="font-bold text-[#003896] hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
