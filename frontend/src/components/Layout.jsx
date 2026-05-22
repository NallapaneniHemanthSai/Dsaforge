import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import {
  LayoutDashboard, Code2, BookOpen, Trophy, User, Settings, LogOut,
  ChevronLeft, ChevronRight, Terminal, Shield, Users, Database, Activity, Eye, LockKeyhole,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Navbar from './Navbar';
import { getDemoModeLabel, isDemoStudent, isDemoUser } from '../utils/demoMode';

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'Problems', path: '/problems', icon: <Code2 size={20} /> },
    { name: 'Notes', path: '/notes', icon: <BookOpen size={20} /> },
    { name: 'Playground', path: '/playground', icon: <Terminal size={20} /> },
    { name: 'Leaderboard', path: '/leaderboard', icon: <Trophy size={20} /> },
  ];

  const bottomItems = [
    { name: 'Profile', path: '/profile', icon: <User size={20} /> },
    { name: 'Settings', path: '/settings', icon: <Settings size={20} /> },
  ];

  const adminItems = [
    { name: 'Admin Home', path: '/admin/dashboard', icon: <Shield size={20} /> },
    { name: 'Users', path: '/admin/users', icon: <Users size={20} /> },
    { name: 'Problems', path: '/admin/problems', icon: <Database size={20} /> },
    { name: 'Submissions', path: '/admin/submissions', icon: <Code2 size={20} /> },
    { name: 'Analytics', path: '/admin/analytics', icon: <Activity size={20} /> },
  ];

  const NavItem = ({ item }) => (
    <NavLink
      to={item.path}
      className={({ isActive }) =>
        `flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors group ${
          isActive 
            ? 'bg-primary text-white shadow-md' 
            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
        }`
      }
      title={collapsed ? item.name : ''}
    >
      <div className={`${collapsed ? 'mx-auto' : ''}`}>{item.icon}</div>
      {!collapsed && <span className="font-medium whitespace-nowrap">{item.name}</span>}
    </NavLink>
  );

  return (
    <div className={`relative hidden md:flex flex-col border-r border-light-border dark:border-dark-border bg-white dark:bg-dark-surface transition-all duration-300 ${collapsed ? 'w-20' : 'w-64'}`}>
      
      {/* Collapse Toggle */}
      <button 
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-6 bg-white dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-full p-1 text-gray-500 hover:text-primary z-10"
      >
        {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>

      {/* Main Nav */}
      <div className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => <NavItem key={item.path} item={item} />)}
        {user?.role === 'admin' && (
          <div className="pt-5 mt-5 border-t border-light-border dark:border-dark-border">
            {!collapsed && (
              <p className="px-3 mb-2 text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                Admin
              </p>
            )}
            <div className="space-y-1">
              {adminItems.map((item) => <NavItem key={item.path} item={item} />)}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Nav */}
      <div className="p-4 border-t border-light-border dark:border-dark-border space-y-1">
        {bottomItems.map((item) => <NavItem key={item.path} item={item} />)}
        <button
          onClick={logout}
          className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10"
          title={collapsed ? 'Logout' : ''}
        >
          <div className={`${collapsed ? 'mx-auto' : ''}`}><LogOut size={20} /></div>
          {!collapsed && <span className="font-medium whitespace-nowrap">Logout</span>}
        </button>
      </div>
    </div>
  );
};

export default function Layout() {
  const { user } = useAuth();
  const demoModeLabel = getDemoModeLabel(user);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-slate-100/90 dark:from-dark-bg dark:to-[#0a0c12]">
      <Navbar />
      <div className="flex-1 flex pt-[72px]"> {/* offset for fixed navbar */}
        <Sidebar />
        <main className="flex-1 p-4 md:p-8 overflow-y-auto w-full">
          <div className="max-w-7xl mx-auto">
            {isDemoUser(user) && (
              <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-primary/20 bg-primary/10 p-4 text-primary dark:border-primary/30 dark:bg-primary/15 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 rounded-xl bg-primary/15 p-2">
                    {isDemoStudent(user) ? <LockKeyhole className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">{demoModeLabel}</p>
                    <p className="text-xs leading-relaxed text-gray-600 dark:text-gray-300">
                      {isDemoStudent(user)
                        ? 'Read-only recruiter preview is active. You can explore the product, but saves and destructive changes are disabled.'
                        : 'Read-only admin preview is active. Recruiters can inspect every admin feature, but create, edit, suspend, and delete actions are disabled.'}
                    </p>
                  </div>
                </div>
              </div>
            )}
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
