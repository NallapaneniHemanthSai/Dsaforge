import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ExternalLink, Code2, Bookmark, Search, ChevronLeft, ChevronRight,
  MessageSquare, LayoutGrid, List, Sparkles, Filter, ChevronDown, ChevronUp,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { isDemoStudent } from '../utils/demoMode';
import {
  problems as catalogProblems,
  sheets,
  getSheetById,
  TOTAL_PROBLEMS,
} from '../data/problems';

const PAGE_SIZE = 25;

function DifficultyBadge({ diff }) {
  const cls = diff === 'Easy' ? 'badge-easy' : diff === 'Medium' ? 'badge-medium' : 'badge-hard';
  return <span className={cls}>{diff}</span>;
}

function StatusSelect({ value, onChange, disabled = false }) {
  const styles = {
    unsolved: 'text-gray-500 bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700',
    attempted: 'text-amber-700 bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800',
    solved: 'text-emerald-700 bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800',
  };
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className={`text-xs font-semibold rounded-lg px-2.5 py-1.5 border outline-none ${disabled ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'} ${styles[value]}`}
    >
      <option value="unsolved">Unsolved</option>
      <option value="attempted">Attempted</option>
      <option value="solved">Solved</option>
    </select>
  );
}

function Pagination({ page, totalPages, total, onPage }) {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2">
      <p className="text-sm text-gray-500">
        {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)} of {total}
      </p>
      <div className="flex items-center gap-2">
        <button type="button" disabled={page === 1} onClick={() => onPage(page - 1)} className="pagination-btn">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span className="text-sm font-medium px-3">Page {page} / {totalPages}</span>
        <button type="button" disabled={page === totalPages} onClick={() => onPage(page + 1)} className="pagination-btn">
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

