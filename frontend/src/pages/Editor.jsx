import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { toast } from 'react-hot-toast';
import { 
  Play, Save, RotateCcw, Copy, ChevronLeft, Terminal, 
  AlertCircle, Clock, Cpu, CheckCircle2, Globe, Send, History
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import api from '../api';

const LANGUAGES = {
  java: {
    id: 'java',
    name: 'Java (OpenJDK 13.0.1)',
    monaco: 'java',
    starter: `class Solution {\n    public static void main(String[] args) {\n        System.out.println("Hello from DSAForge!");\n        // Write your logic here\n    }\n}`
  },
  python: {
    id: 'python',
    name: 'Python (3.8.1)',
    monaco: 'python',
    starter: `def solve():\n    print("Hello from DSAForge!")\n    # Write your logic here\n\nif __name__ == "__main__":\n    solve()`
  },
  cpp: {
    id: 'cpp',
    name: 'C++ (GCC 9.2.0)',
    monaco: 'cpp',
    starter: `#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello from DSAForge!" << endl;\n    // Write your logic here\n    return 0;\n}`
  }
};

export default function CodeEditor() {
  const { problemId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { activeTheme } = useTheme();
  
  const editorRef = useRef(null);
  
  const [problem, setProblem] = useState(null);
  const [selectedLang, setSelectedLang] = useState('java');
  const [codes, setCodes] = useState({
    java: LANGUAGES.java.starter,
    python: LANGUAGES.python.starter,
    cpp: LANGUAGES.cpp.starter
  });
  
  const [output, setOutput] = useState(null);
  const [testResults, setTestResults] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('output'); // output, results, history, info
  const [initialLoad, setInitialLoad] = useState(true);
  const [history, setHistory] = useState([]);

  // Sync editor value with current codes state when language changes
  const currentCode = codes[selectedLang];

  useEffect(() => {
    const fetchData = async () => {
      if (problemId === 'demo') {
        setInitialLoad(false);
        return;
      }
      try {
        // Fetch problem
        const probRes = await api.get(`/problems/${problemId}`);
        setProblem(probRes.data.data);

        // Fetch stored code
        const { data } = await api.get('/progress');
        const prog = data.progress.find(p => p.problemId === problemId);
        
        if (prog && prog.code) {
          try {
            const parsed = JSON.parse(prog.code);
            setCodes({
              java: parsed.java || probRes.data.data.starterCode?.java || LANGUAGES.java.starter,
              python: parsed.python || probRes.data.data.starterCode?.python || LANGUAGES.python.starter,
              cpp: parsed.cpp || probRes.data.data.starterCode?.cpp || LANGUAGES.cpp.starter
            });
          } catch (e) {
            setCodes(prev => ({
              ...prev,
              java: prog.code
            }));
          }
        } else {
          setCodes({
            java: probRes.data.data.starterCode?.java || LANGUAGES.java.starter,
            python: probRes.data.data.starterCode?.python || LANGUAGES.python.starter,
            cpp: probRes.data.data.starterCode?.cpp || LANGUAGES.cpp.starter
          });
        }

        // Fetch submission history
        fetchHistory();

      } catch (error) {
        console.error('Error loading problem data:', error);
        toast.error('Problem not found or inactive');
        navigate('/problems');
      } finally {
        setInitialLoad(false);
      }
    };

    fetchData();
  }, [problemId, navigate]);

  const fetchHistory = async () => {
    try {
      const res = await api.get(`/submissions/problem/${problemId}`);
      setHistory(res.data.data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      handleSave();
    });
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      handleRun('run');
    });
  };

  const handleLanguageChange = (langKey) => {
    if (editorRef.current) {
      const currentVal = editorRef.current.getValue();
      setCodes(prev => ({
        ...prev,
        [selectedLang]: currentVal
      }));
    }
    setSelectedLang(langKey);
  };

  const handleSave = async () => {
    let finalCodes = { ...codes };
    if (editorRef.current) {
      const currentVal = editorRef.current.getValue();
      finalCodes[selectedLang] = currentVal;
      setCodes(finalCodes);
    }

    if (problemId === 'demo') {
      toast.success('Code saved locally (Demo mode)');
      return;
    }
    
    setIsSaving(true);
    try {
      const payloadCode = JSON.stringify(finalCodes);
      await api.patch(`/progress/${problemId}/code`, { code: payloadCode });
      toast.success('Code saved successfully');
    } catch (error) {
      toast.error('Failed to save code');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    if (window.confirm(`Are you sure you want to reset your ${LANGUAGES[selectedLang].name} code?`)) {
      setCodes(prev => ({
        ...prev,
        [selectedLang]: problem?.starterCode?.[selectedLang] || LANGUAGES[selectedLang].starter
      }));
      toast.success('Code reset successfully');
    }
  };

  const handleCopy = () => {
    const activeVal = editorRef.current ? editorRef.current.getValue() : codes[selectedLang];
    navigator.clipboard.writeText(activeVal);
    toast.success('Code copied to clipboard');
  };

  const handleRun = async (mode = 'run') => { // mode: 'run' | 'submit'
    if (problemId === 'demo') {
      toast.error('Cannot run code in demo mode. Please select a real problem.');
      return;
    }

    const activeVal = editorRef.current ? editorRef.current.getValue() : codes[selectedLang];
    
    setCodes(prev => ({
      ...prev,
      [selectedLang]: activeVal
    }));

    setIsRunning(true);
    setTestResults(null);
    setOutput(null);
    setActiveTab('results');

    try {
      const endpoint = mode === 'run' ? '/submissions/run' : '/submissions/submit';
      const { data } = await api.post(endpoint, {
        problemId,
        language: selectedLang,
        code: activeVal
      });

      const result = data.data;
      setTestResults(result);

      if (result.globalStatus === 'accepted') {
        toast.success(mode === 'submit' ? 'Solution Accepted!' : 'Sample cases passed');
      } else {
        toast.error(`Execution failed: ${result.globalStatus}`);
      }

      if (mode === 'submit') {
        fetchHistory(); // refresh history list
      }

      // Auto-save code
      const finalCodes = { ...codes, [selectedLang]: activeVal };
      api.patch(`/progress/${problemId}/code`, { code: JSON.stringify(finalCodes) }).catch(console.error);

    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to execute code');
      setOutput({
        error: error.response?.data?.message || error.message
      });
      setActiveTab('output');
    } finally {
      setIsRunning(false);
    }
  };

  const loadHistoryCode = async (subId) => {
    try {
      const { data } = await api.get(`/submissions/${subId}`);
      const sub = data.data;
      if (window.confirm('Load this submission code into the editor? This will overwrite your current unsaved code.')) {
        setSelectedLang(sub.language);
        setCodes(prev => ({
          ...prev,
          [sub.language]: sub.code
        }));
        if (editorRef.current) {
          editorRef.current.setValue(sub.code);
        }
      }
    } catch (e) {
      toast.error('Failed to load submission code');
    }
  };

  if (initialLoad) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col animate-fade-in -m-4 md:-m-8">
      {/* Toolbar */}
      <div className="h-14 bg-white dark:bg-dark-surface border-b border-light-border dark:border-dark-border flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/problems')} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors text-gray-500 dark:text-gray-400">
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <div>
            <h2 className="font-semibold flex items-center gap-2">
              {problem ? problem.title : 'Demo Mode'}
              {problem && (
                <span className={`text-[10px] px-2 py-0.5 rounded border ${
                  problem.difficulty === 'Easy' ? 'text-green-600 bg-green-50 border-green-200 dark:bg-green-900/10 dark:text-green-400 dark:border-green-800' :
                  problem.difficulty === 'Medium' ? 'text-yellow-600 bg-yellow-50 border-yellow-200 dark:bg-yellow-900/10 dark:text-yellow-400 dark:border-yellow-800' :
                  'text-red-600 bg-red-50 border-red-200 dark:bg-red-900/10 dark:text-red-400 dark:border-red-800'
                }`}>
                  {problem.difficulty}
                </span>
              )}
            </h2>
            {problem && <p className="text-xs text-gray-500 dark:text-gray-400">{problem.topic}</p>}
          </div>
        </div>

        {/* Action Controls & Language Selector Dropdown */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center gap-1.5 bg-gray-50 dark:bg-dark-bg/60 border border-gray-200 dark:border-gray-800 px-3 py-1 rounded-xl">
            <Globe className="w-4 h-4 text-gray-400" />
            <select
              value={selectedLang}
              onChange={(e) => handleLanguageChange(e.target.value)}
              className="bg-transparent text-sm font-semibold focus:outline-none cursor-pointer text-gray-700 dark:text-gray-300"
            >
              <option value="java" className="dark:bg-dark-surface">Java</option>
              <option value="python" className="dark:bg-dark-surface">Python 3</option>
              <option value="cpp" className="dark:bg-dark-surface">C++</option>
            </select>
          </div>

          <button onClick={handleReset} className="btn-secondary px-3 py-1.5 flex items-center gap-1.5 text-sm" title="Reset current language">
            <RotateCcw className="w-4 h-4" /> <span className="hidden sm:inline">Reset</span>
          </button>
          <button onClick={handleCopy} className="btn-secondary px-3 py-1.5 flex items-center gap-1.5 text-sm" title="Copy Code">
            <Copy className="w-4 h-4" /> <span className="hidden sm:inline">Copy</span>
          </button>
          <button onClick={handleSave} disabled={isSaving} className="btn-secondary px-3 py-1.5 flex items-center gap-1.5 text-sm" title="Save Code">
            {isSaving ? <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div> : <Save className="w-4 h-4" />}
            <span className="hidden sm:inline">Save</span>
          </button>
          <button onClick={() => handleRun('run')} disabled={isRunning} className="btn-secondary border-primary/20 hover:border-primary/50 text-primary px-4 py-1.5 flex items-center gap-1.5 text-sm" title="Run Sample Test Cases">
            <Play className="w-4 h-4" /> Run Samples
          </button>
          <button onClick={() => handleRun('submit')} disabled={isRunning} className="btn-primary px-4 py-1.5 flex items-center gap-1.5 text-sm shadow-md" title="Submit Solution">
            {isRunning ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <Send className="w-4 h-4 fill-current" />}
            Submit
          </button>
        </div>
      </div>

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Editor */}
        <div className="flex-1 relative lg:w-[65%] flex flex-col border-r border-light-border dark:border-dark-border">
          <Editor
            height="100%"
            language={LANGUAGES[selectedLang].monaco}
            theme={activeTheme === 'dark' ? 'vs-dark' : 'light'}
            value={currentCode}
            onChange={(val) => {
              setCodes(prev => ({
                ...prev,
                [selectedLang]: val
              }));
            }}
            onMount={handleEditorDidMount}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
              padding: { top: 16 },
              scrollBeyondLastLine: false,
              smoothScrolling: true,
              cursorBlinking: "smooth",
              formatOnPaste: true,
            }}
          />
        </div>

        {/* Output Panel */}
        <div className="h-64 lg:h-full lg:w-[35%] flex flex-col bg-gray-50 dark:bg-[#0D0F14]">
          <div className="flex border-b border-light-border dark:border-dark-border bg-white dark:bg-dark-surface shrink-0">
            <button 
              onClick={() => setActiveTab('results')} 
              className={`flex-1 py-2 text-xs font-semibold border-b-2 transition-colors flex justify-center items-center gap-1.5 ${activeTab === 'results' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-gray-300'}`}
            >
              <Terminal className="w-3.5 h-3.5" /> Results
            </button>
            <button 
              onClick={() => setActiveTab('history')} 
              className={`flex-1 py-2 text-xs font-semibold border-b-2 transition-colors flex justify-center items-center gap-1.5 ${activeTab === 'history' ? 'border-amber-500 text-amber-500' : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-gray-300'}`}
            >
              <History className="w-3.5 h-3.5" /> History
            </button>
            <button 
              onClick={() => setActiveTab('output')} 
              className={`flex-1 py-2 text-xs font-semibold border-b-2 transition-colors flex justify-center items-center gap-1.5 ${activeTab === 'output' ? 'border-red-500 text-red-500' : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-gray-300'}`}
            >
              <AlertCircle className="w-3.5 h-3.5" /> Output
            </button>
          </div>

          <div className="flex-1 p-4 overflow-y-auto font-mono text-sm">
            {isRunning ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-500 dark:text-gray-400 space-y-4">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                <p>Executing on backend...</p>
              </div>
            ) : activeTab === 'results' ? (
              !testResults ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
                  <Terminal className="w-12 h-12 mb-2 opacity-20" />
                  <p>Run or Submit to see test cases</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className={`p-3 rounded-lg border flex items-center justify-between ${testResults.globalStatus === 'accepted' ? 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/10 dark:border-green-800 dark:text-green-300' : 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/10 dark:border-red-800 dark:text-red-300'}`}>
                    <div>
                      <h3 className="font-bold text-sm flex items-center gap-1.5 uppercase tracking-wide">
                        {testResults.globalStatus === 'accepted' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                        {testResults.globalStatus.replace('_', ' ')}
                      </h3>
                      <p className="text-xs opacity-80 mt-0.5 font-semibold">Passed {testResults.passedCount}/{testResults.totalCount} tests</p>
                    </div>
                    <div className="flex flex-col gap-1 text-[10px] font-semibold opacity-80 text-right">
                      <span className="flex items-center justify-end gap-1"><Clock className="w-3 h-3" /> {testResults.runtime}s</span>
                      <span className="flex items-center justify-end gap-1"><Cpu className="w-3 h-3" /> {testResults.memory} KB</span>
                    </div>
                  </div>

                  <div className="space-y-2 mt-4">
                    <h4 className="font-bold text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Test Case Details</h4>
                    {testResults.testResults.map((tr, idx) => (
                      <div key={idx} className="p-2.5 rounded border border-gray-200 dark:border-gray-800 bg-white dark:bg-dark-surface">
                        <div className="flex justify-between items-center mb-1.5">
                          <span className={`text-[11px] font-bold uppercase tracking-wide ${tr.passed ? 'text-green-500' : 'text-red-500'}`}>
                            Test {idx + 1}: {tr.passed ? 'Passed' : 'Failed'}
                          </span>
                          <span className="text-[10px] text-gray-400 font-mono">{tr.runtime}s</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 font-mono text-[10px]">
                          <div className="bg-gray-50 dark:bg-[#09090B] p-1.5 rounded"><span className="text-gray-500 dark:text-gray-400 block mb-0.5">Input</span><span className="text-gray-700 dark:text-gray-300 break-all">{tr.input}</span></div>
                          <div className="bg-gray-50 dark:bg-[#09090B] p-1.5 rounded"><span className="text-gray-500 dark:text-gray-400 block mb-0.5">Expected</span><span className="text-gray-700 dark:text-gray-300 break-all">{tr.expectedOutput}</span></div>
                          <div className="bg-gray-50 dark:bg-[#09090B] p-1.5 rounded"><span className="text-gray-500 dark:text-gray-400 block mb-0.5">Actual</span><span className={`break-all ${tr.passed ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>{tr.actualOutput}</span></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            ) : activeTab === 'history' ? (
              history.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-500 dark:text-gray-400 text-center">
                  <History className="w-12 h-12 mb-2 opacity-20" />
                  <p>No submissions found.<br/>Submit your solution to build history.</p>
                </div>
              ) : (
                <div className="space-y-1.5">
                  {history.map((sub) => (
                    <div key={sub._id} className="p-2.5 flex items-center justify-between rounded border border-gray-200 dark:border-gray-800 bg-white dark:bg-dark-surface hover:bg-gray-50 dark:hover:bg-white/[0.02] cursor-pointer transition-colors" onClick={() => loadHistoryCode(sub._id)}>
                      <div>
                        <div className={`font-bold text-[11px] uppercase tracking-wide flex items-center gap-1 ${
                          sub.status === 'accepted' ? 'text-green-500' : 
                          sub.status === 'wrong_answer' ? 'text-red-500' : 
                          'text-amber-500'
                        }`}>
                          {sub.status === 'accepted' ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                          {sub.status.replace('_', ' ')}
                        </div>
                        <div className="text-[10px] text-gray-400 mt-0.5">{new Date(sub.createdAt).toLocaleString()}</div>
                      </div>
                      <div className="text-right flex flex-col items-end">
                        <span className="text-[10px] font-mono bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-gray-600 dark:text-gray-300">{sub.language}</span>
                        <span className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 mt-1">{sub.passedCount}/{sub.totalCount} pass</span>
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : (
              // Output/Errors tab
              <div className="space-y-4">
                {output?.error && (
                  <div className="p-4 rounded-lg bg-red-50 border-red-200 text-red-800 dark:bg-red-900/10 dark:border-red-800 dark:text-red-300">
                    <h3 className="font-semibold mb-2">Request Error:</h3>
                    <pre className="whitespace-pre-wrap">{output.error}</pre>
                  </div>
                )}
                {testResults?.testResults?.find(tr => tr.errorOutput)?.errorOutput && (
                  <div className="p-4 rounded-lg bg-red-50 border-red-200 text-red-800 dark:bg-red-900/10 dark:border-red-800 dark:text-red-300">
                    <h3 className="font-semibold mb-2">Compilation/Runtime Error:</h3>
                    <pre className="whitespace-pre-wrap text-xs">
                      {testResults.testResults.find(tr => tr.errorOutput).errorOutput}
                    </pre>
                  </div>
                )}
                {!output?.error && !testResults?.testResults?.some(tr => tr.errorOutput) && (
                  <div className="text-gray-500 dark:text-gray-400 text-center mt-10">No system errors to report.</div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
