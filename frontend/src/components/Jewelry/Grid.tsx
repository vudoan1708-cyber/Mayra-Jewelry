'use client'

import { motion } from 'framer-motion';

import type { CSSProperties } from 'react';

export default function Grid({ children, style }: { children: React.ReactNode, style?: CSSProperties }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 100 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 1.2, ease: "easeOut" }}
      viewport={{ once: true }}
      className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12 m-6 mt-0 list-none" style={style}>
      {children}
    </motion.div>
  );
}
