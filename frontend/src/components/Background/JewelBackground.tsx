'use client';

import { useMemo } from 'react';

const GRAIN_SVG = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 240 240'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.83 0 0 0 0 0.64 0 0 0 0 0.45 0 0 0 0.7 0'/></filter><rect width='100%' height='100%' filter='url(#n)'/></svg>`;

export default function JewelBackground() {
  const grainUrl = useMemo(
    () => `url("data:image/svg+xml;utf8,${encodeURIComponent(GRAIN_SVG)}")`,
    [],
  );

  return (
    <div aria-hidden className="fixed inset-0 -z-10 overflow-hidden bg-[#000814]">
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 90% 70% at 50% -20%, rgba(212, 163, 115, 0.14) 0%, rgba(0, 18, 42, 0.92) 35%, rgba(0, 8, 20, 1) 70%)',
        }}
      />

      <div
        className="absolute inset-x-0 top-0 h-[70vh] mix-blend-screen"
        style={{
          background:
            'radial-gradient(70% 90% at 50% -10%, rgba(255, 244, 214, 0.07) 0%, rgba(255, 244, 214, 0.02) 50%, transparent 80%)',
        }}
      />

      <div
        className="absolute inset-x-0 bottom-0 h-[55vh]"
        style={{
          background:
            'linear-gradient(180deg, transparent 0%, rgba(0, 8, 20, 0.55) 60%, rgba(0, 8, 20, 0.85) 100%)',
        }}
      />

      <div
        className="absolute inset-0 opacity-[0.18] mix-blend-soft-light pointer-events-none"
        style={{
          backgroundImage: grainUrl,
          backgroundSize: '240px 240px',
        }}
      />
    </div>
  );
}
