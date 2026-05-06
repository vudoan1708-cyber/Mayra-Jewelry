import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { SessionProvider } from 'next-auth/react';

import { routing } from '../../i18n/routing';
import SmoothScroller from '../../components/LenisSmoothScrolling/SmoothScroller';
import Navigation from '../../components/Navigation';
import Footer from '../../components/Footer';
import JewelBackground from '../../components/Background/JewelBackground';
import TopLoader from '../../components/Loading/TopLoader';
import Floating from './Floating';

import './page.css';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata' });

  return {
    title: t('title'),
    description: t('description'),
    openGraph: {
      title: t('title'),
      description: t('ogDescription'),
      siteName: t('title'),
      images: [{ url: '/images/logo.webp' }],
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  return (
    <NextIntlClientProvider>
      <SessionProvider>
        <TopLoader />
        <JewelBackground />
        <SmoothScroller />
        <Navigation />

        <main id="root" className="grid flex-1 w-full min-w-0">
          <div id="portal-before-anchor" className="absolute"></div>
          <div className="min-w-0 overflow-x-clip">
            {children}
          </div>
        </main>

        <Floating />

        <Footer />
      </SessionProvider>
    </NextIntlClientProvider>
  );
}
