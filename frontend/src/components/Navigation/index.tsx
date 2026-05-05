'use client'

import Image from 'next/image';

import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';

import { Heart, House, Search, ShoppingCart, CircleUser } from 'lucide-react';
import { useEffect } from 'react';

import { motion, useMotionTemplate, useMotionValue, useSpring } from 'framer-motion';

import NavItem from './NavItem';
import LocaleSwitcher from '../LocaleSwitcher';
import { useRouter, usePathname } from '../../i18n/navigation';
import { SAVE_TO_CART } from '../../helpers';
import { useCartCount } from '../../stores/CartCountProvider';

export default function Navigation() {
  const t = useTranslations('nav');
  const session = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const { items, setTo } = useCartCount();

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
  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative bg-brand-700 text-accent-100 p-1 w-full text-center uppercase text-xs tracking-[0.15em]"
        id="extra_nav_info">
        <span className="text-base">📢 </span>
        {t.rich('promo', {
          dates: (chunks) => <span className="border-b border-b-1 border-b-accent-300/60 text-accent-300">{chunks}</span>,
        })}
      </motion.div>
      <motion.nav
        initial={{ y: -120 }}
        animate={{ y: 0 }}
        className="bg-brand-700/95 backdrop-blur-md text-accent-100 sticky top-0 left-0 w-full z-50 flex items-center justify-center p-3 min-h-[57px] shadow-lg shadow-black/30">
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
        <ul className="hidden sm:w-full sm:grid sm:[grid-template-columns:repeat(4,100px)_125px] sm:gap-0 sm:justify-center sm:items-center">
          <NavItem href="/">
            <House {...fillWhenActive('/')} />
            {t('home')}
          </NavItem>
          <NavItem href="/search">
            <Search {...fillWhenActive('/search')} />
            {t('search')}
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
        <span className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-accent-500/35 to-transparent" />
      </motion.nav>
    </>
  )
}
