import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users as UsersIcon, Award, Shield, AlertTriangle, 
  Settings, ArrowLeft, RefreshCw, BarChart2, PieChart as PieChartIcon
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from 'recharts';
import api from '../../api';
import GlassCard from '../../components/ui/GlassCard';
import Skeleton from '../../components/ui/Skeleton';
import { toast } from 'react-hot-toast';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/admin/analytics');
      setStats(data.data);
    } catch (err) {
      toast.error('Failed to load system statistics');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="p-8 space-y-6 max-w-7xl mx-auto">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-80" />
          <Skeleton className="h-80" />
        </div>
      </div>
    );
  }

  const userStats = stats?.users || { total: 0, active: 0, verified: 0, suspended: 0 };
  const problemStats = stats?.problems || { solved: 0, attempted: 0 };

  const userData = [
    { name: 'Active', value: userStats.active },
    { name: 'Suspended', value: userStats.suspended }
  ];

  const problemData = [
    { name: 'Solved', count: problemStats.solved || 0, fill: '#10B981' },
    { name: 'Attempted', count: problemStats.attempted || 0, fill: '#F59E0B' }
  ];

  const COLORS = ['#6C63FF', '#EF4444'];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
            <Shield className="w-8 h-8 text-accent-light" /> Admin Dashboard
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            Platform operations, analytics, and student directory controls
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={fetchStats}
            className="group p-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-dark-surface hover:bg-gray-50 dark:hover:bg-dark-surface/80 transition-all flex items-center gap-2"
          >
            <RefreshCw className="w-5 h-5 text-gray-500 group-hover:rotate-180 transition-transform duration-500" />
          </button>
          <Link
            to="/admin/users"
            className="btn-primary flex items-center gap-2 font-medium"
          >
            <UsersIcon className="w-5 h-5" /> Manage Users
          </Link>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <GlassCard hover={false} className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Total Registrations</span>
              <h3 className="text-3xl font-bold mt-2 text-gray-900 dark:text-white">{userStats.total}</h3>
            </div>
            <div className="p-3 rounded-xl bg-accent-light/10 text-accent-light">
              <UsersIcon className="w-6 h-6" />
            </div>
          </div>
          <div className="text-xs text-gray-500 mt-4">Verified: <span className="font-semibold text-green-500">{userStats.verified}</span></div>
        </GlassCard>

        <GlassCard hover={false} className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Active Students</span>
              <h3 className="text-3xl font-bold mt-2 text-green-500">{userStats.active}</h3>
            </div>
            <div className="p-3 rounded-xl bg-green-500/10 text-green-500">
              <Award className="w-6 h-6" />
            </div>
          </div>
          <div className="text-xs text-gray-500 mt-4">Suspended: <span className="font-semibold text-red-500">{userStats.suspended}</span></div>
        </GlassCard>

        <GlassCard hover={false} className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Mock Solved Aggregates</span>
              <h3 className="text-3xl font-bold mt-2 text-emerald-500">{problemStats.solved}</h3>
            </div>
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500">
              <BarChart2 className="w-6 h-6" />
            </div>
          </div>
          <div className="text-xs text-gray-500 mt-4">Attempted: <span className="font-semibold text-amber-500">{problemStats.attempted}</span></div>
        </GlassCard>

        <GlassCard hover={false} className="p-6 bg-accent-light/5 border-accent-light/20">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-accent-light text-xs font-semibold uppercase tracking-wider">Demo / Preview Mode</span>
              <h3 className="text-sm font-semibold mt-2 text-gray-600 dark:text-gray-400">Limited mutations strictly enforced.</h3>
            </div>
            <div className="p-3 rounded-xl bg-accent-light/10 text-accent-light">
              <Settings className="w-6 h-6" />
            </div>
          </div>
          <div className="text-[10px] text-gray-400 mt-4">Security isolation active.</div>
        </GlassCard>
      </div>

      {/* Visual Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <GlassCard hover={false} className="p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2">
              <PieChartIcon className="w-5 h-5 text-accent-light" /> Account Status Split
            </h3>
          </div>
          <div className="h-64 flex items-center justify-center">
            {userStats.total > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={userData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {userData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip cursor={{ fill: 'transparent' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-gray-400 text-sm">No data available</div>
            )}
          </div>
          <div className="flex justify-center gap-6 mt-4 text-xs font-semibold">
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-accent-light" /> Active: {userStats.active}</div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-500" /> Suspended: {userStats.suspended}</div>
          </div>
        </GlassCard>

        <GlassCard hover={false} className="p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-accent-light" /> Problem Submissions Overview
            </h3>
          </div>
          <div className="h-64 flex items-center justify-center">
            {problemStats.solved + problemStats.attempted > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={problemData}>
                  <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                  <Bar dataKey="count" radius={[8, 8, 0, 0]} barSize={50} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-gray-400 text-sm flex flex-col items-center gap-2">
                <AlertTriangle className="w-8 h-8 text-amber-500" />
                No solves tracked in the platform yet
              </div>
            )}
          </div>
          <div className="text-center text-xs text-gray-500 mt-4">Solves are tracked dynamically across student catalogs</div>
        </GlassCard>
      </div>
    </div>
  );
}
