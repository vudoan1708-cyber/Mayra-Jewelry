'use client'

import { useRouter } from 'next/navigation';

import { useSession } from 'next-auth/react';

import { motion, useAnimation, type LegacyAnimationControls } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

import Button from './Button';
import { LOGO_SCROLLED_PASSED_EVENT } from '../helpers';
import { HopOff, Percent, Phone, TrendingUp } from 'lucide-react';

const PROMOTION_INFO = 'extra_nav_info';
const letters = [ 'M', 'a' , 'y', 'r', 'a', '&nbsp;', 'J', 'e', 'w', 'e', 'l', 'r', 'y' ];

export default function Bio() {
  const session = useSession();
  const router = useRouter();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const headerRef = useRef<HTMLHeadElement>(null);
  const hasAnimated = useRef(false);
  const controls: Array<LegacyAnimationControls> = [];
  const [titleTopPosition, setTitleTopPosition] = useState<string>('sm:absolute sm:top-[104px]');

  const finalState = { opacity: 1, y: 0, scale: 1 };
  const bounceTransition = useRef({
    type: 'spring',
    stiffness: 180,
    damping: 10,
    mass: 0.8,
    duration: 0.2,
  });

  const Letter = ({ letter, idx }: { letter: string, idx: number }) => {
    controls[idx] = useAnimation();
    useEffect(() => {
      if (hasAnimated.current) {
        controls[idx].set(finalState);
        return;
      }
      const sequence = async () => {
        // Step 1: fade + move in (delayed by idx)
        await controls[idx].start({
          opacity: 1,
          y: 0,
          transition: {
            duration: 0.3,
            delay: 1.9,
          },
        });

        // Step 2: scale bounce && color animation
        await controls[idx].start({
          scale: [1, 1.2, 1],
          color: ['#ffffff', '#001B3D', '#ffffff'],
          transition: {
            ...bounceTransition, 
            duration: 0.4,
            delay: (idx * 0.1) + 0.2},
        });

        hasAnimated.current = true;
      };

      sequence();
    }, []);

    const updateLetter = (action: 'hover' | 'leave') => {
      controls[idx].start({
        color: action === 'hover' ? 'var(--brand-500)' : '#fff',
        transition: { duration: 0.2 },
      });
    };
    return (
      <motion.h3
        initial={{ opacity: 0, y: -10, scale: 1 }}
        animate={controls[idx]}
        whileHover={{ scale: 1.2, transition: { ...bounceTransition } }}
        className="text-5xl md:text-7xl font-medium text-white tracking-wide drop-shadow-lg font-[CocoBiker]"
        style={{
          WebkitTextStroke: '0.2px var(--brand-300)',
        }}
        onMouseEnter={() => { updateLetter('hover'); }}
        onMouseLeave={() => { updateLetter('leave'); }}
        dangerouslySetInnerHTML={{ __html: letter }}>
      </motion.h3>
    )
  };

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.target?.id === PROMOTION_INFO) {
        setTitleTopPosition(!entry.isIntersecting ? 'sm:fixed sm:top-[60px]' : 'sm:absolute sm:top-[104px]');
        return;
      }
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

    observer.observe(document.getElementById(PROMOTION_INFO) as HTMLElement);

    return () => {
      observer.disconnect();
    };
  }, []);
  return (
    <div className="w-full">
      <style>
        @import url('https://fonts.cdnfonts.com/css/cocobiker');
      </style>
      <motion.img
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: { duration: 0.4, delay: 0.5 } }}
        src="/images/pixabay-landing-img.webp"
        className="w-dvw h-dvh select-none object-cover"
        alt="Landing image" />
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: '100%', transition: { duration: .7, delay: 1, type: 'tween' } }}
        className={`flex items-center justify-center absolute top-[20%] ${titleTopPosition} left-[0] h-[80px] sm:h-[100px] bg-white/25 shadow-md z-10`}>
        <header ref={headerRef} className="flex gap-2 items-end w-max cursor-default">
          <div className="flex gap-[1px]">
            {letters.map((letter, idx) => (
              <Letter key={idx} letter={letter} idx={idx} />
            ))}
          </div>
        </header>
      </motion.div>
      <motion.aside
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: { duration: 0.4, delay: 1 } }}
        className="absolute bottom-0 md:bottom-auto md:top-[40%] left-[0] md:left-[10%] max-w-screen-sm md:max-w-lg p-2 grid grid-rows-1 gap-2">
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
        {session.status !== 'authenticated' && (
          <Button ref={buttonRef} variant="secondary" className="mt-2" transitionOption={{ delay: 2.4 }} onClick={() => { router.push('/account'); }}>Đăng nhập ngay để nhận ưu đãi</Button>
        )}
      </motion.aside>
    </div>
  )
}
