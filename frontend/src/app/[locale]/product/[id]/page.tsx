import type { Metadata } from 'next';
import { getLocale, getTranslations } from 'next-intl/server';

import Wrapper from './Wrapper';
import MostViewed from './MostViewed';
import { auth } from '../../../auth';
import { getJewelryItem, updateJewelry } from '../../../../server/data';
import { browseThumbnailOf } from '../../../../helpers';
import { localizeJewelryItem } from '../../../../i18n/productCopy';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}): Promise<Metadata> {
  const { locale, id } = await params;
  const decodedId = decodeURIComponent(id);
  const [t, item] = await Promise.all([
    getTranslations({ locale, namespace: 'metadata.product' }),
    getJewelryItem(decodedId).catch(() => null),
  ]);
  const localized = item ? localizeJewelryItem(item, locale) : null;
  const name = localized?.itemName ?? 'Mayra';
  const description = localized?.description?.split('\n')[0] ?? t('description', { name });
  const thumbnail = item ? browseThumbnailOf(item.media) : undefined;
  return {
    title: t('title', { name }),
    description,
    openGraph: {
      title: t('title', { name }),
      description,
      type: 'website',
      images: thumbnail ? [{ url: thumbnail, alt: name }] : undefined,
    },
    twitter: {
      card: thumbnail ? 'summary_large_image' : 'summary',
      title: t('title', { name }),
      description,
      images: thumbnail ? [thumbnail] : undefined,
    },
    alternates: { canonical: `/${locale}/product/${id}` },
  };
}

export default async function Product({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const decodedId = decodeURIComponent(id);

  const [session, jewelryItem, locale] = await Promise.all([auth(), getJewelryItem(decodedId), getLocale()]);
  const localized = localizeJewelryItem(jewelryItem, locale);

  // As soon as this page loads, it means the view count of this produce has increased
  await updateJewelry({ directoryId: decodedId, views: jewelryItem.views + 1 });
  return (
    <div className="w-full mb-5 grid grid-cols-1 md:grid-cols-[60%_1fr] lg:grid-cols-[2fr_1fr] justify-around gap-2 p-2">
      <Wrapper
        id={decodedId}
        itemName={localized.itemName}
        featureCollection={localized.featureCollection}
        type={jewelryItem.type}
        description={localized.description}
        prices={jewelryItem.prices}
        purchases={jewelryItem.purchases}
        media={jewelryItem.media}
        session={session} />
      <MostViewed id={id} />
    </div>
  );
}
