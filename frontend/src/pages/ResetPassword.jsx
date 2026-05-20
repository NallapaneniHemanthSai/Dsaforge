import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Zap, Eye, EyeOff } from 'lucide-react';
import api from '../api';

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});

  const getPasswordStrength = (pass) => {
    let score = 0;
    if (!pass) return { score: 0, label: '', color: 'bg-gray-200' };
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(pass)) score += 1;

    if (score <= 1) return { score, label: 'Weak', color: 'bg-red-500' };
    if (score <= 3) return { score, label: 'Medium', color: 'bg-yellow-500' };
    return { score, label: 'Strong', color: 'bg-green-500' };
  };

  const strength = getPasswordStrength(formData.password);

  const validateField = (name, value) => {
    let error = '';
    switch (name) {
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
    setErrors(prev => ({ ...prev, [name]: validateField(name, value) }));
    if (name === 'password' && formData.confirmPassword) {
      setErrors(prev => ({ ...prev, confirmPassword: validateField('confirmPassword', formData.confirmPassword) }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const newErrors = {};
    Object.keys(formData).forEach(key => {
      const err = validateField(key, formData[key]);
      if (err) newErrors[key] = err;
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post(`/auth/reset-password/${token}`, formData);
      toast.success(data.message);
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-bg p-4">
      <div className="w-full max-w-md card p-8">
        <div className="flex flex-col items-center mb-8 text-center">
          <Link to="/" className="mb-6">
            <Zap className="h-10 w-10 text-primary" />
          </Link>
          <h2 className="text-2xl font-bold">Create New Password</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">
            Your new password must be different from previously used passwords.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-1">New Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`input-field pr-10 ${errors.password ? 'border-red-500 focus:ring-red-500' : ''}`}
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
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
            
            {formData.password && (
              <div className="mt-2">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-gray-500">Strength:</span>
                  <span className={`text-xs font-semibold ${strength.color.replace('bg-', 'text-')}`}>
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
            <label className="block text-sm font-medium mb-1">Confirm Password</label>
            <input
              type={showPassword ? "text" : "password"}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={`input-field ${errors.confirmPassword ? 'border-red-500 focus:ring-red-500' : ''}`}
              placeholder="••••••••"
            />
            {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary py-2.5 flex justify-center items-center"
          >
            {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : 'Reset Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
