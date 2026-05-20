import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { toast } from 'react-hot-toast';
import { 
  Play, Save, RotateCcw, Copy, ChevronLeft, Terminal, 
  AlertCircle, Clock, Cpu, CheckCircle2, Globe 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import api from '../api';
import { problems } from '../data/problems';
import axios from 'axios';

const LANGUAGES = {
  java: {
    id: 62,
    name: 'Java (OpenJDK 13.0.1)',
    monaco: 'java',
    starter: `class Solution {\n    public static void main(String[] args) {\n        System.out.println("Hello from DSAForge!");\n        // Write your logic here\n    }\n}`
  },
  python: {
    id: 71,
    name: 'Python (3.8.1)',
    monaco: 'python',
    starter: `def solve():\n    print("Hello from DSAForge!")\n    # Write your logic here\n\nif __name__ == "__main__":\n    solve()`
  },
  cpp: {
    id: 54,
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
  
  const problem = problems.find(p => p.id === problemId);
  const editorRef = useRef(null);
  
  const [selectedLang, setSelectedLang] = useState('java');
  const [codes, setCodes] = useState({
    java: LANGUAGES.java.starter,
    python: LANGUAGES.python.starter,
    cpp: LANGUAGES.cpp.starter
  });
  
  const [customInput, setCustomInput] = useState('');
  const [output, setOutput] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('output'); // output, errors, info
  const [initialLoad, setInitialLoad] = useState(true);

  // Sync editor value with current codes state when language changes
  const currentCode = codes[selectedLang];

  useEffect(() => {
    if (!problem && problemId !== 'demo') {
      navigate('/problems');
      return;
    }

    const loadCode = async () => {
      if (problemId === 'demo') {
        setInitialLoad(false);
        return;
      }
      try {
        const { data } = await api.get('/progress');
        const prog = data.progress.find(p => p.problemId === problemId);
        
        if (prog && prog.code) {
          const dbCode = prog.code;
          try {
            // Check if stored code is serialized multi-language JSON object
            const parsed = JSON.parse(dbCode);
            setCodes({
              java: parsed.java || LANGUAGES.java.starter,
              python: parsed.python || LANGUAGES.python.starter,
              cpp: parsed.cpp || LANGUAGES.cpp.starter
            });
          } catch (e) {
            // Fallback for legacy single-string (Java template) data
            setCodes(prev => ({
              ...prev,
              java: dbCode
            }));
          }
        }
      } catch (error) {
        console.error('Error loading saved code:', error);
      } finally {
        setInitialLoad(false);
      }
    };

    loadCode();
  }, [problemId, navigate]);

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      handleSave();
    });
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      handleRun();
    });
  };

  const handleLanguageChange = (langKey) => {
    if (editorRef.current) {
      // Sync currently active code before changing state
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
      toast.success('Multi-language code bundle saved successfully');
    } catch (error) {
      toast.error('Failed to save code');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    if (window.confirm(`Are you sure you want to reset your ${LANGUAGES[selectedLang].name} code to starter template?`)) {
      setCodes(prev => ({
        ...prev,
        [selectedLang]: LANGUAGES[selectedLang].starter
      }));
      toast.success('Code reset successfully');
    }
  };

  const handleCopy = () => {
    const activeVal = editorRef.current ? editorRef.current.getValue() : codes[selectedLang];
    navigator.clipboard.writeText(activeVal);
    toast.success('Code copied to clipboard');
  };

  const handleRun = async () => {
    const activeVal = editorRef.current ? editorRef.current.getValue() : codes[selectedLang];
    
    // Sync code locally first
    setCodes(prev => ({
      ...prev,
      [selectedLang]: activeVal
    }));

    const apiKey = user?.judgeApiKey || localStorage.getItem('judgeApiKey');

    if (!apiKey) {
      toast.error('Judge0 API key not configured. Please add it in Settings.');
      return;
    }

    setIsRunning(true);
    setOutput(null);
    setActiveTab('output');

    const activeLanguageConfig = LANGUAGES[selectedLang];

    try {
      const options = {
        method: 'POST',
        url: 'https://judge0-ce.p.rapidapi.com/submissions',
        params: { base64_encoded: 'false', fields: '*' },
        headers: {
          'content-type': 'application/json',
          'Content-Type': 'application/json',
          'X-RapidAPI-Key': apiKey,
          'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com'
        },
        data: {
          language_id: activeLanguageConfig.id,
          source_code: activeVal,
          stdin: customInput
        }
      };

      const response = await axios.request(options);
      const token = response.data.token;

      // Poll for compilation completion
      let result = null;
      let attempts = 0;
      while (attempts < 10) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        const res = await axios.get(`https://judge0-ce.p.rapidapi.com/submissions/${token}?base64_encoded=false`, {
          headers: {
            'X-RapidAPI-Key': apiKey,
            'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com'
          }
        });
        if (res.data.status.id > 2) { // 1 = In Queue, 2 = Processing
          result = res.data;
          break;
        }
        attempts++;
      }

      if (!result) {
        throw new Error('Execution timed out in sandbox environment');
      }

      setOutput(result);
      if (result.status.id === 3) {
        toast.success('Execution completed successfully');
      } else {
        toast.error(`Execution failed: ${result.status.description}`);
        setActiveTab('errors');
      }

      // Auto-save progress inside the database
      if (problemId !== 'demo') {
        const finalCodes = { ...codes, [selectedLang]: activeVal };
        api.patch(`/progress/${problemId}/code`, { code: JSON.stringify(finalCodes) }).catch(console.error);
      }

    } catch (error) {
      toast.error(error.message || 'Failed to execute code');
      setOutput({
        status: { id: 13, description: 'Compilation / Sandbox Error' },
        compile_output: error.response?.data?.message || error.message
      });
      setActiveTab('errors');
    } finally {
      setIsRunning(false);
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
          <button onClick={() => navigate('/problems')} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors text-gray-500">
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <div>
            <h2 className="font-semibold flex items-center gap-2">
              {problem ? problem.title : 'Playground Playground'}
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
            {problem && <p className="text-xs text-gray-500">{problem.topic}</p>}
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
          <button onClick={handleSave} disabled={isSaving} className="btn-secondary px-3 py-1.5 flex items-center gap-1.5 text-sm" title="Save All Languages">
            {isSaving ? <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div> : <Save className="w-4 h-4" />}
            <span className="hidden sm:inline">Save</span>
          </button>
          <button onClick={handleRun} disabled={isRunning} className="btn-primary px-4 py-1.5 flex items-center gap-1.5 text-sm shadow-md" title="Compile & Run Solution">
            {isRunning ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <Play className="w-4 h-4 fill-current" />}
            Run Code
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
              onClick={() => setActiveTab('output')} 
              className={`flex-1 py-2 text-sm font-medium border-b-2 transition-colors flex justify-center items-center gap-1.5 ${activeTab === 'output' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-gray-300'}`}
            >
              <Terminal className="w-4 h-4" /> Output
            </button>
            <button 
              onClick={() => setActiveTab('errors')} 
              className={`flex-1 py-2 text-sm font-medium border-b-2 transition-colors flex justify-center items-center gap-1.5 ${activeTab === 'errors' ? 'border-red-500 text-red-500' : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-gray-300'}`}
            >
              <AlertCircle className="w-4 h-4" /> Errors
            </button>
            <button 
              onClick={() => setActiveTab('info')} 
              className={`flex-1 py-2 text-sm font-medium border-b-2 transition-colors flex justify-center items-center gap-1.5 ${activeTab === 'info' ? 'border-blue-500 text-blue-500' : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-gray-300'}`}
            >
              <Cpu className="w-4 h-4" /> Info
            </button>
          </div>

          <div className="flex-1 p-4 overflow-y-auto font-mono text-sm">
            {isRunning ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-500 space-y-4">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                <p>Compiling & Executing in sandbox...</p>
              </div>
            ) : !output ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-500">
                <Terminal className="w-12 h-12 mb-2 opacity-20" />
                <p>Run your code to see output</p>
              </div>
            ) : (
              <div className="h-full flex flex-col">
                {activeTab === 'output' && (
                  <div className={`p-4 rounded-lg flex-1 border ${output.status.id === 3 ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-900 text-green-800 dark:text-green-300' : 'bg-gray-100 dark:bg-gray-900 border-gray-200 dark:border-gray-800'}`}>
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      {output.status.id === 3 ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : null}
                      Standard Output:
                    </h3>
                    <pre className="whitespace-pre-wrap font-mono text-sm">
                      {output.stdout || 'No standard output'}
                    </pre>
                  </div>
                )}
                
                {activeTab === 'errors' && (
                  <div className="p-4 rounded-lg flex-1 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900 text-red-800 dark:text-red-300">
                    <h3 className="font-semibold mb-2">Errors & Compile Output:</h3>
                    <pre className="whitespace-pre-wrap font-mono text-sm">
                      {output.compile_output || output.stderr || 'No errors reported'}
                    </pre>
                  </div>
                )}
                
                {activeTab === 'info' && (
                  <div className="p-4 rounded-lg flex-1 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-900 text-blue-800 dark:text-blue-300">
                    <h3 className="font-semibold mb-4">Execution Information</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="font-medium w-24">Status:</span>
                        <span className="bg-white/50 dark:bg-black/20 px-2 py-0.5 rounded">{output.status.description}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium w-24">Time:</span>
                        <span className="bg-white/50 dark:bg-black/20 px-2 py-0.5 rounded flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {output.time ? `${output.time}s` : 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium w-24">Memory:</span>
                        <span className="bg-white/50 dark:bg-black/20 px-2 py-0.5 rounded flex items-center gap-1.5"><Cpu className="w-3.5 h-3.5" /> {output.memory ? `${output.memory} KB` : 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Custom Input */}
          <div className="border-t border-light-border dark:border-dark-border bg-white dark:bg-dark-surface p-4 shrink-0">
            <h3 className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Custom Input (stdin)</h3>
            <textarea
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              className="w-full h-24 p-3 bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-mono focus:ring-2 focus:ring-primary outline-none resize-none transition-shadow"
              placeholder="Enter inputs here separated by spaces or newlines..."
            ></textarea>
          </div>

        </div>
      </div>
    </div>
  );
}
