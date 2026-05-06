'use client'

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { motion } from 'framer-motion';
import { LogOut } from 'lucide-react';

import { useAdminAuth } from './AdminAuthContext';

export default function AdminHomeView() {
  const router = useRouter();
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
      <header className="flex items-center justify-between bg-brand-700 text-accent-100 px-6 py-3 shadow-md shadow-black/20">
        <div className="flex flex-col">
          <span className="text-[10px] uppercase tracking-[0.32em] text-accent-300">Mayra Admin</span>
          <span className="text-sm">{email}</span>
        </div>
        <button
          type="button"
          onClick={signOut}
          className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-accent-200 hover:text-accent-300 transition-colors"
        >
          <LogOut className="size-4" />
          Sign out
        </button>
      </header>

      <motion.main
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex-1 px-6 py-10 max-w-4xl mx-auto w-full flex flex-col gap-6"
      >
        <section className="bg-white border border-accent-300/40 rounded-2xl shadow-sm p-6">
          <h1 className="text-lg text-brand-700 mb-2">Welcome back.</h1>
          <p className="text-sm text-brand-500/80">
            You're signed in. Inventory and banner management land in the next phase.
          </p>
        </section>
      </motion.main>
    </div>
  );
}
