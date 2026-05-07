import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import SizeGuideView from './SizeGuideView';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata.sizeGuide' });
  return {
    title: t('title'),
    description: t('description'),
    alternates: { canonical: `/${locale}/size-guide` },
  };
}

export default function Page() {
  return <SizeGuideView />;
}
