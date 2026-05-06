'use client'

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { adminWhoami, getSessionToken, setSessionToken } from './api';
import { AdminAuthContext, type AdminAuthStatus } from './AdminAuthContext';

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [status, setStatus] = useState<AdminAuthStatus>('loading');

  useEffect(() => {
    const token = getSessionToken();
    if (!token) {
      setStatus('anonymous');
      return;
    }
    adminWhoami()
      .then((data) => {
        if (data?.email) {
          setEmail(data.email);
          setStatus('authenticated');
        } else {
          setSessionToken(null);
          setStatus('anonymous');
        }
      })
      .catch(() => {
        setSessionToken(null);
        setStatus('anonymous');
      });
  }, []);

  const setSession = useCallback((token: string, signedInEmail: string) => {
    setSessionToken(token);
    setEmail(signedInEmail);
    setStatus('authenticated');
  }, []);

  const signOut = useCallback(() => {
    setSessionToken(null);
    setEmail(null);
    setStatus('anonymous');
    router.push('/admin/login');
  }, [router]);

  return (
    <AdminAuthContext.Provider value={{ status, email, setSession, signOut }}>
      {children}
    </AdminAuthContext.Provider>
  );
}
