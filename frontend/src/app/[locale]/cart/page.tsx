import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import { auth } from '../../auth';
import Cart from './Cart';
import { buildLocalizedMetadata } from '../../../i18n/metadata';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata.cart' });
  return buildLocalizedMetadata({
    locale,
    path: '/cart',
    title: t('title'),
    description: t('description'),
    noIndex: true,
  });
}

export default async function Page() {
  const session = await auth();
  
  return <Cart userId={session?.user?.id ?? ''} userEmail={session?.user?.email ?? ''} />
}
