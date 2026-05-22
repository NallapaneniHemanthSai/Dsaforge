import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Activity, Search, ArrowLeft, RefreshCw, 
  CheckCircle2, AlertCircle, Clock, Cpu, ChevronLeft, ChevronRight
} from 'lucide-react';
import api from '../../api';
import EmptyState from '../../components/ui/EmptyState';
import Skeleton from '../../components/ui/Skeleton';
import { toast } from 'react-hot-toast';

export default function AdminSubmissions() {
  const [submissions, setSubmissions] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // We'll mock pagination for this view since the API might not support it yet
  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      // Let's assume we can fetch recent submissions from a new endpoint. 
      // If the backend doesn't have it, we could add it to adminController or use a dummy for now.
      // Wait, we didn't add an admin route for all submissions yet. Let me add it in the backend too.
      const { data } = await api.get('/admin/submissions');
      setSubmissions(data.data);
    } catch (err) {
      toast.error('Failed to load global submissions');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-light-border dark:border-dark-border pb-4">
        <div>
          <Link to="/admin/dashboard" className="text-sm font-semibold text-primary hover:underline flex items-center gap-1 mb-2">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
            <Activity className="w-8 h-8 text-primary" /> Global Submissions
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            Monitor real-time code executions across the platform. Total tracked: {submissions.length}
          </p>
        </div>
        <button
          onClick={fetchSubmissions}
          className="group p-2.5 self-start sm:self-auto rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-dark-surface hover:bg-gray-50 dark:hover:bg-dark-surface/80 transition-all flex items-center gap-2"
        >
          <RefreshCw className="w-5 h-5 text-gray-500 group-hover:rotate-180 transition-transform duration-500" />
        </button>
      </div>

      {/* Directory Content */}
      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      ) : submissions.length === 0 ? (
        <EmptyState
          icon={Activity}
          title="No submissions found"
          description={"No code has been executed yet."}
        />
      ) : (
        <div className="space-y-4">
          <div className="overflow-x-auto rounded-2xl border border-gray-200/60 dark:border-white/[0.08] bg-white/60 dark:bg-white/[0.02] backdrop-blur-xl">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
              <thead className="bg-gray-50/50 dark:bg-dark-bg/20">
                <tr>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Time</th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">User</th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Problem</th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Language</th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Performance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {submissions.map(s => (
                  <tr key={s._id} className="hover:bg-gray-50/40 dark:hover:bg-white/[0.01]">
                    <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-500 dark:text-gray-400 font-mono">
                      {new Date(s.createdAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-xs font-semibold">
                      {s.user?.name || 'Unknown User'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-xs font-semibold text-primary">
                      {s.problemId}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-xs">
                      <span className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded font-mono">{s.language}</span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-xs">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wider border ${
                        s.status === 'accepted' ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/10 dark:text-green-400 dark:border-green-800' : 
                        s.status === 'wrong_answer' ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/10 dark:text-red-400 dark:border-red-800' :
                        s.status === 'compile_error' || s.status === 'runtime_error' ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/10 dark:text-amber-400 dark:border-amber-800' :
                        'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700'
                      }`}>
                        {s.status === 'accepted' ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                        {s.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-500 dark:text-gray-400">
                      <div className="flex gap-3 text-xs">
                        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {s.runtime}s</span>
                        <span className="flex items-center gap-1"><Cpu className="w-3.5 h-3.5" /> {s.memory} KB</span>
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
