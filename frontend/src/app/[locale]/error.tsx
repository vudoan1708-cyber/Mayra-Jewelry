'use client'

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

import Button from '../../components/Button';

export default function LocaleError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();
  const t = useTranslations('error');

  useEffect(() => {
    console.error('[locale-error-boundary]', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center w-full min-h-[60dvh] p-4 sm:p-6">
      <div className="bg-accent-200 rounded-2xl shadow-lg px-5 py-6 sm:px-8 sm:py-8 flex flex-col items-center w-full max-w-xl text-center">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-2xl md:text-3xl font-light text-brand-700 mb-3"
        >
          {t('title')}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-sm md:text-base !font-light text-brand-700 mb-5"
        >
          {t('message')}
        </motion.p>
        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <Button
            variant="primary"
            onClick={() => reset()}
            className="!whitespace-nowrap w-full sm:flex-1"
          >
            {t('retry')}
          </Button>
          <Button
            variant="secondary"
            onClick={() => router.push('/')}
            className="!whitespace-nowrap w-full sm:flex-1"
          >
            {t('back')}
          </Button>
        </div>
      </div>
    </div>
  );
}
