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
    <div className="w-full h-dvh">
      <motion.img
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: { duration: 0.4, delay: 0.5 } }}
        src="/images/landing-img.jpg"
        className="w-dvw h-dvh select-none object-cover"
        alt="Landing image" />
      <motion.header
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: { duration: 0.4, delay: 0.7 } }}
        className="absolute top-[15%] sm:top-[22%] left-[50%] translate-x-[-50%] [text-stroke:1px_white] [-webkit-text-stroke:1px_white]">
        <h3 className="text-8xl sm:text-[150px] font-medium text-brand-500 uppercase font-['CocoBikeR']">Mayra</h3>
      </motion.header>
      <motion.aside
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: { duration: 0.4, delay: 1 } }}
        className="absolute bottom-0 sm:bottom-auto sm:top-[45%] left-[0] sm:left-[50%] sm:translate-x-[-50%] max-w-screen-sm sm:max-w-lg p-2 grid grid-rows-1 gap-2">
        <ul className="flex flex-col gap-1 bg-transparent-black rounded [list-style-type:none] p-2 list-inside leading-relaxed">
          <motion.li
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0, transition: { delay: 1.4 } }}
            className="text-2xl text-brand-200 sm:text-center">
            Khám phá bộ sưu tập nhẫn mới nhất, tinh tế và thời thượng – chỉ có tại Mayra
          </motion.li>

          <motion.li
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { delay: 1.6 } }}
            className="flex gap-1 items-center text-brand-200 mt-2">
            <span className="border border-brand-500 p-1 rounded-[100%]"><Phone /></span>Tư vấn 24/7, phục vụ tận tình
          </motion.li>
          <motion.li
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { delay: 1.8 } }}
            className="flex gap-1 items-center text-brand-200 ">
            <span className="border border-brand-500 p-1 rounded-[100%]"><HopOff /></span>Miễn phí hoàn trả trong vòng 24h
          </motion.li>
          <motion.li
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { delay: 2 } }}
            className="flex gap-1 items-center text-brand-200 ">
            <span className="border border-brand-500 p-1 rounded-[100%]"><Percent /></span>Giảm giá cực mạnh khi đăng hình trang sức lên mạng xã hội
          </motion.li>
          <motion.li
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { delay: 2.2 } }}
            className="flex gap-1 items-center text-brand-200 ">
            <span className="border border-brand-500 p-1 rounded-[100%]"><TrendingUp /></span>Tích điểm mỗi khi mua hàng từ Mayra để được giảm giá
          </motion.li>
        </ul>
        <Button ref={buttonRef} variant="primary" className="mt-2" transitionOption={{ delay: 2.4 }} onClick={() => { router.push('/account'); }}>Đăng nhập ngay để nhận ưu đãi</Button>
      </motion.aside>
    </div>
  )
}
