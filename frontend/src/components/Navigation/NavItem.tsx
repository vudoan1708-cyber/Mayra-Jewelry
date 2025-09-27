import type { ReactNode } from 'react';
import { NavLink, type NavLinkRenderProps } from 'react-router-dom';

export default function NavItem({ to, children }: { to: string, children: ReactNode | ((props: NavLinkRenderProps) => ReactNode) }) {
  return (
    <li className="relative group">
      <NavLink
        to={to}
        className={({ isActive }) =>
          `${isActive ? 'text-brand-500' : 'text-black'} hover:text-brand-200 text-xs transition-colors font-semibold flex gap-1 justify-center items-center`
        }
        state={{ scrollToDetails: true }}
      >
        {children}
      </NavLink>
    </li>
  );
}
