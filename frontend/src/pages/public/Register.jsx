import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UserPlus, User, Bike, Mail, Lock, Phone, ShieldCheck, ArrowRight, Package, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Register() {
  const [role, setRole] = useState('CUSTOMER');
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    password: '',
    confirm_password: '',
    // Rider specific
    vehicle_type: 'MOTORCYCLE',
    vehicle_number: '',
    license_number: ''
  });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirm_password) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.password.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: `${formData.first_name} ${formData.last_name}`.trim(),
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        role: role
      };

      if (role === 'RIDER') {
        if (!formData.vehicle_number || !formData.license_number) {
          toast.error('Vehicle plate number and license number are required for riders');
          setLoading(false);
          return;
        }
        payload.vehicleType = formData.vehicle_type;
        payload.plateNumber = formData.vehicle_number;
        payload.licenseNumber = formData.license_number;
      }

      await register(payload);
      toast.success('Registration successful! Please sign in with your credentials.');
      navigate('/login');
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Registration failed';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-[#F8FAFC]">
      <div className="max-w-xl w-full space-y-7 bg-white p-8 sm:p-10 rounded-3xl shadow-xl shadow-blue-900/5 border border-slate-200">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#003896] text-white mb-3 shadow-md shadow-blue-900/20">
            <Package className="w-7 h-7 text-[#FFC50F]" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Join SwiftShip
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            Create an account to book nationwide Nigerian and global shipments or earn as a verified courier
          </p>
        </div>

        {/* Role Selector Tabs (Customer vs Rider; Admin strictly prohibited) */}
        <div className="flex p-1.5 bg-slate-100 rounded-2xl">
          <button
            type="button"
            onClick={() => setRole('CUSTOMER')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-bold text-xs transition-all cursor-pointer ${
              role === 'CUSTOMER'
                ? 'bg-white text-[#003896] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <User className="w-4 h-4 text-[#003896]" />
            Customer Account
          </button>
          <button
            type="button"
            onClick={() => setRole('RIDER')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-bold text-xs transition-all cursor-pointer ${
              role === 'RIDER'
                ? 'bg-white text-amber-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Bike className="w-4 h-4 text-amber-500" />
            Courier Rider
          </button>
        </div>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                First Name
              </label>
              <input
                type="text"
                name="first_name"
                required
                value={formData.first_name}
                onChange={handleChange}
                placeholder="Jane"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#003896] focus:bg-white font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Last Name
              </label>
              <input
                type="text"
                name="last_name"
                required
                value={formData.last_name}
                onChange={handleChange}
                placeholder="Doe"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#003896] focus:bg-white font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="h-4 w-4 text-[#003896]" />
                </div>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="jane@example.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#003896] focus:bg-white font-medium"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Phone Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Phone className="h-4 w-4 text-[#003896]" />
                </div>
                <input
                  type="tel"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="080XXXXXXXX"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#003896] focus:bg-white font-medium"
                />
              </div>
            </div>
          </div>

          {/* Rider Specific Fields */}
          {role === 'RIDER' && (
            <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-3">
              <div className="text-[11px] font-bold text-amber-900 uppercase tracking-wide flex items-center gap-1.5">
                <Bike className="w-4 h-4 text-amber-600" /> Courier Vehicle Details
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Vehicle Type</label>
                  <select
                    name="vehicle_type"
                    value={formData.vehicle_type}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                  >
                    <option value="MOTORCYCLE">Motorcycle</option>
                    <option value="BICYCLE">Bicycle</option>
                    <option value="CAR">Car</option>
                    <option value="VAN">Delivery Van</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Plate Number</label>
                  <input
                    type="text"
                    name="vehicle_number"
                    required
                    value={formData.vehicle_number}
                    onChange={handleChange}
                    placeholder="LND-123-XY"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">License No.</label>
                  <input
                    type="text"
                    name="license_number"
                    required
                    value={formData.license_number}
                    onChange={handleChange}
                    placeholder="DL-987654"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-4 w-4 text-[#003896]" />
                </div>
                <input
                  type="password"
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Min. 8 chars"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#003896] focus:bg-white font-medium"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <ShieldCheck className="h-4 w-4 text-[#003896]" />
                </div>
                <input
                  type="password"
                  name="confirm_password"
                  required
                  value={formData.confirm_password}
                  onChange={handleChange}
                  placeholder="Repeat password"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#003896] focus:bg-white font-medium"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 mt-6 rounded-xl shadow-md text-xs font-bold text-white bg-[#003896] hover:bg-[#002c77] focus:outline-none focus:ring-2 focus:ring-[#003896] transition-all disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>Register as {role === 'CUSTOMER' ? 'Customer' : 'Rider'}</span>
                <ArrowRight className="w-4 h-4 text-[#FFC50F]" />
              </>
            )}
          </button>
        </form>

        <div className="pt-2 text-center border-t border-slate-100">
          <p className="text-xs text-slate-600">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-[#003896] hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
