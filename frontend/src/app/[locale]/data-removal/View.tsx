'use client'

import { useTranslations } from 'next-intl';

export default function DeleteView() {
  const t = useTranslations('delete');
  return (
    <article className="max-w-3xl mx-auto my-12 px-6 md:px-10 py-10 space-y-6 text-sm leading-relaxed rounded-2xl bg-accent-100 border border-accent-300/40 shadow-xl shadow-black/20 text-brand-700">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">{t('title')}</h1>
        <p className="text-xs opacity-60">{t('updated')}</p>
      </header>

      <p>{t('intro')}</p>

      <section className="space-y-2">
        <h2 className="font-semibold">{t('storedHeading')}</h2>
        <p>{t('storedBody')}</p>
      </section>

      <section className="space-y-2">
        <h2 className="font-semibold">{t('howHeading')}</h2>
        <ol className="list-decimal pl-5 space-y-1">
          <li>{t('howStep1')}</li>
          <li>{t('howStep2')}</li>
        </ol>
      </section>

      <section className="space-y-2">
        <h2 className="font-semibold">{t('timelineHeading')}</h2>
        <p>{t('timelineBody')}</p>
      </section>

      <section className="space-y-2">
        <h2 className="font-semibold">{t('contactHeading')}</h2>
        <p>{t('contactBody')}</p>
      </section>
    </article>
  );
}
