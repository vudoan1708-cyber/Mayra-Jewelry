'use client'

import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'
import React from 'react'

export default function MotionFramerWrapper({ children }: { children: React.ReactNode }) {
  const t = useTranslations('product');
  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { delay: 1, duration: 0.2 } }}
      className="col-span-1 md:col-span-2 px-3 md:px-6 max-w-7xl mx-auto w-full">
      <h2 className="text-2xl text-accent-100 font-semibold mt-6 mb-3 tracking-tight drop-shadow">{t('frequentlyViewed')}</h2>
      <div className="flex gap-3 overflow-x-auto no-scrollbar -mx-3 md:-mx-6 px-3 md:px-6">
        {children}
      </div>
    </motion.section>
  )
}
