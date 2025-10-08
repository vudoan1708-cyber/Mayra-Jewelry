'use client'

import { useRouter } from 'next/navigation';

import { Heart, House, Search, ShoppingCart, CircleUser } from 'lucide-react';
import { useEffect, useState } from 'react';

import { motion, useMotionTemplate, useMotionValue, useSpring } from 'framer-motion';

import NavItem from './NavItem';
import { SAVE_TO_CART, LOGO_SCROLLED_PASSED_EVENT } from '../../helpers';
import { useCartCount } from '../../stores/CartCountProvider';

export default function Navigation() {
  const router = useRouter();
  const [logoIntersected, setLogoIntersected] = useState<boolean>(false);
  const { count, setTo } = useCartCount();

  const shadowX = useSpring(0);
  const shadowY = useMotionValue(0);
  const shadow = useMotionTemplate`drop-shadow(${shadowX}px ${shadowY}px 20px rgba(0,0,0,0.3))`;

  useEffect(() => {
    document.body.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
    const result = localStorage.getItem(SAVE_TO_CART);
    try {
      const parsed = JSON.parse(result || '{}');
      setTo(parsed);
    } catch (e) {
      console.error(e);
      alert(e);
    }
    window.addEventListener('message', (e) => {
      if (e.data?.target === 'IMG') {
        setLogoIntersected(e.data?.event === LOGO_SCROLLED_PASSED_EVENT && e.data?.value);
      }
    });
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
        {logoIntersected && <motion.img
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          src="images/logo.webp"
          className="absolute top-0 left-0 w-[57px] select-none cursor-pointer hover:drop-shadow-sm"
          onClick={() => { router.push('/'); }} />}
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
                key={count}
                animate={{
                  rotate: [0, -10, 10, -10, 10, 0],
                }}
                transition={{
                  duration: 0.5,
                  ease: 'easeInOut',
                }}
                style={{ filter: shadow }}
                className="absolute top-[50%] bg-white w-lg rounded-full p-2 border-2 border-solid shadow-lg">
                <ShoppingCart />
                {count > 0 && (
                  <motion.aside className="absolute top-0 right-0 py-0.5 px-1.5 rounded-full bg-brand-500 text-white">
                    {count}
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
            <CircleUser/>
            My Account
          </NavItem>
        </ul>
      </motion.nav>
    </>
  )
}
