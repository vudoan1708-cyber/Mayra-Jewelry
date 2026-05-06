import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import PrivacyView from './View';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata.privacy' });
  return {
    title: t('title'),
    description: t('description'),
    openGraph: { title: t('title'), description: t('description') },
    twitter: { title: t('title'), description: t('description') },
    alternates: { canonical: `/${locale}/privacy` },
  };
}

export default function Page() {
  return <PrivacyView />;
}
