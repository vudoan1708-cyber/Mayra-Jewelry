'use client'

import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';

import { useEffect, useRef } from 'react';

import gsap from 'gsap';

import { HopOff, Percent, Phone, TrendingUp } from 'lucide-react';

import { motion } from 'framer-motion';

import Button from './Button';
import { LOGO_SCROLLED_PASSED_EVENT } from '../helpers';

export default function Bio() {
  const t = useTranslations('home.bio');
  const session = useSession();
  const router = useRouter();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const headerSectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLHeadElement>(null);
  const asideRef = useRef<HTMLElement>(null);

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
          end: '+=40%',
          pin: true,
          scrub: true,
        },
      });

      tl.to(headerRef.current, { opacity: 0, scale: 0.96, y: -60, duration: 1 })
        .to(asideRef.current, { opacity: 1, duration: 0.25 }, '>-0.2')
        .to(asideRef.current, { y: 0, duration: 1.3 }, '<');
    }, headerSectionRef);

    return () => {
      observer.disconnect();
      ctx.revert();
    };
  }, []);

  return (
    <div className="relative w-full overflow-hidden">
      <section
        ref={headerSectionRef}
        className="relative w-dvw h-dvh">
        <div className="sticky top-0 flex flex-col items-center justify-center w-full h-full px-6">
          <header
            ref={headerRef}
            className="flex flex-col items-center text-center gap-3 cursor-default select-none">
            <motion.span
              initial={{ opacity: 0, letterSpacing: '0.1em' }}
              animate={{ opacity: 1, letterSpacing: '0.4em' }}
              transition={{ duration: 1.2, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              style={{ color: 'var(--accent-100)' }}
              className="text-xs sm:text-sm uppercase font-medium drop-shadow-[0_1px_8px_rgba(0,0,0,0.5)]"
            >
              {t('eyebrow')}
            </motion.span>

            <motion.h1
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.4, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
              style={{ color: 'var(--accent-300)' }}
              className="font-light tracking-[0.04em] text-5xl sm:text-7xl md:text-[112px] leading-[1.02] drop-shadow-[0_4px_24px_rgba(0,0,0,0.55)]"
            >
              Mayra
              <span
                style={{ color: 'var(--accent-100)' }}
                className="block text-xs sm:text-sm md:text-base tracking-[0.6em] mt-4 font-normal uppercase"
              >
                Jewelry
              </span>
            </motion.h1>

            <motion.span
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 1.1, delay: 1.2, ease: [0.22, 1, 0.36, 1] }}
              className="block h-px w-32 sm:w-40 bg-gradient-to-r from-transparent via-accent-500 to-transparent origin-center mt-1"
            />
          </header>
        </div>
      </section>

      <section className="relative flex justify-center items-start h-[120dvh] pt-2 px-4">
        <motion.aside
          ref={asideRef}
          initial={{ opacity: 0, y: 50 }}
          className="max-w-xl bg-accent-100 rounded-2xl shadow-2xl shadow-black/50 border border-accent-300/40 p-6 md:p-8 space-y-4"
        >
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0, transition: { delay: 0.3 } }}
            className="text-xl md:text-2xl font-normal leading-snug text-brand-700"
          >
            {t.rich('tagline', {
              brand: (chunks) => <span className="text-brand-700 font-bold">{chunks}</span>,
            })}
          </motion.p>
          <ul style={{ color: 'var(--brand-700)' }} className="flex flex-col gap-2 [list-style-type:none] text-sm md:text-base leading-relaxed">
            <li className="flex gap-3 items-center">
              <span className="border border-accent-400 text-accent-600 p-1.5 rounded-full shrink-0"><Phone className="size-3.5" /></span>{t('perks.support')}
            </li>
            <li className="flex gap-3 items-center">
              <span className="border border-accent-400 text-accent-600 p-1.5 rounded-full shrink-0"><HopOff className="size-3.5" /></span>{t('perks.returns')}
            </li>
            <li className="flex gap-3 items-center">
              <span className="border border-accent-400 text-accent-600 p-1.5 rounded-full shrink-0"><Percent className="size-3.5" /></span>{t('perks.social')}
            </li>
            <li className="flex gap-3 items-center">
              <span className="border border-accent-400 text-accent-600 p-1.5 rounded-full shrink-0"><TrendingUp className="size-3.5" /></span>{t('perks.points')}
            </li>
          </ul>
          {session.status !== 'authenticated' && (
            <Button ref={buttonRef} variant="secondary" className="mt-2 px-4 py-2 rounded-full" transitionOption={{ delay: 2.4 }} onClick={() => { router.push('/account'); }}>{t('signInCta')}</Button>
          )}
        </motion.aside>
      </section>
    </div>
  )
}
