'use client'

import { motion } from 'framer-motion';
import { useEffect, useRef } from 'react';

import Button from './Button';
import { LOGO_SCROLLED_PASSED_EVENT } from '../helpers';

export default function Bio() {
  const triggerRef = useRef<HTMLImageElement>(null);
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
    if (triggerRef.current) observer.observe(triggerRef.current);
    if (buttonRef.current) observer.observe(buttonRef.current);

    return () => {
      observer.disconnect();
    };
  }, []);
  return (
    <header>
      <motion.img
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: { duration: 0.4, delay: 0.5 } }}
        src="/images/pixabay-landing-img.webp"
        className="logo select-none object-cover"
        alt="Landing image" />
      <motion.aside
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: { duration: 0.4, delay: 1 } }}
        className="absolute bottom-0 md:bottom-auto md:top-[25%] left-[0] md:left-[10%] max-w-screen-sm md:max-w-md p-2 grid grid-rows-1 gap-4">
        <header className="flex gap-2 items-end">
          <motion.img
            ref={triggerRef}
            whileInView={{ opacity: 1, y: 0 }}
            src="images/logo.webp"
            className="w-24 h- select-none" />
          <div className="w-full">
            <h3 className="text-5xl font-bold text-brand-500">Mayra</h3>
            <h3 className="text-4xl font-bold text-brand-500">Jewelry</h3>
            <motion.hr
              initial={{ width: 0 }}
              animate={{ width: '100%', transition: { duration: 1, delay: 1.6 } }}
              className="border-0 border-t border-t-brand-400" />
          </div>
        </header>
        <ul className="bg-transparent-white md:bg-transparent rounded [list-style-type:'🔖'] p-2 list-inside leading-relaxed">
          <motion.li
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0, transition: { delay: 1.4 } }}>
            Khám phá những mặt hàng nhẫn <b>mới và tinh tế nhất</b> thị trường tại đây
          </motion.li>
          <motion.li
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0, transition: { delay: 1.6 } }}>
            <b>Tư vấn 24/7</b>, phục vụ tận tình
          </motion.li>
          <motion.li
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0, transition: { delay: 1.8 } }}>
            Hàng hư hoặc không yêu thích sau khi mua có thể
            <b> hoàn trả miễn phí </b> 
            <i>(xin vui lòng
              <a href="https://www.facebook.com/mayrajewelry.insaigon" target="_blank"> <u>liên hệ shop</u> </a>
              để thêm thông tin chi tiết về những mặt hàng sẽ được hoàn trả miễn phí trước khi mua sắm ạ)
            </i>
          </motion.li>
        </ul>
        <Button ref={buttonRef} variant="primary" onClick={() => {}}>Đăng nhập nhận quà</Button>
      </motion.aside>
    </header>
  )
}
