'use client'

import { useEffect, useRef, useState } from 'react';

import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

const FINISH_DELAY_MS = 220;

export default function TopLoader() {
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const finishTimer = useRef<number | null>(null);

  const cancelFinish = () => {
    if (finishTimer.current !== null) {
      window.clearTimeout(finishTimer.current);
      finishTimer.current = null;
    }
  };

  const start = () => {
    cancelFinish();
    // Defer the state update so we don't violate React's
    // "useInsertionEffect must not schedule updates" rule when a navigation is
    // triggered from inside an insertion effect (e.g. framer-motion internals).
    queueMicrotask(() => setLoading(true));
  };

  const finish = () => {
    cancelFinish();
    finishTimer.current = window.setTimeout(() => {
      setLoading(false);
      finishTimer.current = null;
    }, FINISH_DELAY_MS);
  };

  // Complete the bar whenever the route settles.
  useEffect(() => {
    finish();
    return cancelFinish;
  }, [pathname]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented) return;
      if (e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const anchor = (e.target as HTMLElement | null)?.closest('a');
      if (!anchor) return;
      const target = anchor.getAttribute('target');
      if (target && target !== '' && target !== '_self') return;
      const href = anchor.getAttribute('href');
      if (
        !href ||
        href.startsWith('#') ||
        href.startsWith('mailto:') ||
        href.startsWith('tel:') ||
        href.startsWith('javascript:')
      ) return;

      let url: URL;
      try {
        url = new URL(href, window.location.href);
      } catch {
        return;
      }
      if (url.origin !== window.location.origin) return;
      if (
        url.pathname === window.location.pathname &&
        url.search === window.location.search
      ) return;

      start();
    };
    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, []);

  useEffect(() => {
    const originalPush = window.history.pushState;
    const originalReplace = window.history.replaceState;

    window.history.pushState = function patched(...args) {
      start();
      return originalPush.apply(this, args as Parameters<typeof originalPush>);
    };
    window.history.replaceState = function patched(...args) {
      start();
      return originalReplace.apply(this, args as Parameters<typeof originalReplace>);
    };

    const onPopState = () => start();
    window.addEventListener('popstate', onPopState);

    return () => {
      window.history.pushState = originalPush;
      window.history.replaceState = originalReplace;
      window.removeEventListener('popstate', onPopState);
    };
  }, []);

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          key="topbar"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.25, delay: 0.1 } }}
          className="fixed top-0 left-0 right-0 h-[2px] z-[200] pointer-events-none overflow-hidden"
        >
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: [0, 0.25, 0.45, 0.75, 0.9] }}
            exit={{ scaleX: 1 }}
            transition={{
              scaleX: {
                duration: 1.6,
                times: [0, 0.10, 0.30, 0.60, 1.0],
                ease: 'easeOut',
              },
            }}
            style={{
              transformOrigin: 'left',
              height: '100%',
              background:
                'linear-gradient(90deg, rgba(253,246,236,0.2) 0%, #fbeed4 25%, #e9c8a0 50%, #d4a373 70%, #e9c8a0 88%, rgba(253,246,236,0.2) 100%)',
              boxShadow:
                '0 0 10px rgba(212, 163, 115, 0.7), 0 0 4px rgba(233, 200, 160, 0.95)',
            }}
          >
            <motion.div
              animate={{ x: ['-100%', '100%'] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
              style={{
                width: '40%',
                height: '100%',
                background:
                  'linear-gradient(90deg, transparent 0%, rgba(255, 248, 220, 0.85) 50%, transparent 100%)',
                filter: 'blur(1px)',
              }}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
