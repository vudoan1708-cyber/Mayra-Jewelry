'use client'

import type { Session } from 'next-auth';
import { AnimatePresence } from 'framer-motion';

import LoginForm from '../../components/LoginForm/LoginForm';
import AlreadySignedIn from './AlreadySignedIn';
import type { Order } from '../../../types';
import { useEffect, useState } from 'react';

export default function SelectProvider({ session, orders, autoSignIn = false, redirection }: { session: Session | null; orders?: Array<Order>; autoSignIn: boolean; redirection?: string }) {
  const [redirectTo, setRedirectTo] = useState<string | undefined>('');

  useEffect(() => {
    setRedirectTo(window.atob(redirection ?? '') ?? undefined);
  }, []);
  if (!session || !orders) {
    return (
      <AnimatePresence mode="wait">
        <LoginForm title="Hãy đăng nhập để lưu trữ<br /> các món đồ yêu thích của bạn" autoSignIn={autoSignIn} redirectTo={redirectTo} />
      </AnimatePresence>
    )
  }

  return (
    <AlreadySignedIn userName={session.user?.name ?? ''} userImage={session.user?.image ?? ''} orders={orders} />
  )
}
