import type { Session } from 'next-auth';
import { AnimatePresence } from 'framer-motion';

import LoginForm from '../../components/LoginForm/LoginForm';
import AlreadySignedIn from './AlreadySignedIn';
import type { Order } from '../../../types';

export default function SelectProvider({ session, orders }: { session: Session | null; orders?: Array<Order> }) {
  if (!session || !orders) {
    return (
      <AnimatePresence mode="wait">
        <LoginForm title="Hãy lưu trữ<br /> các món đồ yêu thích của bạn" />
      </AnimatePresence>
    )
  }

  return (
    <AlreadySignedIn userName={session.user?.name ?? ''} userImage={session.user?.image ?? ''} orders={orders} />
  )
}
