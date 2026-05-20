import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Eye, EyeOff, Zap, CheckCircle2, XCircle } from 'lucide-react';
import api from '../api';

export default function Signup() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState({});
  const [usernameAvailable, setUsernameAvailable] = useState(null);
  const [checkingUsername, setCheckingUsername] = useState(false);

  // Password strength
  const getPasswordStrength = (pass) => {
    let score = 0;
    if (!pass) return { score: 0, label: '', color: 'bg-gray-200' };
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(pass)) score += 1;

    if (score <= 1) return { score, label: 'Weak', color: 'bg-red-500', width: '25%' };
    if (score <= 3) return { score, label: 'Medium', color: 'bg-yellow-500', width: '50%' };
    return { score, label: 'Strong', color: 'bg-green-500', width: '100%' };
  };

  const strength = getPasswordStrength(formData.password);

  const validateField = (name, value) => {
    let error = '';
    switch (name) {
      case 'name':
        if (!value.trim()) error = 'Name is required';
        break;
      case 'username':
        if (value.length < 3 || value.length > 20) error = 'Username must be 3-20 characters';
        else if (!/^[a-zA-Z0-9_]+$/.test(value)) error = 'Alphanumeric and underscores only';
        break;
      case 'email':
        if (!value) error = 'Email is required';
        else if (!/^[a-zA-Z0-9._%+-]+@(kluniversity\.in|klu\.ac\.in)$/.test(value)) {
          error = 'Only KL University email addresses are allowed.';
        }
        break;
      case 'password':
        if (value.length < 8) error = 'Min 8 characters';
        else if (!/[A-Z]/.test(value)) error = 'Need 1 uppercase letter';
        else if (!/[0-9]/.test(value)) error = 'Need 1 number';
        else if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) error = 'Need 1 special character';
        break;
      case 'confirmPassword':
        if (value !== formData.password) error = 'Passwords do not match';
        break;
      default:
        break;
    }
    return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));

    // Re-validate confirm password if password changes
    if (name === 'password' && formData.confirmPassword) {
      setErrors(prev => ({ ...prev, confirmPassword: validateField('confirmPassword', formData.confirmPassword) }));
    }
  };

  const checkUsername = async (username) => {
    if (!username || username.length < 3 || errors.username) {
      setUsernameAvailable(null);
      return;
    }
    
    setCheckingUsername(true);
    try {
      const { data } = await api.get(`/auth/check-username?username=${username}`);
      setUsernameAvailable(data.available);
      if (!data.available) {
        setErrors(prev => ({ ...prev, username: 'Username already taken.' }));
      } else {
        setErrors(prev => ({ ...prev, username: '' }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCheckingUsername(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate all
    const newErrors = {};
    Object.keys(formData).forEach(key => {
      const err = validateField(key, formData[key]);
      if (err) newErrors[key] = err;
    });

    if (Object.keys(newErrors).length > 0 || !usernameAvailable) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post('/auth/signup', formData);
      toast.success(data.message);
      navigate('/verify-otp', { state: { email: formData.email } });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row-reverse bg-white dark:bg-dark-bg">
      {/* Decorative Side Panel - Reversed on Signup */}
      <div className="hidden md:flex md:w-1/2 bg-dark-bg relative overflow-hidden flex-col justify-between p-12">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-secondary/30 via-dark-bg to-dark-bg"></div>
        <div className="absolute -right-40 -top-40 w-96 h-96 bg-primary/20 blur-[100px] rounded-full mix-blend-screen"></div>
        
        <div className="relative z-10">
          <div className="flex justify-end mb-12">
            <Link to="/" className="flex items-center space-x-2">
              <Zap className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold text-white">DSAForge</span>
            </Link>
          </div>
          
          <h1 className="text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-6">
            Begin your journey.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary to-primary">
              Forge your future.
            </span>
          </h1>
          <p className="text-gray-400 text-lg max-w-md">
            The ultimate placement preparation platform built exclusively for KL University students.
          </p>
        </div>
        
        <div className="relative z-10">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-md">
              <div className="text-secondary font-bold text-xl mb-1">850+</div>
              <div className="text-gray-400 text-xs">Curated Problems</div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-md">
              <div className="text-primary font-bold text-xl mb-1">5</div>
              <div className="text-gray-400 text-xs">Integrated Sheets</div>
            </div>
          </div>
        </div>
      </div>

      {/* Form Side */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-12 overflow-y-auto">
        <div className="w-full max-w-md">
          <div className="md:hidden flex flex-col items-center mb-8">
            <Link to="/" className="flex items-center space-x-2 mb-4">
              <Zap className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold text-gray-900 dark:text-white">DSAForge</span>
            </Link>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Create account</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-2">KL University students only</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`input-field bg-gray-50 dark:bg-dark-surface/50 ${errors.name ? 'border-red-500 focus:ring-red-500' : ''}`}
                placeholder="John Doe"
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">Username</label>
              <div className="relative">
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  onBlur={(e) => checkUsername(e.target.value)}
                  className={`input-field bg-gray-50 dark:bg-dark-surface/50 ${errors.username ? 'border-red-500 focus:ring-red-500' : ''}`}
                  placeholder="johndoe123"
                />
                <div className="absolute right-3 top-2.5">
                  {checkingUsername && <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>}
                  {!checkingUsername && usernameAvailable === true && <CheckCircle2 className="w-5 h-5 text-green-500" />}
                  {!checkingUsername && usernameAvailable === false && <XCircle className="w-5 h-5 text-red-500" />}
                </div>
              </div>
              {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">KL Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`input-field bg-gray-50 dark:bg-dark-surface/50 ${errors.email ? 'border-red-500 focus:ring-red-500' : ''}`}
                placeholder="id@kluniversity.in"
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`input-field pr-10 bg-gray-50 dark:bg-dark-surface/50 ${errors.password ? 'border-red-500 focus:ring-red-500' : ''}`}
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
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
              
              {/* Password Strength Bar */}
              {formData.password && (
                <div className="mt-2.5">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">Password strength:</span>
                    <span className={`text-xs font-bold ${strength.color.replace('bg-', 'text-')}`}>
                      {strength.label}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden flex gap-1">
                    <div className={`h-full ${strength.score >= 1 ? strength.color : 'bg-transparent'} w-1/3 transition-colors duration-300`}></div>
                    <div className={`h-full ${strength.score >= 2 ? strength.color : 'bg-transparent'} w-1/3 transition-colors duration-300`}></div>
                    <div className={`h-full ${strength.score >= 4 ? strength.color : 'bg-transparent'} w-1/3 transition-colors duration-300`}></div>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">Confirm Password</label>
              <input
                type={showPassword ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`input-field bg-gray-50 dark:bg-dark-surface/50 ${errors.confirmPassword ? 'border-red-500 focus:ring-red-500' : ''}`}
                placeholder="••••••••"
              />
              {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3 mt-6 flex justify-center items-center font-semibold text-[15px] shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all"
            >
              {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-8">
            Already have an account? <Link to="/login" className="text-primary font-semibold hover:text-primary-hover transition-colors">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
