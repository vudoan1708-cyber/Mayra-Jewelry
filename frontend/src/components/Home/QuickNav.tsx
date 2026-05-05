import { getBestSellers, getFeatureCollectionThumbnails } from '../../server/data';
import QuickNavView, { type QuickNavCard } from './QuickNavView';
import { minPrice } from '../../helpers';

const thumbnailOf = (item: { media: { fileName: string; url: string }[] }) =>
  item.media.find((m) => m.fileName.endsWith('file-thumbnail'))?.url ?? '';

export default async function QuickNav() {
  const [best, featured] = await Promise.all([
    getBestSellers().catch(() => []),
    getFeatureCollectionThumbnails().catch(() => []),
  ]);

  const seen = new Set<string>();
  const featuredCards: QuickNavCard[] = [...best, ...featured]
    .filter((item) => {
      if (seen.has(item.directoryId)) return false;
      seen.add(item.directoryId);
      return true;
    })
    .slice(0, 12)
    .map((item) => ({
      id: item.directoryId,
      href: `/product/${item.directoryId}`,
      image: thumbnailOf(item),
      name: item.itemName,
      eyebrow: item.featureCollection ?? null,
      price: minPrice(item.prices),
      currency: item.currency,
    }));

  return <QuickNavView featured={featuredCards} />;
}
