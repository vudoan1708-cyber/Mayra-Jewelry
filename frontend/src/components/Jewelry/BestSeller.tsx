import { getTranslations } from 'next-intl/server';

import Money from '../Money/Money';
import Grid from './Grid';
import GridItem from './GridItem';

import { getBestSellers } from '../../server/data';
import { minPrice } from '../../helpers';

export default async function BestSeller() {
  const bestSellerItems = await getBestSellers();
  const t = await getTranslations('jewelry');

  return (
    <>
      {bestSellerItems.length > 0
        ? (
            <Grid>
              {
                bestSellerItems.map((item) => (
                  <GridItem
                    key={`best-seller-${item.directoryId}`}
                    encodedId={item.directoryId}
                    media={item.media}
                    alt={item.description}>
                    <div>
                      <b className="text-lg text-gray-800">{item.itemName}</b>
                    </div>
                    <b><Money amount={minPrice(item.prices)} currency={item.currency} /></b>
                  </GridItem>
                ))
              }
            </Grid>
          )
        : (
          <div className="m-6">
            <p className="text-[70px] text-center select-none">🥹</p>
            <p className="text-center text-base !font-light">{t('noItemsYet')}</p>
          </div>
        )
      }
    </>
  )
};
