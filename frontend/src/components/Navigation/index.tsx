import { Heart, House, Search, ShoppingCart, CircleUser } from 'lucide-react';
import { motion } from 'framer-motion';

import NavItem from './NavItem';

export default function Navigation() {
  return (
    <>
      <nav className="bg-white fixed top-0 left-0 w-full z-50 flex items-center justify-between p-2 sm:border-b-2 sm:border-solid sm:shadow-lg">
        <ul className="hidden sm:w-full sm:flex sm:gap-12 sm:justify-center sm:items-center">
          <NavItem to="/">
            <House />
            Home
          </NavItem>
          <NavItem to="/search">
            <Search />
            Search
          </NavItem>

          <NavItem to="/cart">
            <motion.div className="sm:flex sm:justify-center">
              <motion.div className="sm:absolute sm:top-[50%] bg-white sm:w-lg sm:rounded-full sm:p-2 sm:border-2 sm:border-solid sm:shadow-lg">
                <ShoppingCart />
              </motion.div>
            </motion.div>
          </NavItem>

          <NavItem to="/wishlist">
            <Heart />
            Wishlist
          </NavItem>
          <NavItem to="/account">
            <CircleUser/>
            My Account
          </NavItem>
        </ul>
      </nav>
    </>
  )
}
