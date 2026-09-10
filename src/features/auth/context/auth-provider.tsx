import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

import { api, type AuthUser } from '@/lib/api';
import {
  decodeToken,
  getToken,
  isTokenValid,
  removeToken,
  saveToken,
} from '@/lib/auth-token';
import { hydrateAll, resetAll } from '@/store/data-stores';
import { toast } from '@/store/toast-store';
import { translateStatic } from '@/i18n';

import { AuthContext, type AuthContextValue } from './auth-context';

/** Identity we can show immediately from the JWT, before `/auth/me` answers. */
function userFromToken(token: string): AuthUser | null {
  const payload = decodeToken(token);
  if (!payload) return null;
  return {
    id: payload.id,
    email: payload.email,
    role: payload.role,
    firstName: null,
    lastName: null,
    werkstatt: null,
  };
}

/** A store whose GET failed renders as an empty list, which is indistinguishable
 * from a workshop with no data — so say it out loud instead. */
function reportHydrationFailures(failed: number): void {
  if (failed > 0) toast.error(translateStatic('common', 'toasts.loadFailed'));
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const stored = getToken();
  const hadValidToken = isTokenValid(stored);

  const [token, setToken] = useState<string | null>(hadValidToken ? stored : null);
  const [user, setUser] = useState<AuthUser | null>(
    hadValidToken && stored ? userFromToken(stored) : null,
  );
  // A stored token is only *shaped* right until the server confirms it, so the
  // app shows a splash instead of flashing the dashboard and then the login page.
  const [initialising, setInitialising] = useState(hadValidToken);

  // StrictMode mounts effects twice in development; without this the whole
  // working set would be fetched twice on every reload.
  const bootstrapped = useRef(false);

  /** Confirm a restored session and load the working set. */
  useEffect(() => {
    if (!hadValidToken || bootstrapped.current) return;
    bootstrapped.current = true;

    let cancelled = false;
    void (async () => {
      try {
        const me = await api.auth.me();
        if (cancelled) return;
        setUser(me);
        reportHydrationFailures(await hydrateAll());
      } catch {
        // Expired or revoked despite looking valid (or the API is down) — the
        // 401 interceptor has already cleared the token; drop the session.
        if (!cancelled) {
          removeToken();
          setToken(null);
          setUser(null);
          resetAll();
        }
      } finally {
        if (!cancelled) setInitialising(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [hadValidToken]);

  const startSession = useCallback(async (newToken: string, newUser: AuthUser) => {
    // Clear the previous account's rows BEFORE loading the new ones, so nothing
    // from the old session can be visible for even one frame.
    resetAll();
    saveToken(newToken);
    setToken(newToken);
    setUser(newUser);
    reportHydrationFailures(await hydrateAll());
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await api.auth.login(email, password);
      await startSession(res.token, res.user);
    },
    [startSession],
  );

  const register = useCallback(
    async (email: string, password: string, werkstatt?: string) => {
      const res = await api.auth.register(email, password, werkstatt);
      await startSession(res.token, res.user);
    },
    [startSession],
  );

  const logout = useCallback(() => {
    removeToken();
    setToken(null);
    setUser(null);
    resetAll();
  }, []);

  // The axios interceptor dispatches this on any 401 so in-memory auth state
  // is dropped; RequireAuth then redirects through the router.
  useEffect(() => {
    const handler = () => {
      setToken(null);
      setUser(null);
      resetAll();
    };
    window.addEventListener('auth:unauthorized', handler);
    return () => window.removeEventListener('auth:unauthorized', handler);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: isTokenValid(token),
      initialising,
      login,
      register,
      logout,
    }),
    [user, token, initialising, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
