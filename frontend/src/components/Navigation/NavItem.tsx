'use client'

import { useEffect, useState, type MouseEventHandler, type ReactNode } from 'react';
import ReactDOM from 'react-dom';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { motion } from 'framer-motion';

type NavItemProps = {
  href: string,
  target?: string,
  className?: string,
  withBorder?: boolean,
  withHover?: boolean,
  onClick?: MouseEventHandler<HTMLAnchorElement>,
  children: ReactNode,
};

export default function NavItem({ href, target, className, withBorder = true, withHover = true, onClick, children }: NavItemProps) {
  const pathname = usePathname();
  const isActive = pathname === href;
  const [loading, setLoading] = useState<boolean>(false);

  const patchedOnClick: MouseEventHandler<HTMLAnchorElement> = (e) => {
    if (isActive) return;
    setLoading(true);
    if (!onClick) return;
    onClick(e);
  };

  useEffect(() => {
    setLoading(false);
  }, [pathname]);

  return (
    <>
      <li className="relative group">
        <Link
          href={href}
          target={target}
          className={`${isActive ? 'text-brand-500' : 'text-black'} ${withHover ? `hover:text-brand-400` : 'hover:text-black'} text-xs transition-colors font-semibold flex gap-1 justify-center items-center ${className}`}
          onClick={patchedOnClick}
        >
          {children}
        </Link>

        {isActive && withBorder && <motion.hr className="absolute bottom-[-14px] border-b-2 border-solid border-brand-500 w-[calc(100%+4px)]" />}
      </li>

      {loading && ReactDOM.createPortal(
        <p className="fixed top-0 left-0 w-dvw h-dvh bg-transparent-white flex justify-center items-center z-50">Loading...</p>,
        document.body,
      )}
    </>
  );
}
