'use client'

import { useEffect, useState, type MouseEventHandler, type ReactNode } from 'react';
import ReactDOM from 'react-dom';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { motion } from 'framer-motion';

import { DotLottieReact } from '@lottiefiles/dotlottie-react';

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

  useEffect(() => {
    setLoading(false);
  }, [pathname]);

  return (
    <>
      <li className="relative group list-none">
        <Link
          href={href}
          target={target}
          className={`${isActive ? 'text-brand-500 font-semibold' : 'text-black'} ${withHover ? `hover:text-brand-400` : 'hover:text-black'} text-xs transition-colors flex gap-1 justify-center items-center [text-decoration:inherit] ${className ?? ''}`}
          onClick={patchedOnClick}
        >
          {children}
        </Link>

        {isActive && withBorder && <motion.hr className="absolute bottom-[-18px] border-b-2 border-solid border-brand-500 w-[calc(100%+1px)]" />}
      </li>

      {loading && ReactDOM.createPortal(
        <div className="fixed top-0 left-0 w-dvw h-dvh bg-transparent-white flex justify-center items-center z-50">
          <DotLottieReact
            src="https://lottie.host/af84b5a6-74cc-42f5-b6fa-10268ce91ab9/aFWRCbuQ0C.lottie"
            renderConfig={{ autoResize: true }}
            className="w-20 h-20"
            loop
            autoplay
          />
        </div>,
        document.body,
      )}
    </>
  );
}
