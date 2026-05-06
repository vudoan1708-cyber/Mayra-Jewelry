'use client'

const SESSION_KEY = 'mayra_admin_session';
const PENDING_KEY = 'mayra_admin_pending';

export type LoginResponse = { pendingToken: string };
export type SessionResponse = { sessionToken: string; email: string; expiresIn: number };
export type WhoamiResponse = { id: string; email: string };

export class AdminApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

const baseUrl = () => process.env.NEXT_PUBLIC_BACKEND_URL ?? '';

const parseError = async (res: Response, fallback: string): Promise<AdminApiError> => {
  try {
    const body = await res.json();
    return new AdminApiError(body?.message || fallback, res.status);
  } catch {
    return new AdminApiError(fallback, res.status);
  }
};

export const getSessionToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return window.sessionStorage.getItem(SESSION_KEY);
};

export const setSessionToken = (token: string | null) => {
  if (typeof window === 'undefined') return;
  if (token === null) window.sessionStorage.removeItem(SESSION_KEY);
  else window.sessionStorage.setItem(SESSION_KEY, token);
};

export const getPendingToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return window.sessionStorage.getItem(PENDING_KEY);
};

export const setPendingToken = (token: string | null) => {
  if (typeof window === 'undefined') return;
  if (token === null) window.sessionStorage.removeItem(PENDING_KEY);
  else window.sessionStorage.setItem(PENDING_KEY, token);
};

export const adminLogin = async (email: string, password: string): Promise<LoginResponse> => {
  const res = await fetch(`${baseUrl()}/api/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw await parseError(res, 'Sign-in failed');
  return res.json();
};

export const adminVerifyTotp = async (pendingToken: string, code: string): Promise<SessionResponse> => {
  const res = await fetch(`${baseUrl()}/api/admin/login/totp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pendingToken, code }),
  });
  if (!res.ok) throw await parseError(res, 'Verification failed');
  return res.json();
};

export const adminFetch = async <T>(path: string, init?: RequestInit): Promise<T | null> => {
  const token = getSessionToken();
  if (!token) throw new AdminApiError('Not signed in', 401);
  const res = await fetch(`${baseUrl()}${path}`, {
    ...init,
    headers: {
      ...(init?.headers ?? {}),
      Authorization: `Bearer ${token}`,
    },
  });
  if (res.status === 401) {
    setSessionToken(null);
    throw new AdminApiError('Session expired', 401);
  }
  if (!res.ok) throw await parseError(res, `Request failed (${res.status})`);
  if (res.status === 204) return null;
  return res.json();
};

export const adminWhoami = () => adminFetch<WhoamiResponse>('/api/admin/whoami');
