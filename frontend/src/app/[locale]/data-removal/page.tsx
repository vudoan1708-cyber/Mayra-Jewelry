import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import DeleteView from './View';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata.delete' });
  return {
    title: t('title'),
    description: t('description'),
    openGraph: { title: t('title'), description: t('description') },
    twitter: { title: t('title'), description: t('description') },
    alternates: { canonical: `/${locale}/data-removal` },
  };
}

export default function Page() {
  return <DeleteView />;
}
