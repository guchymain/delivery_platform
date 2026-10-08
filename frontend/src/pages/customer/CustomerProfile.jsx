import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { userAPI } from '../../lib/api';
import StatusBadge from '../../components/common/StatusBadge';
import { formatDate } from '../../lib/utils';
import { User, Mail, Phone, Lock, Shield, AlertTriangle, Save, KeyRound } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CustomerProfile() {
  const { user, refreshUser, logout } = useAuth();

  const [profileData, setProfileData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    phone: user?.phone || ''
  });
  const [profileSaving, setProfileSaving] = useState(false);

  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [passwordSaving, setPasswordSaving] = useState(false);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileSaving(true);
    try {
      await userAPI.updateProfile(profileData);
      await refreshUser();
      toast.success('Profile details updated successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setProfileSaving(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordData.new_password !== passwordData.confirm_password) {
      toast.error('New passwords do not match');
      return;
    }
    if (passwordData.new_password.length < 8) {
      toast.error('Password must be at least 8 characters long');
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

  const handleDeactivate = async () => {
    if (!window.confirm('Are you sure you want to deactivate your account? You will be signed out.')) {
      return;
    }
    try {
      await userAPI.deactivateAccount();
      toast.success('Your account has been deactivated.');
      logout();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Deactivation failed');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-brand-blue text-white flex items-center justify-center font-black text-2xl shadow-sm ring-4 ring-brand-yellow/20">
            {user?.first_name?.[0] || 'U'}
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              {user?.first_name} {user?.last_name}
            </h1>
            <p className="text-xs text-slate-500 font-mono mt-0.5">{user?.email}</p>
            <div className="flex items-center gap-2 mt-2.5">
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-brand-blue/10 text-brand-blue uppercase tracking-wider">
                {user?.role}
              </span>
              <StatusBadge status={user?.status} type="account" />
            </div>
          </div>
        </div>
        <div className="text-xs font-semibold text-slate-500 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
          Member since <span className="text-slate-900 font-bold">{formatDate(user?.createdAt)}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Personal Details Form */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-7 shadow-xs space-y-5">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <User className="w-5 h-5 text-brand-blue" /> Personal Information
          </h2>

          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">First Name</label>
              <input
                type="text"
                required
                value={profileData.first_name}
                onChange={(e) => setProfileData({ ...profileData, first_name: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Last Name</label>
              <input
                type="text"
                required
                value={profileData.last_name}
                onChange={(e) => setProfileData({ ...profileData, last_name: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Phone Number</label>
              <input
                type="tel"
                value={profileData.phone}
                onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                placeholder="+234 800 000 0000"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={profileSaving}
              className="w-full mt-2 py-3 px-4 bg-brand-blue hover:bg-blue-900 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              <Save className="w-4 h-4 text-brand-yellow" />
              {profileSaving ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </form>
        </div>

        {/* Change Password Form */}
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
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Confirm New Password</label>
              <input
                type="password"
                required
                value={passwordData.confirm_password}
                onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
                placeholder="Repeat new password"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={passwordSaving}
              className="w-full mt-2 py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              <Lock className="w-4 h-4 text-brand-yellow" />
              {passwordSaving ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-red-50/60 rounded-3xl border border-red-200/80 p-6 sm:p-7 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="font-bold text-red-900 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600" /> Deactivate Account
          </h3>
          <p className="text-xs text-red-700 mt-1 max-w-xl">
            Setting your account status to INACTIVE will pause your access to bookings and sign you out immediately. You can contact support to reactivate.
          </p>
        </div>
        <button
          onClick={handleDeactivate}
          className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer shrink-0"
        >
          Deactivate My Account
        </button>
      </div>
    </div>
  );
}
