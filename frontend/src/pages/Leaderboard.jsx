import { useState, useEffect } from 'react';
import { Trophy, Medal, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api';

export default function Leaderboard() {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('alltime'); // alltime, month, week
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/leaderboard?filter=${filter}&page=${page}`);
        setLeaderboard(data.leaderboard);
        setTotalPages(data.totalPages);
      } catch (error) {
        console.error('Failed to load leaderboard', error);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, [filter, page]);

  const getRankBadge = (rank) => {
    if (rank === 1) return <div className="w-8 h-8 rounded-full bg-yellow-100 text-yellow-600 flex items-center justify-center"><Trophy className="w-4 h-4" /></div>;
    if (rank === 2) return <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center"><Medal className="w-4 h-4" /></div>;
    if (rank === 3) return <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center"><Medal className="w-4 h-4" /></div>;
    return <div className="w-8 h-8 flex items-center justify-center font-semibold text-gray-500">#{rank}</div>;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-dark-surface p-6 rounded-xl border border-light-border dark:border-dark-border shadow-sm">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Trophy className="w-6 h-6 text-accent-light" />
            Hall of Fame
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">See how you stack up against other KLU students.</p>
        </div>
        
        <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
          <button 
            onClick={() => { setFilter('alltime'); setPage(1); }}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${filter === 'alltime' ? 'bg-white dark:bg-dark-surface shadow text-accent-light' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
          >
            All Time
          </button>
          <button 
            onClick={() => { setFilter('month'); setPage(1); }}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${filter === 'month' ? 'bg-white dark:bg-dark-surface shadow text-accent-light' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
          >
            This Month
          </button>
          <button 
            onClick={() => { setFilter('week'); setPage(1); }}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${filter === 'week' ? 'bg-white dark:bg-dark-surface shadow text-accent-light' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
          >
            This Week
          </button>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-dark-bg/50 border-b border-light-border dark:border-dark-border">
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider w-20 text-center">Rank</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Student</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Solved</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Current Streak</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-light-border dark:divide-dark-border">
              {loading ? (
                [1,2,3,4,5].map(i => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4"><div className="w-8 h-8 bg-gray-200 dark:bg-gray-800 rounded-full mx-auto"></div></td>
                    <td className="px-6 py-4"><div className="flex items-center gap-3"><div className="w-10 h-10 bg-gray-200 dark:bg-gray-800 rounded-full"></div><div className="w-32 h-4 bg-gray-200 dark:bg-gray-800 rounded"></div></div></td>
                    <td className="px-6 py-4"><div className="w-12 h-6 bg-gray-200 dark:bg-gray-800 rounded mx-auto"></div></td>
                    <td className="px-6 py-4"><div className="w-12 h-6 bg-gray-200 dark:bg-gray-800 rounded mx-auto"></div></td>
                    <td className="px-6 py-4"><div className="w-20 h-4 bg-gray-200 dark:bg-gray-800 rounded ml-auto"></div></td>
                  </tr>
                ))
              ) : leaderboard.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                    No data available for this period. Be the first!
                  </td>
                </tr>
              ) : (
                leaderboard.map((entry) => {
                  const isCurrentUser = user._id === entry._id;
                  return (
                    <tr 
                      key={entry._id} 
                      className={`hover:bg-gray-50 dark:hover:bg-dark-surface/50 transition-colors ${isCurrentUser ? 'bg-accent-light/5 dark:bg-accent-light/10 relative' : ''}`}
                    >
                      {isCurrentUser && <td className="absolute left-0 top-0 bottom-0 w-1 bg-accent-light"></td>}
                      <td className="px-6 py-4 flex justify-center">
                        {getRankBadge(entry.rank)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent-light to-purple-500 text-white flex items-center justify-center font-bold shadow-sm">
                            {entry.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-semibold flex items-center gap-2 text-gray-900 dark:text-white">
                              {entry.name}
                              {isCurrentUser && <span className="text-[10px] bg-accent-light text-white px-2 py-0.5 rounded-full">You</span>}
                            </div>
                            <div className="text-xs text-gray-500">@{entry.username}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-center font-bold text-lg text-gray-900 dark:text-white">{entry.solved}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-1.5 font-medium text-orange-500">
                          {entry.streak > 0 ? <><Star className="w-4 h-4 fill-current" /> {entry.streak}</> : <span className="text-gray-400">-</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right text-sm text-gray-500">
                        {new Date(entry.joinedAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 p-4 border-t border-light-border dark:border-dark-border bg-gray-50/50 dark:bg-dark-bg/50">
            <button 
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1.5 rounded border border-light-border dark:border-dark-border hover:bg-white dark:hover:bg-dark-surface disabled:opacity-50 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-sm font-medium">Page {page} of {totalPages}</span>
            <button 
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-1.5 rounded border border-light-border dark:border-dark-border hover:bg-white dark:hover:bg-dark-surface disabled:opacity-50 transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

    </div>
  );
}
