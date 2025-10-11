import { AnimatePresence } from 'framer-motion';

import { auth } from '../auth';
import LoginForm from '../../components/LoginForm/LoginForm';
import AlreadySignedIn from './AlreadySignedIn';

export default async function SelectProvider() {
  const session = await auth();

  if (!session) {
    return (
      <AnimatePresence mode="wait">
        <LoginForm title="Hãy lưu trữ<br /> các món đồ yêu thích của bạn" />
      </AnimatePresence>
    )
  }

  return (
    <AlreadySignedIn userName={session.user?.name ?? ''} userImage={session.user?.image ?? ''} />
  )
}
