import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users as UsersIcon, Shield, Search, ArrowLeft, RefreshCw, 
  Trash2, UserCheck, ShieldAlert, ChevronLeft, ChevronRight, Ban, CheckCircle
} from 'lucide-react';
import api from '../../api';
import GlassCard from '../../components/ui/GlassCard';
import Skeleton from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { isDemoAdmin } from '../../utils/demoMode';

export default function AdminUsers() {
  const { user } = useAuth();
  const readOnlyPreview = isDemoAdmin(user);
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/admin/users?page=${page}&limit=10&search=${search}`);
      setUsers(data.data);
      setTotalPages(data.pagination.totalPages);
      setTotalUsers(data.pagination.total);
    } catch (err) {
      toast.error('Failed to load user directory');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  const toggleStatus = async (userId) => {
    if (readOnlyPreview) {
      toast('Admin Demo is read-only. Account status changes are disabled for recruiter previews.');
      return;
    }
    try {
      setActionLoading(userId);
      const { data } = await api.patch(`/admin/users/${userId}/toggle-status`);
      toast.success(data.message);
      
      // Update state locally
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, isDeleted: !u.isDeleted } : u));
    } catch (err) {
      const msg = err.response?.data?.message || 'Action failed';
      toast.error(msg);
    } finally {
      setActionLoading(null);
    }
  };

  const changeRole = async (userId, currentRole) => {
    if (readOnlyPreview) {
      toast('Admin Demo is read-only. Role changes are disabled for recruiter previews.');
      return;
    }
    const nextRole = currentRole === 'admin' ? 'user' : 'admin';
    try {
      setActionLoading(userId);
      const { data } = await api.patch(`/admin/users/${userId}/role`, { role: nextRole });
      toast.success(data.message);

      // Update state locally
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, role: nextRole } : u));
    } catch (err) {
      const msg = err.response?.data?.message || 'Action failed';
      toast.error(msg);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Link to="/admin/dashboard" className="text-sm font-semibold text-primary hover:underline flex items-center gap-1 mb-2">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
            <UsersIcon className="w-8 h-8 text-primary" /> User Directory
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            Search, suspend accounts, change user roles, and monitor registrations. Total: {totalUsers}
          </p>
          {readOnlyPreview && (
            <p className="mt-2 inline-flex rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              Recruiter preview: admin actions are visible but disabled.
            </p>
          )}
        </div>
        <button
          onClick={fetchUsers}
          className="group p-2.5 self-start sm:self-auto rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-dark-surface hover:bg-gray-50 dark:hover:bg-dark-surface/80 transition-all flex items-center gap-2"
        >
          <RefreshCw className="w-5 h-5 text-gray-500 group-hover:rotate-180 transition-transform duration-500" />
        </button>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearchSubmit} className="flex gap-3 max-w-md">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search name, username, or email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input-field pl-11"
          />
        </div>
        <button type="submit" className="btn-primary font-medium py-2.5 px-6">
          Search
        </button>
      </form>

      {/* Directory Content */}
      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      ) : users.length === 0 ? (
        <EmptyState
          icon={UsersIcon}
          title="No students found"
          description={search ? "Try refining your search terms." : "No users are currently registered on the platform."}
        />
      ) : (
        <div className="space-y-4">
          <div className="overflow-x-auto rounded-2xl border border-gray-200/60 dark:border-white/[0.08] bg-white/60 dark:bg-white/[0.02] backdrop-blur-xl">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
              <thead className="bg-gray-50/50 dark:bg-dark-bg/20">
                <tr>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">User</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Username</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Role</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {users.map(u => (
                  <tr key={u._id} className="hover:bg-gray-50/40 dark:hover:bg-white/[0.01]">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-gray-900 dark:text-white">{u.name}</div>
                          <div className="text-xs text-gray-400">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500 dark:text-gray-400">
                      @{u.username}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold uppercase tracking-wider ${u.role === 'admin' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-850 dark:text-gray-400'}`}>
                        {u.role === 'admin' ? <Shield className="w-3.5 h-3.5" /> : null}
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${u.isDeleted ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'}`}>
                        {u.isDeleted ? <Ban className="w-3 h-3" /> : <CheckCircle className="w-3 h-3" />}
                        {u.isDeleted ? 'Suspended' : 'Active'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <div className="flex justify-end gap-3">
                        <button
                          onClick={() => changeRole(u._id, u.role)}
                          disabled={actionLoading === u._id || readOnlyPreview}
                          title={readOnlyPreview ? 'Read-only admin preview' : 'Change role'}
                          className="text-xs font-medium text-purple-600 dark:text-purple-400 hover:underline inline-flex items-center gap-1 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {u.role === 'admin' ? 'Revoke Admin' : 'Make Admin'}
                        </button>
                        <button
                          onClick={() => toggleStatus(u._id)}
                          disabled={actionLoading === u._id || readOnlyPreview}
                          title={readOnlyPreview ? 'Read-only admin preview' : 'Toggle account status'}
                          className={`text-xs font-semibold inline-flex items-center gap-1 disabled:cursor-not-allowed disabled:opacity-50 ${u.isDeleted ? 'text-green-600 dark:text-green-400' : 'text-red-500'}`}
                        >
                          {u.isDeleted ? 'Activate' : 'Suspend'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center mt-4">
              <span className="text-xs text-gray-500">
                Page {page} of {totalPages}
              </span>
              <div className="flex gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  className="p-2 border border-gray-200 dark:border-gray-800 rounded-lg hover:bg-gray-150 dark:hover:bg-dark-surface/50 disabled:opacity-50"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  className="p-2 border border-gray-200 dark:border-gray-800 rounded-lg hover:bg-gray-150 dark:hover:bg-dark-surface/50 disabled:opacity-50"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
