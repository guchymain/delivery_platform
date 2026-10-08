import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { riderAPI, userAPI } from '../../lib/api';
import StatusBadge from '../../components/common/StatusBadge';
import { formatDate } from '../../lib/utils';
import { Bike, Shield, Star, CheckCircle, Save, KeyRound, Lock } from 'lucide-react';
import toast from 'react-hot-toast';

export default function RiderProfile() {
  const { user, refreshUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    vehicle_type: 'MOTORCYCLE',
    vehicle_number: '',
    license_number: ''
  });

  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [passwordSaving, setPasswordSaving] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await riderAPI.getProfile();
      const p = res.data?.data;
      setProfile(p);
      if (p) {
        setFormData({
          vehicle_type: p.vehicle_type || 'MOTORCYCLE',
          vehicle_number: p.vehicle_number || '',
          license_number: p.license_number || ''
        });
      }
    } catch (err) {
      toast.error('Failed to load rider profile');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await riderAPI.updateProfile(formData);
      toast.success('Rider vehicle profile updated!');
      fetchProfile();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordData.new_password !== passwordData.confirm_password) {
      toast.error('Passwords do not match');
      return;
    }
    setPasswordSaving(true);
    try {
      await userAPI.changePassword({
        current_password: passwordData.current_password,
        new_password: passwordData.new_password
      });
      toast.success('Password updated successfully');
      setPasswordData({ current_password: '', new_password: '', confirm_password: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update password');
    } finally {
      setPasswordSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center text-slate-500">
        <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        Loading rider profile...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Banner */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-brand-blue text-white flex items-center justify-center font-black text-2xl shadow-sm ring-4 ring-brand-yellow/20">
            <Bike className="w-8 h-8 text-brand-yellow" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              {user?.first_name} {user?.last_name}
            </h1>
            <p className="text-xs text-slate-500 font-mono mt-0.5">{user?.email}</p>
            <div className="flex items-center gap-2 mt-2.5">
              <StatusBadge status={profile?.availability_status || 'AVAILABLE'} type="availability" />
              <StatusBadge status={user?.status} type="account" />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6 bg-slate-50 p-4 rounded-2xl border border-slate-100">
          <div className="text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Runs</span>
            <div className="text-2xl font-black text-slate-900">{profile?.total_deliveries || 0}</div>
          </div>
          <div className="h-8 w-px bg-slate-200" />
          <div className="text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Driver Rating</span>
            <div className="text-2xl font-black text-amber-500 flex items-center justify-center gap-1">
              <Star className="w-4 h-4 fill-amber-500" /> {profile?.rating || '5.00'}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Vehicle specs */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-7 shadow-xs space-y-5">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Bike className="w-5 h-5 text-brand-blue" /> Vehicle & Fleet Details
          </h2>

          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Vehicle Type</label>
              <select
                value={formData.vehicle_type}
                onChange={(e) => setFormData({ ...formData, vehicle_type: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all"
              >
                <option value="MOTORCYCLE">Motorcycle (Lagos Express Dispatch)</option>
                <option value="BIKE">Bicycle (Local Hub Courier)</option>
                <option value="CAR">Car (Standard Delivery)</option>
                <option value="VAN">Van (Heavy Cargo / Pallets)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Plate Number</label>
              <input
                type="text"
                required
                value={formData.vehicle_number}
                onChange={(e) => setFormData({ ...formData, vehicle_number: e.target.value })}
                placeholder="e.g. KSF-123-XY"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Driver License Number</label>
              <input
                type="text"
                required
                value={formData.license_number}
                onChange={(e) => setFormData({ ...formData, license_number: e.target.value })}
                placeholder="e.g. LAG-9876543"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full mt-2 py-3 px-4 bg-brand-blue hover:bg-blue-900 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              <Save className="w-4 h-4 text-brand-yellow" />
              {saving ? 'Saving...' : 'Save Fleet Info'}
            </button>
          </form>
        </div>

        {/* Password */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-7 shadow-xs space-y-5">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <KeyRound className="w-5 h-5 text-brand-blue" /> Security & Password
          </h2>

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Current Password</label>
              <input
                type="password"
                required
                value={passwordData.current_password}
                onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">New Password</label>
              <input
                type="password"
                required
                value={passwordData.new_password}
                onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                placeholder="Min 8 characters"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Confirm Password</label>
              <input
                type="password"
                required
                value={passwordData.confirm_password}
                onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
                placeholder="Repeat password"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={passwordSaving}
              className="w-full mt-2 py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              <Lock className="w-4 h-4 text-brand-yellow" />
              {passwordSaving ? 'Updating...' : 'Change Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
