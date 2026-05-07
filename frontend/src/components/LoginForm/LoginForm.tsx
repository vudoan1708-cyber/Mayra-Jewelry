'use client'

import { useEffect, useState } from 'react';

import { signIn } from 'next-auth/react';
import { useTranslations } from 'next-intl';

import { motion } from 'framer-motion';

import Button from '../Button';

export default function LoginForm({ title, redirectTo = '/', autoSignIn = false }: { title: string; redirectTo?: string; autoSignIn?: boolean }) {
  const t = useTranslations('loginForm');
  const [clicked, setClicked] = useState<boolean>(false);

  useEffect(() => {
    const signInImmediately = async () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      autoSignIn && await signIn('facebook', { redirectTo });
    };
    signInImmediately();
  }, [autoSignIn]);
  return (
    <motion.form
      key="scale-and-fade"
      initial={{ opacity: 0, scale: 1.09 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col gap-5 h-max self-center mx-auto bg-accent-100 border border-accent-300/40 rounded-2xl shadow-2xl shadow-black/50 p-6 sm:p-8 w-full max-w-[400px] mt-12"
      action={async () => {
        await signIn('facebook', { redirectTo });
      }}
    >
      <h2
        className="text-lg sm:text-xl leading-snug tracking-[0.04em] text-center text-brand-700"
        dangerouslySetInnerHTML={{ __html: title }}
      />
      <Button
        type="submit"
        variant="secondary"
        className="items-center justify-center gap-2 text-[11px] sm:text-xs uppercase tracking-[0.3em] !text-brand-700 !border-accent-500/40 hover:!text-brand-700 hover:!border-accent-500 hover:bg-accent-300/40 py-2"
        working={clicked}
        onClick={() => {
          setClicked(true);
        }}>
        <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="currentColor"><title>Facebook</title><path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z" /></svg>
        {t('facebook')}
      </Button>
    </motion.form>
  )
}