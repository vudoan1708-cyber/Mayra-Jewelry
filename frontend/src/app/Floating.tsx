'use client'

import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

import { useEffect, useState } from 'react';

import Button from '../components/Button';
import FloatingButton from '../components/FloatingButton/FloatingButton';
import TawkChat from '../components/TawkChat/TawkChat';

import { LOGO_SCROLLED_PASSED_EVENT } from '../helpers';

export default function Floating() {
  const session = useSession();
  const router = useRouter();
  const [logoIntersected, setLogoIntersected] = useState<boolean>(false);

  useEffect(() => {
    window.addEventListener('message', (e) => {
      if (e.data?.target === 'BUTTON') {
        setLogoIntersected(e.data?.event === LOGO_SCROLLED_PASSED_EVENT && e.data?.value);
      }
    });
  }, []);
  
  return (
    <>
      <FloatingButton anchorBottom anchorRight>
        <TawkChat />
      </FloatingButton>
      {session.status !== 'authenticated' && logoIntersected && (
        <FloatingButton type="division" anchorBottom anchorLeft width="auto">
          <Button variant="primary" onClick={() => { router.push('/account'); }}>Đăng nhập để nhận ưu đãi</Button>
        </FloatingButton>
      )}
    </>
  )
}
