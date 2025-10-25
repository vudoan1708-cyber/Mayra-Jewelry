'use client'

import { motion } from 'framer-motion';
import { useEffect, useRef } from 'react';

import Button from './Button';
import { LOGO_SCROLLED_PASSED_EVENT } from '../helpers';
import { HopOff, Percent, Phone, TrendingUp } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Bio() {
  const router = useRouter();
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) {
        window.postMessage({
          event: LOGO_SCROLLED_PASSED_EVENT,
          target: entry?.target?.tagName,
          value: true,
        }, '*');
      } else {
        window.postMessage({
          event: LOGO_SCROLLED_PASSED_EVENT,
          target: entry?.target?.tagName,
          value: false,
        }, '*');
      }
    }, { threshold: 0 });
    if (buttonRef.current) observer.observe(buttonRef.current);

    return () => {
      observer.disconnect();
    };
  }, []);
  return (
    <div className="w-full">
      <motion.img
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: { duration: 0.4, delay: 0.5 } }}
        src="/images/pixabay-landing-img.webp"
        className="w-dvw h-dvh select-none object-cover"
        alt="Landing image" />
      <motion.aside
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: { duration: 0.4, delay: 1 } }}
        className="absolute bottom-0 md:bottom-auto md:top-[25%] left-[0] md:left-[10%] max-w-screen-sm md:max-w-lg p-2 grid grid-rows-1 gap-2">
        <header className="flex gap-2 items-end w-full">
          <div className="w-full">
            <h3 className="text-5xl md:text-6xl font-medium text-brand-500 tracking-wide drop-shadow-lg">Mayra Jewelry</h3>
            {/* <motion.hr
              initial={{ width: 0 }}
              animate={{ width: '100%', transition: { duration: 1, delay: 1.6 } }}
              className="border-0 border-t border-t-brand-400" /> */}
          </div>
        </header>
        <ul className="flex flex-col gap-1 bg-transparent-white md:bg-transparent rounded [list-style-type:none] p-2 list-inside leading-relaxed">
          <motion.li
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0, transition: { delay: 1.4 } }}
            className="text-2xl text-brand-600">
            Khám phá bộ sưu tập nhẫn mới nhất, tinh tế và thời thượng – chỉ có tại Mayra
          </motion.li>

          <motion.li
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { delay: 1.6 } }}
            className="flex gap-1 items-center text-brand-500 mt-2">
            <span className="border border-brand-500 p-1 rounded-[100%]"><Phone /></span>Tư vấn 24/7, phục vụ tận tình
          </motion.li>
          <motion.li
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { delay: 1.8 } }}
            className="flex gap-1 items-center text-brand-500 ">
            <span className="border border-brand-500 p-1 rounded-[100%]"><HopOff /></span>Miễn phí hoàn trả trong vòng 24h
          </motion.li>
          <motion.li
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { delay: 2 } }}
            className="flex gap-1 items-center text-brand-500 ">
            <span className="border border-brand-500 p-1 rounded-[100%]"><Percent /></span>Giảm giá cực mạnh khi đăng hình trang sức lên mạng xã hội
          </motion.li>
          <motion.li
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { delay: 2.2 } }}
            className="flex gap-1 items-center text-brand-500 ">
            <span className="border border-brand-500 p-1 rounded-[100%]"><TrendingUp /></span>Tích điểm mỗi khi mua hàng từ Mayra để được giảm giá
          </motion.li>
        </ul>
        <Button ref={buttonRef} variant="secondary" className="mt-2" transitionOption={{ delay: 2.4 }} onClick={() => { router.push('/account'); }}>Đăng nhập ngay để nhận ưu đãi</Button>
      </motion.aside>
    </div>
  )
}
