import { encryptPayload } from '@/lib/crypto';

import { getJson, sendJson } from './client';

export interface AuthUser {
  id: string;
  email: string;
  role: string;
  firstName: string | null;
  lastName: string | null;
  werkstatt: string | null;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

export const authApi = {
  /** POST /auth/login with an AES-encrypted `{ email, password }` blob. */
  login: (email: string, password: string) =>
    sendJson<AuthResponse>('post', '/auth/login', {
      data: encryptPayload({ email, password }),
    }),

  /** POST /auth/register — same AES-encrypted payload plus the workshop name. */
  register: (email: string, password: string, werkstatt?: string) =>
    sendJson<AuthResponse>('post', '/auth/register', {
      data: encryptPayload({ email, password, werkstatt }),
    }),

  /** GET /auth/me — used to confirm a stored token is still good. */
  me: () => getJson<AuthUser>('/auth/me'),
};
