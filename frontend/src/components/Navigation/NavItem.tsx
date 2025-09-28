'use client'

import type { ReactNode } from 'react';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { motion } from 'framer-motion';

type NavItemProps = {
  href: string,
  target?: string,
  className?: string,
  withBorder?: boolean,
  children: ReactNode,
};

export default function NavItem({ href, target, className, withBorder = true, children }: NavItemProps) {
  const pathname = usePathname();
  const isActive = pathname === href;
  return (
    <li className="relative group">
      <Link
        href={href}
        target={target}
        className={`${isActive ? 'text-brand-500' : 'text-black'} hover:text-brand-400 text-xs transition-colors font-semibold flex gap-1 justify-center items-center ${className}`}
      >
        {children}
      </Link>

      {isActive && withBorder && <motion.hr className="absolute bottom-[-14px] border-b-2 border-solid border-brand-500 w-[calc(100%+4px)]" />}
    </li>
  );
}
