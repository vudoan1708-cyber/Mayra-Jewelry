import type { JewelryItemInfo } from '../../types';
import { routing } from './routing';

type Locale = (typeof routing.locales)[number];

type LocalizableJewelry = Pick<
  JewelryItemInfo,
  'directoryId' | 'itemName' | 'description' | 'featureCollection' | 'translations'
>;

const isBaseLocale = (locale: string) => locale === 'vi';

export function localizeJewelryItem<T extends LocalizableJewelry>(item: T, locale: string): T {
  if (isBaseLocale(locale)) return item;
  const override = item.translations?.[locale as Locale];
  if (!override) return item;
  return {
    ...item,
    itemName: override.itemName?.trim() || item.itemName,
    description: override.description?.trim() || item.description,
    featureCollection: override.featureCollection?.trim() || item.featureCollection,
  };
}
