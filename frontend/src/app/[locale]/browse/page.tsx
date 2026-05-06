import { getLocale, getTranslations } from 'next-intl/server';

import Money from '../../../components/Money/Money';
import Grid from '../../../components/Jewelry/Grid';
import GridItem from '../../../components/Jewelry/GridItem';
import Search, { type BrowseSearchItem } from './Search';

import { getAllJewelry } from '../../../server/data';
import { localizeJewelryItem } from '../../../i18n/productCopy';
import { minPrice } from '../../../helpers';

const thumbnailOf = (media: { fileName: string; url: string }[]) =>
  media.find((file) => file.fileName.endsWith('file-thumbnail'))?.url ?? '';

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
    thumbnail: thumbnailOf(item.media),
    collection: item.featureCollection || null,
  }));

  return (
    <section className="flex flex-col gap-8 py-10">
      <header className="flex flex-col items-center gap-3 px-6 text-center">
        <h1 className="text-3xl sm:text-4xl font-serif text-brand-700">{t('title')}</h1>
        <p className="text-sm text-brand-500/80 max-w-xl">{t('subtitle')}</p>
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
                <div>
                  <b className="text-lg text-gray-800">{item.itemName}</b>
                  {item.featureCollection && (
                    <p className="font-light text-sm">{item.featureCollection}</p>
                  )}
                </div>
                <Money
                  amount={minPrice(item.prices)}
                  currency={item.currency || item.prices[0]?.currency || 'VND'}
                  className="text-brand-700"
                />
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
