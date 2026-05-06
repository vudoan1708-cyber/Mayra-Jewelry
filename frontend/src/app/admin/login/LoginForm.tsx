'use client'

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';

import { motion } from 'framer-motion';

import { adminLogin, setPendingToken } from '../api';

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const { pendingToken } = await adminLogin(email.trim().toLowerCase(), password);
      setPendingToken(pendingToken);
      router.push('/admin/login/totp');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign-in failed');
      setBusy(false);
    }
  };

  return (
    <main className="flex min-h-dvh items-center justify-center px-6 py-16">
      <motion.form
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={onSubmit}
        className="w-full max-w-[380px] flex flex-col gap-5 bg-accent-100 border border-accent-300/40 rounded-2xl shadow-2xl shadow-black/30 p-7"
      >
        <header className="flex flex-col gap-1 text-center">
          <p className="text-[10px] uppercase tracking-[0.32em] text-brand-500/70">Mayra Admin</p>
          <h1 className="text-xl text-brand-700">Sign in</h1>
        </header>

        <label className="flex flex-col gap-1 text-sm">
          <span className="text-brand-500/80">Email</span>
          <input
            type="email"
            autoComplete="username"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-white border border-accent-300/60 rounded-md px-3 py-2 text-sm text-brand-700 focus:outline-none focus:border-brand-500"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="text-brand-500/80">Password</span>
          <input
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-white border border-accent-300/60 rounded-md px-3 py-2 text-sm text-brand-700 focus:outline-none focus:border-brand-500"
          />
        </label>

        {error && (
          <p role="alert" className="text-sm text-red-600">{error}</p>
        )}

        <button
          type="submit"
          disabled={busy}
          className="bg-brand-700 text-accent-100 uppercase tracking-[0.2em] text-xs py-2.5 rounded-md hover:bg-brand-600 disabled:opacity-60 transition-colors"
        >
          {busy ? 'Signing in…' : 'Continue'}
        </button>
      </motion.form>
    </main>
  );
}
