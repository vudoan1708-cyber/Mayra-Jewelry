'use client'

import { useEffect, useRef, type MouseEventHandler } from 'react';
import ReactDOM from 'react-dom';

import { motion } from 'framer-motion';

import { X } from 'lucide-react';

export default function Modal({ children, title, className, onClose }: { children: React.ReactNode, title: string, className?: string, onClose: () => void }) {
  const backgroundRef = useRef<HTMLDivElement>(null);

  const patchedClose: MouseEventHandler = (e) => {
    if (e.target !== backgroundRef.current) {
      return;
    }
    onClose();
  };

  useEffect(() => {
    window.addEventListener('keydown', (e) => {
      if (e.key !== 'Escape') return;
      onClose();
    });
  }, []);
  return (
    <>
      {ReactDOM.createPortal(
        (
          <motion.div
            key="fade"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            ref={backgroundRef}
            className="fixed top-0 left-0 w-dvw h-dvh flex justify-center place-items-center bg-brand-700/60 backdrop-blur-sm z-[100]"
            onClick={(e) => { e.stopPropagation(); patchedClose(e); }}>
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`bg-accent-100 border border-accent-300/40 shadow-2xl shadow-black/40 p-5 min-w-[32em] rounded-2xl text-brand-700 ${className}`}>
              <div className="w-full flex items-center justify-between gap-3 mb-3">
                <h2 className="text-base sm:text-lg uppercase tracking-[0.2em] font-semibold text-brand-700">{title}</h2>
                <X className="cursor-pointer text-brand-700 hover:text-accent-600 transition-colors size-5" onClick={(e) => { e.stopPropagation(); onClose(); }} />
              </div>
              <hr className="w-full mb-4 border-accent-500/30" />
              {children}
            </motion.div>
          </motion.div>
        ),
        document.body,
      )}
    </>
  )
}
