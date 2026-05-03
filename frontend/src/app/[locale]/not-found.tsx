'use client'

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

export default function Custom404() {
  const router = useRouter();
  return (
    <div className="flex flex-col items-center justify-center w-screen h-dvh p-2 bg-gray-100 text-center">
      <motion.h1
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-7xl font-extrabold text-gray-800 mb-4"
      >
        404
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-lg text-gray-600 mb-8"
      >
        Trang này không tồn tại.
      </motion.p>

      <a onClick={() => { router.push('/'); }}>
          Quay về trang chủ
      </a>
    </div>
  )
}
