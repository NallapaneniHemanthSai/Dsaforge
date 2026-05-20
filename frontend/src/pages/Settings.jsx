import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Settings as SettingsIcon, Moon, Sun, Monitor, Bell, Code, Key } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import api from '../api';

export default function Settings() {
  const { user, setUser } = useAuth();
  const { theme, changeTheme } = useTheme();
  
  const [settings, setSettings] = useState({
    theme: 'system',
    emailNotifications: true,
    judgeApiKey: '',
    weeklyGoal: 7
  });
  
  const [saving, setSaving] = useState(false);
  const [showKey, setShowKey] = useState(false);

  useEffect(() => {
    if (user) {
      setSettings({
        theme: user.theme || 'system',
        emailNotifications: user.emailNotifications ?? true,
        judgeApiKey: user.judgeApiKey || '',
        weeklyGoal: user.weeklyGoal || 7
      });
    }
  }, [user]);

  // Sync context theme when settings change
  useEffect(() => {
    if (settings.theme !== theme) {
      changeTheme(settings.theme);
    }
  }, [settings.theme, theme, changeTheme]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data } = await api.patch('/user/settings', settings);
      setUser(data.user);
      
      // Also save api key to local storage for quick access in editor without fetching user
      if (settings.judgeApiKey) {
        localStorage.setItem('judgeApiKey', settings.judgeApiKey);
      } else {
        localStorage.removeItem('judgeApiKey');
      }

      toast.success('Settings saved successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fade-in pb-12">
      
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <SettingsIcon className="w-8 h-8 text-primary" />
            Preferences
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Customize your DSAForge experience.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="btn-primary px-6 flex items-center"
        >
          {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div> : null}
          Save Preferences
        </button>
      </div>

      <div className="space-y-6">
        
        {/* Appearance */}
        <div className="card p-6 sm:p-8">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2 border-b border-light-border dark:border-dark-border pb-4">
            <Moon className="w-5 h-5 text-gray-500" /> Appearance
          </h3>
          
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Theme Preference</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <button
                onClick={() => setSettings({ ...settings, theme: 'light' })}
                className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${settings.theme === 'light' ? 'border-primary bg-primary/5' : 'border-light-border dark:border-dark-border hover:border-gray-300 dark:hover:border-gray-600'}`}
              >
                <Sun className={`w-8 h-8 mb-2 ${settings.theme === 'light' ? 'text-primary' : 'text-gray-400'}`} />
                <span className={`font-medium ${settings.theme === 'light' ? 'text-primary' : 'text-gray-600 dark:text-gray-400'}`}>Light</span>
              </button>
              
              <button
                onClick={() => setSettings({ ...settings, theme: 'dark' })}
                className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${settings.theme === 'dark' ? 'border-primary bg-primary/5' : 'border-light-border dark:border-dark-border hover:border-gray-300 dark:hover:border-gray-600'}`}
              >
                <Moon className={`w-8 h-8 mb-2 ${settings.theme === 'dark' ? 'text-primary' : 'text-gray-400'}`} />
                <span className={`font-medium ${settings.theme === 'dark' ? 'text-primary' : 'text-gray-600 dark:text-gray-400'}`}>Dark</span>
              </button>
              
              <button
                onClick={() => setSettings({ ...settings, theme: 'system' })}
                className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${settings.theme === 'system' ? 'border-primary bg-primary/5' : 'border-light-border dark:border-dark-border hover:border-gray-300 dark:hover:border-gray-600'}`}
              >
                <Monitor className={`w-8 h-8 mb-2 ${settings.theme === 'system' ? 'text-primary' : 'text-gray-400'}`} />
                <span className={`font-medium ${settings.theme === 'system' ? 'text-primary' : 'text-gray-600 dark:text-gray-400'}`}>System</span>
              </button>
            </div>
          </div>
        </div>

        {/* Goals & Notifications */}
        <div className="card p-6 sm:p-8">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2 border-b border-light-border dark:border-dark-border pb-4">
            <Bell className="w-5 h-5 text-gray-500" /> Notifications & Goals
          </h3>
          
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Weekly Email Summary</p>
                <p className="text-sm text-gray-500">Receive a weekly report of your progress and streaks.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer"
                  checked={settings.emailNotifications}
                  onChange={(e) => setSettings({ ...settings, emailNotifications: e.target.checked })}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
              </label>
            </div>

            <div className="pt-4">
              <label className="block font-medium mb-1">Weekly Goal (Problems)</label>
              <p className="text-sm text-gray-500 mb-3">Set how many problems you want to solve each week.</p>
              <div className="flex items-center gap-4">
                <input 
                  type="range" 
                  min="1" 
                  max="50" 
                  value={settings.weeklyGoal}
                  onChange={(e) => setSettings({ ...settings, weeklyGoal: parseInt(e.target.value) })}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-primary"
                />
                <span className="font-bold text-xl w-12 text-center text-primary bg-primary/10 rounded-lg py-1">{settings.weeklyGoal}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Developer Settings */}
        <div className="card p-6 sm:p-8">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2 border-b border-light-border dark:border-dark-border pb-4">
            <Code className="w-5 h-5 text-gray-500" /> Developer
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block font-medium mb-1 flex items-center gap-2">
                <Key className="w-4 h-4" /> Judge0 API Key (RapidAPI)
              </label>
              <p className="text-sm text-gray-500 mb-3">Required to compile and run code in the editor. Get one for free from RapidAPI.</p>
              
              <div className="relative">
                <input
                  type={showKey ? "text" : "password"}
                  value={settings.judgeApiKey}
                  onChange={(e) => setSettings({ ...settings, judgeApiKey: e.target.value })}
                  className="input-field pr-24 font-mono text-sm"
                  placeholder="Enter your RapidAPI Key for Judge0 CE"
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-2 top-1.5 px-3 py-1 text-xs font-medium text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded"
                >
                  {showKey ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-lg border border-blue-200 dark:border-blue-900/50">
              <p className="text-sm text-blue-800 dark:text-blue-300">
                <strong>Need an API key?</strong> Go to <a href="https://rapidapi.com/judge0-official/api/judge0-ce" target="_blank" rel="noopener noreferrer" className="underline font-bold hover:text-blue-600 dark:hover:text-blue-200">Judge0 CE on RapidAPI</a>, subscribe to the free tier (500 requests/day), and paste your `X-RapidAPI-Key` here.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
