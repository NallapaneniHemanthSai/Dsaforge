import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, RotateCw, ListTodo, Target, Flame, ArrowRight, Code2, BookOpen } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import { TOTAL_PROBLEMS, getProblemTitle } from '../data/problems';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/stats/me');
        setStats(data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch stats', err);
        setError('Could not load dashboard stats. Please refresh the page.');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-24 bg-gray-200 dark:bg-gray-800 rounded-xl"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="h-32 bg-gray-200 dark:bg-gray-800 rounded-xl"></div>)}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-64 bg-gray-200 dark:bg-gray-800 rounded-xl col-span-2"></div>
          <div className="h-64 bg-gray-200 dark:bg-gray-800 rounded-xl"></div>
        </div>
      </div>
    );
  }

  if (error || !stats || !user) {
    return (
      <div className="card p-8 text-center">
        <p className="text-gray-600 dark:text-gray-400">{error || 'Loading user data...'}</p>
        {error && (
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 rounded-lg bg-accent-light text-white font-medium hover:opacity-90"
          >
            Refresh
          </button>
        )}
      </div>
    );
  }

  const successRate = stats.totalAttempted > 0
    ? Math.round((stats.totalSolved / stats.totalAttempted) * 100)
    : 0;

  const joinDate = new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  // Heatmap generation
  const today = new Date();
  const heatmapCells = [];
  const weeks = 52;
  const daysInWeek = 7;
  
  for (let w = 0; w < weeks; w++) {
    const col = [];
    for (let d = 0; d < daysInWeek; d++) {
      const date = new Date(today);
      date.setDate(date.getDate() - (w * 7 + d));
      const dateStr = date.toISOString().split('T')[0];
      const count = stats.heatmapData[dateStr] || 0;
      
      let colorClass = "bg-gray-100 dark:bg-gray-800";
      if (count === 1) colorClass = "bg-accent-light/30";
      else if (count === 2) colorClass = "bg-accent-light/60";
      else if (count >= 3) colorClass = "bg-accent-light";
      
      col.push(
        <div 
          key={`${w}-${d}`} 
          className={`w-3 h-3 rounded-sm ${colorClass} cursor-pointer hover:ring-2 ring-accent-light ring-offset-1 dark:ring-offset-dark-bg`}
          title={`${count} problems solved on ${dateStr}`}
        />
      );
    }
    heatmapCells.push(<div key={w} className="flex flex-col gap-1">{col.reverse()}</div>);
  }

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Welcome Banner */}
      <div className="card p-6 bg-gradient-to-r from-accent-light/10 to-transparent dark:from-accent-dark/10 flex justify-between items-center border-none shadow-none">
        <div>
          <h1 className="text-2xl font-bold mb-1">Hey {user.name.split(' ')[0]} 👋</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Joined {joinDate} • Ready to forge some code?</p>
        </div>
        {stats.currentStreak > 0 && (
          <div className="hidden sm:flex items-center gap-2 bg-white dark:bg-dark-surface px-4 py-2 rounded-full shadow-sm border border-orange-200 dark:border-orange-900/50">
            <Flame className="text-orange-500 w-5 h-5 fill-current" />
            <span className="font-bold text-orange-600 dark:text-orange-400">{stats.currentStreak} Day Streak</span>
          </div>
        )}
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-5 hover:-translate-y-1 transition-transform">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Solved</p>
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{stats.totalSolved}</h3>
            </div>
            <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>
        </div>
        
        <div className="card p-5 hover:-translate-y-1 transition-transform">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Attempted</p>
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{stats.totalAttempted}</h3>
            </div>
            <div className="p-3 rounded-lg bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400">
              <RotateCw className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="card p-5 hover:-translate-y-1 transition-transform">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Remaining</p>
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{Math.max(0, TOTAL_PROBLEMS - stats.totalSolved)}</h3>
            </div>
            <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
              <ListTodo className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="card p-5 hover:-translate-y-1 transition-transform">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Success Rate</p>
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{successRate}%</h3>
            </div>
            <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400">
              <Target className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Activity Heatmap */}
        <div className="card p-6 lg:col-span-2 overflow-x-auto">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-semibold text-lg">Activity (Last Year)</h3>
            <div className="flex items-center text-xs text-gray-500 gap-2">
              Less
              <div className="flex gap-1">
                <div className="w-3 h-3 rounded-sm bg-gray-100 dark:bg-gray-800"></div>
                <div className="w-3 h-3 rounded-sm bg-accent-light/30"></div>
                <div className="w-3 h-3 rounded-sm bg-accent-light/60"></div>
                <div className="w-3 h-3 rounded-sm bg-accent-light"></div>
              </div>
              More
            </div>
          </div>
          <div className="flex gap-1 min-w-max">
            {heatmapCells.reverse()}
          </div>
        </div>

        {/* Weekly Goal & Streak */}
        <div className="space-y-6">
          <div className="card p-6">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-accent-light" /> Weekly Goal
            </h3>
            <div className="flex justify-between items-end mb-2">
              <span className="text-2xl font-bold">{stats.solvedThisWeek} <span className="text-sm text-gray-500 font-normal">/ {stats.weeklyGoal} solved</span></span>
              <span className="text-sm font-medium text-accent-light">{Math.min(100, Math.round((stats.solvedThisWeek/stats.weeklyGoal)*100))}%</span>
            </div>
            <div className="w-full h-2.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-accent-light rounded-full transition-all duration-1000" 
                style={{ width: `${Math.min(100, (stats.solvedThisWeek/stats.weeklyGoal)*100)}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-4 text-center">
              {stats.solvedThisWeek >= stats.weeklyGoal ? 'Goal crushed! Keep going! 🚀' : `${stats.weeklyGoal - stats.solvedThisWeek} more to reach your goal.`}
            </p>
          </div>

          <div className="card p-6 bg-gradient-to-br from-orange-500/10 to-red-500/5 dark:from-orange-900/20 border-orange-100 dark:border-orange-900/20">
            <h3 className="font-semibold text-lg mb-4 text-orange-600 dark:text-orange-400 flex items-center gap-2">
              <Flame className="w-5 h-5 fill-current" /> Streaks
            </h3>
            <div className="flex justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Current</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.currentStreak} <span className="text-sm font-normal text-gray-500">days</span></p>
              </div>
              <div className="w-px bg-orange-200 dark:bg-orange-800/50"></div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Longest</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.longestStreak} <span className="text-sm font-normal text-gray-500">days</span></p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions & Recent */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="font-semibold text-lg mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-4">
            <Link to="/problems" className="p-4 rounded-xl border border-light-border dark:border-dark-border hover:bg-gray-50 dark:hover:bg-dark-surface/50 transition-colors group">
              <Code2 className="w-6 h-6 text-accent-light mb-2" />
              <h4 className="font-medium group-hover:text-accent-light transition-colors">Browse Problems</h4>
              <p className="text-xs text-gray-500 mt-1">Pick a new challenge</p>
            </Link>
            <Link to="/notes" className="p-4 rounded-xl border border-light-border dark:border-dark-border hover:bg-gray-50 dark:hover:bg-dark-surface/50 transition-colors group">
              <BookOpen className="w-6 h-6 text-emerald-500 mb-2" />
              <h4 className="font-medium group-hover:text-emerald-500 transition-colors">Review Notes</h4>
              <p className="text-xs text-gray-500 mt-1">Check your insights</p>
            </Link>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-lg">Recent Activity</h3>
            <Link to="/profile" className="text-sm text-accent-light hover:underline flex items-center">
              View All <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
          {stats.recentActivity.length === 0 ? (
            <div className="text-center py-6 text-gray-500 text-sm">No activity yet. Start solving!</div>
          ) : (
            <div className="space-y-3">
              {stats.recentActivity.map((activity, idx) => (
                <div key={idx} className="flex justify-between items-center p-3 rounded-lg bg-gray-50 dark:bg-dark-surface/50">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${activity.status === 'solved' ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                    <span className="font-medium text-sm truncate max-w-[200px]">{getProblemTitle(activity.problemId)}</span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(activity.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
