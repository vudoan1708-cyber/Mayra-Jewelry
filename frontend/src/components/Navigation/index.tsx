'use client'

import Image from 'next/image';

import { useSession } from 'next-auth/react';
import { useLocale, useTranslations } from 'next-intl';

import { Heart, House, Compass, ShoppingCart, CircleUser, Menu, X } from 'lucide-react';
import { useEffect, useState } from 'react';

import { AnimatePresence, motion, useMotionTemplate, useMotionValue, useSpring } from 'framer-motion';

import NavItem from './NavItem';
import LocaleSwitcher from '../LocaleSwitcher';
import { getLenis } from '../LenisSmoothScrolling/SmoothScroller';
import { useRouter, usePathname } from '../../i18n/navigation';
import { SAVE_TO_CART } from '../../helpers';
import { useCartCount } from '../../stores/CartCountProvider';
import type { SiteBanner } from '../../server/data';

export default function Navigation({ initialBanner }: { initialBanner: SiteBanner | null }) {
  const t = useTranslations('nav');
  const locale = useLocale();
  const session = useSession();
  const navGridCols = locale === 'vi'
    ? 'sm:[grid-template-columns:repeat(4,125px)_150px]'
    : 'sm:[grid-template-columns:repeat(4,100px)_125px]';
  const router = useRouter();
  const pathname = usePathname();
  const { items, setTo } = useCartCount();
  const [mobileOpen, setMobileOpen] = useState(false);

  const shadowX = useSpring(0);
  const shadowY = useMotionValue(0);
  const shadow = useMotionTemplate`drop-shadow(${shadowX}px ${shadowY}px 20px rgba(0,0,0,0.3))`;

  const fillWhenActive = (href: string) => {
    if (pathname === href) {
      return {
        fill: 'none',
        stroke: 'var(--accent-300)',
        strokeWidth: 2.25,
      };
    }
    return {
      fill: 'none',
      stroke: 'currentColor',
    };
  };

  useEffect(() => {
    const result = localStorage.getItem(SAVE_TO_CART);
    try {
      const parsed = JSON.parse(result || '{}');
      setTo(parsed);
    } catch (e) {
      console.error(e);
    }

    // Remove hash redirection after signing in from Facebook
    if (window.location.hash === '#_=_') {
      history.replaceState(
        null,
        "",
        window.location.href.replace('#_=_', '')
      );
    }
    // Force full reload on browser back button
    const handlePopState = () => {
      window.location.reload();
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileOpen) return;
    const lenis = getLenis();
    lenis?.stop();
    const preventTouch = (e: TouchEvent) => e.preventDefault();
    document.addEventListener('touchmove', preventTouch, { passive: false });
    return () => {
      document.removeEventListener('touchmove', preventTouch);
      lenis?.start();
    };
  }, [mobileOpen]);
  return (
    <>
      {(() => {
        const bannerText = initialBanner && initialBanner.active
          ? (locale === 'vi' ? initialBanner.viText : initialBanner.enText).trim()
          : '';
        if (initialBanner && (!initialBanner.active || !bannerText)) {
          return null;
        }
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="relative bg-brand-700 text-accent-100 p-1 w-full text-center uppercase text-xs tracking-[0.15em]"
            id="extra_nav_info">
            <span className="text-base">📢 </span>
            {bannerText
              ? bannerText
              : t.rich('promo', {
                  dates: (chunks) => <span className="border-b border-b-1 border-b-accent-300/60 text-accent-300">{chunks}</span>,
                })}
          </motion.div>
        );
      })()}
      <motion.nav
        initial={{ y: -120 }}
        animate={{ y: 0 }}
        className="bg-brand-600 text-accent-100 sticky top-0 left-0 w-full z-50 flex items-center justify-center p-3 min-h-[57px] shadow-lg shadow-black/30">
        <motion.button
          type="button"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          aria-label="Mayra — home"
          onClick={() => { router.push('/'); }}
          className="absolute left-5 top-1/2 -translate-y-1/2 select-none cursor-pointer leading-none"
        >
          <span className="font-serif font-semibold text-accent-300 text-2xl tracking-[0.32em] pl-[0.32em]">
            MAYRA
          </span>
        </motion.button>
        <ul className={`hidden sm:w-full sm:grid ${navGridCols} sm:gap-x-3 sm:justify-center sm:items-center`}>
          <NavItem href="/">
            <House {...fillWhenActive('/')} />
            {t('home')}
          </NavItem>
          <NavItem href="/browse">
            <Compass {...fillWhenActive('/browse')} />
            {t('browse')}
          </NavItem>

          <NavItem href="/cart" withBorder={false}>
            <motion.div className="flex justify-center">
              {/* Circular progress border */}
              <svg
                className="absolute top-0 w-[60px] h-[52px] rotate-[-90deg]"
                viewBox="0 0 100 100"
              >
                <motion.circle
                  cx="54"
                  cy="50"
                  r="48"
                  fill="transparent"
                  stroke="var(--accent-300)"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 48}
                  initial={{ strokeDashoffset: 2 * Math.PI * 48 }}
                  animate={{ strokeDashoffset: pathname === '/cart' ? 0 : 2 * Math.PI * 48 }}
                  transition={{
                    duration: 0.75,
                    ease: 'easeInOut',
                  }}
                />
              </svg>
              <motion.div
                key={items.length}
                animate={{
                  rotate: [0, -10, 10, -10, 10, 0],
                }}
                transition={{
                  duration: 0.5,
                  ease: 'easeInOut',
                }}
                style={{ filter: shadow }}
                className={`absolute top-[50%] bg-accent-100 text-brand-700 w-lg rounded-full p-2 shadow-lg`}>
                <ShoppingCart aria-label={t('cart')} fill="none" stroke={pathname === '/cart' ? 'var(--brand-700)' : 'var(--brand-500)'} strokeWidth={pathname === '/cart' ? 2.25 : 2} />
                {items.length > 0 && (
                  <motion.aside
                    className={`absolute top-0 right-0 py-0.5 px-1.5 rounded-full bg-accent-500 text-brand-700 text-xs font-semibold`}>
                    {items.length}
                  </motion.aside>
                )}
              </motion.div>
            </motion.div>
          </NavItem>

          <NavItem href="/wishlist">
            <Heart {...fillWhenActive('/wishlist')} />
            {t('wishlist')}
          </NavItem>
          <NavItem href="/account">
            {session.status === 'authenticated'
              ? (
              <>
                <Image
                  alt="user profile image"
                  src={session.data.user?.image ?? ''}
                  width="24"
                  height="24"
                  className="rounded-md"
                />
                {session.data.user?.name ?? t('account')}
              </>
              )
              : (
                <>
                  <CircleUser {...fillWhenActive('/account')} />
                  {t('account')}
                </>
              )
            }
          </NavItem>
        </ul>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:block">
          <LocaleSwitcher />
        </div>
        <button
          type="button"
          aria-label="Open menu"
          aria-expanded={mobileOpen}
          aria-controls="mobile-nav-drawer"
          onClick={() => setMobileOpen(true)}
          className="absolute right-4 top-1/2 -translate-y-1/2 sm:hidden text-accent-200 hover:text-accent-300 transition-colors p-1.5 cursor-pointer"
        >
          <Menu className="size-6" />
        </button>
        <span className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-accent-500/35 to-transparent" />
      </motion.nav>
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-[60] sm:hidden">
        <AnimatePresence>
          {mobileOpen && (
            <>
              <motion.div
                key="mobile-nav-backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileOpen(false)}
                className="absolute inset-0 bg-brand-700/60 backdrop-blur-sm pointer-events-auto"
              />
              <motion.aside
                id="mobile-nav-drawer"
                key="mobile-nav-drawer"
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'tween', duration: 0.3, ease: 'easeOut' }}
                className="absolute top-0 right-0 bottom-0 w-[78%] max-w-[320px] bg-brand-600 text-accent-100 flex flex-col py-5 px-6 shadow-2xl shadow-black/50 pointer-events-auto"
              >
              <div className="flex items-center justify-between mb-8">
                <span className="font-serif font-semibold text-accent-300 text-lg tracking-[0.32em] pl-[0.32em]">
                  MENU
                </span>
                <button
                  type="button"
                  aria-label="Close menu"
                  onClick={() => setMobileOpen(false)}
                  className="text-accent-200 hover:text-accent-300 transition-colors p-1 cursor-pointer"
                >
                  <X className="size-5" />
                </button>
              </div>
              <ul className="flex flex-col gap-7" onClick={() => setMobileOpen(false)}>
                <NavItem href="/" withBorder={false} className="!justify-start text-sm">
                  <House {...fillWhenActive('/')} />
                  {t('home')}
                </NavItem>
                <NavItem href="/browse" withBorder={false} className="!justify-start text-sm">
                  <Compass {...fillWhenActive('/browse')} />
                  {t('browse')}
                </NavItem>
                <NavItem href="/cart" withBorder={false} className="!justify-start text-sm">
                  <span className="relative inline-flex">
                    <ShoppingCart {...fillWhenActive('/cart')} />
                    {items.length > 0 && (
                      <span className="absolute -top-2 -right-2 py-0.5 px-1.5 rounded-full bg-accent-500 text-brand-700 text-[10px] font-semibold leading-none">
                        {items.length}
                      </span>
                    )}
                  </span>
                  {t('cart')}
                </NavItem>
                <NavItem href="/wishlist" withBorder={false} className="!justify-start text-sm">
                  <Heart {...fillWhenActive('/wishlist')} />
                  {t('wishlist')}
                </NavItem>
                <NavItem href="/account" withBorder={false} className="!justify-start text-sm">
                  {session.status === 'authenticated'
                    ? (
                      <>
                        <Image
                          alt="user profile image"
                          src={session.data.user?.image ?? ''}
                          width="24"
                          height="24"
                          className="rounded-md"
                        />
                        {session.data.user?.name ?? t('account')}
                      </>
                    )
                    : (
                      <>
                        <CircleUser {...fillWhenActive('/account')} />
                        {t('account')}
                      </>
                    )}
                </NavItem>
              </ul>
              <hr className="my-6 border-accent-500/20" />
              <LocaleSwitcher />
            </motion.aside>
            </>
          )}
        </AnimatePresence>
      </div>
    </>
  )
}
