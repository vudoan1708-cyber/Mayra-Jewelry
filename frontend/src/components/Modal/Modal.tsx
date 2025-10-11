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
            className="fixed top-0 left-0 w-dvw h-dvh flex justify-center place-items-center bg-transparent-black backdrop-blur-sm z-50"
            onClick={(e) => { e.stopPropagation(); patchedClose(e); }}>
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`bg-white shadow-md p-2 min-w-[32em] rounded-md ${className}`}>
              <div className="text-lg text-brand-500 w-full flex justify-between">
                <h2 className="text-xl">{title}</h2>
                <X className="cursor-pointer hover:text-brand-400" onClick={(e) => { e.stopPropagation(); onClose(); }} />
              </div>
              <hr className="w-full mb-2" />
              {children}
            </motion.div>
          </motion.div>
        ),
        document.body,
      )}
    </>
  )
}
