'use client'

import { useSession } from 'next-auth/react';
import { AnimatePresence } from 'framer-motion';

import React, { type JSX } from 'react';

export default function UserSessionWrapper({ children }: { children: JSX.Element }) {
  const session = useSession();
  const clonedChildren = React.cloneElement(
    children,
    { key: 'cloned', sessionStatus: session.status, sessionData: session.data },
  );
  return (
    <AnimatePresence mode="wait">
      {clonedChildren}
    </AnimatePresence>
  )
}
