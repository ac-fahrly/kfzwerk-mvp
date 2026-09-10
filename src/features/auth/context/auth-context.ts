import { createContext, useContext } from 'react';

import type { AuthUser } from '@/lib/api';

/**
 * App-wide auth state: the current user plus login/register/logout actions.
 * The token itself lives in localStorage (see `@/lib/auth-token`); this context
 * exposes the derived identity and the imperative actions. Provider lives in
 * auth-provider.tsx.
 */
export interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  /** True while the stored token is being verified on first mount. */
  initialising: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, werkstatt?: string) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
