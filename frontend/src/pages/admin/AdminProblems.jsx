import { useEffect, useMemo, useState } from 'react';
import {
  Ban, CheckCircle, Code2, Database, Edit, Eye, FileJson, Filter,
  Plus, RefreshCw, Save, Search, Trash2, X,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../api';
import EmptyState from '../../components/ui/EmptyState';
import Skeleton from '../../components/ui/Skeleton';
import { useAuth } from '../../context/AuthContext';
import { isDemoAdmin } from '../../utils/demoMode';

const emptyForm = {
  title: '',
  id: '',
  sheet: 'custom',
  section: 'General',
  topic: '',
  difficulty: 'Easy',
  externalLink: '',
  description: '',
  constraintsText: '',
  examplesText: '[]',
  testCasesText: '[]',
  hiddenTestCasesText: '[]',
  isActive: true,
};

const parseJsonList = (value, label) => {
  try {
    const parsed = JSON.parse(value || '[]');
    if (!Array.isArray(parsed)) throw new Error();
    return parsed;
  } catch {
    throw new Error(`${label} must be a valid JSON array`);
  }
};

const problemToForm = (problem) => ({
  title: problem.title || '',
  id: problem.id || '',
  sheet: problem.sheet || 'custom',
  section: problem.section || 'General',
  topic: problem.topic || '',
  difficulty: problem.difficulty || 'Easy',
  externalLink: problem.externalLink || '',
  description: problem.description || '',
  constraintsText: (problem.constraints || []).join('\n'),
  examplesText: JSON.stringify(problem.examples || [], null, 2),
  testCasesText: JSON.stringify(problem.testCases || [], null, 2),
  hiddenTestCasesText: JSON.stringify(problem.hiddenTestCases || [], null, 2),
  isActive: problem.isActive !== false,
});

function ProblemModal({ problem, onClose, onSaved, readOnlyPreview = false }) {
  const [form, setForm] = useState(problem ? problemToForm(problem) : emptyForm);
  const [saving, setSaving] = useState(false);

  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const save = async () => {
    if (readOnlyPreview) {
      toast('Admin Demo is read-only. Problem changes are disabled for recruiter previews.');
      return;
    }
    if (!form.title.trim() || !form.id.trim() || !form.topic.trim() || !form.description.trim()) {
      toast.error('Title, ID, topic, and description are required');
      return;
    }

    try {
      setSaving(true);
      const payload = {
        title: form.title.trim(),
        id: form.id.trim(),
        sheet: form.sheet.trim(),
        section: form.section.trim() || 'General',
        topic: form.topic.trim(),
        difficulty: form.difficulty,
        externalLink: form.externalLink.trim(),
        description: form.description.trim(),
        constraints: form.constraintsText.split('\n').map((line) => line.trim()).filter(Boolean),
        examples: parseJsonList(form.examplesText, 'Examples'),
        testCases: parseJsonList(form.testCasesText, 'Visible test cases'),
        hiddenTestCases: parseJsonList(form.hiddenTestCasesText, 'Hidden test cases'),
        isActive: form.isActive,
      };

      if (problem?._id) {
        await api.patch(`/admin/problems/${problem._id}`, payload);
        toast.success('Problem updated');
      } else {
        await api.post('/admin/problems', payload);
        toast.success('Problem created');
      }
      onSaved();
    } catch (err) {
      toast.error(err.message || err.response?.data?.message || 'Failed to save problem');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="mx-auto max-w-5xl rounded-2xl border border-light-border dark:border-dark-border bg-white dark:bg-dark-surface shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-light-border dark:border-dark-border bg-white/95 dark:bg-dark-surface/95 px-5 py-4 backdrop-blur">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">{problem ? 'Edit Problem' : 'Create Problem'}</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">Manage metadata, examples, and Judge0 test cases.</p>
          </div>
          <button type="button" onClick={onClose} className="pagination-btn" aria-label="Close problem editor">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid gap-5 p-5 lg:grid-cols-2">
          <section className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Basic Info</h3>
            <input className="input-field" placeholder="Problem title" value={form.title} onChange={(e) => update('title', e.target.value)} readOnly={readOnlyPreview} />
            <input className="input-field font-mono text-sm" placeholder="stable-id-like-two-sum" value={form.id} onChange={(e) => update('id', e.target.value)} disabled={Boolean(problem) || readOnlyPreview} />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <input className="input-field" placeholder="Sheet" value={form.sheet} onChange={(e) => update('sheet', e.target.value)} readOnly={readOnlyPreview} />
              <input className="input-field" placeholder="Section" value={form.section} onChange={(e) => update('section', e.target.value)} readOnly={readOnlyPreview} />
              <input className="input-field" placeholder="Topic" value={form.topic} onChange={(e) => update('topic', e.target.value)} readOnly={readOnlyPreview} />
              <select className="input-field" value={form.difficulty} onChange={(e) => update('difficulty', e.target.value)} disabled={readOnlyPreview}>
                <option>Easy</option>
                <option>Medium</option>
                <option>Hard</option>
              </select>
            </div>
            <input className="input-field" placeholder="External problem link" value={form.externalLink} onChange={(e) => update('externalLink', e.target.value)} readOnly={readOnlyPreview} />
            <label className="flex items-center gap-3 text-sm font-semibold text-gray-700 dark:text-gray-200">
              <input type="checkbox" checked={form.isActive} onChange={(e) => update('isActive', e.target.checked)} disabled={readOnlyPreview} />
              Active and visible to students
            </label>
          </section>

          <section className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Statement</h3>
            <textarea className="input-field min-h-40" placeholder="Problem description" value={form.description} onChange={(e) => update('description', e.target.value)} readOnly={readOnlyPreview} />
            <textarea className="input-field min-h-28" placeholder="Constraints, one per line" value={form.constraintsText} onChange={(e) => update('constraintsText', e.target.value)} readOnly={readOnlyPreview} />
          </section>

          <section className="space-y-4 lg:col-span-2">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Examples And Tests</h3>
            <div className="grid gap-4 lg:grid-cols-3">
              <label className="block">
                <span className="mb-2 block text-xs font-semibold text-gray-500 dark:text-gray-400">Examples JSON</span>
                <textarea className="input-field min-h-56 font-mono text-xs" value={form.examplesText} onChange={(e) => update('examplesText', e.target.value)} readOnly={readOnlyPreview} />
              </label>
              <label className="block">
                <span className="mb-2 block text-xs font-semibold text-gray-500 dark:text-gray-400">Visible Test Cases JSON</span>
                <textarea className="input-field min-h-56 font-mono text-xs" value={form.testCasesText} onChange={(e) => update('testCasesText', e.target.value)} readOnly={readOnlyPreview} />
              </label>
              <label className="block">
                <span className="mb-2 block text-xs font-semibold text-amber-600 dark:text-amber-300">Hidden Test Cases JSON</span>
                <textarea className="input-field min-h-56 font-mono text-xs" value={form.hiddenTestCasesText} onChange={(e) => update('hiddenTestCasesText', e.target.value)} readOnly={readOnlyPreview} />
              </label>
            </div>
          </section>
        </div>

        <div className="sticky bottom-0 flex justify-end gap-3 border-t border-light-border dark:border-dark-border bg-white/95 dark:bg-dark-surface/95 px-5 py-4 backdrop-blur">
          <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
          <button type="button" onClick={save} disabled={saving || readOnlyPreview} className="btn-primary inline-flex items-center gap-2" title={readOnlyPreview ? 'Read-only admin preview' : 'Save problem'}>
            <Save className="h-4 w-4" />
            {readOnlyPreview ? 'Preview Only' : saving ? 'Saving...' : 'Save Problem'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminProblems() {
  const { user } = useAuth();
  const readOnlyPreview = isDemoAdmin(user);
  const [problems, setProblems] = useState([]);
  const [search, setSearch] = useState('');
  const [difficulty, setDifficulty] = useState('all');
  const [status, setStatus] = useState('all');
  const [loading, setLoading] = useState(true);
  const [activeProblem, setActiveProblem] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [importText, setImportText] = useState('');
  const [actionLoading, setActionLoading] = useState(null);

  const fetchProblems = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/admin/problems');
      setProblems(data.data || []);
    } catch (err) {
      toast.error('Failed to load problems');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProblems();
  }, []);

  const filteredProblems = useMemo(() => {
    const q = search.trim().toLowerCase();
    return problems.filter((problem) => {
      const matchesSearch = !q || [problem.title, problem.id, problem.sheet, problem.topic]
        .some((value) => String(value || '').toLowerCase().includes(q));
      const matchesDifficulty = difficulty === 'all' || problem.difficulty === difficulty;
      const matchesStatus = status === 'all' || (status === 'active' ? problem.isActive !== false : problem.isActive === false);
      return matchesSearch && matchesDifficulty && matchesStatus;
    });
  }, [problems, search, difficulty, status]);

  const toggleStatus = async (problem) => {
    if (readOnlyPreview) {
      toast('Admin Demo is read-only. Problem status changes are disabled for recruiter previews.');
      return;
    }
    try {
      setActionLoading(problem._id);
      if (problem.isActive === false) {
        await api.patch(`/admin/problems/${problem._id}`, { isActive: true });
        toast.success('Problem activated');
      } else {
        await api.delete(`/admin/problems/${problem._id}`);
        toast.success('Problem deactivated');
      }
      fetchProblems();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    } finally {
      setActionLoading(null);
    }
  };

  const importProblems = async () => {
    if (readOnlyPreview) {
      toast('Admin Demo is read-only. Problem imports are disabled for recruiter previews.');
      return;
    }
    try {
      const parsed = JSON.parse(importText || '[]');
      const problemsPayload = Array.isArray(parsed) ? parsed : parsed.problems;
      if (!Array.isArray(problemsPayload)) throw new Error('Import must be an array or { "problems": [] }');
      await api.post('/admin/problems/import', { problems: problemsPayload });
      toast.success('Import completed');
      setImportOpen(false);
      setImportText('');
      fetchProblems();
    } catch (err) {
      toast.error(err.message || err.response?.data?.message || 'Import failed');
    }
  };

  const openEditor = (problem = null) => {
    setActiveProblem(problem);
    setModalOpen(true);
  };

  const closeEditor = () => {
    setModalOpen(false);
    setActiveProblem(null);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col gap-4 border-b border-light-border pb-5 dark:border-dark-border lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-primary">Admin Suite</p>
          <h1 className="mt-1 flex items-center gap-2 text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            <Database className="h-8 w-8 text-primary" /> Problem Management
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Create, edit, import, and deactivate problem records with visible and hidden test cases.
          </p>
          {readOnlyPreview && (
            <p className="mt-2 inline-flex rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              Recruiter preview: admin controls are visible but disabled.
            </p>
          )}
        </div>
        <div className="flex flex-wrap gap-3">
          <button onClick={fetchProblems} className="btn-secondary inline-flex items-center gap-2">
            <RefreshCw className="h-4 w-4" /> Refresh
          </button>
          <button onClick={() => readOnlyPreview ? toast('Admin Demo is read-only. Import is disabled for recruiter previews.') : setImportOpen(true)} disabled={readOnlyPreview} className="btn-secondary inline-flex items-center gap-2" title={readOnlyPreview ? 'Read-only admin preview' : 'Import JSON'}>
            <FileJson className="h-4 w-4" /> Import JSON
          </button>
          <button onClick={() => readOnlyPreview ? toast('Admin Demo is read-only. New problem creation is disabled for recruiter previews.') : openEditor()} disabled={readOnlyPreview} className="btn-primary inline-flex items-center gap-2" title={readOnlyPreview ? 'Read-only admin preview' : 'New Problem'}>
            <Plus className="h-4 w-4" /> New Problem
          </button>
        </div>
      </div>

      <div className="card p-4">
        <div className="grid gap-3 lg:grid-cols-[1fr_180px_180px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input className="input-field pl-10" placeholder="Search title, ID, sheet, or topic" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <select className="input-field" value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
            <option value="all">All difficulties</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
          <select className="input-field" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="all">All statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}</div>
      ) : filteredProblems.length === 0 ? (
        <EmptyState icon={Code2} title="No problems found" description="Create a problem or adjust the filters." />
      ) : (
        <div className="admin-table-shell">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Problem</th>
                <th>Sheet / Topic</th>
                <th>Tests</th>
                <th>Difficulty</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProblems.map((problem) => (
                <tr key={problem._id}>
                  <td>
                    <div className="font-semibold text-gray-900 dark:text-white">{problem.title}</div>
                    <div className="mt-1 font-mono text-xs text-gray-500 dark:text-gray-400">{problem.id}</div>
                  </td>
                  <td>
                    <div className="font-medium text-gray-800 dark:text-gray-200">{problem.sheet}</div>
                    <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">{problem.topic}</div>
                  </td>
                  <td>
                    <div className="flex flex-wrap gap-2">
                      <span className="status-badge status-badge-blue">{problem.testCases?.length || 0} visible</span>
                      <span className="status-badge status-badge-amber">{problem.hiddenTestCases?.length || 0} hidden</span>
                    </div>
                  </td>
                  <td>
                    <span className={problem.difficulty === 'Easy' ? 'badge-easy' : problem.difficulty === 'Medium' ? 'badge-medium' : 'badge-hard'}>
                      {problem.difficulty}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${problem.isActive === false ? 'status-badge-red' : 'status-badge-green'}`}>
                      {problem.isActive === false ? <Ban className="h-3 w-3" /> : <CheckCircle className="h-3 w-3" />}
                      {problem.isActive === false ? 'Inactive' : 'Active'}
                    </span>
                  </td>
                  <td>
                    <div className="flex justify-end gap-2">
                      <a href={problem.externalLink || '#'} target="_blank" rel="noreferrer" className="pagination-btn" aria-label="Preview problem">
                        <Eye className="h-4 w-4" />
                      </a>
                      <button onClick={() => openEditor(problem)} className="pagination-btn" aria-label="Edit problem">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button onClick={() => toggleStatus(problem)} disabled={actionLoading === problem._id || readOnlyPreview} className="pagination-btn" aria-label="Toggle problem status" title={readOnlyPreview ? 'Read-only admin preview' : 'Toggle problem status'}>
                        {problem.isActive === false ? <CheckCircle className="h-4 w-4" /> : <Trash2 className="h-4 w-4" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modalOpen && (
        <ProblemModal
          problem={activeProblem}
          onClose={closeEditor}
          readOnlyPreview={readOnlyPreview}
          onSaved={() => {
            closeEditor();
            fetchProblems();
          }}
        />
      )}

      {importOpen && (
        <div className="fixed inset-0 z-[80] bg-black/60 p-4 backdrop-blur-sm">
          <div className="mx-auto mt-10 max-w-3xl rounded-2xl border border-light-border bg-white p-5 shadow-2xl dark:border-dark-border dark:bg-dark-surface">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Import Problems</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">Paste an array of problem objects or an object with a problems array.</p>
              </div>
              <button onClick={() => setImportOpen(false)} className="pagination-btn" aria-label="Close import">
                <X className="h-5 w-5" />
              </button>
            </div>
            <textarea className="input-field min-h-96 font-mono text-xs" value={importText} onChange={(e) => setImportText(e.target.value)} placeholder='[{"title":"Two Sum","id":"two-sum",...}]' />
            <div className="mt-4 flex justify-end gap-3">
              <button onClick={() => setImportOpen(false)} className="btn-secondary">Cancel</button>
              <button onClick={importProblems} className="btn-primary inline-flex items-center gap-2">
                <Filter className="h-4 w-4" /> Import
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
