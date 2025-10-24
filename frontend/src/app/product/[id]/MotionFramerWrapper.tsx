'use client'

import { motion } from 'framer-motion'
import React from 'react'

export default function MotionFramerWrapper({ children }: { children: React.ReactNode }) {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { delay: 1, duration: 0.2 } }}
      className="col-span-1 md:col-span-2">
      <h2 className="text-2xl text-brand-500 font-semibold mt-6 self-start">Những món hàng được view thường xuyên</h2>
      <div className="flex gap-2 overflow-hidden">
        {children}
      </div>
    </motion.section>
  )
}
