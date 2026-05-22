import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sun, Moon, Menu, X, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { activeTheme, changeTheme } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Problems', path: '/problems' },
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Leaderboard', path: '/leaderboard' },
  ];

  const isLanding = location.pathname === '/';
  const isAuthPage = ['/login', '/signup', '/verify-otp', '/forgot-password'].some((p) => location.pathname.startsWith(p));
  const isAppShell = !isLanding && !isAuthPage && !location.pathname.startsWith('/reset-password');

  const navClass = isAppShell
    ? 'glass-nav py-3 shadow-sm'
    : scrolled || !isLanding
      ? 'glass-nav py-3'
      : 'bg-transparent py-5';

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${navClass}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          
          <Link to="/" className="flex items-center space-x-2 group text-gray-950 dark:text-white">
            <Zap className="h-6 w-6 text-primary group-hover:text-primary-hover transition-colors" />
            <span className="text-xl font-bold tracking-tight">DSAForge</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-8">
            <div className="flex space-x-6">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`text-sm font-medium transition-colors hover:text-primary ${location.pathname === link.path ? 'text-primary' : 'text-gray-600 dark:text-gray-300'}`}
                >
                  {link.name}
                </Link>
              ))}
            </div>

            <div className="flex items-center space-x-4 border-l border-gray-200 dark:border-gray-700 pl-4">
              <button
                onClick={() => changeTheme(activeTheme === 'dark' ? 'light' : 'dark')}
                className="p-2 rounded-full text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800 transition-colors"
                aria-label="Toggle Theme"
              >
                {activeTheme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>

              {user ? (
                <div className="relative group">
                  <button className="flex items-center space-x-2 focus:outline-none">
                    <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  </button>
                  {/* Dropdown */}
                    <div className="absolute right-0 mt-2 w-48 bg-white text-gray-900 dark:bg-dark-surface dark:text-gray-100 rounded-xl shadow-lg border border-light-border dark:border-dark-border py-2 invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all transform origin-top-right">
                    <div className="px-4 py-2 border-b border-light-border dark:border-dark-border">
                      <p className="text-sm font-medium truncate">{user.name}</p>
                      <p className="text-xs text-gray-500 truncate">@{user.username}</p>
                    </div>
                    {user?.role === 'admin' && (
                      <Link to="/admin/dashboard" className="block px-4 py-2 text-sm text-purple-600 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950/20 font-semibold transition-colors">Admin Panel</Link>
                    )}
                    <Link to="/profile" className="block px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">Profile</Link>
                    <Link to="/settings" className="block px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">Settings</Link>
                    <button onClick={logout} className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">Logout</button>
                  </div>
                </div>
              ) : (
                <div className="flex space-x-3">
                  <Link to="/login" className="btn-secondary text-sm px-4 py-2">Login</Link>
                  <Link to="/signup" className="btn-primary text-sm px-4 py-2">Sign Up</Link>
                </div>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-4">
            <button
              onClick={() => changeTheme(activeTheme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              {activeTheme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden glass-nav border-t border-light-border dark:border-dark-border animate-fade-in absolute w-full left-0 top-full shadow-lg">
          <div className="px-4 pt-2 pb-6 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            {!user ? (
              <div className="pt-4 flex flex-col space-y-2 border-t border-light-border dark:border-dark-border">
                <Link to="/login" className="btn-secondary text-center" onClick={() => setMobileMenuOpen(false)}>Login</Link>
                <Link to="/signup" className="btn-primary text-center" onClick={() => setMobileMenuOpen(false)}>Sign Up</Link>
              </div>
            ) : (
              <div className="pt-4 flex flex-col space-y-2 border-t border-light-border dark:border-dark-border">
                {user?.role === 'admin' && (
                  <Link to="/admin/dashboard" className="block px-3 py-2 rounded-md text-base font-semibold text-purple-600 dark:text-purple-400 hover:bg-purple-50/10" onClick={() => setMobileMenuOpen(false)}>Admin Panel</Link>
                )}
                <Link to="/profile" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => setMobileMenuOpen(false)}>Profile</Link>
                <Link to="/settings" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => setMobileMenuOpen(false)}>Settings</Link>
                <button onClick={() => { logout(); setMobileMenuOpen(false); }} className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">Logout</button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
