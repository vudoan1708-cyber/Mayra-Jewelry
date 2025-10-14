'use client'

import { useEffect, useState, type MouseEventHandler, type ReactNode } from 'react';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { motion } from 'framer-motion';
import FullScreenLoading from '../Loading/FullScreenLoading';

type NavItemProps = {
  href: string,
  target?: string,
  className?: string,
  withBorder?: boolean,
  withHover?: boolean,
  externalLink?: boolean,
  onClick?: MouseEventHandler<HTMLAnchorElement>,
  children: ReactNode,
};

export default function NavItem({ href, target, className, withBorder = true, withHover = true, externalLink = false, onClick, children }: NavItemProps) {
  const pathname = usePathname();
  const isActive = pathname === href;
  const [loading, setLoading] = useState<boolean>(false);

  const patchedOnClick: MouseEventHandler<HTMLAnchorElement> = (e) => {
    if (isActive || externalLink) return;
    setLoading(true);
    if (!onClick) return;
    onClick(e);
  };

  const onHoverStyling = () => {
    if (withHover) {
      if (isActive) return 'hover:text-brand-500 hover:cursor-default';
      return 'hover:text-brand-400';
    }
    return 'hover:text-black';
  }

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
    setLoading(false);
  }, [pathname]);

  return (
    <>
      <li className="relative group list-none">
        <Link
          href={href}
          target={target}
          className={`${isActive ? 'text-brand-500 font-semibold' : 'text-black'} ${onHoverStyling()} text-xs transition-colors flex gap-1 justify-center items-center [text-decoration:inherit] ${className ?? ''}`}
          onClick={patchedOnClick}
        >
          {children}
        </Link>

        {isActive && withBorder && (
          <motion.hr
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            className="absolute left-[50%] translate-x-[-50%] bottom-[-18px] border-b-2 border-solid border-brand-500 w-[calc(100%+1px)]" />
        )}
      </li>

      {loading && <FullScreenLoading />}
    </>
  );
}
