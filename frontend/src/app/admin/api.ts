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

const safeFetch = async (url: string, init: RequestInit, method: string): Promise<Response> => {
  try {
    return await fetch(url, init);
  } catch (err) {
    const detail = err instanceof Error ? err.message : 'fetch error';
    throw new AdminApiError(
      `Network error on ${method} ${url} (${detail}). Check the backend is reachable and CORS allows the method.`,
      0,
    );
  }
};

export const adminFetch = async <T>(path: string, init?: RequestInit): Promise<T | null> => {
  const token = getSessionToken();
  if (!token) throw new AdminApiError('Not signed in', 401);
  const url = `${baseUrl()}${path}`;
  const method = (init?.method ?? 'GET').toUpperCase();
  const res = await safeFetch(url, {
    ...init,
    headers: {
      ...(init?.headers ?? {}),
      Authorization: `Bearer ${token}`,
    },
  }, method);
  if (res.status === 401) {
    setSessionToken(null);
    throw new AdminApiError('Session expired', 401);
  }
  if (!res.ok) throw await parseError(res, `${method} ${path} failed (${res.status})`);
  if (res.status === 204) return null;
  return res.json();
};

export const adminWhoami = () => adminFetch<WhoamiResponse>('/api/admin/whoami');

export type AdminJewelryPrice = {
  id?: number;
  variation: 'Silver' | 'Gold' | 'White Gold';
  amount: number;
  currency: string;
  discount: number;
};

export type AdminJewelryMedia = {
  url: string;
  fileName: string;
};

export type JewelryTranslation = {
  itemName?: string;
  description?: string;
  featureCollection?: string;
};

export type JewelryTranslations = Record<string, JewelryTranslation>;

export type AdminJewelry = {
  directoryId: string;
  itemName: string;
  description: string;
  purchases: number;
  featureCollection: string;
  bestSeller: boolean;
  type: 'ring' | 'bracelet';
  views: number;
  currency: string;
  inStock: boolean;
  giftable: boolean;
  translations?: JewelryTranslations | null;
  prices: AdminJewelryPrice[];
  media: AdminJewelryMedia[];
};

export type AdminBanner = {
  id: number;
  enText: string;
  viText: string;
  active: boolean;
  updatedAt: string;
};

export type AdminJewelryUpdate = {
  itemName?: string;
  description?: string;
  featureCollection?: string;
  giftable?: boolean;
  translations?: JewelryTranslations;
  prices?: Array<{
    variation: AdminJewelryPrice['variation'];
    amount: number;
    currency: string;
    discount: number;
  }>;
};

const jsonHeaders = { 'Content-Type': 'application/json' } as const;

export const listAdminJewelry = () => adminFetch<AdminJewelry[]>('/api/admin/jewelry');

export const getAdminJewelry = (directoryId: string) =>
  adminFetch<AdminJewelry>(`/api/admin/jewelry/${encodeURIComponent(directoryId)}`);

export const createAdminJewelry = (formData: FormData) =>
  adminFetch<{ directoryId: string }>('/api/admin/jewelry', {
    method: 'POST',
    body: formData,
  });

export const updateAdminJewelry = (directoryId: string, payload: AdminJewelryUpdate) =>
  adminFetch<null>(`/api/admin/jewelry/${encodeURIComponent(directoryId)}`, {
    method: 'PATCH',
    headers: jsonHeaders,
    body: JSON.stringify(payload),
  });

export const uploadAdminJewelryMedia = (directoryId: string, formData: FormData) =>
  adminFetch<null>(`/api/admin/jewelry/${encodeURIComponent(directoryId)}/media`, {
    method: 'POST',
    body: formData,
  });

export const deleteAdminJewelryMedia = (directoryId: string, fileName: string) =>
  adminFetch<null>(
    `/api/admin/jewelry/${encodeURIComponent(directoryId)}/media/${encodeURIComponent(fileName)}`,
    { method: 'DELETE' },
  );

export const updateAdminBanner = (payload: Partial<Pick<AdminBanner, 'enText' | 'viText' | 'active'>>) =>
  adminFetch<AdminBanner>('/api/admin/site/banner', {
    method: 'PATCH',
    headers: jsonHeaders,
    body: JSON.stringify(payload),
  });

export const getPublicBanner = async (): Promise<AdminBanner | null> => {
  const res = await fetch(`${baseUrl()}/api/site/banner`);
  if (res.status === 204) return null;
  if (!res.ok) return null;
  return res.json();
};

export type AdminUserSummary = {
  id: string;
  email: string;
  disabled: boolean;
  lockedUntil?: string;
  lastLoginAt?: string;
  createdAt: string;
};

export type AdminUserCreated = {
  id: string;
  email: string;
  otpauthURL: string;
};

export const listAdmins = () => adminFetch<AdminUserSummary[]>('/api/admin/users');

export const createAdminUser = (payload: { email: string; password: string }) =>
  adminFetch<AdminUserCreated>('/api/admin/users', {
    method: 'POST',
    headers: jsonHeaders,
    body: JSON.stringify(payload),
  });

export const setAdminDisabled = (id: string, disabled: boolean) =>
  adminFetch<null>(`/api/admin/users/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: jsonHeaders,
    body: JSON.stringify({ disabled }),
  });
