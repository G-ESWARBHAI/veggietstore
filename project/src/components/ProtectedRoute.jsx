import { Navigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { isAuthenticated, user } = useAuthStore();

  // If admin tries to access regular pages, redirect to admin dashboard
  if (isAuthenticated && user?.role === 'admin' && !adminOnly) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  // If regular user tries to access admin pages, redirect to home
  if (adminOnly && (!isAuthenticated || user?.role !== 'admin')) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;

