import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import PrivacyView from './View';
import { buildLocalizedMetadata } from '../../../i18n/metadata';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata.privacy' });
  return buildLocalizedMetadata({
    locale,
    path: '/privacy',
    title: t('title'),
    description: t('description'),
  });
}

export default function Page() {
  return <PrivacyView />;
}
