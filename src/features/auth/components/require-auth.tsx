import { Loader2 } from 'lucide-react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { useAuth } from '../context/auth-context';

/** Route guard: redirects unauthenticated users to /login, preserving the
 * attempted path so the login page can send them back after sign-in. */
export function RequireAuth() {
  const { isAuthenticated, initialising } = useAuth();
  const location = useLocation();

  // While a restored token is being verified, render neither the app nor the
  // login page — either would be wrong for one of the two outcomes.
  if (initialising) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/20">
        <Loader2 size={20} className="animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isAuthenticated) {
    // Preserve the full attempted URL (path + query + hash) so URL-encoded
    // filter/tab state survives the round-trip through login.
    const from = location.pathname + location.search + location.hash;
    return <Navigate to="/login" replace state={{ from }} />;
  }

  return <Outlet />;
}
