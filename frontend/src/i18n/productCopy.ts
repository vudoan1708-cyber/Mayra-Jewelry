import type { JewelryItemInfo } from '../../types';
import { routing } from './routing';

type Locale = (typeof routing.locales)[number];

type ProductCopyOverride = {
  itemName?: string;
  description?: string;
  featureCollection?: string;
};

const featureCollectionByLocale: Record<Locale, Record<string, string>> = {
  vi: {},
  en: {
    'Nhẫn đôi': 'Couple Rings',
  },
};

const productCopyByLocale: Record<Locale, Record<string, ProductCopyOverride>> = {
  vi: {},
  en: {
    // Vĩnh Ngân
    'VsSpbmggTmfDom4=': {
      itemName: 'Eternal Silver',
      description: [
        "A union of 'eternity' and 'silver light' — evoking a love that endures, pure as silver caught in morning light.",
        'Each band is crafted in luminous silver, the surface lightly brushed so it catches and scatters light as the angle shifts.',
        'Simple yet meticulously finished — a quiet symbol of harmony and union, made for couples who favour an elegant, sincere line.',
      ].join('\n'),
    },
    // Giọt Ánh Trăng
    'R2nhu410IMOBbmggVHLEg25n': {
      itemName: 'Drops of Moonlight',
      description: [
        'Inspired by the clear sparkle of small stones — like drops of moonlight falling onto a mysterious black-velvet sky.',
        'The band is shaped in luminous silver, set with three small round stones arranged in a vertical line.',
        'Each stone glows softly, catching natural light with a quiet grace.',
        'The whole feels pure and minimal, yet full of allure — made for those drawn to a refined, gentle style.',
      ].join('\n'),
    },
  },
};

type LocalizableJewelry = Pick<JewelryItemInfo, 'directoryId' | 'itemName' | 'description' | 'featureCollection'>;

export function localizeJewelryItem<T extends LocalizableJewelry>(item: T, locale: string): T {
  const overrides = productCopyByLocale[locale as Locale]?.[item.directoryId];
  const collectionLabel = featureCollectionByLocale[locale as Locale]?.[item.featureCollection];
  if (!overrides && !collectionLabel) return item;
  return {
    ...item,
    itemName: overrides?.itemName ?? item.itemName,
    description: overrides?.description ?? item.description,
    featureCollection: overrides?.featureCollection ?? collectionLabel ?? item.featureCollection,
  };
}
