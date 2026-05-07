import { getLocale } from 'next-intl/server';

import Image from 'next/image';
import MotionFramerWrapper from './MotionFramerWrapper';
import { getMostViewedJewelryItems } from '../../../../server/data';
import NavItem from '../../../../components/Navigation/NavItem';
import Money from '../../../../components/Money/Money';
import { browseThumbnailOf, minPrice } from '../../../../helpers';
import { localizeJewelryItem } from '../../../../i18n/productCopy';

export default async function MostViewed({ id }: { id: string }) {
  const [jewelryItems, locale] = await Promise.all([getMostViewedJewelryItems(id), getLocale()]);
  const localizedItems = jewelryItems.map((item) => localizeJewelryItem(item, locale));
  return (
    <MotionFramerWrapper>
      {localizedItems.length > 0
        ? localizedItems.map((item, idx) => (
            <NavItem key={idx} href={`/product/${item.directoryId}`} withBorder={false} withHover={false}>
              <figure className="text-sm h-80 overflow-hidden">
                <Image
                  key={idx}
                  id={item.directoryId}
                  src={browseThumbnailOf(item.media) ?? ''}
                  alt={item.itemName}
                  width="360"
                  height="360"
                  style={{ objectFit: "contain", width: "auto", height: "auto" }}
                  className="border rounded-lg max-w-[360px] max-h-[360px] cursor-pointer hover:opacity-90 hover:scale-105 transition-all" />
                <figcaption className="absolute bottom-0 w-full bg-accent-100/95 backdrop-blur-sm flex justify-between items-center gap-2 px-2 py-1.5">
                  <b className="text-base text-brand-700 truncate">{item.itemName}</b>
                  <b className="text-brand-700 font-bold shrink-0"><Money amount={minPrice(item.prices)} currency={item.currency} /></b>
                </figcaption>
              </figure>
            </NavItem>
          ))
        : <></>
      }
    </MotionFramerWrapper>
  )
};
