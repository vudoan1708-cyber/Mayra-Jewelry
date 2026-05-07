'use client'

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

import { Gem, Megaphone, Users, LogOut } from 'lucide-react';

import { motion } from 'framer-motion';

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

  useEffect(() => {
    if (status === 'anonymous') {
      router.replace('/admin/login');
    }
  }, [status, router]);

  if (status !== 'authenticated') {
    return (
      <div className="flex min-h-dvh items-center justify-center px-6">
        <p className="text-sm text-brand-500/80">Loading…</p>
      </div>
    );
  }

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
            <nav className="flex items-center gap-7">
              {navItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
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
            className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-accent-200/80 hover:text-accent-300 transition-colors"
          >
            <LogOut className="size-4" />
            Sign out
          </button>
        </div>
      </header>

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
