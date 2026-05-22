import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Code2, Search, ArrowLeft, RefreshCw, 
  Trash2, Edit, ChevronLeft, ChevronRight, Plus, FileJson, Ban, CheckCircle
} from 'lucide-react';
import api from '../../api';
import EmptyState from '../../components/ui/EmptyState';
import Skeleton from '../../components/ui/Skeleton';
import { toast } from 'react-hot-toast';

export default function AdminProblems() {
  const [problems, setProblems] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchProblems = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/admin/problems');
      setProblems(data.data);
    } catch (err) {
      toast.error('Failed to load problems');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProblems();
  }, []);

  const filteredProblems = problems.filter(p => 
    p.title.toLowerCase().includes(search.toLowerCase()) || 
    p.id.toLowerCase().includes(search.toLowerCase()) ||
    p.sheet.toLowerCase().includes(search.toLowerCase())
  );

  const toggleStatus = async (id, currentStatus) => {
    try {
      setActionLoading(id);
      const { data } = await api.delete(`/admin/problems/${id}`);
      toast.success(data.message || 'Problem status updated');
      
      // Update state locally
      setProblems(prev => prev.map(p => p._id === id ? { ...p, isActive: false } : p));
    } catch (err) {
      const msg = err.response?.data?.message || 'Action failed';
      toast.error(msg);
    } finally {
      setActionLoading(null);
    }
  };

  const reactivate = async (id) => {
    try {
      setActionLoading(id);
      const { data } = await api.patch(`/admin/problems/${id}`, { isActive: true });
      toast.success('Problem reactivated');
      
      setProblems(prev => prev.map(p => p._id === id ? { ...p, isActive: true } : p));
    } catch (err) {
      const msg = err.response?.data?.message || 'Action failed';
      toast.error(msg);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-light-border dark:border-dark-border pb-4">
        <div>
          <Link to="/admin/dashboard" className="text-sm font-semibold text-primary hover:underline flex items-center gap-1 mb-2">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
            <Code2 className="w-8 h-8 text-primary" /> Problem Management
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            Manage coding problems, test cases, and starter code. Total: {problems.length}
          </p>
        </div>
        <div className="flex items-center gap-3 self-start sm:self-auto">
          <button
            onClick={fetchProblems}
            className="group p-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-dark-surface hover:bg-gray-50 dark:hover:bg-dark-surface/80 transition-all flex items-center gap-2"
            title="Refresh"
          >
            <RefreshCw className="w-5 h-5 text-gray-500 group-hover:rotate-180 transition-transform duration-500" />
          </button>
          <button className="btn-secondary px-4 py-2.5 flex items-center gap-2">
            <FileJson className="w-4 h-4" /> Import JSON
          </button>
          <button className="btn-primary px-4 py-2.5 flex items-center gap-2">
            <Plus className="w-4 h-4" /> New Problem
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search by title, ID, or sheet..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="input-field pl-9 py-1.5 text-sm"
        />
      </div>

      {/* Directory Content */}
      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      ) : filteredProblems.length === 0 ? (
        <EmptyState
          icon={Code2}
          title="No problems found"
          description={search ? "Try refining your search terms." : "No problems are currently added to the platform."}
        />
      ) : (
        <div className="space-y-4">
          <div className="overflow-x-auto rounded-2xl border border-gray-200/60 dark:border-white/[0.08] bg-white/60 dark:bg-white/[0.02] backdrop-blur-xl">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
              <thead className="bg-gray-50/50 dark:bg-dark-bg/20">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Problem</th>
                  <th scope="col" className="px-4 py-3 text-left text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Sheet & Topic</th>
                  <th scope="col" className="px-4 py-3 text-left text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Difficulty</th>
                  <th scope="col" className="px-4 py-3 text-left text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-4 py-3 text-right text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {filteredProblems.map(p => (
                  <tr key={p._id} className="hover:bg-gray-50/40 dark:hover:bg-white/[0.01]">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div>
                          <div className="text-sm font-semibold text-gray-900 dark:text-white">{p.title}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 font-mono">{p.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-gray-300">{p.sheet}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{p.topic}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
                        p.difficulty === 'Easy' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                        p.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                        'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                      }`}>
                        {p.difficulty}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold ${!p.isActive ? 'bg-red-50 text-red-600 border border-red-200 dark:bg-red-900/10 dark:text-red-400 dark:border-red-800' : 'bg-green-50 text-green-600 border border-green-200 dark:bg-green-900/10 dark:text-green-400 dark:border-green-800'}`}>
                        {!p.isActive ? <Ban className="w-3 h-3" /> : <CheckCircle className="w-3 h-3" />}
                        {!p.isActive ? 'Inactive' : 'Active'}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right text-sm">
                      <div className="flex justify-end gap-3">
                        <button
                          className="text-gray-500 dark:text-gray-400 hover:text-primary transition-colors p-1"
                          title="Edit Problem"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        {p.isActive ? (
                          <button
                            onClick={() => toggleStatus(p._id)}
                            disabled={actionLoading === p._id}
                            className="text-gray-500 dark:text-gray-400 hover:text-red-500 transition-colors p-1"
                            title="Deactivate Problem"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => reactivate(p._id)}
                            disabled={actionLoading === p._id}
                            className="text-gray-500 dark:text-gray-400 hover:text-green-500 transition-colors p-1"
                            title="Activate Problem"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
