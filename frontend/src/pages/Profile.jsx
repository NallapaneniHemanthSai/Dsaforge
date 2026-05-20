import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { User as UserIcon, Mail, Calendar, Key, ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api';

export default function Profile() {
  const { user, setUser } = useAuth();
  
  // Profile Form
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    username: user?.username || '',
    bio: user?.bio || ''
  });
  const [updatingProfile, setUpdatingProfile] = useState(false);

  // Password Form
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [updatingPassword, setUpdatingPassword] = useState(false);

  // Delete Account Form
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name,
        username: user.username,
        bio: user.bio || ''
      });
    }
  }, [user]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setUpdatingProfile(true);
    try {
      const { data } = await api.patch('/user/profile', profileData);
      setUser(data.user);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    setUpdatingPassword(true);
    try {
      const { data } = await api.patch('/user/change-password', passwordData);
      toast.success(data.message);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setUpdatingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== 'DELETE') {
      toast.error('Please type DELETE to confirm');
      return;
    }
    setDeleting(true);
    try {
      const { data } = await api.delete('/user/account', { data: { confirmation: 'DELETE' } });
      toast.success(data.message);
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete account');
      setDeleting(false);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-12">
      
      {/* Header Profile Card */}
      <div className="card p-8 flex flex-col md:flex-row items-center gap-8 bg-gradient-to-r from-primary/10 to-transparent dark:from-primary-hover/10 border-none shadow-none">
        <div className="w-24 h-24 rounded-full bg-primary text-white flex items-center justify-center text-4xl font-bold shadow-lg shrink-0">
          {user.name.charAt(0).toUpperCase()}
        </div>
        <div className="text-center md:text-left flex-1">
          <h1 className="text-3xl font-bold mb-2">{user.name}</h1>
          <p className="text-gray-600 dark:text-gray-400 font-medium mb-4">@{user.username}</p>
          <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1.5"><Mail className="w-4 h-4" /> {user.email}</span>
            <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> Joined {new Date(user.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left Col: Navigation / Info */}
        <div className="space-y-6">
          <div className="card p-6">
            <h3 className="font-semibold text-lg mb-4">Account Status</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Email Verification</span>
                <span className="text-green-500 font-medium">Verified ✓</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Account Type</span>
                <span className="font-medium">Student</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Forms */}
        <div className="md:col-span-2 space-y-8">
          
          {/* Edit Profile */}
          <div className="card p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-gray-700 dark:text-gray-300"><UserIcon className="w-5 h-5" /></div>
              <h2 className="text-xl font-bold">Public Profile</h2>
            </div>
            
            <form onSubmit={handleProfileUpdate} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium mb-1">Full Name</label>
                  <input
                    type="text"
                    value={profileData.name}
                    onChange={e => setProfileData({...profileData, name: e.target.value})}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Username</label>
                  <input
                    type="text"
                    value={profileData.username}
                    onChange={e => setProfileData({...profileData, username: e.target.value})}
                    className="input-field"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1 flex justify-between">
                  Bio <span className="text-gray-400 font-normal">{profileData.bio.length}/150</span>
                </label>
                <textarea
                  value={profileData.bio}
                  onChange={e => setProfileData({...profileData, bio: e.target.value.slice(0, 150)})}
                  className="input-field min-h-[100px] resize-none"
                  placeholder="Tell us about yourself..."
                />
              </div>

              <div className="flex justify-end pt-2">
                <button type="submit" disabled={updatingProfile} className="btn-primary flex items-center px-6">
                  {updatingProfile ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div> : null}
                  Save Changes
                </button>
              </div>
            </form>
          </div>

          {/* Change Password */}
          <div className="card p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-gray-700 dark:text-gray-300"><Key className="w-5 h-5" /></div>
              <h2 className="text-xl font-bold">Security</h2>
            </div>
            
            <form onSubmit={handlePasswordUpdate} className="space-y-5">
              <div>
                <label className="block text-sm font-medium mb-1">Current Password</label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={e => setPasswordData({...passwordData, currentPassword: e.target.value})}
                  className="input-field"
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium mb-1">New Password</label>
                  <input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={e => setPasswordData({...passwordData, newPassword: e.target.value})}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={e => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                    className="input-field"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button type="submit" disabled={updatingPassword} className="btn-secondary flex items-center px-6">
                  {updatingPassword ? <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin mr-2"></div> : null}
                  Update Password
                </button>
              </div>
            </form>
          </div>

          {/* Danger Zone */}
          <div className="card p-6 sm:p-8 border-red-200 dark:border-red-900/50">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg text-red-600 dark:text-red-400"><ShieldAlert className="w-5 h-5" /></div>
              <h2 className="text-xl font-bold text-red-600 dark:text-red-400">Danger Zone</h2>
            </div>
            
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Once you delete your account, there is no going back. Please be certain. All your progress, notes, and code submissions will be permanently wiped after 30 days.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <input
                type="text"
                placeholder="Type DELETE to confirm"
                value={deleteConfirmation}
                onChange={e => setDeleteConfirmation(e.target.value)}
                className="input-field max-w-xs border-red-200 focus:ring-red-500"
              />
              <button 
                onClick={handleDeleteAccount}
                disabled={deleting || deleteConfirmation !== 'DELETE'}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center whitespace-nowrap"
              >
                {deleting ? 'Deleting...' : 'Delete Account'}
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
