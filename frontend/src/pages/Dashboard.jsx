import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  CheckCircle2, RotateCw, ListTodo, Target, Flame, 
  ArrowRight, Code2, BookOpen, BarChart2, PieChart as PieIcon, Award, Zap
} from 'lucide-react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import { TOTAL_PROBLEMS, getProblemTitle, problems } from '../data/problems';
import GlassCard from '../components/ui/GlassCard';
import Skeleton from '../components/ui/Skeleton';
import useCountUp from '../hooks/useCountUp';

/* ── Stat Count Card Wrapper ── */
const StatCard = ({ title, count, icon: Icon, colorClass, suffix = '', delay = 0 }) => {
  const { count: displayCount, ref } = useCountUp(count);
  return (
    <GlassCard ref={ref} delay={delay} className="p-6">
      <div className="flex justify-between items-start">
        <div>
          <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider">{title}</span>
          <h3 className="text-3xl font-extrabold mt-2 text-gray-900 dark:text-white">
            {displayCount}{suffix}
          </h3>
        </div>
        <div className={`p-3 rounded-xl bg-white/60 dark:bg-white/[0.04] shadow-sm ${colorClass}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </GlassCard>
  );
};

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [topicProgress, setTopicProgress] = useState([]);
  const [difficultySplit, setDifficultySplit] = useState([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/stats/me');
        setStats(data);
        setError(null);

        // Fetch user progress details to compute topic and difficulty breakdowns
        const progressResponse = await api.get('/progress');
        const userSolves = progressResponse.data.progress || [];

        // 1. Compute Topic Progress Breakdown
        const topicCounts = {};
        const solvedTopicCounts = {};

        // Aggregate total problems per topic
        problems.forEach(p => {
          topicCounts[p.topic] = (topicCounts[p.topic] || 0) + 1;
        });

        // Aggregate solved problems per topic
        userSolves.forEach(solve => {
          if (solve.status === 'solved') {
            const originalProblem = problems.find(p => p.id === solve.problemId);
            if (originalProblem) {
              solvedTopicCounts[originalProblem.topic] = (solvedTopicCounts[originalProblem.topic] || 0) + 1;
            }
          }
        });

        const topicsArray = Object.keys(topicCounts).map(topic => {
          const solved = solvedTopicCounts[topic] || 0;
          const total = topicCounts[topic];
          return {
            subject: topic,
            A: Math.round((solved / total) * 100), // percentage
            solved,
            total,
            fullMark: 100
          };
        }).sort((a, b) => b.A - a.A).slice(0, 6); // Top 6 topics for layout

        setTopicProgress(topicsArray);

        // 2. Compute Difficulty Breakdown (Easy, Medium, Hard)
        const difficultyCounts = { Easy: 0, Medium: 0, Hard: 0 };
        const solvedDifficultyCounts = { Easy: 0, Medium: 0, Hard: 0 };

        problems.forEach(p => {
          if (difficultyCounts[p.difficulty] !== undefined) {
            difficultyCounts[p.difficulty]++;
          }
        });

        userSolves.forEach(solve => {
          if (solve.status === 'solved') {
            const originalProblem = problems.find(p => p.id === solve.problemId);
            if (originalProblem && solvedDifficultyCounts[originalProblem.difficulty] !== undefined) {
              solvedDifficultyCounts[originalProblem.difficulty]++;
            }
          }
        });

        setDifficultySplit([
          { name: 'Easy', value: solvedDifficultyCounts.Easy, total: difficultyCounts.Easy, color: '#10B981' },
          { name: 'Medium', value: solvedDifficultyCounts.Medium, total: difficultyCounts.Medium, color: '#F59E0B' },
          { name: 'Hard', value: solvedDifficultyCounts.Hard, total: difficultyCounts.Hard, color: '#EF4444' }
        ]);

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
      <div className="p-8 space-y-6 max-w-7xl mx-auto">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-80 lg:col-span-2" />
          <Skeleton className="h-80" />
        </div>
      </div>
    );
  }

  if (error || !stats || !user) {
    return (
      <div className="max-w-md mx-auto mt-12">
        <GlassCard hover={false} className="p-8 text-center flex flex-col items-center">
          <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Error Loading Dashboard</h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="btn-primary font-semibold"
          >
            Retry Loading
          </button>
        </GlassCard>
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
      
      let colorClass = "bg-gray-150 dark:bg-gray-800/60";
      if (count === 1) colorClass = "bg-primary/20 border border-primary/10";
      else if (count === 2) colorClass = "bg-primary/50 border border-primary/20";
      else if (count >= 3) colorClass = "bg-primary border border-primary-hover";
      
      col.push(
        <div 
          key={`${w}-${d}`} 
          className={`w-3.5 h-3.5 rounded-[3px] transition-all ${colorClass} cursor-pointer hover:ring-2 hover:ring-primary hover:scale-115`}
          title={`${count} problems solved on ${dateStr}`}
        />
      );
    }
    heatmapCells.push(<div key={w} className="flex flex-col gap-1">{col.reverse()}</div>);
  }

  return (
    <div className="space-y-8 animate-fade-in p-2 max-w-7xl mx-auto">
      
      {/* Welcome Banner */}
      <GlassCard hover={false} className="p-8 bg-gradient-to-br from-primary/[0.08] via-purple-500/[0.02] to-transparent border-none flex flex-col sm:flex-row justify-between sm:items-center gap-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
            Welcome back, {user.name.split(' ')[0]} 👋
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            Registered on {joinDate} • Ready to crush your coding placement goals today?
          </p>
        </div>
        {stats.currentStreak > 0 && (
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 text-white px-5 py-2.5 rounded-full shadow-lg shadow-orange-500/25">
            <Flame className="w-5 h-5 fill-current animate-bounce" />
            <span className="font-bold text-sm">{stats.currentStreak} Day Coding Streak</span>
          </div>
        )}
      </GlassCard>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Solved" count={stats.totalSolved} icon={CheckCircle2} colorClass="text-emerald-500 bg-emerald-500/10" delay={0} />
        <StatCard title="Attempted" count={stats.totalAttempted} icon={RotateCw} colorClass="text-amber-500 bg-amber-500/10" delay={0.05} />
        <StatCard title="Remaining" count={Math.max(0, TOTAL_PROBLEMS - stats.totalSolved)} icon={ListTodo} colorClass="text-blue-500 bg-blue-500/10" delay={0.1} />
        <StatCard title="Success Rate" count={successRate} icon={Target} colorClass="text-purple-500 bg-purple-500/10" suffix="%" delay={0.15} />
      </div>

      {/* Charts & Interactive Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Heatmap Card */}
        <GlassCard hover={false} className="p-6 lg:col-span-2 flex flex-col justify-between overflow-hidden">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-primary" /> Solved Heatmap
            </h3>
            <div className="flex items-center text-xs text-gray-500 gap-2">
              Less
              <div className="flex gap-1">
                <div className="w-3.5 h-3.5 rounded-[3px] bg-gray-150 dark:bg-gray-800"></div>
                <div className="w-3.5 h-3.5 rounded-[3px] bg-primary/20"></div>
                <div className="w-3.5 h-3.5 rounded-[3px] bg-primary/50"></div>
                <div className="w-3.5 h-3.5 rounded-[3px] bg-primary"></div>
              </div>
              More
            </div>
          </div>
          <div className="overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-250 dark:scrollbar-thumb-gray-850">
            <div className="flex gap-1 min-w-max">
              {heatmapCells.reverse()}
            </div>
          </div>
          <div className="text-xs text-gray-400 mt-4">Solves are updated dynamically on problem saves</div>
        </GlassCard>

        {/* Weekly Goals Card */}
        <div className="flex flex-col gap-6">
          <GlassCard hover={false} className="p-6 bg-gradient-to-br from-primary/[0.03] to-transparent">
            <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-primary animate-pulse" /> Weekly Placement Goal
            </h3>
            <div className="flex justify-between items-end mb-2">
              <span className="text-3xl font-extrabold text-gray-900 dark:text-white">
                {stats.solvedThisWeek} <span className="text-xs text-gray-500 font-normal">/ {stats.weeklyGoal} solved</span>
              </span>
              <span className="text-sm font-semibold text-primary">
                {Math.min(100, Math.round((stats.solvedThisWeek / stats.weeklyGoal) * 100))}%
              </span>
            </div>
            <div className="w-full h-3 bg-gray-150 dark:bg-gray-850 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-primary to-purple-500 rounded-full transition-all duration-1000" 
                style={{ width: `${Math.min(100, (stats.solvedThisWeek / stats.weeklyGoal) * 100)}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-5 text-center leading-relaxed">
              {stats.solvedThisWeek >= stats.weeklyGoal 
                ? '🎉 Congratulations! You crushed this week\'s goal!' 
                : `💡 Just ${stats.weeklyGoal - stats.solvedThisWeek} more solved problem${stats.weeklyGoal - stats.solvedThisWeek > 1 ? 's' : ''} left to hit your benchmark.`
              }
            </p>
          </GlassCard>

          <GlassCard hover={false} className="p-6 bg-gradient-to-br from-orange-500/[0.04] to-red-500/[0.04] border-orange-500/10">
            <h3 className="font-bold text-lg text-orange-600 dark:text-orange-400 mb-4 flex items-center gap-2">
              <Flame className="w-5 h-5 fill-current" /> Streaks Ledger
            </h3>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs text-gray-500">Current Run</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {stats.currentStreak} <span className="text-xs font-normal text-gray-500">days</span>
                </p>
              </div>
              <div className="w-px h-10 bg-orange-500/10"></div>
              <div>
                <p className="text-xs text-gray-500">All-Time Peak</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {stats.longestStreak} <span className="text-xs font-normal text-gray-500">days</span>
                </p>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Advanced Topic and Difficulty Breakdown Visualization */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Topic Breakdown Radar */}
        <GlassCard hover={false} className="p-6 lg:col-span-2 flex flex-col justify-between">
          <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-primary" /> Topic Strength Breakdown
          </h3>
          <div className="h-72 flex items-center justify-center">
            {topicProgress.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" radius="70%" data={topicProgress}>
                  <PolarGrid stroke="#888888" strokeWidth={0.5} strokeDasharray="3 3" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#888888', fontSize: 11 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#888888', fontSize: 9 }} />
                  <Radar name="Solved Strength" dataKey="A" stroke="#6366F1" fill="#6366F1" fillOpacity={0.2} />
                  <Tooltip cursor={{ fill: 'transparent' }} />
                </RadarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-gray-400 text-sm">Solve questions to populate your strength metrics</div>
            )}
          </div>
          <div className="text-center text-xs text-gray-400 mt-4">Metrics reflect percentages solved across catalog topics</div>
        </GlassCard>

        {/* Difficulty Breakdown Doughnut */}
        <GlassCard hover={false} className="p-6 flex flex-col justify-between">
          <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <PieIcon className="w-5 h-5 text-primary" /> Difficulty Breakdown
          </h3>
          <div className="h-56 flex items-center justify-center">
            {difficultySplit.some(d => d.value > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={difficultySplit.filter(d => d.value > 0)}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {difficultySplit.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip cursor={{ fill: 'transparent' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-gray-400 text-sm text-center flex flex-col items-center gap-2">
                <Zap className="w-8 h-8 text-amber-500 opacity-40 animate-pulse" />
                No questions solved yet
              </div>
            )}
          </div>
          
          <div className="space-y-2 mt-4 text-xs">
            {difficultySplit.map((diff, index) => {
              const percentage = diff.total > 0 ? Math.round((diff.value / diff.total) * 100) : 0;
              return (
                <div key={index} className="flex items-center justify-between font-medium">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: diff.color }} />
                    <span className="text-gray-600 dark:text-gray-400">{diff.name}</span>
                  </div>
                  <span className="text-gray-800 dark:text-gray-200">
                    {diff.value} <span className="text-gray-400 font-normal">/ {diff.total} solved ({percentage}%)</span>
                  </span>
                </div>
              );
            })}
          </div>
        </GlassCard>

      </div>

      {/* Quick Actions & Recent Solver Activity Ledger */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Quick Actions Card */}
        <GlassCard hover={false} className="p-6 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-6">Quick Navigation</h3>
            <div className="grid grid-cols-2 gap-4">
              <Link to="/problems" className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white/40 dark:bg-white/[0.01] hover:bg-gray-100 dark:hover:bg-dark-surface/50 hover:border-primary/35 transition-all group">
                <Code2 className="w-6 h-6 text-primary mb-2 group-hover:scale-110 transition-transform" />
                <h4 className="font-bold text-sm text-gray-800 dark:text-gray-200 group-hover:text-primary transition-colors">Problems</h4>
                <p className="text-[10px] text-gray-500 mt-1">Practice & compile</p>
              </Link>
              <Link to="/notes" className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white/40 dark:bg-white/[0.01] hover:bg-gray-100 dark:hover:bg-dark-surface/50 hover:border-emerald-500/35 transition-all group">
                <BookOpen className="w-6 h-6 text-emerald-500 mb-2 group-hover:scale-110 transition-transform" />
                <h4 className="font-bold text-sm text-gray-800 dark:text-gray-200 group-hover:text-emerald-500 transition-colors">Workspace</h4>
                <p className="text-[10px] text-gray-500 mt-1">Review sheets</p>
              </Link>
            </div>
          </div>
          <div className="text-center text-[10px] text-gray-400 mt-4 leading-relaxed">
            Streaks update every 24 hours. Keep coding consistently to lock streaks!
          </div>
        </GlassCard>

        {/* Recent Solves Activity Ledger */}
        <GlassCard hover={false} className="p-6 lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-lg text-gray-900 dark:text-white">Recent Solver Activity</h3>
            <Link to="/profile" className="text-sm font-semibold text-primary hover:underline inline-flex items-center gap-1">
              View Activity Profile <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          {stats.recentActivity.length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-sm">
              No recent activity. Pick a problem and start solving!
            </div>
          ) : (
            <div className="space-y-4">
              {stats.recentActivity.map((activity, idx) => (
                <div key={idx} className="flex justify-between items-center p-4 rounded-xl border border-gray-150 dark:border-gray-850 bg-white/30 dark:bg-white/[0.01]">
                  <div className="flex items-center gap-3">
                    <div className={`w-2.5 h-2.5 rounded-full ${activity.status === 'solved' ? 'bg-green-500 shadow-md shadow-green-500/25' : 'bg-yellow-500 shadow-md shadow-yellow-500/25'}`} />
                    <span className="font-semibold text-sm text-gray-800 dark:text-gray-200 truncate max-w-[200px] sm:max-w-md">
                      {getProblemTitle(activity.problemId)}
                    </span>
                  </div>
                  <span className="text-xs text-gray-400 font-medium">
                    {new Date(activity.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </GlassCard>

      </div>

    </div>
  );
}
