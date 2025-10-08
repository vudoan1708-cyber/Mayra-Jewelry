'use client'

import { motion } from 'framer-motion';
import { type MouseEventHandler } from 'react';

export type JewelryVariation = {
  key: number,
  style: string,
  label: string,
};

export default function Variation({ variation, selected, onSelect }: { variation: JewelryVariation, selected?: number, onSelect?: MouseEventHandler<HTMLSpanElement> | undefined
 }) {
  const notSelected = selected !== variation.key;
  return (
    <motion.span
      whileHover={{ scale: notSelected ? 1.05 : 1, opacity: notSelected ? .9 : 1 }}
      transition={{ type: 'spring', stiffness: 300 }}
      className={`border-2 rounded-full w-4 h-4 cursor-pointer hover:shadow-xl ${variation.style} ${selected === variation.key && 'w-[27px] h-[27px] shadow-lg border-brand-500'}`}
      title={variation.label}
      onClick={onSelect}>  
    </motion.span>
  )
}
