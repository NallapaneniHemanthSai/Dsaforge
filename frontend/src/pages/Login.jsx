import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Eye, EyeOff, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
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
      navigate('/dashboard');
    } catch (error) {
      const msg = error.response?.data?.message || 'Login failed';
      toast.error(msg);
      
      // If unverified, redirect to OTP
      if (error.response?.data?.needsVerification) {
        setTimeout(() => {
          navigate('/verify-otp', { state: { email: formData.email } });
        }, 1500);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-bg p-4">
      <div className="w-full max-w-md card p-8">
        <div className="flex flex-col items-center mb-8">
          <Link to="/" className="flex items-center space-x-2 mb-6">
            <Zap className="h-8 w-8 text-accent-light" />
            <span className="text-2xl font-bold">DSAForge</span>
          </Link>
          <h2 className="text-2xl font-bold text-center">Welcome back</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-2 text-center">Enter your details to access your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-1">KL Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="input-field"
              placeholder="id@kluniversity.in"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-medium">Password</label>
              <Link to="/forgot-password" className="text-sm text-accent-light hover:underline">Forgot password?</Link>
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="input-field pr-10"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
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
              className="h-4 w-4 text-accent-light focus:ring-accent-light border-gray-300 rounded"
            />
            <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
              Remember me for 30 days
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary py-2.5 flex justify-center items-center"
          >
            {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-6">
          Don't have an account? <Link to="/signup" className="text-accent-light hover:underline font-medium">Sign up</Link>
        </p>
      </div>
    </div>
  );
}
