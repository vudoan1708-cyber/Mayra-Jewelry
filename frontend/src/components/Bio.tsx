'use client'

import { motion } from 'framer-motion';

export default function Bio() {
  return (
    <header>
      <img src="/images/sun.jpg" className="logo" alt="Landing image" />
      <motion.aside className="absolute top-[50%] left-[0] md:left-[25%] max-w-screen-sm md:max-w-xl bg-transparent-white rounded p-2">
        <h3 className="text-4xl font-bold text-brand-500">Mayra Jewelry</h3>
        <motion.hr className="border-0 border-t border-t-brand-300" />
        <p>Discover our handcrafted silver 5 white gold jewelry</p>
      </motion.aside>
    </header>
  )
}
