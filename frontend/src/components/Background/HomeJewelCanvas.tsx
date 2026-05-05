'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

const JewelCanvas = dynamic(() => import('./JewelCanvas'), {
  ssr: false,
  loading: () => null,
});

export default function HomeJewelCanvas() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setEnabled(!mq.matches);
    const onChange = () => setEnabled(!mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  if (!enabled) return null;

  return (
    <div aria-hidden className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      <JewelCanvas />
    </div>
  );
}
