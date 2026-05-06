import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import DisplayWishlist from './DisplayWishlist';
import { auth } from '../../auth';
import { getBuyerWishlist } from '../../../server/data';
import { userIdOrBase64Email } from '../../../helpers';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata.wishlist' });
  return {
    title: t('title'),
    description: t('description'),
    robots: { index: false, follow: false },
    alternates: { canonical: `/${locale}/wishlist` },
  };
}

export default async function Page({ searchParams }: {
  searchParams: Promise<{ [key: string]: string | undefined }>
}) {
  const session = await auth();
  const buyerId = userIdOrBase64Email(session?.user);
  const wishlistItems = buyerId ? await getBuyerWishlist(buyerId) : [];

  const params = await searchParams;
  const from = params.from;
  return (
    <DisplayWishlist from={from} wishlistItems={wishlistItems} />
  );
}
