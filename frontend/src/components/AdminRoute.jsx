import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { useEffect } from 'react';

export default function AdminRoute() {
  const { user } = useAuth();

  useEffect(() => {
    if (user && user.role !== 'admin') {
      toast.error('Access denied. Administrator privileges required.');
    }
  }, [user]);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
