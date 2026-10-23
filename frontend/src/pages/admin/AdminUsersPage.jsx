import React, { useState, useEffect, useCallback } from 'react';
import { Search, Users, Shield, User, Trash2, RefreshCw, AlertCircle } from 'lucide-react';
import { userService } from '../../services/userService';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';

const roleConfig = {
  ADMIN: { label: 'Admin', variant: 'danger' },
  ORGANIZER: { label: 'Organizer', variant: 'indigo' },
  USER: { label: 'User', variant: 'secondary' },
};

export const AdminUsersPage = () => {
  const { showToast } = useToast();
  const { currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await userService.getUsers({ search, role: roleFilter });
      setUsers(data);
    } catch (err) {
      showToast({ title: 'Error', message: err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [search, roleFilter, showToast]);

  useEffect(() => { loadUsers(); }, [loadUsers]);

  const handleRoleChange = async (userId, newRole) => {
    try {
      await userService.updateUserRole(userId, newRole);
      showToast({ title: 'Role Updated', message: `User role changed to ${newRole}.`, type: 'success' });
      loadUsers();
    } catch (err) {
      showToast({ title: 'Error', message: err.message, type: 'error' });
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await userService.deleteUser(deleteTarget.id);
      showToast({ title: 'User Deleted', message: `${deleteTarget.name} has been removed.`, type: 'success' });
      setDeleteTarget(null);
      loadUsers();
    } catch (err) {
      showToast({ title: 'Error', message: err.message, type: 'error' });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">User Management</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            View and manage registered user accounts.
          </p>
        </div>
        <Button onClick={loadUsers} variant="secondary" size="sm">
          <RefreshCw size={14} className="mr-1.5" /> Refresh
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-9 pl-9 pr-3 text-xs rounded-xl bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="h-9 px-3 text-xs rounded-xl bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        >
          <option value="all">All Roles</option>
          <option value="USER">Users</option>
          <option value="ORGANIZER">Organizers</option>
          <option value="ADMIN">Admins</option>
        </select>
      </div>

      <Card className="overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-slate-100 dark:bg-white/5 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : users.length === 0 ? (
          <div className="p-16 text-center">
            <Users size={40} className="mx-auto text-slate-300 dark:text-slate-700 mb-3" />
            <p className="text-base font-semibold text-slate-600 dark:text-slate-400">No users found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/70 dark:bg-white/[0.02] text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-100 dark:border-white/5 font-semibold">
                <tr>
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Bookings</th>
                  <th className="py-3 px-4">Requests</th>
                  <th className="py-3 px-4">Joined</th>
                  <th className="py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {users.map((user) => {
                  const rc = roleConfig[user.role] || roleConfig.USER;
                  const isSelf = user.id === currentUser?.id;
                  return (
                    <tr key={user.id} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01]">
                      <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">
                        {user.name}
                        {isSelf && <span className="ml-1.5 text-[9px] font-bold text-blue-500">(you)</span>}
                      </td>
                      <td className="py-3 px-4 text-slate-500">{user.email}</td>
                      <td className="py-3 px-4">
                        <Badge variant={rc.variant} size="sm">{rc.label}</Badge>
                      </td>
                      <td className="py-3 px-4 text-slate-500">{user.bookingCount}</td>
                      <td className="py-3 px-4 text-slate-500">{user.requestCount}</td>
                      <td className="py-3 px-4 text-slate-400">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        {!isSelf && (
                          <div className="flex items-center gap-1.5">
                            <select
                              value={user.role}
                              onChange={(e) => handleRoleChange(user.id, e.target.value)}
                              className="h-7 px-2 text-[10px] rounded-lg bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 focus:outline-none"
                            >
                              <option value="USER">User</option>
                              <option value="ORGANIZER">Organizer</option>
                              <option value="ADMIN">Admin</option>
                            </select>
                            <button
                              onClick={() => setDeleteTarget(user)}
                              className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete User"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This will remove all their bookings and requests.`}
        confirmLabel="Delete User"
        variant="danger"
        loading={deleting}
      />
    </div>
  );
};
