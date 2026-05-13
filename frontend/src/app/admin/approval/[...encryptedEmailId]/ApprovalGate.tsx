'use client'

import { Suspense, lazy, useEffect, useRef, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { AnimatePresence } from 'framer-motion';

import { useAdminAuth } from '../../AdminAuthContext';
import { AdminApiError, confirmPayment } from '../../api';

const LazyConfirmScreen = lazy(() => import('./ConfirmScreen'));

type ConfirmState = 'idle' | 'confirming' | 'confirmed' | 'failed';

export default function ApprovalGate({ encryptedId }: { encryptedId: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const { status } = useAdminAuth();
  const [confirmState, setConfirmState] = useState<ConfirmState>('idle');
  const [error, setError] = useState<string | null>(null);
  const requestedRef = useRef(false);

  useEffect(() => {
    if (status === 'anonymous') {
      const next = encodeURIComponent(pathname);
      router.replace(`/admin/login?next=${next}`);
    }
  }, [status, pathname, router]);

  useEffect(() => {
    if (status !== 'authenticated' || requestedRef.current) return;
    requestedRef.current = true;
    setConfirmState('confirming');
    confirmPayment(encryptedId)
      .then(() => setConfirmState('confirmed'))
      .catch((err) => {
        if (err instanceof AdminApiError && err.status === 401) {
          const next = encodeURIComponent(pathname);
          router.replace(`/admin/login?next=${next}`);
          return;
        }
        setError(err instanceof Error ? err.message : 'Confirmation failed');
        setConfirmState('failed');
      });
  }, [status, encryptedId, pathname, router]);

  if (confirmState === 'confirmed') {
    return (
      <Suspense fallback={null}>
        <AnimatePresence mode="wait">
          <LazyConfirmScreen />
        </AnimatePresence>
      </Suspense>
    );
  }

  if (confirmState === 'failed') {
    return (
      <div className="min-h-dvh flex items-center justify-center p-6">
        <div className="bg-white shadow-lg p-6 rounded-sm text-center max-w-md">
          <h3 className="text-brand-700 mb-2">Không thể xác nhận thanh toán</h3>
          {error && <p className="text-sm text-brand-500/80">{error}</p>}
        </div>
      </div>
    );
  }

  return null;
}
