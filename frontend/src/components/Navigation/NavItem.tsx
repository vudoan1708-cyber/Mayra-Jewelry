'use client'

import { useEffect, useRef, type MouseEventHandler, type ReactNode } from 'react';

import Link from 'next/link';
import { usePathname } from '../../i18n/navigation';

import { motion } from 'framer-motion';

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

  const patchedOnClick: MouseEventHandler<HTMLAnchorElement> = (e) => {
    if (isActive || externalLink) return;
    if (!onClick) return;
    onClick(e);
  };

  const onHoverStyling = () => {
    if (withHover) {
      if (isActive) return 'hover:text-accent-300 hover:cursor-default';
      return 'group-hover:text-accent-300 group-hover:scale-105';
    }
    return 'hover:text-accent-300';
  }

  const isFirstPathRender = useRef(true);
  useEffect(() => {
    if (isFirstPathRender.current) {
      isFirstPathRender.current = false;
      return;
    }
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }, [pathname]);

  return (
    <li className="relative group list-none">
      <Link
        href={href}
        target={target}
        className={`${isActive ? 'text-accent-300 font-semibold' : 'text-accent-200'} ${onHoverStyling()} text-xs uppercase tracking-[0.18em] transition-all flex gap-1.5 justify-center items-center [text-decoration:inherit] ${className ?? ''}`}
        onClick={patchedOnClick}
      >
        {children}
      </Link>

      {withBorder && (
        <motion.hr
          className={`absolute left-[50%] translate-x-[-50%] bottom-[-18px] border-b-2 border-solid ${isActive ? 'w-[calc(100%+1px)] border-accent-300' : 'w-0 group-hover:border-accent-300 group-hover:w-[calc(100%+1px)]'} transition-all`} />
      )}
    </li>
  );
}
