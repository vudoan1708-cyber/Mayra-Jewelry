'use client'

import { motion } from 'framer-motion';

export type JewelryVariation = {
  key: number,
  style: string,
  label: string,
};

export default function Variation({ key, variation }: { key: string, variation: JewelryVariation }) {
  return (
    <motion.span
      key={key}
      whileHover={{ scale: 1.05, opacity: .9 }}
      transition={{ type: 'spring', stiffness: 300 }}
      className={`border-2 rounded-full w-4 h-4 cursor-pointer hover:shadow-xl ${variation.style}`}
      title={variation.label}>  
    </motion.span>
  )
}
