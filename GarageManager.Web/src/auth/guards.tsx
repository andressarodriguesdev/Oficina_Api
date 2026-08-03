import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { PageLoader } from '../components/ui/Spinner';
import { useAuth } from './AuthProvider';

/**
 * Everything behind the app layout needs a signed-in User. These guards mirror the
 * policies in GarageManager.Api/Authorization/Policies.cs — they keep pages out of
 * sight, they do not enforce anything. The API is what enforces.
 */
export function RequireAuth() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <PageLoader label="Checking your session..." />;
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}

/** Money and staff records. Mirrors Policies.ProprietorOnly. */
export function RequireProprietor() {
  const { user, loading, isProprietor } = useAuth();

  if (loading) {
    return <PageLoader label="Checking your session..." />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!isProprietor) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
