import { useEffect, useMemo, useState } from 'react';
import {
  Activity, AlertCircle, CheckCircle2, Clock, Code2, Cpu, Eye,
  RefreshCw, Search, X,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../api';
import EmptyState from '../../components/ui/EmptyState';
import Skeleton from '../../components/ui/Skeleton';

const statusClass = {
  accepted: 'status-badge-green',
  wrong_answer: 'status-badge-red',
  compile_error: 'status-badge-red',
  runtime_error: 'status-badge-red',
  time_limit_exceeded: 'status-badge-amber',
  error: 'status-badge-red',
};

function SubmissionDrawer({ submission, onClose }) {
  if (!submission) return null;

  return (
    <div className="fixed inset-0 z-[80] bg-black/60 p-4 backdrop-blur-sm">
      <div className="ml-auto flex h-full max-w-3xl flex-col rounded-2xl border border-light-border bg-white shadow-2xl dark:border-dark-border dark:bg-dark-surface">
        <div className="flex items-center justify-between border-b border-light-border px-5 py-4 dark:border-dark-border">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Submission Details</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">{submission.problemId} · {submission.language}</p>
          </div>
          <button onClick={onClose} className="pagination-btn" aria-label="Close submission details">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto p-5">
          <div className="grid gap-3 sm:grid-cols-4">
            <div className="card p-4">
              <div className="text-xs text-gray-500 dark:text-gray-400">Status</div>
              <div className="mt-2 font-bold capitalize text-gray-900 dark:text-white">{submission.status?.replace('_', ' ')}</div>
            </div>
            <div className="card p-4">
              <div className="text-xs text-gray-500 dark:text-gray-400">Tests</div>
              <div className="mt-2 font-bold text-gray-900 dark:text-white">{submission.passedCount}/{submission.totalCount}</div>
            </div>
            <div className="card p-4">
              <div className="text-xs text-gray-500 dark:text-gray-400">Runtime</div>
              <div className="mt-2 font-bold text-gray-900 dark:text-white">{submission.runtime || 0}s</div>
            </div>
            <div className="card p-4">
              <div className="text-xs text-gray-500 dark:text-gray-400">Memory</div>
              <div className="mt-2 font-bold text-gray-900 dark:text-white">{submission.memory || 0} KB</div>
            </div>
          </div>

          <section>
            <h3 className="mb-2 text-sm font-bold text-gray-900 dark:text-white">Submitted Code</h3>
            <pre className="max-h-80 overflow-auto rounded-xl border border-light-border bg-gray-950 p-4 text-xs text-gray-100 dark:border-dark-border">
              <code>{submission.code || 'Code not available in list response.'}</code>
            </pre>
          </section>

          <section>
            <h3 className="mb-2 text-sm font-bold text-gray-900 dark:text-white">Test Results</h3>
            <div className="space-y-3">
              {(submission.testResults || []).length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">Open a saved submission detail endpoint to view full per-test output.</p>
              ) : submission.testResults.map((result, index) => (
                <div key={index} className="rounded-xl border border-light-border p-4 dark:border-dark-border">
                  <div className="mb-2 flex items-center justify-between">
                    <span className={`status-badge ${result.passed ? 'status-badge-green' : 'status-badge-red'}`}>
                      {result.passed ? <CheckCircle2 className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                      Test {index + 1}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{result.runtime || 0}s · {result.memory || 0} KB</span>
                  </div>
                  <pre className="overflow-auto rounded-lg bg-gray-100 p-3 text-xs text-gray-800 dark:bg-dark-bg dark:text-gray-200">{result.errorOutput || result.actualOutput || 'No output'}</pre>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default function AdminSubmissions() {
  const [submissions, setSubmissions] = useState([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [language, setLanguage] = useState('all');
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/admin/submissions');
      setSubmissions(data.data || []);
    } catch (err) {
      toast.error('Failed to load global submissions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return submissions.filter((submission) => {
      const matchesSearch = !q || [
        submission.problemId,
        submission.user?.name,
        submission.user?.email,
        submission.status,
        submission.language,
      ].some((value) => String(value || '').toLowerCase().includes(q));
      const matchesStatus = status === 'all' || submission.status === status;
      const matchesLanguage = language === 'all' || submission.language === language;
      return matchesSearch && matchesStatus && matchesLanguage;
    });
  }, [submissions, search, status, language]);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col gap-4 border-b border-light-border pb-5 dark:border-dark-border lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-primary">Admin Suite</p>
          <h1 className="mt-1 flex items-center gap-2 text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            <Activity className="h-8 w-8 text-primary" /> Submission Monitor
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Audit code submissions, failures, language usage, and performance signals.</p>
        </div>
        <button onClick={fetchSubmissions} className="btn-secondary inline-flex items-center gap-2 self-start lg:self-auto">
          <RefreshCw className="h-4 w-4" /> Refresh
        </button>
      </div>

      <div className="card p-4">
        <div className="grid gap-3 lg:grid-cols-[1fr_190px_170px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input className="input-field pl-10" placeholder="Search user, problem, status, or language" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <select className="input-field" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="all">All statuses</option>
            <option value="accepted">Accepted</option>
            <option value="wrong_answer">Wrong answer</option>
            <option value="compile_error">Compile error</option>
            <option value="runtime_error">Runtime error</option>
            <option value="time_limit_exceeded">Time limit</option>
            <option value="error">Error</option>
          </select>
          <select className="input-field" value={language} onChange={(e) => setLanguage(e.target.value)}>
            <option value="all">All languages</option>
            <option value="java">Java</option>
            <option value="python">Python</option>
            <option value="cpp">C++</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}</div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={Code2} title="No submissions found" description="Submissions will appear here after students submit code through the Judge0 flow." />
      ) : (
        <div className="admin-table-shell">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Time</th>
                <th>User</th>
                <th>Problem</th>
                <th>Language</th>
                <th>Status</th>
                <th>Performance</th>
                <th className="text-right">View</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((submission) => (
                <tr key={submission._id}>
                  <td className="whitespace-nowrap font-mono text-xs text-gray-500 dark:text-gray-400">{new Date(submission.createdAt).toLocaleString()}</td>
                  <td>
                    <div className="font-semibold text-gray-900 dark:text-white">{submission.user?.name || 'Unknown user'}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{submission.user?.email || 'No email'}</div>
                  </td>
                  <td className="font-mono text-xs text-primary">{submission.problemId}</td>
                  <td><span className="topic-pill font-mono">{submission.language}</span></td>
                  <td>
                    <span className={`status-badge ${statusClass[submission.status] || 'status-badge-blue'}`}>
                      {submission.status === 'accepted' ? <CheckCircle2 className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                      {submission.status?.replace('_', ' ')}
                    </span>
                  </td>
                  <td>
                    <div className="flex flex-wrap gap-3 text-xs text-gray-500 dark:text-gray-400">
                      <span>{submission.passedCount}/{submission.totalCount} tests</span>
                      <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {submission.runtime || 0}s</span>
                      <span className="inline-flex items-center gap-1"><Cpu className="h-3.5 w-3.5" /> {submission.memory || 0} KB</span>
                    </div>
                  </td>
                  <td>
                    <div className="flex justify-end">
                      <button onClick={() => setSelected(submission)} className="pagination-btn" aria-label="View submission">
                        <Eye className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <SubmissionDrawer submission={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
