import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

const prettify = (slug: string) =>
  decodeURIComponent(slug)
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; collectionName: string }>;
}): Promise<Metadata> {
  const { locale, collectionName } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata.collection' });
  const name = prettify(collectionName);
  return {
    title: t('title', { name }),
    description: t('description', { name }),
    openGraph: { title: t('title', { name }), description: t('description', { name }) },
    twitter: { title: t('title', { name }), description: t('description', { name }) },
    alternates: { canonical: `/${locale}/collections/${collectionName}` },
  };
}

export default function Collection() {
  return 'Hello'
}
