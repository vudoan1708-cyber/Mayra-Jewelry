import { AnimatePresence } from 'framer-motion';

import { auth } from '../auth';
import LoginForm from './LoginForm';
import AlreadySignedIn from './AlreadySignedIn';

export default async function SelectProvider() {
  const session = await auth();

  if (!session) {
    return (
      <AnimatePresence mode="wait">
        <LoginForm />
      </AnimatePresence>
    )
  }

  return (
    <AlreadySignedIn userName={session.user?.name ?? ''} userImage={session.user?.image ?? ''} />
  )
}
