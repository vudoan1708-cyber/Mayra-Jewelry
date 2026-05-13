import { getLocale } from 'next-intl/server';

import type { JewelryItemInfo } from '../../../types';
import { getAllJewelry, getBestSellers, getFeatureCollectionThumbnails } from '../../server/data';
import QuickNavView, { type QuickNavCard, type QuickNavCover } from './QuickNavView';
import { browseThumbnailOf, minPrice } from '../../helpers';
import { localizeJewelryItem } from '../../i18n/productCopy';

const hasThumbnail = (item: JewelryItemInfo) => Boolean(browseThumbnailOf(item.media));

const byBestSellerRank = (a: JewelryItemInfo, b: JewelryItemInfo) =>
  (b.purchases - a.purchases) || (b.views - a.views);

const pickBestSeller = (items: JewelryItemInfo[], used: Set<string>) =>
  items
    .filter((item) => hasThumbnail(item) && !used.has(item.directoryId))
    .sort(byBestSellerRank)[0];

const pickFeatured = (items: JewelryItemInfo[], used: Set<string>) =>
  items.find((item) =>
    Boolean(item.featureCollection) && hasThumbnail(item) && !used.has(item.directoryId),
  );

const pickAny = (items: JewelryItemInfo[], used: Set<string>) =>
  items.find((item) => hasThumbnail(item) && !used.has(item.directoryId));

export default async function QuickNav() {
  const [best, featured, all, locale] = await Promise.all([
    getBestSellers(),
    getFeatureCollectionThumbnails(),
    getAllJewelry(),
    getLocale(),
  ]);

  const dedupedPool: JewelryItemInfo[] = [];
  const seen = new Set<string>();
  for (const item of [...best, ...featured, ...all]) {
    if (seen.has(item.directoryId)) continue;
    seen.add(item.directoryId);
    dedupedPool.push(item);
  }

  const used = new Set<string>();

  const bestSellerItem =
    pickBestSeller(best, used) ?? pickBestSeller(dedupedPool, used);
  if (bestSellerItem) used.add(bestSellerItem.directoryId);

  const featuredItem =
    pickFeatured(featured, used) ??
    pickFeatured(dedupedPool, used) ??
    pickAny(dedupedPool, used);
  if (featuredItem) used.add(featuredItem.directoryId);

  const discoverItem =
    pickAny(dedupedPool, used) ??
    dedupedPool.find(hasThumbnail);
  if (discoverItem) used.add(discoverItem.directoryId);

  const toCover = (item: JewelryItemInfo | undefined): QuickNavCover | null => {
    if (!item) return null;
    const image = browseThumbnailOf(item.media);
    return image ? { image } : null;
  };

  const covers: Array<QuickNavCover | null> = [
    toCover(discoverItem),
    toCover(bestSellerItem),
    toCover(featuredItem),
  ];

  const carouselSeen = new Set<string>();
  const featuredCards: QuickNavCard[] = [...best, ...featured]
    .filter((item) => {
      if (carouselSeen.has(item.directoryId)) return false;
      carouselSeen.add(item.directoryId);
      return true;
    })
    .slice(0, 12)
    .map((item) => {
      const localized = localizeJewelryItem(item, locale);
      return {
        id: item.directoryId,
        href: `/product/${item.directoryId}`,
        image: browseThumbnailOf(item.media) ?? '',
        name: localized.itemName,
        eyebrow: localized.featureCollection ?? null,
        price: minPrice(item.prices),
        currency: item.currency,
      };
    });

  return <QuickNavView covers={covers} featured={featuredCards} />;
}
