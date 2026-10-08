import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../lib/api';
import { formatDate } from '../../lib/utils';
import { useAuth } from '../../context/AuthContext';
import StatusBadge from '../../components/common/StatusBadge';
import Modal from '../../components/common/Modal';
import {
  Users,
  Search,
  Filter,
  UserCheck,
  UserX,
  Trash2,
  RefreshCw,
  ShieldAlert,
  AlertTriangle
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminUsers() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Status edit state
  const [selectedUser, setSelectedUser] = useState(null);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [targetStatus, setTargetStatus] = useState('ACTIVE');
  const [updating, setUpdating] = useState(false);

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [roleFilter, statusFilter]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = {};
      if (roleFilter) params.role = roleFilter;
      if (statusFilter) params.status = statusFilter;
      const res = await adminAPI.getUsers(params);
      setUsers(res.data?.data?.users || []);
    } catch (err) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenStatus = (u) => {
    setSelectedUser(u);
    setTargetStatus(u.status);
    setStatusModalOpen(true);
  };

  const handleUpdateStatus = async () => {
    if (!selectedUser) return;
    setUpdating(true);
    try {
      await adminAPI.updateUserStatus(selectedUser.id, targetStatus);
      toast.success(`User status updated to ${targetStatus}`);
      setStatusModalOpen(false);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Status change failed');
    } finally {
      setUpdating(false);
    }
  };

  const handleOpenDelete = (u) => {
    setUserToDelete(u);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    setDeleting(true);
    try {
      await adminAPI.deleteUser(userToDelete.id);
      toast.success(`User ${userToDelete.email} removed from platform`);
      setDeleteModalOpen(false);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete operation failed');
    } finally {
      setDeleting(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      u.email?.toLowerCase().includes(term) ||
      u.first_name?.toLowerCase().includes(term) ||
      u.last_name?.toLowerCase().includes(term) ||
      u.phone?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-yellow/15 text-brand-dark text-xs font-bold mb-2">
            <span>👥 Access & Roles</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-7 h-7 text-brand-blue" /> Platform User Governance
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Enforce role-based access permissions, account statuses, and compliance across platform accounts
          </p>
        </div>

        <button
          onClick={fetchUsers}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold shadow-xs transition-colors cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-brand-blue' : ''}`} />
          Refresh Users
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, email, phone..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full md:w-36 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all"
          >
            <option value="">All Roles</option>
            <option value="CUSTOMER">Customer</option>
            <option value="RIDER">Rider</option>
            <option value="ADMIN">Admin</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full md:w-36 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all"
          >
            <option value="">All Statuses</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="INACTIVE">INACTIVE</option>
            <option value="SUSPENDED">SUSPENDED</option>
          </select>
        </div>
      </div>

      {/* User Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-[11px] uppercase font-bold text-slate-500 border-b border-slate-200/80 tracking-wider">
              <tr>
                <th className="px-5 py-4">User</th>
                <th className="px-5 py-4">Platform Role</th>
                <th className="px-5 py-4">Phone Number</th>
                <th className="px-5 py-4">Account Status</th>
                <th className="px-5 py-4">Registered</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-5 py-16 text-center text-slate-400">
                    <div className="w-7 h-7 border-3 border-brand-blue border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                    Loading accounts...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-5 py-16 text-center text-slate-400">
                    <Users className="w-10 h-10 mx-auto mb-3 text-slate-300" />
                    No users match your filters.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const isSelf = u.id === currentUser?.id;
                  return (
                    <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-5 py-4">
                        <div className="font-bold text-slate-900">
                          {u.first_name} {u.last_name} {isSelf && <span className="text-xs text-brand-blue font-bold ml-1">(You)</span>}
                        </div>
                        <div className="text-xs text-slate-500 font-mono">{u.email}</div>
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`text-[11px] font-bold px-3 py-1 rounded-full ${
                            u.role === 'ADMIN'
                              ? 'bg-slate-900 text-white'
                              : u.role === 'RIDER'
                              ? 'bg-brand-yellow/20 text-brand-dark'
                              : 'bg-brand-blue/10 text-brand-blue'
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-xs text-slate-600">{u.phone || 'N/A'}</td>
                      <td className="px-5 py-4">
                        <StatusBadge status={u.status} type="account" />
                      </td>
                      <td className="px-5 py-4 text-xs text-slate-400 whitespace-nowrap font-medium">
                        {formatDate(u.createdAt)}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenStatus(u)}
                            className="p-2 text-slate-500 hover:text-brand-blue hover:bg-brand-blue/10 rounded-xl transition-colors cursor-pointer"
                            title="Modify Status"
                          >
                            <UserCheck className="w-4 h-4" />
                          </button>
                          {!isSelf && (
                            <button
                              onClick={() => handleOpenDelete(u)}
                              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                              title="Delete Account"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Status Modal */}
      <Modal
        isOpen={statusModalOpen}
        onClose={() => setStatusModalOpen(false)}
        title="Modify User Status"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600">
            Change operational status for <strong className="text-slate-900">{selectedUser?.email}</strong>.
          </p>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Account Status
            </label>
            <select
              value={targetStatus}
              onChange={(e) => setTargetStatus(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all"
            >
              <option value="ACTIVE">ACTIVE (Normal operational access)</option>
              <option value="INACTIVE">INACTIVE (Disabled)</option>
              <option value="SUSPENDED">SUSPENDED (Restricted by admin)</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setStatusModalOpen(false)}
              className="px-4 py-2.5 border border-slate-200 text-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={updating}
              onClick={handleUpdateStatus}
              className="px-5 py-2.5 bg-brand-blue hover:bg-blue-900 text-white font-bold rounded-xl text-sm shadow-xs disabled:opacity-50 transition-all cursor-pointer"
            >
              {updating ? 'Updating...' : 'Save Status'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete User Account"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-red-50 text-red-800 rounded-2xl text-xs border border-red-100">
            <AlertTriangle className="w-5 h-5 shrink-0 text-red-600" />
            <span>
              Are you sure you want to permanently remove <strong className="text-red-950">{userToDelete?.email}</strong>?
              This action cannot be undone.
            </span>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setDeleteModalOpen(false)}
              className="px-4 py-2.5 border border-slate-200 text-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-colors"
            >
              Keep User
            </button>
            <button
              type="button"
              disabled={deleting}
              onClick={handleConfirmDelete}
              className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-sm shadow-xs disabled:opacity-50 transition-all cursor-pointer"
            >
              {deleting ? 'Deleting...' : 'Delete User'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
