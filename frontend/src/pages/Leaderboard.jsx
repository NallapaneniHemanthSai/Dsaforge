import { useState, useEffect } from 'react';
import { Trophy, Medal, Star, ChevronLeft, ChevronRight, Users, Flame, Zap, Award } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import GlassCard from '../components/ui/GlassCard';
import Skeleton from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';

export default function Leaderboard() {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('alltime'); // alltime, month, week
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalStudents, setTotalStudents] = useState(0);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/leaderboard?filter=${filter}&page=${page}`);
        setLeaderboard(data.leaderboard || []);
        setTotalPages(data.totalPages || 1);
        setTotalStudents(data.total || data.leaderboard?.length || 0);
      } catch (error) {
        console.error('Failed to load leaderboard', error);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, [filter, page]);

  const getRankBadge = (rank) => {
    if (rank === 1) {
      return (
        <div className="w-9 h-9 rounded-full bg-yellow-500/10 text-yellow-500 flex items-center justify-center border border-yellow-500/25 shadow-lg shadow-yellow-500/5 animate-pulse">
          <Trophy className="w-5 h-5 fill-current" />
        </div>
      );
    }
    if (rank === 2) {
      return (
        <div className="w-9 h-9 rounded-full bg-slate-300/20 text-slate-400 flex items-center justify-center border border-slate-300/10">
          <Medal className="w-5 h-5 fill-current" />
        </div>
      );
    }
    if (rank === 3) {
      return (
        <div className="w-9 h-9 rounded-full bg-amber-600/10 text-amber-600 flex items-center justify-center border border-amber-600/15">
          <Medal className="w-5 h-5 fill-current" />
        </div>
      );
    }
    return (
      <div className="w-9 h-9 flex items-center justify-center font-bold text-gray-400 text-sm">
        #{rank}
      </div>
    );
  };

  const getGamifiedBadge = (solvedCount) => {
    if (solvedCount >= 100) {
      return { 
        name: 'Grandmaster', 
        class: 'bg-gradient-to-r from-red-500 to-purple-600 text-white font-bold px-2 py-0.5 rounded border border-red-500/20 shadow-sm shadow-red-500/10' 
      };
    }
    if (solvedCount >= 50) {
      return { 
        name: 'Master', 
        class: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border border-purple-200 dark:border-purple-800' 
      };
    }
    if (solvedCount >= 25) {
      return { 
        name: 'Expert', 
        class: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200 dark:border-amber-800' 
      };
    }
    if (solvedCount >= 10) {
      return { 
        name: 'Specialist', 
        class: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800' 
      };
    }
    return { 
      name: 'Novice', 
      class: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800' 
    };
  };

  return (
    <div className="space-y-8 animate-fade-in p-1 max-w-7xl mx-auto">
      
      {/* Header Panel */}
      <GlassCard hover={false} className="p-6 flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-gradient-to-br from-accent-light/[0.04] to-transparent">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
            <Trophy className="w-8 h-8 text-yellow-500" /> Leaderboard Arena
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            Student rankings, placement consistency badges, and problem solving streaks. Total Solvers: {totalStudents}
          </p>
        </div>
        
        {/* Toggle Duration filter controls */}
        <div className="flex bg-gray-150 dark:bg-gray-850 p-1 rounded-xl shrink-0">
          <button 
            onClick={() => { setFilter('alltime'); setPage(1); }}
            className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${filter === 'alltime' ? 'bg-white dark:bg-dark-surface shadow-sm text-accent-light' : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-300'}`}
          >
            All-Time
          </button>
          <button 
            onClick={() => { setFilter('month'); setPage(1); }}
            className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${filter === 'month' ? 'bg-white dark:bg-dark-surface shadow-sm text-accent-light' : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-300'}`}
          >
            This Month
          </button>
          <button 
            onClick={() => { setFilter('week'); setPage(1); }}
            className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${filter === 'week' ? 'bg-white dark:bg-dark-surface shadow-sm text-accent-light' : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-300'}`}
          >
            This Week
          </button>
        </div>
      </GlassCard>

      {/* Directory Cards for top three profiles */}
      {!loading && leaderboard.length >= 3 && page === 1 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Rank 2 */}
          <GlassCard className="p-6 flex flex-col items-center justify-between text-center relative border-slate-350 dark:border-slate-800 order-2 md:order-1 mt-6">
            <div className="absolute top-4 left-4 bg-slate-300/10 text-slate-400 font-bold px-3 py-1 rounded-full text-xs">Rank #2</div>
            <div className="w-16 h-16 rounded-full bg-slate-300/20 text-slate-400 flex items-center justify-center font-bold text-2xl border border-slate-300/10 shadow-md">
              {leaderboard[1].name.charAt(0).toUpperCase()}
            </div>
            <h3 className="font-extrabold text-base text-gray-900 dark:text-white mt-4">{leaderboard[1].name}</h3>
            <p className="text-xs text-gray-400">@{leaderboard[1].username}</p>
            <div className="flex items-center gap-2 mt-4">
              <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded ${getGamifiedBadge(leaderboard[1].solved).class}`}>
                {getGamifiedBadge(leaderboard[1].solved).name}
              </span>
            </div>
            <div className="mt-6 pt-4 border-t border-gray-150 dark:border-gray-850 w-full flex justify-around text-xs">
              <div>
                <span className="text-gray-400">Solved</span>
                <p className="font-bold text-gray-950 dark:text-white mt-0.5">{leaderboard[1].solved}</p>
              </div>
              <div>
                <span className="text-gray-400">Streak</span>
                <p className="font-bold text-orange-500 mt-0.5 flex items-center gap-0.5 justify-center"><Flame className="w-3.5 h-3.5 fill-current" /> {leaderboard[1].streak || '-'}</p>
              </div>
            </div>
          </GlassCard>

          {/* Rank 1 */}
          <GlassCard className="p-8 flex flex-col items-center justify-between text-center relative border-yellow-500/20 bg-gradient-to-br from-yellow-500/[0.03] to-transparent order-1 md:order-2 ring-2 ring-yellow-500/15">
            <div className="absolute top-4 bg-yellow-500/15 text-yellow-500 font-extrabold px-4 py-1.5 rounded-full text-xs flex items-center gap-1"><Trophy className="w-3.5 h-3.5 fill-current animate-bounce" /> Champion</div>
            <div className="w-20 h-20 rounded-full bg-yellow-500/10 text-yellow-500 flex items-center justify-center font-bold text-3xl border border-yellow-500/25 shadow-lg shadow-yellow-500/5 mt-4">
              {leaderboard[0].name.charAt(0).toUpperCase()}
            </div>
            <h3 className="font-black text-lg text-gray-900 dark:text-white mt-4">{leaderboard[0].name}</h3>
            <p className="text-xs text-gray-400">@{leaderboard[0].username}</p>
            <div className="flex items-center gap-2 mt-4">
              <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded ${getGamifiedBadge(leaderboard[0].solved).class}`}>
                {getGamifiedBadge(leaderboard[0].solved).name}
              </span>
            </div>
            <div className="mt-6 pt-4 border-t border-yellow-500/10 w-full flex justify-around text-xs">
              <div>
                <span className="text-gray-400">Solved</span>
                <p className="font-bold text-gray-950 dark:text-white mt-0.5">{leaderboard[0].solved}</p>
              </div>
              <div>
                <span className="text-gray-400">Streak</span>
                <p className="font-bold text-orange-500 mt-0.5 flex items-center gap-0.5 justify-center"><Flame className="w-3.5 h-3.5 fill-current" /> {leaderboard[0].streak || '-'}</p>
              </div>
            </div>
          </GlassCard>

          {/* Rank 3 */}
          <GlassCard className="p-6 flex flex-col items-center justify-between text-center relative border-amber-600/20 order-3 mt-6">
            <div className="absolute top-4 right-4 bg-amber-600/10 text-amber-600 font-bold px-3 py-1 rounded-full text-xs">Rank #3</div>
            <div className="w-16 h-16 rounded-full bg-amber-600/15 text-amber-600 flex items-center justify-center font-bold text-2xl border border-amber-600/20 shadow-md">
              {leaderboard[2].name.charAt(0).toUpperCase()}
            </div>
            <h3 className="font-extrabold text-base text-gray-900 dark:text-white mt-4">{leaderboard[2].name}</h3>
            <p className="text-xs text-gray-400">@{leaderboard[2].username}</p>
            <div className="flex items-center gap-2 mt-4">
              <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded ${getGamifiedBadge(leaderboard[2].solved).class}`}>
                {getGamifiedBadge(leaderboard[2].solved).name}
              </span>
            </div>
            <div className="mt-6 pt-4 border-t border-gray-150 dark:border-gray-850 w-full flex justify-around text-xs">
              <div>
                <span className="text-gray-400">Solved</span>
                <p className="font-bold text-gray-950 dark:text-white mt-0.5">{leaderboard[2].solved}</p>
              </div>
              <div>
                <span className="text-gray-400">Streak</span>
                <p className="font-bold text-orange-500 mt-0.5 flex items-center gap-0.5 justify-center"><Flame className="w-3.5 h-3.5 fill-current" /> {leaderboard[2].streak || '-'}</p>
              </div>
            </div>
          </GlassCard>
        </div>
      )}

      {/* Directory Grid */}
      <div className="bg-white/60 dark:bg-white/[0.02] backdrop-blur-xl border border-gray-250 dark:border-white/[0.08] rounded-2xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-250 dark:divide-gray-850">
            <thead className="bg-gray-50/50 dark:bg-dark-bg/20">
              <tr>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-24 text-center">Rank</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Student</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Tier Badge</th>
                <th scope="col" className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider w-32">Solved</th>
                <th scope="col" className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider w-36">Coding Streak</th>
                <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Registration</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-850">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4"><div className="w-8 h-8 bg-gray-200 dark:bg-gray-800 rounded-full mx-auto" /></td>
                    <td className="px-6 py-4"><div className="flex items-center gap-3"><div className="w-10 h-10 bg-gray-200 dark:bg-gray-800 rounded-full" /><div className="w-32 h-4 bg-gray-200 dark:bg-gray-800 rounded" /></div></td>
                    <td className="px-6 py-4"><div className="w-16 h-5 bg-gray-200 dark:bg-gray-800 rounded" /></td>
                    <td className="px-6 py-4"><div className="w-12 h-6 bg-gray-200 dark:bg-gray-800 rounded mx-auto" /></td>
                    <td className="px-6 py-4"><div className="w-12 h-6 bg-gray-200 dark:bg-gray-800 rounded mx-auto" /></td>
                    <td className="px-6 py-4"><div className="w-20 h-4 bg-gray-200 dark:bg-gray-800 rounded ml-auto" /></td>
                  </tr>
                ))
              ) : leaderboard.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                    <EmptyState
                      icon={Award}
                      title="No solver stats tracked yet"
                      description="Be the first solver to rank on this leaderboard!"
                    />
                  </td>
                </tr>
              ) : (
                leaderboard.map((entry) => {
                  const isCurrentUser = user?._id === entry._id;
                  const tier = getGamifiedBadge(entry.solved);
                  return (
                    <tr 
                      key={entry._id} 
                      className={`hover:bg-gray-50/40 dark:hover:bg-white/[0.01] transition-colors ${isCurrentUser ? 'bg-accent-light/[0.04] dark:bg-accent-light/10 relative font-semibold' : ''}`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap flex justify-center">
                        {getRankBadge(entry.rank)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent-light to-purple-500 text-white flex items-center justify-center font-bold shadow-sm">
                            {entry.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="text-sm font-semibold flex items-center gap-2 text-gray-900 dark:text-white">
                              {entry.name}
                              {isCurrentUser && <span className="text-[10px] bg-accent-light text-white px-2 py-0.5 rounded-full font-bold">You</span>}
                            </div>
                            <div className="text-xs text-gray-400">@{entry.username}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`inline-flex items-center text-[10px] uppercase font-extrabold tracking-wider px-2.5 py-0.5 rounded-md ${tier.class}`}>
                          {tier.name}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-bold text-gray-900 dark:text-white">
                        {entry.solved}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                        {entry.streak > 0 ? (
                          <div className="inline-flex items-center justify-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-100 dark:bg-orange-950/20 text-orange-600 dark:text-orange-400">
                            <Star className="w-3.5 h-3.5 fill-current" /> {entry.streak}
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-xs text-gray-400">
                        {new Date(entry.joinedAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination bar */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-between p-5 border-t border-gray-150 dark:border-gray-850 bg-gray-50/50 dark:bg-dark-bg/50">
            <span className="text-xs text-gray-500">
              Page {page} of {totalPages}
            </span>
            <div className="flex gap-2">
              <button 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-dark-surface hover:bg-gray-150 dark:hover:bg-dark-surface/50 disabled:opacity-50 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button 
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-dark-surface hover:bg-gray-150 dark:hover:bg-dark-surface/50 disabled:opacity-50 transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
