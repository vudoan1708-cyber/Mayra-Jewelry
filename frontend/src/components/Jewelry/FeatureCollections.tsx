import { getTranslations } from 'next-intl/server';

import Money from '../Money/Money';
import Grid from './Grid';
import GridItem from './GridItem';
import { getFeatureCollectionThumbnails } from '../../server/data';
import type { Prices } from '../../../types';

export default async function FeatureCollections() {
  const featureCollections = await getFeatureCollectionThumbnails();
  const t = await getTranslations('jewelry');

  const minPrice = (prices: Prices[]) => {
    let currentPrice = prices[0].amount;
    prices.forEach((item) => {
      currentPrice = Math.min(item.amount, currentPrice);
    });
    return currentPrice;
  };

  return (
    <>
      {featureCollections.length > 0
        ? (
            <Grid>
              {
                featureCollections.map((item) => (
                  <GridItem
                    key={`feature-${item.directoryId}`}
                    encodedId={item.directoryId}
                    media={item.media}
                    alt={item.description}>
                    <div>
                      <b className="text-lg text-gray-800">{item.featureCollection} {t('collectionSuffix')}</b>
                      <p className="font-light">{item.itemName}</p>
                    </div>
                    <b><Money amount={minPrice(item.prices)} currency={item.currency} /></b>
                  </GridItem>
                ))
              }
            </Grid>
          )
        : (
          <div className="m-6 flex flex-col gap-3">
            <p className="text-[70px] text-center select-none">🥹</p>
            <p className="text-center text-base !font-light">{t('noItemsYet')}</p>
          </div>
        )
      }
    </>
  )
}
