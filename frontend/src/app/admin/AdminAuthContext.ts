'use client'

import { createContext, useContext } from 'react';

export type AdminAuthStatus = 'loading' | 'authenticated' | 'anonymous';

export type AdminAuthContextValue = {
  status: AdminAuthStatus;
  email: string | null;
  setSession: (token: string, email: string) => void;
  signOut: () => void;
};

export const AdminAuthContext = createContext<AdminAuthContextValue>({
  status: 'loading',
  email: null,
  setSession: () => {},
  signOut: () => {},
});

export const useAdminAuth = () => useContext(AdminAuthContext);
