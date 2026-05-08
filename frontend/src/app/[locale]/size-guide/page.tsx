import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import SizeGuideView from './SizeGuideView';
import { buildLocalizedMetadata } from '../../../i18n/metadata';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata.sizeGuide' });
  return buildLocalizedMetadata({
    locale,
    path: '/size-guide',
    title: t('title'),
    description: t('description'),
  });
}

export default function Page() {
  return <SizeGuideView />;
}
