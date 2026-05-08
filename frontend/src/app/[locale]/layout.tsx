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
import { getSiteBanner } from '../../server/data';

import './page.css';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata' });
  const isVi = locale === 'vi';

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: t('title'),
      template: `%s · ${t('title')}`,
    },
    description: t('description'),
    applicationName: t('siteName'),
    generator: 'Next.js',
    keywords: t('keywords').split(',').map((k) => k.trim()),
    authors: [{ name: t('siteName') }],
    creator: t('siteName'),
    publisher: t('siteName'),
    category: 'shopping',
    formatDetection: { email: false, address: false, telephone: false },
    icons: {
      icon: '/favicon.ico',
      shortcut: '/favicon.ico',
      apple: '/images/logo.webp',
    },
    alternates: {
      canonical: `/${locale}`,
      languages: {
        en: '/en',
        vi: '/vi',
        'x-default': `/${routing.defaultLocale}`,
      },
    },
    openGraph: {
      type: 'website',
      url: `${SITE_URL}/${locale}`,
      siteName: t('siteName'),
      title: t('title'),
      description: t('ogDescription'),
      locale: isVi ? 'vi_VN' : 'en_US',
      alternateLocale: isVi ? ['en_US'] : ['vi_VN'],
      images: [
        {
          url: '/images/logo.webp',
          width: 1200,
          height: 630,
          alt: t('siteName'),
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: t('title'),
      description: t('twitterDescription'),
      images: ['/images/logo.webp'],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        'max-snippet': -1,
        'max-video-preview': -1,
      },
    },
    referrer: 'origin-when-cross-origin',
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

  const banner = await getSiteBanner();

  return (
    <NextIntlClientProvider>
      <SessionProvider>
        <TopLoader />
        <JewelBackground />
        <SmoothScroller />
        <Navigation initialBanner={banner} />

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
