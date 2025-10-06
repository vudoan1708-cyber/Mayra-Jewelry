'use client'

import { useRouter } from 'next/navigation';

import { Heart, House, Search, ShoppingCart, CircleUser } from 'lucide-react';
import { useEffect, useState } from 'react';

import { motion } from 'framer-motion';

import NavItem from './NavItem';
import { LOGO_SCROLLED_PASSED_EVENT } from '../../helpers';

export default function Navigation() {
  const router = useRouter();
  const [logoIntersected, setLogoIntersected] = useState<boolean>(false);

  useEffect(() => {
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
        className="relative bg-brand-500 text-white p-1 w-full text-center uppercase">
        Ship hàng ngay ngày hôm sau - <span className="border-b border-b-1 border-b-brand-200">7 ngày / tuần</span>
      </motion.div>
      <motion.nav
        initial={{ y: -120 }}
        animate={{ y: 0 }}
        className="bg-white sticky top-0 left-0 w-full z-50 flex items-center justify-center p-3 min-h-[57px] sm:border-b-2 sm:border-solid sm:shadow-lg">
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
            <motion.div className="sm:flex sm:justify-center">
              <motion.div className="sm:absolute sm:top-[50%] bg-white sm:w-lg sm:rounded-full sm:p-2 sm:border-2 sm:border-solid sm:shadow-lg">
                <ShoppingCart />
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
