import type { Metadata } from 'next';
import { LayoutGroup } from 'framer-motion';
import { getTranslations } from 'next-intl/server';

import Bio from '../../components/Bio';
import QuickNav from '../../components/Home/QuickNav';
import HomeJewelCanvas from '../../components/Background/HomeJewelCanvas';
import { buildLocalizedMetadata } from '../../i18n/metadata';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata.home' });
  return buildLocalizedMetadata({
    locale,
    path: '',
    title: t('title'),
    description: t('description'),
  });
}

export default function Home() {
  return (
    <LayoutGroup>
      <HomeJewelCanvas />
      <Bio />
      <QuickNav />
    </LayoutGroup>
  );
}
