import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import { auth } from '../../auth';
import Cart from './Cart';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata.cart' });
  return {
    title: t('title'),
    description: t('description'),
    robots: { index: false, follow: false },
    alternates: { canonical: `/${locale}/cart` },
  };
}

export default async function Page() {
  const session = await auth();
  
  return <Cart userId={session?.user?.id ?? ''} userEmail={session?.user?.email ?? ''} />
}
