import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import SelectProvider from './SelectProvider';
import { auth } from '../../auth';
import { getBuyer, getOrdersByBuyerId } from '../../../server/data';
import { userIdOrBase64Email } from '../../../helpers';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata.account' });
  return {
    title: t('title'),
    description: t('description'),
    robots: { index: false, follow: false },
    alternates: { canonical: `/${locale}/account` },
  };
}

export default async function Page({ searchParams }: { searchParams: Promise<{ [key: string]: string | undefined }> }) {
  const [session, params] = await Promise.all([auth(), searchParams]);

  const buyerId = userIdOrBase64Email(session?.user);
  const buyer = buyerId ? await getBuyer(buyerId, ['tier', 'mayraPoint']) : undefined;
  const orders = buyerId ? await getOrdersByBuyerId(userIdOrBase64Email(session?.user)) : undefined;
  return <SelectProvider
    session={session}
    orders={orders}
    buyer={buyer}
    autoSignIn={params.autoSignin === 'true'}
    redirection={params.from} />;
}
