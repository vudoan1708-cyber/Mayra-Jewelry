'use client'

import { Heart, House, Search, ShoppingCart, CircleUser } from 'lucide-react';
import { motion } from 'framer-motion';

import NavItem from './NavItem';

export default function Navigation() {
  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0, transition: { duration: 0.2, delay: 0.5 } }}
        className="bg-white fixed top-0 left-0 w-full z-50 flex items-center justify-center p-2 sm:border-b-2 sm:border-solid sm:shadow-lg">
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
