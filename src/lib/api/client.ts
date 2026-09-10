/**
 * Shared HTTP client for the whole frontend API layer.
 *
 * Every store talks to the real backend (kfzwerk-mvp-backend) through
 * `api.<domain>.<action>()` (see `./index`). axios lives ONLY here — no
 * component, store or hook touches it directly.
 */
import axios from 'axios';

import { getToken, removeToken } from '@/lib/auth-token';

/** Base URL of the NestJS backend. */
export const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3002/api';

/** The single axios instance. axios sets the JSON Content-Type automatically
 * when a request carries a body. */
export const http = axios.create({ baseURL: API_URL });

/** Attach the stored JWT as a Bearer header on every request. */
http.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/** On a 401, drop the (now-invalid) token and notify the AuthProvider via a
 * window event. The provider clears its in-memory state and the RequireAuth
 * guard then redirects to /login through the router — no full-page reload, so
 * the SPA (theme, i18n) and the attempted-URL `from` state survive. */
http.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      removeToken();
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('auth:unauthorized'));
      }
    }
    return Promise.reject(error);
  },
);

/** HTTP write verbs accepted by `sendJson`. axios accepts lowercase methods. */
export type HttpMethod = 'post' | 'put' | 'patch' | 'delete';

/** HTTP GET. */
export async function getJson<T>(path: string): Promise<T> {
  const res = await http.get<T>(path);
  return res.data;
}

/** HTTP write (post/put/patch/delete) with an optional JSON body. */
export async function sendJson<T>(
  method: HttpMethod,
  path: string,
  body?: unknown,
): Promise<T> {
  const res = await http.request<T>({ method, url: path, data: body });
  return res.data;
}

/**
 * The backend's message for a failed request, if it sent one. Nest's exception
 * filter puts it in `response.data.message` — a string for our thrown
 * exceptions, an array for ValidationPipe failures.
 */
export function serverError(err: unknown, fallback: string): string {
  const data = (err as { response?: { data?: { message?: unknown } } } | null)?.response
    ?.data;
  const message = data?.message;
  if (typeof message === 'string') return message;
  if (Array.isArray(message) && typeof message[0] === 'string') return message[0];
  return fallback;
}
