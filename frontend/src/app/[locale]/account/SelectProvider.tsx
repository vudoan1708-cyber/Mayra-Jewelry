'use client';

import type { Session } from 'next-auth';
import { AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';

import LoginForm from '../../../components/LoginForm/LoginForm';
import AlreadySignedIn from './AlreadySignedIn';
import type { Buyer, Order } from '../../../../types';

export default function SelectProvider({
  session,
  orders,
  buyer,
  autoSignIn = false,
  redirection = undefined,
}: {
  session: Session | null;
  orders?: Array<Order>;
  buyer?: Buyer;
  autoSignIn: boolean;
  redirection?: string;
}) {
  const t = useTranslations('loginForm');
  const redirectTo = Buffer.from(redirection ?? '', 'base64').toString('utf-8') ?? undefined;
  if (!session || !orders || !buyer) {
    return (
      <AnimatePresence mode="wait">
        <LoginForm title={t.raw('wishlistTitle')} autoSignIn={autoSignIn} redirectTo={redirectTo} />
      </AnimatePresence>
    )
  }

  return (
    <AlreadySignedIn
      userName={session.user?.name ?? ''}
      userImage={session.user?.image ?? ''}
      userPoint={buyer.mayraPoint}
      userTier={buyer.tier}
      orders={orders} />
  )
}
