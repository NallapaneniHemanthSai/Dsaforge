import { useEffect, useMemo, useState } from 'react';
import {
  Activity, BarChart2, CheckCircle2, Code2, Database, PieChart as PieIcon,
  RefreshCw, TrendingUp, Users,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import {
  Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import api from '../../api';
import GlassCard from '../../components/ui/GlassCard';
import Skeleton from '../../components/ui/Skeleton';

const MetricCard = ({ label, value, icon: Icon, tone = 'text-primary' }) => (
  <GlassCard hover={false} className="p-5">
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">{label}</p>
        <p className="mt-2 text-3xl font-extrabold text-gray-900 dark:text-white">{value}</p>
      </div>
      <div className={`rounded-xl bg-gray-100 p-3 dark:bg-white/[0.04] ${tone}`}>
        <Icon className="h-5 w-5" />
      </div>
    </div>
  </GlassCard>
);

export default function AdminAnalytics() {
  const [analytics, setAnalytics] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const [analyticsResponse, submissionsResponse] = await Promise.all([
        api.get('/admin/analytics'),
        api.get('/admin/submissions').catch(() => ({ data: { data: [] } })),
      ]);
      setAnalytics(analyticsResponse.data.data);
      setSubmissions(submissionsResponse.data.data || []);
    } catch (err) {
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const languageData = useMemo(() => {
    const counts = submissions.reduce((acc, submission) => {
      acc[submission.language || 'unknown'] = (acc[submission.language || 'unknown'] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [submissions]);

  const statusData = useMemo(() => {
    const counts = submissions.reduce((acc, submission) => {
      acc[submission.status || 'unknown'] = (acc[submission.status || 'unknown'] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(counts).map(([name, count]) => ({ name: name.replace('_', ' '), count }));
  }, [submissions]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <Skeleton className="h-12 w-72" />
        <div className="grid gap-5 md:grid-cols-4">{Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-28" />)}</div>
        <div className="grid gap-5 lg:grid-cols-2">{Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-80" />)}</div>
      </div>
    );
  }

  const users = analytics?.users || {};
  const problems = analytics?.problems || {};
  const submissionStats = analytics?.submissions || {};
  const acceptanceRate = typeof submissionStats.acceptanceRate === 'string'
    ? submissionStats.acceptanceRate
    : `${submissionStats.acceptanceRate || 0}%`;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col gap-4 border-b border-light-border pb-5 dark:border-dark-border lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-primary">Admin Suite</p>
          <h1 className="mt-1 flex items-center gap-2 text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            <TrendingUp className="h-8 w-8 text-primary" /> Platform Analytics
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Operational health, problem coverage, submissions, and acceptance signals.</p>
        </div>
        <button onClick={fetchAnalytics} className="btn-secondary inline-flex items-center gap-2 self-start lg:self-auto">
          <RefreshCw className="h-4 w-4" /> Refresh
        </button>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Total Users" value={users.total || 0} icon={Users} />
        <MetricCard label="Verified Users" value={users.verified || 0} icon={CheckCircle2} tone="text-emerald-500" />
        <MetricCard label="Suspended" value={users.suspended || 0} icon={Activity} tone="text-red-500" />
        <MetricCard label="Active Problems" value={`${problems.active || 0}/${problems.total || 0}`} icon={Database} tone="text-blue-500" />
        <MetricCard label="Total Submissions" value={submissionStats.total || 0} icon={Code2} tone="text-purple-500" />
        <MetricCard label="Accepted" value={submissionStats.accepted || 0} icon={CheckCircle2} tone="text-emerald-500" />
        <MetricCard label="Acceptance Rate" value={acceptanceRate} icon={BarChart2} tone="text-amber-500" />
        <MetricCard label="Solved Marks" value={problems.solved || 0} icon={PieIcon} tone="text-cyan-500" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <GlassCard hover={false} className="p-6">
          <h2 className="mb-5 flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-white">
            <BarChart2 className="h-5 w-5 text-primary" /> Submission Status
          </h2>
          <div className="h-72">
            {statusData.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statusData}>
                  <XAxis dataKey="name" tick={{ fill: '#9CA3AF', fontSize: 12 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fill: '#9CA3AF', fontSize: 12 }} tickLine={false} axisLine={false} />
                  <Tooltip cursor={{ fill: 'rgba(99, 102, 241, 0.08)' }} />
                  <Bar dataKey="count" fill="#6366F1" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-gray-500 dark:text-gray-400">No submission data yet</div>
            )}
          </div>
        </GlassCard>

        <GlassCard hover={false} className="p-6">
          <h2 className="mb-5 flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-white">
            <PieIcon className="h-5 w-5 text-primary" /> Language Usage
          </h2>
          <div className="h-72">
            {languageData.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={languageData} dataKey="value" nameKey="name" innerRadius={60} outerRadius={92} paddingAngle={4}>
                    {languageData.map((entry, index) => (
                      <Cell key={entry.name} fill={['#6366F1', '#10B981', '#F59E0B', '#EF4444'][index % 4]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-gray-500 dark:text-gray-400">No language data yet</div>
            )}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
