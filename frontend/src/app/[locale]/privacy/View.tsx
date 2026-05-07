'use client'

import { useTranslations } from 'next-intl';

export default function PrivacyView() {
  const t = useTranslations('privacy');
  return (
    <article className="max-w-3xl mx-auto my-12 px-6 md:px-10 py-10 space-y-6 text-sm leading-relaxed rounded-2xl bg-accent-100 border border-accent-300/40 shadow-xl shadow-black/20 text-brand-700">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">{t('title')}</h1>
        <p className="text-xs opacity-60">{t('updated')}</p>
      </header>

      <p>{t('intro')}</p>

      <section className="space-y-2">
        <h2 className="font-semibold">{t('collectHeading')}</h2>
        <p>{t('collectBody')}</p>
      </section>

      <section className="space-y-2">
        <h2 className="font-semibold">{t('useHeading')}</h2>
        <p>{t('useBody')}</p>
      </section>

      <section className="space-y-2">
        <h2 className="font-semibold">{t('shareHeading')}</h2>
        <p>{t('shareBody')}</p>
      </section>

      <section className="space-y-2">
        <h2 className="font-semibold">{t('retentionHeading')}</h2>
        <p>{t('retentionBody')}</p>
      </section>

      <section className="space-y-2">
        <h2 className="font-semibold">{t('rightsHeading')}</h2>
        <p>{t('rightsBody')}</p>
      </section>

      <section className="space-y-2">
        <h2 className="font-semibold">{t('contactHeading')}</h2>
        <p>{t('contactBody')}</p>
      </section>
    </article>
  );
}
