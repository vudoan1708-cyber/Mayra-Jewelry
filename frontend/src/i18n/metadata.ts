import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import { routing } from './routing';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

const OG_LOCALE: Record<string, string> = {
  vi: 'vi_VN',
  en: 'en_US',
};

type OgImage = {
  url: string;
  width?: number;
  height?: number;
  alt?: string;
};

type BuildArgs = {
  locale: string;
  path?: string;
  title: string;
  description: string;
  ogImage?: OgImage;
  noIndex?: boolean;
};

function buildLanguageAlternates(path: string): Record<string, string> {
  const languages: Record<string, string> = {};
  for (const l of routing.locales) {
    languages[l] = `/${l}${path}`;
  }
  languages['x-default'] = `/${routing.defaultLocale}${path}`;
  return languages;
}

export async function buildLocalizedMetadata({
  locale,
  path = '',
  title,
  description,
  ogImage,
  noIndex,
}: BuildArgs): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'metadata' });
  const ownLocale = OG_LOCALE[locale] ?? OG_LOCALE[routing.defaultLocale];
  const alternateLocales = routing.locales
    .filter((l) => l !== locale)
    .map((l) => OG_LOCALE[l])
    .filter(Boolean);

  const image: OgImage = ogImage ?? {
    url: '/images/logo.webp',
    width: 1200,
    height: 630,
    alt: t('siteName'),
  };

  const url = `${SITE_URL}/${locale}${path}`;

  return {
    title,
    description,
    alternates: {
      canonical: `/${locale}${path}`,
      languages: buildLanguageAlternates(path),
    },
    openGraph: {
      type: 'website',
      url,
      siteName: t('siteName'),
      title,
      description,
      locale: ownLocale,
      alternateLocale: alternateLocales,
      images: [image],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image.url],
    },
    ...(noIndex ? { robots: { index: false, follow: false } } : {}),
  };
}
