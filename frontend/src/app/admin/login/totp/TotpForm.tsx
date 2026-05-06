'use client'

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';

import { motion } from 'framer-motion';

import { adminVerifyTotp, getPendingToken, setPendingToken } from '../../api';
import { useAdminAuth } from '../../AdminAuthContext';

const CODE_LENGTH = 6;

export default function TotpForm() {
  const router = useRouter();
  const { setSession } = useAdminAuth();
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!getPendingToken()) {
      router.replace('/admin/login');
      return;
    }
    inputRef.current?.focus();
  }, [router]);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const pending = getPendingToken();
    if (!pending) {
      router.replace('/admin/login');
      return;
    }
    if (code.length !== CODE_LENGTH) {
      setError(`Enter the ${CODE_LENGTH}-digit code from your authenticator`);
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const { sessionToken, email } = await adminVerifyTotp(pending, code);
      setPendingToken(null);
      setSession(sessionToken, email);
      router.push('/admin');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed');
      setCode('');
      inputRef.current?.focus();
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
          <p className="text-[10px] uppercase tracking-[0.32em] text-brand-500/70">Two-factor</p>
          <h1 className="text-xl text-brand-700">Enter your code</h1>
          <p className="text-sm text-brand-500/80 mt-1">Open your authenticator app and enter the 6-digit code.</p>
        </header>

        <label className="flex flex-col gap-1 text-sm">
          <span className="sr-only">Authentication code</span>
          <input
            ref={inputRef}
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9]*"
            maxLength={CODE_LENGTH}
            required
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, CODE_LENGTH))}
            className="text-center tracking-[0.6em] text-lg bg-white border border-accent-300/60 rounded-md px-3 py-3 text-brand-700 focus:outline-none focus:border-brand-500"
            placeholder="••••••"
          />
        </label>

        {error && (
          <p role="alert" className="text-sm text-red-600">{error}</p>
        )}

        <button
          type="submit"
          disabled={busy || code.length !== CODE_LENGTH}
          className="bg-brand-700 text-accent-100 uppercase tracking-[0.2em] text-xs py-2.5 rounded-md hover:bg-brand-600 disabled:opacity-60 transition-colors"
        >
          {busy ? 'Verifying…' : 'Verify'}
        </button>

        <button
          type="button"
          onClick={() => { setPendingToken(null); router.replace('/admin/login'); }}
          className="text-xs text-brand-500/70 hover:text-brand-700 transition-colors"
        >
          Sign in as a different user
        </button>
      </motion.form>
    </main>
  );
}
