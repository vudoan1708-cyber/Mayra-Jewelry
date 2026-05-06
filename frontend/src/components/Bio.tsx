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
      gsap.timeline({
        scrollTrigger: {
          trigger: headerSectionRef.current,
          start: 'center center',
          end: '+=40%',
          pin: true,
          scrub: true,
        },
      }).to(headerRef.current, { opacity: 0, scale: 0.96, y: -60, duration: 1 });
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

      <section className="relative flex justify-center items-start h-[120dvh] pt-2 px-4 sm:px-6">
        <motion.aside
          ref={asideRef}
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="relative max-w-4xl w-full mx-auto pt-12 sm:pt-20 pb-10 px-2 sm:px-6 text-accent-100"
        >
          <div className="flex items-center gap-3 text-[10px] sm:text-[11px] uppercase tracking-[0.45em] text-accent-300/85 mb-6 sm:mb-8">
            <span aria-hidden className="block h-px w-10 sm:w-14 bg-gradient-to-r from-transparent to-accent-500/70" />
            {t('eyebrow')}
          </div>

          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0, transition: { delay: 0.3 } }}
            className="font-serif font-light leading-[1.1] tracking-[0.005em] text-3xl sm:text-4xl md:text-5xl text-accent-100 max-w-3xl"
          >
            {t.rich('tagline', {
              brand: (chunks) => <span className="italic font-medium text-accent-300">{chunks}</span>,
            })}
          </motion.p>

          <span aria-hidden className="block h-px w-24 sm:w-32 bg-gradient-to-r from-accent-500/60 via-accent-500/30 to-transparent mt-8 sm:mt-12" />

          <ul className="mt-8 sm:mt-10 grid grid-cols-1 sm:grid-cols-2 gap-x-8 sm:gap-x-12 gap-y-5 [list-style-type:none] text-sm md:text-[15px] leading-relaxed text-accent-100/85">
            <li className="flex gap-3 items-start">
              <span className="text-accent-300 shrink-0 mt-0.5"><Phone className="size-4" strokeWidth={1.5} /></span>
              {t('perks.support')}
            </li>
            <li className="flex gap-3 items-start">
              <span className="text-accent-300 shrink-0 mt-0.5"><HopOff className="size-4" strokeWidth={1.5} /></span>
              {t('perks.returns')}
            </li>
            <li className="flex gap-3 items-start">
              <span className="text-accent-300 shrink-0 mt-0.5"><Percent className="size-4" strokeWidth={1.5} /></span>
              {t('perks.social')}
            </li>
            <li className="flex gap-3 items-start">
              <span className="text-accent-300 shrink-0 mt-0.5"><TrendingUp className="size-4" strokeWidth={1.5} /></span>
              {t('perks.points')}
            </li>
          </ul>

          {session.status !== 'authenticated' && (
            <div className="mt-10 sm:mt-12">
              <Button
                ref={buttonRef}
                variant="secondary"
                className="!text-accent-300 !border-accent-500/40 hover:!text-brand-700 hover:!bg-accent-300 hover:!border-accent-300 uppercase tracking-[0.3em] text-[11px] sm:text-xs px-6 py-3 rounded-full"
                transitionOption={{ delay: 2.4 }}
                onClick={() => { router.push('/account'); }}
              >
                {t('signInCta')}
              </Button>
            </div>
          )}
        </motion.aside>
      </section>
    </div>
  )
}
