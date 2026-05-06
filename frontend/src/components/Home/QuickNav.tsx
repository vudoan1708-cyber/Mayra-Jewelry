import { getLocale } from 'next-intl/server';

import { getBestSellers, getFeatureCollectionThumbnails } from '../../server/data';
import QuickNavView, { type QuickNavCard } from './QuickNavView';
import { minPrice } from '../../helpers';
import { localizeJewelryItem } from '../../i18n/productCopy';

const thumbnailOf = (item: { media: { fileName: string; url: string }[] }) =>
  item.media.find((m) => m.fileName.endsWith('file-thumbnail'))?.url ?? '';

export default async function QuickNav() {
  const [best, featured, locale] = await Promise.all([
    getBestSellers().catch(() => []),
    getFeatureCollectionThumbnails().catch(() => []),
    getLocale(),
  ]);

  const seen = new Set<string>();
  const featuredCards: QuickNavCard[] = [...best, ...featured]
    .filter((item) => {
      if (seen.has(item.directoryId)) return false;
      seen.add(item.directoryId);
      return true;
    })
    .slice(0, 12)
    .map((item) => {
      const localized = localizeJewelryItem(item, locale);
      return {
        id: item.directoryId,
        href: `/product/${item.directoryId}`,
        image: thumbnailOf(item),
        name: localized.itemName,
        eyebrow: localized.featureCollection ?? null,
        price: minPrice(item.prices),
        currency: item.currency,
      };
    });

  return <QuickNavView featured={featuredCards} />;
}