export default function Problems() {
  const { user } = useAuth();
  const readOnlyPreview = isDemoStudent(user);
  const [activeSheet, setActiveSheet] = useState('all');
  const [search, setSearch] = useState('');
  const [topicFilter, setTopicFilter] = useState('all');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [bookmarkedOnly, setBookmarkedOnly] = useState(false);
  const [viewMode, setViewMode] = useState('table');
  const [page, setPage] = useState(1);
  const [collapsed, setCollapsed] = useState({});
  const [progress, setProgress] = useState({});
  const [loading, setLoading] = useState(true);
  const [apiProblems, setApiProblems] = useState([]);

  const sheetCounts = useMemo(() => {
    const source = apiProblems.length ? apiProblems : catalogProblems;
    const counts = { all: source.length };
    sheets.forEach((sheet) => {
      counts[sheet.id] = source.filter((problem) => problem.sheet === sheet.id).length;
    });
    return counts;
  }, [apiProblems]);
  const sheetMeta = activeSheet !== 'all' ? getSheetById(activeSheet) : null;

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const [progressRes, problemsRes] = await Promise.all([
          api.get('/progress'),
          api.get('/problems')
        ]);
        
        const map = {};
        progressRes.data.progress.forEach((p) => { map[p.problemId] = p; });
        setProgress(map);
        const loadedProblems = problemsRes.data.data || [];
        setApiProblems(loadedProblems.length ? loadedProblems : catalogProblems);
      } catch (e) {
        console.error(e);
        setApiProblems(catalogProblems);
        toast.error('Loaded local problem catalog because the API problem list is unavailable');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const setStatus = async (id, status) => {
    if (readOnlyPreview) {
      toast('Student Demo is read-only. Progress changes are disabled for previews.');
      return;
    }
    const prev = progress[id];
    setProgress((u) => ({ ...u, [id]: { ...u[id], status, problemId: id } }));
    try {
      await api.patch(`/progress/${id}/status`, { status });
      if (status === 'solved') toast.success('Marked solved!');
    } catch {
      setProgress((u) => ({ ...u, [id]: prev }));
      toast.error('Update failed');
    }
  };

  const toggleBookmark = async (id) => {
    if (readOnlyPreview) {
      toast('Student Demo is read-only. Bookmark changes are disabled for previews.');
      return;
    }
    const prev = progress[id];
    const next = !prev?.bookmarked;
    setProgress((u) => ({ ...u, [id]: { ...u[id], bookmarked: next, problemId: id } }));
    try {
      await api.patch(`/progress/${id}/bookmark`);
    } catch {
      setProgress((u) => ({ ...u, [id]: prev }));
      toast.error('Bookmark failed');
    }
  };

  const filtered = useMemo(() => apiProblems.filter((p) => {
    if (activeSheet !== 'all' && p.sheet !== activeSheet) return false;
    if (search && !p.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (topicFilter !== 'all' && p.topic !== topicFilter) return false;
    if (difficultyFilter !== 'all' && p.difficulty !== difficultyFilter) return false;
    const st = progress[p.id]?.status || 'unsolved';
    if (statusFilter !== 'all' && st !== statusFilter) return false;
    if (bookmarkedOnly && !progress[p.id]?.bookmarked) return false;
    return true;
  }), [apiProblems, activeSheet, search, topicFilter, difficultyFilter, statusFilter, bookmarkedOnly, progress]);

  const sectionMode = !search && topicFilter === 'all' && statusFilter === 'all' && !bookmarkedOnly && difficultyFilter === 'all';

  const grouped = useMemo(() => {
    const m = new Map();
    filtered.forEach((p) => {
      const k = p.section || 'General';
      if (!m.has(k)) m.set(k, []);
      m.get(k).push(p);
    });
    return [...m.entries()];
  }, [filtered]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const stats = useMemo(() => {
    let solved = 0;
    let attempted = 0;
    filtered.forEach((p) => {
      const s = progress[p.id]?.status;
      if (s === 'solved') solved += 1;
      else if (s === 'attempted') attempted += 1;
    });
    return { total: filtered.length, solved, attempted, remaining: filtered.length - solved };
  }, [filtered, progress]);

  const globalSolved = useMemo(
    () => apiProblems.filter((p) => progress[p.id]?.status === 'solved').length,
    [apiProblems, progress],
  );
  const pct = apiProblems.length ? Math.round((globalSolved / apiProblems.length) * 100) : 0;

  useEffect(() => { setPage(1); }, [activeSheet, search, topicFilter, difficultyFilter, statusFilter, bookmarkedOnly]);

  const topics = useMemo(() => {
    const source = apiProblems.length ? apiProblems : catalogProblems;
    const filteredSource = activeSheet === 'all' ? source : source.filter((problem) => problem.sheet === activeSheet);
    return [...new Set(filteredSource.map((problem) => problem.topic).filter(Boolean))].sort();
  }, [activeSheet, apiProblems]);

  const tableHead = (
    <thead>
      <tr className="bg-gray-50/90 dark:bg-dark-bg/90 border-b border-light-border dark:border-dark-border">
        <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
        <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Problem</th>
        <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">Topic</th>
        <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Level</th>
        <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Action</th>
        <th className="w-12" />
      </tr>
    </thead>
  );

  const renderRow = (problem) => {
    const prog = progress[problem.id];
    const status = prog?.status || 'unsolved';
    return (
      <tr key={problem.id} className="table-row-hover">
        <td className="px-5 py-3.5">
          <StatusSelect value={status} onChange={(v) => setStatus(problem.id, v)} disabled={readOnlyPreview} />
        </td>
        <td className="px-5 py-3.5">
          <div className="flex items-center gap-2 min-w-0">
            <a href={problem.link || problem.externalLink || '#'} target="_blank" rel="noreferrer" className="font-medium hover:text-primary truncate flex items-center gap-1">
              {problem.title}
              <ExternalLink className="w-3.5 h-3.5 opacity-40 shrink-0" />
            </a>
            {prog?.note && <MessageSquare className="w-4 h-4 text-sky-500 shrink-0" />}
          </div>
        </td>
        <td className="px-5 py-3.5 hidden md:table-cell"><span className="topic-pill">{problem.topic}</span></td>
        <td className="px-5 py-3.5"><DifficultyBadge diff={problem.difficulty} /></td>
        <td className="px-5 py-3.5">
          <Link to={`/editor/${problem.id}`} className="btn-code"><Code2 className="w-4 h-4" /> Solve</Link>
        </td>
        <td className="px-5 py-3.5 text-right">
          <button
            type="button"
            onClick={() => toggleBookmark(problem.id)}
            disabled={readOnlyPreview}
            className={`p-2 rounded-lg ${prog?.bookmarked ? 'text-primary bg-primary/15' : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
            title={readOnlyPreview ? 'Read-only demo preview' : 'Toggle bookmark'}
          >
            <Bookmark className={`w-4 h-4 ${prog?.bookmarked ? 'fill-current' : ''}`} />
          </button>
        </td>
      </tr>
    );
  };

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      <div className="page-hero">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <span className="hero-badge"><Sparkles className="w-4 h-4" /> {(apiProblems.length || TOTAL_PROBLEMS)}+ DSA problems</span>
            <h1 className="text-3xl md:text-4xl font-bold mt-3">Problem Library</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2 max-w-2xl">
              Structured sheets with subtopics for KL students — track progress, code in Java, ace placements.
            </p>
          </div>
          <div className="flex items-center gap-5">
            <div className="progress-ring" style={{ '--pct': pct }}>
              <div className="progress-ring-inner">
                <span className="text-2xl font-bold">{pct}%</span>
                <span className="text-xs text-gray-500">done</span>
              </div>
            </div>
            <div className="text-sm">
              <p><strong className="text-emerald-500">{globalSolved}</strong> solved</p>
              <p><strong>{Math.max(0, apiProblems.length - globalSolved)}</strong> remaining</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex overflow-x-auto gap-2 hide-scrollbar">
        <button type="button" onClick={() => setActiveSheet('all')} className={`sheet-tab ${activeSheet === 'all' ? 'sheet-tab-active' : ''}`}>
          All <span className="sheet-tab-count">{sheetCounts.all}</span>
        </button>
        {sheets.map((s) => (
          <button key={s.id} type="button" title={s.desc} onClick={() => setActiveSheet(s.id)} className={`sheet-tab ${activeSheet === s.id ? 'sheet-tab-active' : ''}`}>
            {s.name} <span className="sheet-tab-count">{sheetCounts[s.id]}</span>
          </button>
        ))}
      </div>

      {sheetMeta && (
        <div className="section-subheading-bar">
          <h2>{sheetMeta.name}</h2>
          <p>{sheetMeta.desc}</p>
        </div>
      )}

      <div className="flex flex-col xl:flex-row gap-6">
        <div className="flex-1 space-y-4">
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input className="input-field pl-10 h-11" placeholder="Search problems..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <button type="button" onClick={() => setBookmarkedOnly(!bookmarkedOnly)} className={`filter-chip ${bookmarkedOnly ? 'filter-chip-active' : ''}`}>
              <Bookmark className={`w-4 h-4 ${bookmarkedOnly ? 'fill-current' : ''}`} /> Saved
            </button>
            <div className="flex rounded-xl border border-light-border dark:border-dark-border overflow-hidden">
              <button type="button" onClick={() => setViewMode('table')} className={`p-2.5 ${viewMode === 'table' ? 'bg-primary text-white' : 'bg-white dark:bg-dark-surface'}`}><List className="w-4 h-4" /></button>
              <button type="button" onClick={() => setViewMode('grid')} className={`p-2.5 ${viewMode === 'grid' ? 'bg-primary text-white' : 'bg-white dark:bg-dark-surface'}`}><LayoutGrid className="w-4 h-4" /></button>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            <Filter className="w-4 h-4 text-gray-400" />
            <select className="filter-select" value={topicFilter} onChange={(e) => setTopicFilter(e.target.value)}>
              <option value="all">All Topics</option>
              {topics.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            <select className="filter-select" value={difficultyFilter} onChange={(e) => setDifficultyFilter(e.target.value)}>
              <option value="all">All Levels</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
            <select className="filter-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="all">All Status</option>
              <option value="unsolved">Unsolved</option>
              <option value="attempted">Attempted</option>
              <option value="solved">Solved</option>
            </select>
          </div>
        </div>
        <div className="stats-strip">
          {[['Showing', stats.total, ''], ['Solved', stats.solved, 'text-emerald-500'], ['Tried', stats.attempted, 'text-amber-500'], ['Left', stats.remaining, 'text-sky-500']].map(([label, val, color]) => (
            <div key={label} className="stats-strip-item">
              <div className={`text-2xl font-bold ${color}`}>{val}</div>
              <div className="text-xs text-gray-500 uppercase">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid md:grid-cols-3 gap-4">{[1, 2, 3, 4, 5, 6].map((i) => <div key={i} className="h-36 rounded-xl skeleton" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-gray-500 mb-4">No problems found.</p>
          <button type="button" className="btn-primary" onClick={() => { setSearch(''); setTopicFilter('all'); setDifficultyFilter('all'); setStatusFilter('all'); setBookmarkedOnly(false); }}>Clear filters</button>
        </div>
      ) : sectionMode && viewMode === 'table' ? (
        <div className="space-y-4">
          {grouped.map(([title, items]) => {
            const isCollapsed = collapsed[title];
            const solved = items.filter((p) => progress[p.id]?.status === 'solved').length;
            const width = items.length ? Math.round((solved / items.length) * 100) : 0;
            return (
              <div key={title} className="card overflow-hidden">
                <button type="button" className="section-header-btn w-full" onClick={() => setCollapsed((c) => ({ ...c, [title]: !c[title] }))}>
                  <div className="text-left">
                    <h3 className="section-title">{title}</h3>
                    <p className="section-subtitle">{solved}/{items.length} solved</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="section-progress-mini"><div style={{ width: `${width}%` }} /></div>
                    {isCollapsed ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
                  </div>
                </button>
                {!isCollapsed && (
                  <div className="overflow-x-auto border-t border-light-border dark:border-dark-border">
                    <table className="w-full">{tableHead}<tbody className="divide-y divide-light-border dark:divide-dark-border">{items.map((p) => renderRow(p))}</tbody></table>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {pageItems.map((p) => {
            const prog = progress[p.id];
            return (
              <div key={p.id} className="problem-card">
                <p className="text-xs text-primary font-medium mb-2">{p.section}</p>
                <a href={p.link} target="_blank" rel="noreferrer" className="font-semibold line-clamp-2 hover:text-primary">{p.title}</a>
                <div className="flex gap-2 mt-3">
                  <span className="topic-pill">{p.topic}</span>
                  <DifficultyBadge diff={p.difficulty} />
                </div>
                <Link to={`/editor/${p.id}`} className="btn-code w-full justify-center mt-4"><Code2 className="w-4 h-4" /> Solve</Link>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">{tableHead}<tbody className="divide-y divide-light-border dark:divide-dark-border">{pageItems.map((p) => renderRow(p))}</tbody></table>
          </div>
        </div>
      )}

      {!loading && (!sectionMode || viewMode === 'grid') && totalPages > 1 && (
        <Pagination page={page} totalPages={totalPages} total={filtered.length} onPage={setPage} />
      )}
    </div>
  );
}
