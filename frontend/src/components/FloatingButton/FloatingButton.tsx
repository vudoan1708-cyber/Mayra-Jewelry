'use client'

import type { HTMLAttributeAnchorTarget } from 'react';
import { motion } from 'framer-motion';

type FloatingButtonProps = {
  children: React.ReactNode,
  type?: 'link' | 'division',
  anchorLeft?: boolean,
  anchorRight?: boolean,
  anchorTop?: boolean,
  anchorBottom?: boolean,
  width?: string,
  height?: string,
  href?: string,
  target?: HTMLAttributeAnchorTarget,
  className?: string,
};

export default function FloatingButton({ children, type = 'link', anchorLeft, anchorRight, anchorTop, anchorBottom, width = '12', height = '12', href ='/', target = '_blank', className = '' }: FloatingButtonProps) {
  if (type === 'link') {
    return (
      <motion.a
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        whileInView={{ opacity: 1 }}
        href={href}
        target={target}
        className={`fixed ${anchorBottom ? 'bottom-0' : ''} ${anchorRight ? 'right-0' : ''} ${anchorLeft ? 'left-0' : ''} ${anchorTop ? 'top-0' :''} m-3 w-${width} h-${height} rounded-full text-brand-500 hover:scale-110 transition-all ${className}`}
        style={{ position: "-webkit-sticky" }}>
        {children}
      </motion.a>
    )
  }

  if (type === 'division') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        whileInView={{ opacity: 1 }}
        className={`fixed ${anchorBottom ? 'bottom-0' : ''} ${anchorRight ? 'right-0' : ''} ${anchorLeft ? 'left-0' : ''} ${anchorTop ? 'top-0' :''} m-3 w-${width} h-${height} rounded-full text-brand-500 hover:scale-110 transition-all ${className}`}
        style={{ position: "-webkit-sticky" }}>
        {children}
      </motion.div>
    )
  }
}
