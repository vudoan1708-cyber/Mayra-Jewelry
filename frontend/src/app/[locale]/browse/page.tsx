import type { Metadata } from 'next';
import { getLocale, getTranslations } from 'next-intl/server';

import Money from '../../../components/Money/Money';
import Grid from '../../../components/Jewelry/Grid';
import GridItem from '../../../components/Jewelry/GridItem';
import Search, { type BrowseSearchItem } from './Search';

import { getAllJewelry } from '../../../server/data';
import { localizeJewelryItem } from '../../../i18n/productCopy';
import { browseThumbnailOf, minPrice } from '../../../helpers';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata.browse' });
  return {
    title: t('title'),
    description: t('description'),
    openGraph: { title: t('title'), description: t('description') },
    twitter: { title: t('title'), description: t('description') },
    alternates: { canonical: `/${locale}/browse` },
  };
}


export default async function Page() {
  const [items, locale, t] = await Promise.all([
    getAllJewelry().catch(() => []),
    getLocale(),
    getTranslations('browse'),
  ]);

  const localized = items.map((item) => localizeJewelryItem(item, locale));
  const sorted = [...localized].sort((a, b) =>
    a.itemName.localeCompare(b.itemName, locale, { sensitivity: 'base' }),
  );

  const searchItems: BrowseSearchItem[] = sorted.map((item) => ({
    id: item.directoryId,
    name: item.itemName,
    thumbnail: browseThumbnailOf(item.media) ?? '',
    collection: item.featureCollection || null,
    price: minPrice(item.prices),
    currency: item.currency || item.prices[0]?.currency || 'VND',
  }));

  return (
    <section className="flex flex-col gap-8 py-10">
      <header className="flex flex-col items-center gap-3 px-6 text-center">
        <h1 className="text-3xl sm:text-4xl font-serif text-accent-500">{t('title')}</h1>
      </header>

      <div className="px-6">
        <Search items={searchItems} />
      </div>

      {sorted.length > 0
        ? (
          <Grid>
            {sorted.map((item) => (
              <GridItem
                key={`browse-${item.directoryId}`}
                encodedId={item.directoryId}
                media={item.media}
                alt={item.description || item.itemName}>
                <div className="w-full min-w-0">
                  {item.featureCollection && (
                    <p className="text-[10px] uppercase tracking-[0.3em] text-accent-600 truncate">
                      {item.featureCollection}
                    </p>
                  )}
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="text-sm md:text-base font-semibold text-brand-700 truncate min-w-0">{item.itemName}</p>
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
        )
        : (
          <div className="m-6 flex flex-col gap-3">
            <p className="text-[70px] text-center select-none">🥹</p>
            <p className="text-center text-base !font-light">{t('empty')}</p>
          </div>
        )
      }
    </section>
  );
}
