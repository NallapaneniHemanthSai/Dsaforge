import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Terminal, Plus, Trash2, Edit2, Code2, Clock } from 'lucide-react';
import api from '../api';
import GlassCard from '../components/ui/GlassCard';
import { useAuth } from '../context/AuthContext';
import { isDemoStudent } from '../utils/demoMode';

export default function Playground() {
  const { user } = useAuth();
  const readOnlyPreview = isDemoStudent(user);
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchPrograms = async () => {
    try {
      const { data } = await api.get('/programs');
      setPrograms(data.data);
    } catch (error) {
      toast.error('Failed to load programs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrograms();
  }, []);


  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (readOnlyPreview) {
      toast('Student Demo is read-only. Program deletion is disabled for previews.');
      return;
    }
    if (window.confirm('Are you sure you want to delete this program?')) {
      try {
        await api.delete(`/programs/${id}`);
        setPrograms(programs.filter(p => p._id !== id));
        toast.success('Program deleted');
      } catch (error) {
        toast.error('Failed to delete program');
      }
    }
  };

  const getLanguageIcon = (lang) => {
    switch (lang) {
      case 'java': return <span className="font-bold text-red-500">Java</span>;
      case 'python': return <span className="font-bold text-blue-500">Python</span>;
      case 'cpp': return <span className="font-bold text-blue-700">C++</span>;
      default: return <Code2 className="w-5 h-5" />;
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Terminal className="w-8 h-8 text-primary" />
            Playground
          </h1>
          <p className="text-gray-500 text-sm mt-1">Write, execute, and store your coding snippets.</p>
        </div>
        <button 
          onClick={() => readOnlyPreview ? toast('Student Demo is read-only. New programs are disabled for previews.') : navigate('/playground/new')}
          disabled={readOnlyPreview}
          className="btn-primary flex items-center gap-2"
          title={readOnlyPreview ? 'Read-only demo preview' : 'Create new program'}
        >
          <Plus className="w-5 h-5" />
          New Program
        </button>
      </div>

      {programs.length === 0 ? (
        <GlassCard className="p-12 flex flex-col items-center justify-center text-center">
          <Terminal className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No programs yet</h3>
          <p className="text-gray-500 max-w-sm mb-6">You haven't saved any code snippets yet. Create your first program to get started.</p>
          <button 
            onClick={() => readOnlyPreview ? toast('Student Demo is read-only. New programs are disabled for previews.') : navigate('/playground/new')}
            disabled={readOnlyPreview}
            className="btn-primary"
          >
            Create First Program
          </button>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {programs.map((program) => (
            <GlassCard 
              key={program._id} 
              className="p-5 flex flex-col cursor-pointer hover:border-primary/50 transition-colors group"
              onClick={() => navigate(`/playground/${program._id}`)}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                    {getLanguageIcon(program.language)}
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-1">{program.title}</h3>
                </div>
                <button 
                  onClick={(e) => handleDelete(program._id, e)}
                  disabled={readOnlyPreview}
                  className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1 disabled:cursor-not-allowed disabled:opacity-40"
                  title={readOnlyPreview ? 'Read-only demo preview' : 'Delete program'}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              
              <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {new Date(program.updatedAt).toLocaleDateString()}
                </span>
                <span className="flex items-center gap-1 text-primary">
                  <Edit2 className="w-3.5 h-3.5" />
                  Open
                </span>
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
}
