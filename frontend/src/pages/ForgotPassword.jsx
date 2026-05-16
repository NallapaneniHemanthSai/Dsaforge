import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Zap, ArrowLeft } from 'lucide-react';
import api from '../api';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email');
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post('/auth/forgot-password', { email });
      toast.success(data.message);
      setSubmitted(true);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send reset link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-bg p-4">
      <div className="w-full max-w-md card p-8">
        <Link to="/login" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 mb-6">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to login
        </Link>
        
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="w-16 h-16 bg-accent-light/10 rounded-full flex items-center justify-center mb-4">
            <Zap className="h-8 w-8 text-accent-light" />
          </div>
          <h2 className="text-2xl font-bold">Forgot Password</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">
            Enter your KL University email address and we'll send you a link to reset your password.
          </p>
        </div>

        {submitted ? (
          <div className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 p-4 rounded-lg text-center text-sm">
            Check your email for a link to reset your password. If it doesn't appear within a few minutes, check your spam folder.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-1">KL Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="id@kluniversity.in"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-2.5 flex justify-center items-center"
            >
              {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : 'Send Reset Link'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
