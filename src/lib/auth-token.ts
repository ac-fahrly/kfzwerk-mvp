/**
 * Auth token storage + decoding. The backend returns a JWT on login; we keep it
 * in localStorage and attach it as a Bearer header on every request (see the
 * axios interceptor in `./api/client`). The token payload identifies the user.
 */
const TOKEN_KEY = 'kfz.token';

export interface TokenPayload {
  id: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

export function saveToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function removeToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

/** Decode the JWT payload (base64url) without verifying the signature. This is
 * a UX read only — the server verifies every request. */
export function decodeToken(token: string): TokenPayload | null {
  try {
    const part = token.split('.')[1];
    if (!part) return null;
    const base64 = part.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
    return JSON.parse(atob(padded)) as TokenPayload;
  } catch {
    return null;
  }
}

/** True when the token exists and (if it carries an `exp`) has not expired. */
export function isTokenValid(token: string | null): boolean {
  if (!token) return false;
  const decoded = decodeToken(token);
  if (!decoded) return false;
  if (!decoded.exp) return true;
  return decoded.exp * 1000 > Date.now();
}
