import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Download, Save, CheckCircle2, FileText } from 'lucide-react';
import useDebounce from '../hooks/useDebounce';
import api from '../api';

export default function Notes() {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState('saved'); // 'saved', 'saving', 'error'
  const [lastSavedTime, setLastSavedTime] = useState(null);

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
    if (loading) return; // Don't trigger save on initial load

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
  }, [debouncedContent, loading]);

  const handleExport = () => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `DSAForge_Notes_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Notes exported successfully');
  };

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const charCount = content.length;

  if (loading) {
    return (
      <div className="h-[calc(100vh-120px)] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-accent-light border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col space-y-4 animate-fade-in">
      
      <div className="flex justify-between items-center bg-white dark:bg-dark-surface p-4 rounded-xl border border-light-border dark:border-dark-border shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-accent-light/10 text-accent-light rounded-lg">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-semibold text-lg">Global Notes</h2>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              {saveStatus === 'saving' && <span className="flex items-center gap-1"><Save className="w-3 h-3" /> Saving...</span>}
              {saveStatus === 'saved' && <span className="flex items-center gap-1 text-green-500"><CheckCircle2 className="w-3 h-3" /> Saved</span>}
              {saveStatus === 'error' && <span className="text-red-500">Failed to save</span>}
              {lastSavedTime && <span>• Last saved: {lastSavedTime.toLocaleTimeString()}</span>}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex text-sm text-gray-500 gap-4 mr-4">
            <span>{wordCount} words</span>
            <span>{charCount} characters</span>
          </div>
          <button onClick={handleExport} className="btn-secondary flex items-center gap-2 text-sm px-4 py-2">
            <Download className="w-4 h-4" /> Export .txt
          </button>
        </div>
      </div>

      <div className="flex-1 bg-white dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-xl overflow-hidden shadow-sm flex flex-col">
        <textarea
          value={content}
          onChange={(e) => {
            setContent(e.target.value);
            if (saveStatus === 'saved') setSaveStatus('saving'); // immediate visual feedback
          }}
          placeholder="Start typing your algorithms notes, cheat sheets, or reflections here... Auto-saves automatically."
          className="flex-1 w-full p-6 bg-transparent outline-none resize-none text-base leading-relaxed text-gray-800 dark:text-gray-200"
          spellCheck="false"
        />
      </div>

    </div>
  );
}
