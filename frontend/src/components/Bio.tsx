'use client'

import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

import { useEffect, useRef } from 'react';

import gsap from 'gsap';

import { HopOff, Percent, Phone, TrendingUp } from 'lucide-react';

import { motion, useAnimation, type LegacyAnimationControls } from 'framer-motion';

import Button from './Button';
import { LOGO_SCROLLED_PASSED_EVENT } from '../helpers';

const letters = [ 'M', 'a' , 'y', 'r', 'a', '&nbsp;', 'J', 'e', 'w', 'e', 'l', 'r', 'y' ];

export default function Bio() {
  const session = useSession();
  const router = useRouter();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const headerSectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLHeadElement>(null);
  const asideRef = useRef<HTMLElement>(null);
  const controls: Array<LegacyAnimationControls> = [];

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
      const sequence = async () => {
        // Step 1: fade + move in (delayed by idx)
        await controls[idx].start({
          opacity: 1,
          y: 0,
          transition: {
            duration: 0.3,
            delay: 0.2,
          },
        });

        // Step 2: scale bounce && color animation
        await controls[idx].start({
          scale: [1, 1.2, 1],
          color: ['#ffffff', '#001B3D', '#ffffff'],
          transition: {
            ...bounceTransition, 
            duration: 0.4,
            delay: (idx * 0.1) + 0.2
          },
        });
        // Step 3: reinforce the theme colour
        await controls[idx].start({
          color: ['#001B3D'],
          transition: {
            ...bounceTransition, 
            duration: 0.4,
            delay: 0.5 + ((letters.length * 0.25) + 0.2),
          },
        });
      };

      sequence();
    }, []);

    const updateLetter = (action: 'hover' | 'leave') => {
      controls[idx].start({
        color: action === 'hover' ? '#fff' : 'var(--brand-500)',
        transition: { duration: 0.2 },
      });
    };

    const randomSize = idx % 2 === 0 ? 'md:text-[120px]' : 'md:text-[72px]';
    return (
      <motion.h3
        initial={{ opacity: 0, y: -10, scale: 1 }}
        animate={controls[idx]}
        whileHover={{ scale: 1.2, transition: { ...bounceTransition } }}
        className={`text-5xl ${randomSize} font-medium text-white tracking-wide drop-shadow-lg font-[CocoBiker]`}
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

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: headerSectionRef.current,
          start: 'center center',
          end: '+=150%',
          pin: true,
          scrub: true,
          // anticipatePin: 1,
        },
      });

      // Animate the header fade-out before next content scrolls
      tl.to(headerRef.current, { opacity: 0, scale: 0.9, y: -100, duration: 1 })
        .to(asideRef.current, { opacity: 1, y: 0, duration: 1.5 }, '>-0.2');
    }, headerSectionRef);

    return () => {
      observer.disconnect();
      ctx.revert();
    };
  }, []);
  return (
    <div className="relative w-full overflow-hidden">
      <style>
        {`@import url('https://fonts.cdnfonts.com/css/cocobiker');`}
      </style>

      <section
        ref={headerSectionRef}
        className="relative w-dvw h-dvh">
        <div className="sticky top-0 flex flex-col items-center justify-center w-full h-full">
          <header ref={headerRef} className="flex gap-[1px] items-end cursor-default z-10">
            {letters.map((letter, idx) => (
              <Letter key={idx} letter={letter} idx={idx} />
            ))}
          </header>
        </div>
      </section>

      <section className="relative flex justify-center items-center h-[200dvh]">
        <motion.aside
          ref={asideRef}
          initial={{ opacity: 0, y: 50 }}
          className="max-w-xl bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 md:p-8 space-y-3 text-brand-500"
        >
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0, transition: { delay: 0.3 } }}
            className="text-2xl md:text-3xl font-semibold leading-snug"
          >
            Khám phá bộ sưu tập nhẫn mới nhất, tinh tế và thời thượng – chỉ có tại{' '}
            <span className="text-[#001B3D] font-bold">Mayra</span>
          </motion.p>
          <ul className="flex flex-col gap-1 bg-transparent-white md:bg-transparent rounded [list-style-type:none] p-2 list-inside leading-relaxed">
            <li className="flex gap-1 items-center text-brand-500 mt-2">
              <span className="border border-brand-500 p-1 rounded-[100%]"><Phone /></span>Tư vấn 24/7, phục vụ tận tình
            </li>
            <li className="flex gap-1 items-center text-brand-500 ">
              <span className="border border-brand-500 p-1 rounded-[100%]"><HopOff /></span>Miễn phí hoàn trả trong vòng 24h
            </li>
            <li className="flex gap-1 items-center text-brand-500 ">
              <span className="border border-brand-500 p-1 rounded-[100%]"><Percent /></span>Giảm giá cực mạnh khi đăng hình trang sức lên mạng xã hội
            </li>
            <li className="flex gap-1 items-center text-brand-500 ">
              <span className="border border-brand-500 p-1 rounded-[100%]"><TrendingUp /></span>Tích điểm mỗi khi mua hàng từ Mayra để được giảm giá
            </li>
          </ul>
          {session.status !== 'authenticated' && (
            <Button ref={buttonRef} variant="secondary" className="mt-2" transitionOption={{ delay: 2.4 }} onClick={() => { router.push('/account'); }}>Đăng nhập ngay để nhận ưu đãi</Button>
          )}
        </motion.aside>
      </section>
    </div>
  )
}
