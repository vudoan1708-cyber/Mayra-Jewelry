import Money from '../Money/Money';
import Grid from './Grid';
import GridItem from './GridItem';

import { getBestSellers } from '../../server/data';
import type { Prices } from '../../../types';

export default async function BestSeller() {
  const bestSellerItems = await getBestSellers();

  const minPrice = (prices: Prices[]) => {
    let currentPrice = prices[0].amount;
    prices.forEach((item) => {
      currentPrice = Math.min(item.amount, currentPrice);
    });
    return currentPrice;
  };

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
            <p className="text-center text-base !font-light">Shop chưa bán được nhiều nên chưa hiện thông tin này được. Ủng hộ shop với nhé</p>
          </div>
        )
      }
    </>
  )
};
