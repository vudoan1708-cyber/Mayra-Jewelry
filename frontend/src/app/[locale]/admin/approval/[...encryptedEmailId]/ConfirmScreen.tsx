'use client'

import { motion } from 'framer-motion';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

export default function ConfirmScreen() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 1.10 }}
      animate={{ opacity: 1, scale: 1 }}
      className="self-center flex items-center justify-center gap-0.5 bg-white shadow-lg p-1 rounded-sm">
      <DotLottieReact
        src="https://lottie.host/bfb3f3c0-6319-482f-90a0-e774c665b65e/US0OjVQhI9.lottie"
        renderConfig={{ autoResize: true }}
        className="w-20 h-20"
        autoplay
      />
      <h3 className="mr-3">Xác nhận thanh toán thành công</h3>
    </motion.div>
  )
}
