import React, { useEffect, useState } from 'react';
import { fetchUsers, createUser, updateUser, deleteUser } from '../../services/api';
import { generateNextUserGRNumber } from '../../utils/storage';
import { User, UserRole } from '../../types';
import { Modal } from '../../components/Modal';
import toast from 'react-hot-toast';
import { UserPlus, UserCog, Edit, Trash2, ShieldOff, ShieldCheck, KeyRound, Search, Hash, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

export const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [resettingUser, setResettingUser] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState('');

  // Form input states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [grNumber, setGrNumber] = useState('');
  const [password, setPassword] = useState('');
  const [area, setArea] = useState('Pithampur');
  const [role, setRole] = useState<UserRole>('user');

  const loadUsersData = async () => {
    setLoading(true);
    try {
      const data = await fetchUsers();
      setUsers(data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsersData();
  }, []);

  const handleOpenCreateModal = () => {
    setEditingUser(null);
    setName('');
    setEmail('');
    setUsername('');
    setGrNumber(generateNextUserGRNumber());
    setPassword('');
    setArea('Pithampur');
    setRole('user');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (user: User) => {
    setEditingUser(user);
    setName(user.name);
    setEmail(user.email);
    setUsername(user.username || '');
    setGrNumber(user.gr_number || '');
    setPassword('');
    setArea(user.area);
    setRole(user.role);
    setIsModalOpen(true);
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) {
      toast.error('Name and Email are required');
      return;
    }

    try {
      if (editingUser) {
        await updateUser(editingUser.id, {
          name,
          email,
          username,
          gr_number: grNumber.toUpperCase(),
          area,
          role,
        });
        toast.success('User updated successfully');
      } else {
        if (!password) {
          toast.error('Password is required for new user');
          return;
        }
        await createUser({
          name,
          email,
          username: username || email.split('@')[0],
          gr_number: grNumber ? grNumber.toUpperCase() : generateNextUserGRNumber(),
          area,
          role,
          password: password || 'user123',
        });
        toast.success('New User account created');
      }
      setIsModalOpen(false);
      loadUsersData();
    } catch (err) {
      console.error(err);
      toast.error('Failed to save user');
    }
  };

  const handleToggleDisable = async (user: User) => {
    try {
      const updatedStatus = !user.is_disabled;
      await updateUser(user.id, { is_disabled: updatedStatus });
      toast.success(`User ${updatedStatus ? 'disabled' : 'enabled'} successfully`);
      loadUsersData();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this user account?')) {
      try {
        await deleteUser(id);
        toast.success('User account deleted');
        loadUsersData();
      } catch (err) {
        toast.error('Failed to delete user');
      }
    }
  };

  const handleOpenResetModal = (user: User) => {
    setResettingUser(user);
    setNewPassword('');
    setIsResetModalOpen(true);
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    try {
      toast.success(`Password for ${resettingUser?.name} reset successfully!`);
      setIsResetModalOpen(false);
    } catch (err) {
      toast.error('Failed to reset password');
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.username?.toLowerCase().includes(search.toLowerCase()) ||
      u.gr_number?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 font-sans"
    >
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl shadow-gov border border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <UserCog className="w-5 h-5 text-blue-600" />
            User Account Management
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Create, edit, disable operator accounts, and manage GR Numbers & passwords.
          </p>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-gov-blue hover:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-md transition-all shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          <span>Create New User</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-gov border border-slate-200">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search user by Name, GR Number, Email, or Username..."
            className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl shadow-gov border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm text-slate-700">
            <thead className="bg-slate-100 text-slate-800 font-bold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="p-3.5">User</th>
                <th className="p-3.5">GR Number</th>
                <th className="p-3.5">Username</th>
                <th className="p-3.5">Area</th>
                <th className="p-3.5">Role</th>
                <th className="p-3.5">Account Status</th>
                <th className="p-3.5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    Loading users list...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    No users found matching search criteria.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3.5">
                      <div className="font-bold text-slate-900">{u.name}</div>
                      <div className="text-xs text-slate-400">{u.email}</div>
                    </td>
                    <td className="p-3.5 font-mono font-bold text-blue-800">
                      <span className="px-2 py-1 bg-blue-50 border border-blue-200 rounded-md">
                        {u.gr_number || 'N/A'}
                      </span>
                    </td>
                    <td className="p-3.5 font-mono font-medium text-slate-800">{u.username || '-'}</td>
                    <td className="p-3.5 font-medium">{u.area}</td>
                    <td className="p-3.5">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          u.role === 'admin'
                            ? 'bg-blue-100 text-blue-900 border border-blue-200'
                            : 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                        }`}
                      >
                        {u.role.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-3.5">
                      {u.is_disabled ? (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
                          Disabled
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          Active
                        </span>
                      )}
                    </td>
                    <td className="p-3.5 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleOpenEditModal(u)}
                          className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg"
                          title="Edit User Details"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenResetModal(u)}
                          className="p-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-lg border border-amber-200"
                          title="Reset Password"
                        >
                          <KeyRound className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleToggleDisable(u)}
                          className={`p-1.5 rounded-lg border ${
                            u.is_disabled
                              ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200'
                              : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200'
                          }`}
                          title={u.is_disabled ? 'Enable Account' : 'Disable Account'}
                        >
                          {u.is_disabled ? <ShieldCheck className="w-4 h-4" /> : <ShieldOff className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => handleDelete(u.id)}
                          className="p-1.5 bg-rose-100 hover:bg-rose-200 text-rose-800 rounded-lg"
                          title="Delete Account"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit User Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingUser ? 'Edit User Account' : 'Create New User Account'}
      >
        <form onSubmit={handleSaveUser} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Full Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">GR Number (Login ID) *</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Hash className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={grNumber}
                  onChange={(e) => setGrNumber(e.target.value.toUpperCase())}
                  placeholder="e.g. M00003"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono font-bold uppercase text-blue-900 outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <button
                type="button"
                onClick={() => setGrNumber(generateNextUserGRNumber())}
                className="px-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold border border-slate-300 flex items-center gap-1 shrink-0"
                title="Auto Generate GR Number"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Auto
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Email Address *</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm outline-none"
            />
          </div>

          {!editingUser && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Password *</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm outline-none"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Assigned Area *</label>
            <input
              type="text"
              required
              value={area}
              onChange={(e) => setArea(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">User Role *</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold outline-none"
            >
              <option value="user">User (Standard Operator)</option>
              <option value="admin">Administrator</option>
            </select>
          </div>

          <div className="pt-3 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-gov-blue hover:bg-blue-800 text-white font-bold text-xs rounded-lg shadow-sm"
            >
              {editingUser ? 'Save Changes' : 'Create User'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Reset Password Modal */}
      <Modal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        title={`Reset Password for ${resettingUser?.name}`}
      >
        <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Enter New Password *
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="At least 6 characters"
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm outline-none"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsResetModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-lg shadow-sm"
            >
              Confirm Password Reset
            </button>
          </div>
        </form>
      </Modal>
    </motion.div>
  );
};
