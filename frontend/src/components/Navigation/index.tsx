'use client'

import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';

import { useSession } from 'next-auth/react';

import { Heart, House, Search, ShoppingCart, CircleUser } from 'lucide-react';
import { useEffect } from 'react';

import { motion, useMotionTemplate, useMotionValue, useSpring } from 'framer-motion';

import NavItem from './NavItem';
import { SAVE_TO_CART } from '../../helpers';
import { useCartCount } from '../../stores/CartCountProvider';

export default function Navigation() {
  const session = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const { items, setTo } = useCartCount();

  const shadowX = useSpring(0);
  const shadowY = useMotionValue(0);
  const shadow = useMotionTemplate`drop-shadow(${shadowX}px ${shadowY}px 20px rgba(0,0,0,0.3))`;

  useEffect(() => {
    const result = localStorage.getItem(SAVE_TO_CART);
    try {
      const parsed = JSON.parse(result || '{}');
      setTo(parsed);
    } catch (e) {
      console.error(e);
      alert(e);
    }
  }, []);
  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative bg-brand-500 text-white p-1 w-full text-center uppercase"
        id="extra_nav_info">
        <span className="font-semibold text-lg">📢 </span>
        Giảm giá 10% các mẫu nhẫn từ ngày <span className="border-b border-b-1 border-b-brand-200">5/10 - 20/10</span>
      </motion.div>
      <motion.nav
        initial={{ y: -120 }}
        animate={{ y: 0 }}
        className="bg-transparent-white backdrop-blur-sm sticky top-0 left-0 w-full z-50 flex items-center justify-center p-3 min-h-[57px] sm:border-b-2 sm:border-solid sm:shadow-lg">
        <motion.img
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          alt="Mayra logo"
          src="/images/logo.webp"
          className="absolute top-0 left-0 w-[57px] select-none cursor-pointer hover:drop-shadow-sm"
          onClick={() => { router.push('/'); }} />
        <ul className="hidden sm:w-full sm:grid sm:[grid-template-columns:repeat(4,100px)_120px] sm:gap-2 sm:justify-center sm:items-center">
          <NavItem href="/">
            <House />
            Home
          </NavItem>
          <NavItem href="/search">
            <Search />
            Search
          </NavItem>

          <NavItem href="/cart" withBorder={false}>
            <motion.div className="flex justify-center">
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
                className={`absolute top-[50%] bg-white w-lg rounded-full p-2 border-2 border-solid ${pathname === '/cart' && 'border-brand-500'} shadow-lg`}>
                <ShoppingCart />
                {items.length > 0 && (
                  <motion.aside
                    className={`absolute top-0 right-0 py-0.5 px-1.5 rounded-full bg-brand-500 text-white ${pathname === '/cart' && 'text-brand-500'}`}>
                    {items.length}
                  </motion.aside>
                )}
              </motion.div>
            </motion.div>
          </NavItem>

          <NavItem href="/wishlist">
            <Heart />
            Wishlist
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
                {session.data.user?.name ?? 'My Account'}
              </>
              )
              : (
                <>
                  <CircleUser/>
                  My Account
                </>
              )
            }
          </NavItem>
        </ul>
      </motion.nav>
    </>
  )
}
