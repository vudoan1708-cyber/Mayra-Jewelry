import type { Metadata } from 'next';
import { ArrowLeft } from 'lucide-react';
import { getLocale, getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';

import Money from '../../../../components/Money/Money';
import Grid from '../../../../components/Jewelry/Grid';
import GridItem from '../../../../components/Jewelry/GridItem';
import { Link } from '../../../../i18n/navigation';
import { localizeJewelryItem } from '../../../../i18n/productCopy';
import { getAllJewelry } from '../../../../server/data';
import { minPrice, slugifyCollection } from '../../../../helpers';
import type { JewelryItemInfo } from '../../../../../types';

const VIRTUAL_BEST = 'best-sellers';
const VIRTUAL_FEATURED = 'featured';

type ResolvedCollection = {
  name: string;
  items: JewelryItemInfo[];
  virtualKey?: 'best' | 'featured';
};

function resolveCollection(
  slug: string,
  items: JewelryItemInfo[],
  virtualNames: { best: string; featured: string },
): ResolvedCollection | null {
  if (slug === VIRTUAL_BEST) {
    return {
      name: virtualNames.best,
      items: items.filter((item) => item.bestSeller),
      virtualKey: 'best',
    };
  }
  if (slug === VIRTUAL_FEATURED) {
    return {
      name: virtualNames.featured,
      items: items.filter((item) => item.featureCollection?.trim()),
      virtualKey: 'featured',
    };
  }
  const matching = items.filter(
    (item) => item.featureCollection && slugifyCollection(item.featureCollection) === slug,
  );
  if (matching.length === 0) return null;
  return {
    name: matching[0].featureCollection,
    items: matching,
  };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; collectionName: string }>;
}): Promise<Metadata> {
  const { locale, collectionName } = await params;
  const [items, t, tCat] = await Promise.all([
    getAllJewelry().catch(() => [] as JewelryItemInfo[]),
    getTranslations({ locale, namespace: 'metadata.collection' }),
    getTranslations({ locale, namespace: 'home.categories' }),
  ]);
  const localized = items.map((item) => localizeJewelryItem(item, locale));
  const resolved = resolveCollection(collectionName, localized, {
    best: tCat('bestSellers.name'),
    featured: tCat('featured.name'),
  });
  const name = resolved?.name ?? decodeURIComponent(collectionName);
  return {
    title: t('title', { name }),
    description: t('description', { name }),
    openGraph: { title: t('title', { name }), description: t('description', { name }) },
    twitter: { title: t('title', { name }), description: t('description', { name }) },
    alternates: { canonical: `/${locale}/collections/${collectionName}` },
  };
}

export default async function Collection({
  params,
}: {
  params: Promise<{ collectionName: string }>;
}) {
  const { collectionName } = await params;
  const [items, locale, t, tCat] = await Promise.all([
    getAllJewelry().catch(() => [] as JewelryItemInfo[]),
    getLocale(),
    getTranslations('collections'),
    getTranslations('home.categories'),
  ]);

  const localized = items.map((item) => localizeJewelryItem(item, locale));
  const resolved = resolveCollection(collectionName, localized, {
    best: tCat('bestSellers.name'),
    featured: tCat('featured.name'),
  });

  if (!resolved) notFound();

  const sorted = [...resolved.items].sort((a, b) => {
    if (a.bestSeller !== b.bestSeller) return a.bestSeller ? -1 : 1;
    return (b.purchases ?? 0) - (a.purchases ?? 0);
  });

  const eyebrow =
    resolved.virtualKey === 'best'
      ? tCat('bestSellers.eyebrow')
      : resolved.virtualKey === 'featured'
        ? tCat('featured.eyebrow')
        : t('eyebrow');

  return (
    <section className="relative w-full pb-16">
      <header className="relative overflow-hidden bg-gradient-to-br from-brand-700 via-brand-600 to-brand-500 text-white pt-12 pb-10 md:pt-16 md:pb-14">
        <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-accent-300/15 blur-3xl" />
        <div className="absolute -bottom-24 -right-24 w-72 h-72 rounded-full bg-accent-400/10 blur-3xl" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-8">
          <Link
            href="/collections"
            className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.3em] text-accent-300/90 [text-decoration:none] hover:text-accent-200 transition-colors"
          >
            <ArrowLeft className="size-3.5" />
            {t('backToCollections')}
          </Link>
          <p className="mt-6 text-[11px] uppercase tracking-[0.4em] text-accent-300 font-semibold">
            {eyebrow}
          </p>
          <h1 className="mt-3 text-3xl md:text-5xl font-light leading-[1.05] tracking-tight">
            {resolved.name}
          </h1>
          <div className="mt-5 inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.35em] text-accent-300/90">
            <span className="h-px w-8 bg-accent-300/60" />
            {t('itemCount', { count: sorted.length })}
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto -mt-4 md:-mt-6">
        {sorted.length === 0 ? (
          <div className="m-6 rounded-2xl border border-dashed border-accent-400/40 bg-brand-700/40 backdrop-blur-sm p-12 text-center text-accent-200/80">
            <p className="text-lg">{t('emptyCollection')}</p>
          </div>
        ) : (
          <Grid>
            {sorted.map((item) => (
              <GridItem
                key={`collection-${item.directoryId}`}
                encodedId={item.directoryId}
                media={item.media}
                alt={item.description || item.itemName}
              >
                <div className="w-full min-w-0">
                  {item.bestSeller && (
                    <p className="text-[10px] uppercase tracking-[0.3em] text-accent-600 truncate">
                      {t('bestSellerTag')}
                    </p>
                  )}
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="text-sm md:text-base font-semibold text-brand-700 truncate min-w-0">
                      {item.itemName}
                    </p>
                    <Money
                      amount={minPrice(item.prices)}
                      currency={item.currency || item.prices[0]?.currency || 'VND'}
                      className="text-sm font-semibold text-brand-700 shrink-0"
                    />
                  </div>
                </div>
              </GridItem>
            ))}
          </Grid>
        )}
      </div>
    </section>
  );
}

export const dynamic = 'force-dynamic';
