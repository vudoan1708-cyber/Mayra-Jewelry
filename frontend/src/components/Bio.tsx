import { motion } from 'framer-motion';;

import Ring from '../assets/sun.jpg';

export default function Bio() {
  return (
    <header>
      <img src={Ring} className="logo" alt="Landing image" />
      <motion.aside className="absolute top-[50%] left-[0] md:left-[25%] max-w-screen-sm md:max-w-xl bg-transparent-white rounded p-2">
        <h3 className="text-4xl">Mayra Jewelry</h3>
        <p>Discover our handcrafted silver 5 white gold jewelry</p>
      </motion.aside>
    </header>
  )
}
