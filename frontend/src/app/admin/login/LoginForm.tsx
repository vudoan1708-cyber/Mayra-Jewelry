'use client'

import { useState, type FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import { motion } from 'framer-motion';

import Button from '../../../components/Button';
import {
  adminEyebrow,
  adminInput,
  adminLabel,
  adminLabelText,
} from '../styles';
import { adminLogin, setPendingToken } from '../api';
import { sanitiseNextPath } from '../next';

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = sanitiseNextPath(searchParams.get('next'));
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
      const totpPath = next ? `/admin/login/totp?next=${encodeURIComponent(next)}` : '/admin/login/totp';
      router.push(totpPath);
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
        className="w-full max-w-[420px] flex flex-col gap-6 bg-accent-100 border border-accent-300/40 rounded-2xl shadow-2xl shadow-black/30 p-8 sm:p-9"
      >
        <header className="flex flex-col items-center gap-1 text-center">
          <p className={adminEyebrow}>Mayra Admin</p>
          <h1 className="text-2xl text-brand-700 leading-tight">Sign in</h1>
          <p className="text-sm text-brand-500/80 mt-1">Step 1 of 2 — credentials</p>
        </header>

        <label className={adminLabel}>
          <span className={adminLabelText}>Email</span>
          <input
            type="email"
            autoComplete="username"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`${adminInput} bg-white`}
          />
        </label>

        <label className={adminLabel}>
          <span className={adminLabelText}>Password</span>
          <input
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`${adminInput} bg-white`}
          />
        </label>

        {error && (
          <p role="alert" className="text-sm text-red-600">{error}</p>
        )}

        <Button type="submit" variant="primary" disabled={busy} working={busy}>
          {busy ? 'Signing in…' : 'Continue'}
        </Button>
      </motion.form>
    </main>
  );
}
