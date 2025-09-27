import type { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function NavItem({ href, children }: { href: string, children: ReactNode }) {
  const pathname = usePathname();
  console.log('pathname', pathname);
  const isActive = pathname === href;
  return (
    <li className="relative group">
      <Link
        href={href}
        className={`${isActive ? 'text-brand-500' : 'text-black'} hover:text-brand-400 text-xs transition-colors font-semibold flex gap-1 justify-center items-center`}
      >
        {children}
      </Link>
    </li>
  );
}
