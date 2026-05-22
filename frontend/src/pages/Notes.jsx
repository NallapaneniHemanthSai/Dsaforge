import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { 
  Download, Save, CheckCircle2, FileText, Bold, Italic, 
  Heading1, Heading2, Code, List, Link as LinkIcon, CheckSquare, Eye, Edit3, Columns 
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
import useDebounce from '../hooks/useDebounce';
import api from '../api';
import GlassCard from '../components/ui/GlassCard';
import { useAuth } from '../context/AuthContext';
import { isDemoStudent } from '../utils/demoMode';

export default function Notes() {
  const { user } = useAuth();
  const readOnlyPreview = isDemoStudent(user);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState('saved'); // 'saved', 'saving', 'error'
  const [lastSavedTime, setLastSavedTime] = useState(null);
  const [viewMode, setViewMode] = useState('split'); // 'edit', 'preview', 'split'

  const debouncedContent = useDebounce(content, 800);

  // Initial fetch
  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const { data } = await api.get('/notes');
        setContent(data.content || '');
        if (data.updatedAt) setLastSavedTime(new Date(data.updatedAt));
      } catch (error) {
        toast.error('Failed to load notes');
      } finally {
        setLoading(false);
      }
    };
    fetchNotes();
  }, []);

  // Auto-save logic
  useEffect(() => {
    if (loading || readOnlyPreview) return; // Don't trigger save on initial load or demo preview

    const saveNotes = async () => {
      setSaveStatus('saving');
      try {
        const { data } = await api.put('/notes', { content: debouncedContent });
        setLastSavedTime(new Date(data.updatedAt));
        setSaveStatus('saved');
      } catch (error) {
        setSaveStatus('error');
        toast.error('Failed to auto-save notes');
      }
    };

    if (debouncedContent !== undefined) {
      saveNotes();
    }
  }, [debouncedContent, loading, readOnlyPreview]);

  const insertMarkdown = (syntax, placeholder = '') => {
    if (readOnlyPreview) {
      toast('Student Demo is read-only. Notes editing is disabled for previews.');
      return;
    }
    const textarea = document.getElementById('notes-textarea');
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selected = text.substring(start, end);

    let replacement = '';
    if (syntax === 'link') {
      replacement = `[${selected || 'Link Text'}](https://example.com)`;
    } else if (syntax === 'code-block') {
      replacement = `\n\`\`\`javascript\n${selected || '// code here'}\n\`\`\`\n`;
    } else {
      replacement = `${syntax}${selected || placeholder}${syntax}`;
    }

    const nextContent = text.substring(0, start) + replacement + text.substring(end);
    setContent(nextContent);
    setSaveStatus('saving');

    // Refocus & set selection range
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + replacement.length, start + replacement.length);
    }, 50);
  };

  const handleExport = () => {
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `DSAForge_Notes_${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Notes exported as Markdown (.md)');
  };

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const charCount = content.length;

  if (loading) {
    return (
      <div className="h-[calc(100vh-120px)] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col space-y-4 animate-fade-in max-w-7xl mx-auto p-1">
      
      {/* Header bar */}
      <GlassCard hover={false} className="p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/10 text-primary rounded-xl">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-extrabold text-lg text-gray-900 dark:text-white">Workspace Notes</h2>
            <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
              {readOnlyPreview && <span className="font-semibold text-primary">Read-only preview</span>}
              {!readOnlyPreview && saveStatus === 'saving' && <span className="flex items-center gap-1"><Save className="w-3.5 h-3.5 animate-spin" /> Saving...</span>}
              {!readOnlyPreview && saveStatus === 'saved' && <span className="flex items-center gap-1 text-green-500 font-medium"><CheckCircle2 className="w-3.5 h-3.5" /> Saved</span>}
              {!readOnlyPreview && saveStatus === 'error' && <span className="text-red-500 font-semibold">Save failed</span>}
              {lastSavedTime && <span>• Auto-saved: {lastSavedTime.toLocaleTimeString()}</span>}
            </div>
          </div>
        </div>
        
        {/* Toggle Mode & Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex bg-gray-100 dark:bg-gray-850 p-1 rounded-xl">
            <button 
              onClick={() => setViewMode('edit')}
              className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${viewMode === 'edit' ? 'bg-white dark:bg-dark-surface shadow-sm text-primary' : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-300'}`}
              title="Edit View"
            >
              <Edit3 className="w-4 h-4" /> <span className="hidden sm:inline">Write</span>
            </button>
            <button 
              onClick={() => setViewMode('preview')}
              className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${viewMode === 'preview' ? 'bg-white dark:bg-dark-surface shadow-sm text-primary' : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-300'}`}
              title="Preview View"
            >
              <Eye className="w-4 h-4" /> <span className="hidden sm:inline">Preview</span>
            </button>
            <button 
              onClick={() => setViewMode('split')}
              className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${viewMode === 'split' ? 'bg-white dark:bg-dark-surface shadow-sm text-primary' : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-300'}`}
              title="Split View"
            >
              <Columns className="w-4 h-4" /> <span className="hidden sm:inline">Split</span>
            </button>
          </div>

          <button onClick={handleExport} className="btn-secondary flex items-center gap-2 text-xs font-semibold px-4 py-2">
            <Download className="w-4 h-4" /> Export Markdown
          </button>
        </div>
      </GlassCard>

      {/* Editor & Previewer shell */}
      <div className="flex-1 flex flex-col bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-850 rounded-2xl overflow-hidden shadow-lg">
        
        {/* Helper Formatting Toolbelt (only when editor is visible) */}
        {viewMode !== 'preview' && (
          <div className="flex items-center gap-1.5 p-2 bg-gray-50 dark:bg-dark-surface/50 border-b border-gray-200 dark:border-gray-850 overflow-x-auto">
            <button onClick={() => insertMarkdown('**', 'bold text')} className="p-2 hover:bg-gray-150 dark:hover:bg-gray-800 rounded-lg text-gray-500 hover:text-gray-900" title="Bold"><Bold className="w-4 h-4" /></button>
            <button onClick={() => insertMarkdown('*', 'italic text')} className="p-2 hover:bg-gray-150 dark:hover:bg-gray-800 rounded-lg text-gray-500 hover:text-gray-900" title="Italic"><Italic className="w-4 h-4" /></button>
            <button onClick={() => insertMarkdown('# ', 'Heading 1')} className="p-2 hover:bg-gray-150 dark:hover:bg-gray-800 rounded-lg text-gray-500 hover:text-gray-900" title="Header 1"><Heading1 className="w-4 h-4" /></button>
            <button onClick={() => insertMarkdown('## ', 'Heading 2')} className="p-2 hover:bg-gray-150 dark:hover:bg-gray-800 rounded-lg text-gray-500 hover:text-gray-900" title="Header 2"><Heading2 className="w-4 h-4" /></button>
            <button onClick={() => insertMarkdown('`', 'inline code')} className="p-2 hover:bg-gray-150 dark:hover:bg-gray-800 rounded-lg text-gray-500 hover:text-gray-900" title="Code"><Code className="w-4 h-4" /></button>
            <button onClick={() => insertMarkdown('code-block')} className="p-2 hover:bg-gray-150 dark:hover:bg-gray-800 rounded-lg text-gray-500 hover:text-gray-900" title="Code Block"><Columns className="w-4 h-4" /></button>
            <button onClick={() => insertMarkdown('- ', 'list item')} className="p-2 hover:bg-gray-150 dark:hover:bg-gray-800 rounded-lg text-gray-500 hover:text-gray-900" title="Bullet List"><List className="w-4 h-4" /></button>
            <button onClick={() => insertMarkdown('- [ ] ', 'task item')} className="p-2 hover:bg-gray-150 dark:hover:bg-gray-800 rounded-lg text-gray-500 hover:text-gray-900" title="Task List"><CheckSquare className="w-4 h-4" /></button>
            <button onClick={() => insertMarkdown('link')} className="p-2 hover:bg-gray-150 dark:hover:bg-gray-800 rounded-lg text-gray-500 hover:text-gray-900" title="Insert Link"><LinkIcon className="w-4 h-4" /></button>
          </div>
        )}

        {/* Content Pane */}
        <div className="flex-1 flex overflow-hidden">
          {/* Write Editor Pane */}
          {viewMode !== 'preview' && (
            <div className={`flex-1 flex flex-col ${viewMode === 'split' ? 'border-r border-gray-200 dark:border-gray-850' : ''}`}>
              <textarea
                id="notes-textarea"
                value={content}
                onChange={(e) => {
                  if (readOnlyPreview) return;
                  setContent(e.target.value);
                  if (saveStatus === 'saved') setSaveStatus('saving');
                }}
                readOnly={readOnlyPreview}
                placeholder="Start writing algorithm summaries, notes, or placement checklist items using markdown syntax..."
                className={`flex-1 w-full p-6 bg-transparent outline-none resize-none text-base leading-relaxed text-gray-800 dark:text-gray-200 font-mono ${readOnlyPreview ? 'cursor-default' : ''}`}
                spellCheck="false"
              />
            </div>
          )}

          {/* Render Previewer Pane */}
          {viewMode !== 'edit' && (
            <div className="flex-1 p-6 overflow-y-auto bg-gray-50/50 dark:bg-[#0D0F14]/50 prose prose-slate dark:prose-invert max-w-none">
              {content.trim() ? (
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    code({ node, inline, className, children, ...props }) {
                      const match = /language-(\w+)/.exec(className || '');
                      return !inline && match ? (
                        <div className="rounded-xl overflow-hidden shadow-sm my-4 border border-gray-250 dark:border-gray-850">
                          <SyntaxHighlighter
                            style={tomorrow}
                            language={match[1]}
                            PreTag="div"
                            {...props}
                          >
                            {String(children).replace(/\n$/, '')}
                          </SyntaxHighlighter>
                        </div>
                      ) : (
                        <code className={`${className} bg-gray-200 dark:bg-gray-800/80 px-1.5 py-0.5 rounded text-sm text-primary`} {...props}>
                          {children}
                        </code>
                      );
                    }
                  }}
                >
                  {content}
                </ReactMarkdown>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 text-sm">
                  <Eye className="w-12 h-12 mb-2 opacity-20" />
                  <p>Markdown preview outputs will render here dynamically.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Word / Char Counters */}
      <div className="flex justify-between items-center text-[10px] text-gray-400 px-2">
        <span>DSAForge Professional Notebook</span>
        <div className="flex gap-4">
          <span>{wordCount} words</span>
          <span>{charCount} characters</span>
        </div>
      </div>

    </div>
  );
}
