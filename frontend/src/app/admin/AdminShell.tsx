'use client'

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

import { Gem, Megaphone, Users, LogOut, Menu, X } from 'lucide-react';

import { AnimatePresence, motion } from 'framer-motion';

import { useAdminAuth } from './AdminAuthContext';

const navItems = [
  { href: '/admin/jewelry', label: 'Jewelry', icon: Gem },
  { href: '/admin/banner', label: 'Banner', icon: Megaphone },
  { href: '/admin/users', label: 'Users', icon: Users },
];

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { status, email, signOut } = useAdminAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (status === 'anonymous') {
      router.replace('/admin/login');
    }
  }, [status, router]);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileOpen) return;
    const preventTouch = (e: TouchEvent) => e.preventDefault();
    document.addEventListener('touchmove', preventTouch, { passive: false });
    return () => {
      document.removeEventListener('touchmove', preventTouch);
    };
  }, [mobileOpen]);

  if (status !== 'authenticated') {
    return (
      <div className="flex min-h-dvh items-center justify-center px-6">
        <p className="text-sm text-brand-500/80">Loading…</p>
      </div>
    );
  }

  const isItemActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="bg-brand-700 text-accent-100 shadow-md shadow-black/20 border-b border-accent-500/20">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between gap-6">
          <div className="flex items-center gap-10">
            <Link href="/admin" className="flex flex-col leading-tight !no-underline !text-accent-100 group">
              <span className="text-[10px] uppercase tracking-[0.32em] text-accent-300 group-hover:text-accent-200 transition-colors">
                Mayra Admin
              </span>
              <span className="text-sm text-accent-100/90">{email}</span>
            </Link>
            <nav className="hidden min-[900px]:flex items-center gap-7">
              {navItems.map((item) => {
                const isActive = isItemActive(item.href);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 text-xs uppercase tracking-[0.2em] transition-colors !no-underline ${
                      isActive ? '!text-accent-300' : '!text-accent-200 hover:!text-accent-300'
                    }`}
                  >
                    <Icon className="size-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
          <button
            type="button"
            onClick={signOut}
            className="hidden min-[900px]:flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-accent-200/80 hover:text-accent-300 transition-colors cursor-pointer"
          >
            <LogOut className="size-4" />
            Sign out
          </button>
          <button
            type="button"
            aria-label="Open menu"
            aria-expanded={mobileOpen}
            aria-controls="admin-mobile-nav-drawer"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => setMobileOpen(true)}
            className="min-[900px]:hidden text-accent-200 hover:text-accent-300 transition-colors p-1.5 cursor-pointer"
          >
            <Menu className="size-6" />
          </button>
        </div>
      </header>

      <div className="fixed inset-0 overflow-hidden pointer-events-none z-[60] min-[900px]:hidden">
        <AnimatePresence>
          {mobileOpen && (
            <>
              <motion.div
                key="admin-mobile-nav-backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileOpen(false)}
                className="absolute inset-0 bg-brand-700/60 backdrop-blur-sm pointer-events-auto"
              />
              <motion.aside
                id="admin-mobile-nav-drawer"
                key="admin-mobile-nav-drawer"
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'tween', duration: 0.3, ease: 'easeOut' }}
                className="absolute top-0 right-0 bottom-0 w-[78%] max-w-[320px] bg-brand-600 text-accent-100 flex flex-col py-5 px-6 shadow-2xl shadow-black/50 pointer-events-auto"
              >
                <div className="flex items-center justify-between mb-8">
                  <span className="font-serif font-semibold text-accent-300 text-lg tracking-[0.32em] pl-[0.32em]">
                    MENU
                  </span>
                  <button
                    type="button"
                    aria-label="Close menu"
                    onClick={() => setMobileOpen(false)}
                    className="text-accent-200 hover:text-accent-300 transition-colors p-1 cursor-pointer"
                  >
                    <X className="size-5" />
                  </button>
                </div>
                <ul className="flex flex-col gap-7">
                  {navItems.map((item) => {
                    const isActive = isItemActive(item.href);
                    const Icon = item.icon;
                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          onClick={() => setMobileOpen(false)}
                          className={`flex items-center gap-2 text-sm uppercase tracking-[0.2em] transition-colors !no-underline ${
                            isActive ? '!text-accent-300' : '!text-accent-200 hover:!text-accent-300'
                          }`}
                        >
                          <Icon className="size-4" />
                          {item.label}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
                <hr className="my-6 border-accent-500/20" />
                <button
                  type="button"
                  onClick={() => {
                    setMobileOpen(false);
                    signOut();
                  }}
                  className="flex items-center gap-2 text-sm uppercase tracking-[0.2em] text-accent-200/80 hover:text-accent-300 transition-colors cursor-pointer"
                >
                  <LogOut className="size-4" />
                  Sign out
                </button>
              </motion.aside>
            </>
          )}
        </AnimatePresence>
      </div>

      <motion.main
        key={pathname}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex-1 px-6 py-10 max-w-6xl mx-auto w-full"
      >
        {children}
      </motion.main>
    </div>
  );
}
