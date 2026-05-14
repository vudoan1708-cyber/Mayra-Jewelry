import { getTranslations } from 'next-intl/server';

import Money from '../Money/Money';
import Grid from './Grid';
import GridItem from './GridItem';
import { getFeatureCollectionThumbnails } from '../../server/data';
import { lowestPriceEntry } from '../../helpers';

export default async function FeatureCollections() {
  const featureCollections = await getFeatureCollectionThumbnails();
  const t = await getTranslations('jewelry');

  return (
    <>
      {featureCollections.length > 0
        ? (
            <Grid>
              {
                featureCollections.map((item) => {
                  const cheapest = lowestPriceEntry(item.prices);
                  return (
                    <GridItem
                      key={`feature-${item.directoryId}`}
                      encodedId={item.directoryId}
                      media={item.media}
                      alt={item.description}>
                      <div>
                        <b className="text-lg text-gray-800">{item.featureCollection} {t('collectionSuffix')}</b>
                        <p className="font-light">{item.itemName}</p>
                      </div>
                      <Money amount={cheapest.amount} discount={cheapest.discount} currency={item.currency} />
                    </GridItem>
                  );
                })
              }
            </Grid>
          )
        : (
          <div className="m-6 flex flex-col justify-center items-center">
            <div className="bg-accent-200 rounded-2xl shadow-lg px-5 py-4 flex flex-col items-center max-w-md text-center">
              <p className="text-[70px] text-center select-none leading-none">🥹</p>
              <p className="mt-2 text-center text-base !font-light text-brand-700">{t('noItemsYet')}</p>
            </div>
          </div>
        )
      }
    </>
  )
}
