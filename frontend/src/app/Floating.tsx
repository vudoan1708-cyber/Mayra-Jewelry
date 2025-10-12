'use client'

import { useEffect, useState } from 'react';
import Button from '../components/Button';
import FloatingButton from '../components/FloatingButton/FloatingButton';
import { LOGO_SCROLLED_PASSED_EVENT } from '../helpers';
import TawkChat from '../components/TawkChat/TawkChat';
import { useRouter } from 'next/navigation';

export default function Floating() {
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
      {logoIntersected && (
        <FloatingButton type="division" anchorBottom anchorLeft width="auto">
          <Button variant="primary" onClick={() => { router.push('/account'); }}>Đăng nhập để nhận ưu đãi</Button>
        </FloatingButton>
      )}
    </>
  )
}
