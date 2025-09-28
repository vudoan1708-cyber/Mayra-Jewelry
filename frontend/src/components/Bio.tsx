'use client'

import { motion } from 'framer-motion';

import Button from './Button';

export default function Bio() {
  return (
    <header>
      <img src="/images/jewelry/sun.webp" className="logo select-none" alt="Landing image" />
      <motion.aside className="absolute bottom-0 md:bottom-auto md:top-[50%] left-[0] md:left-[10%] max-w-screen-sm md:max-w-lg bg-transparent-white rounded p-2 grid grid-rows-1 gap-2">
        <div className="flex gap-2 items-end">
          <img src="images/logo.webp" className="w-16 h-16" />
          <div className="w-full">
            <h3 className="text-4xl font-bold text-brand-500">Mayra Jewelry</h3>
            <motion.hr className="border-0 border-t border-t-brand-300" />
          </div>
        </div>
        <p>Giới thiệu về kinh doanh, điểm khác biệt với những đối thủ khác cùng lĩnh vực <i>(thí dụ như là việc cho phép người dùng đăng sản phẩm và kinh doanh trên website này)</i> và các sản phẩm giảm giá tại đây</p>
        <Button variant="primary" onClick={() => {}}>Sign up for perks</Button>
      </motion.aside>
    </header>
  )
}
