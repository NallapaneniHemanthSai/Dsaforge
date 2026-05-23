import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Eye, EyeOff, GraduationCap, ShieldCheck, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import { DEMO_ADMIN_EMAIL, DEMO_STUDENT_EMAIL } from '../utils/demoMode';

const demoAccounts = {
  student: {
    email: DEMO_STUDENT_EMAIL,
    password: 'Demo@123',
    title: 'Student Demo',
    subtitle: 'Read-only preview',
    description: 'Explore dashboard, problems, notes, leaderboard, and playground without changing demo data.',
    icon: GraduationCap,
    redirect: '/dashboard',
  },
  admin: {
    email: DEMO_ADMIN_EMAIL,
    password: 'Admin@123',
    title: 'Admin Demo',
    subtitle: 'Read-only admin preview',
    description: 'Inspect users, problems, submissions, analytics, and controls without changing platform data.',
    icon: ShieldCheck,
    redirect: '/admin/dashboard',
  },
};

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', formData);
      login(data.accessToken, data.user);
      toast.success(data.message);
      navigate(data.user?.role === 'admin' ? '/admin/dashboard' : '/dashboard');
    } catch (error) {
      const msg = error.response?.data?.message || 'Login failed';
      toast.error(msg);
      
      // If unverified, redirect to OTP
      if (error.response?.data?.needsVerification) {
        setTimeout(() => {
          navigate('/verify-otp', {
            state: {
              email: formData.email,
              devOtp: error.response?.data?.devOtp,
              emailDeliveryFailed: error.response?.data?.emailDeliveryFailed,
            },
          });
        }, 1500);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (mode) => {
    const account = demoAccounts[mode];
    setDemoLoading(mode);
    try {
      const { data } = await api.post('/auth/login', {
        email: account.email,
        password: account.password,
        rememberMe: false,
      });
      login(data.accessToken, data.user);
      toast.success(`${account.title} opened successfully`);
      navigate(account.redirect);
    } catch (error) {
      const msg = error.response?.data?.message || 'Demo login failed';
      toast.error(msg);
    } finally {
      setDemoLoading(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white dark:bg-dark-bg">
      {/* Decorative Side Panel */}
      <div className="hidden md:flex md:w-1/2 bg-dark-bg relative overflow-hidden flex-col justify-between p-12">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/30 via-dark-bg to-dark-bg"></div>
        <div className="absolute -left-40 -bottom-40 w-96 h-96 bg-secondary/20 blur-[100px] rounded-full mix-blend-screen"></div>
        
        <div className="relative z-10">
          <Link to="/" className="flex items-center space-x-2 mb-12">
            <Zap className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-white">DSAForge</span>
          </Link>
          
          <h1 className="text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-6">
            Master algorithms.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
              Accelerate your career.
            </span>
          </h1>
          <p className="text-gray-400 text-lg max-w-md">
            Join the elite community of KL University students preparing for top-tier tech placements.
          </p>
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-4 text-gray-400 text-sm bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
              <Zap className="w-6 h-6 text-primary" />
            </div>
            <p>"The best platform to track your progress and build a consistent coding habit for placements."</p>
          </div>
        </div>
      </div>

      {/* Form Side */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          <div className="md:hidden flex flex-col items-center mb-8">
            <Link to="/" className="flex items-center space-x-2 mb-4">
              <Zap className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold text-gray-900 dark:text-white">DSAForge</span>
            </Link>
          </div>
          
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Welcome back</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-2">Enter your details to access your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">KL Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="input-field bg-gray-50 dark:bg-dark-surface/50"
                placeholder="id@kluniversity.in"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
                <Link to="/forgot-password" className="text-sm font-semibold text-primary hover:text-primary-hover transition-colors">Forgot password?</Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="input-field pr-10 bg-gray-50 dark:bg-dark-surface/50"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="rememberMe"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleChange}
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded cursor-pointer"
              />
              <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-600 dark:text-gray-400 cursor-pointer">
                Remember me for 30 days
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3 flex justify-center items-center font-semibold text-[15px] shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all"
            >
              {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-8">
            Don't have an account? <Link to="/signup" className="text-primary font-semibold hover:text-primary-hover transition-colors">Sign up</Link>
          </p>

          {/* Recruiter Preview / Demo Account Section */}
          <div className="mt-10 pt-8 border-t border-gray-200 dark:border-dark-border">
            <div className="text-center mb-5">
              <span className="px-3 py-1 text-[11px] font-bold tracking-wider uppercase rounded-full bg-primary/10 text-primary border border-primary/20">
                Recruiter & Guest Preview
              </span>
            </div>
            <div className="grid gap-4">
              {Object.entries(demoAccounts).map(([mode, account]) => {
                const Icon = account.icon;
                const isLoading = demoLoading === mode;
                return (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => handleDemoLogin(mode)}
                    disabled={loading || Boolean(demoLoading)}
                    className="group flex items-center gap-4 rounded-2xl border border-gray-200 bg-gray-50 p-4 text-left transition-all hover:border-primary/40 hover:bg-white hover:shadow-md disabled:cursor-not-allowed disabled:opacity-70 dark:border-dark-border dark:bg-dark-surface/40 dark:hover:bg-dark-surface"
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      {isLoading ? (
                        <div className="h-5 w-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                      ) : (
                        <Icon className="h-5 w-5" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-bold text-gray-900 transition-colors group-hover:text-primary dark:text-white">
                          {account.title}
                        </span>
                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
                          {account.subtitle}
                        </span>
                      </div>
                      <p className="mt-1 text-xs leading-relaxed text-gray-500 dark:text-gray-400">
                        {account.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
