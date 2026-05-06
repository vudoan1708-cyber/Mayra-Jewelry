import type { Metadata } from 'next';
import { getLocale, getTranslations } from 'next-intl/server';

import NotFoundView from './NotFoundView';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = await getTranslations({ locale, namespace: 'metadata.notFound' });
  return {
    title: t('title'),
    description: t('description'),
    robots: { index: false, follow: false },
  };
}

export default function NotFound() {
  return <NotFoundView />;
}
