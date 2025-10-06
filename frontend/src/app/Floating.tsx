'use client'

import { useEffect, useState } from 'react';
import Button from '../components/Button';
import FloatingButton from '../components/FloatingButton/FloatingButton';
import { LOGO_SCROLLED_PASSED_EVENT } from '../helpers';

export default function Floating() {
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
      <FloatingButton anchorBottom anchorRight href="https://www.facebook.com/mayrajewelry.insaigon" target="_blank">
        <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 drop-shadow-2xl shadow-2xl shadow-brand-500 rounded-full"><title>Facebook</title><path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z"/></svg>
      </FloatingButton>
      {logoIntersected && (
        <FloatingButton anchorBottom anchorLeft width="auto">
          <Button variant="primary" onClick={() => {}}>Đăng nhập nhận quà</Button>
        </FloatingButton>
      )}
    </>
  )
}
