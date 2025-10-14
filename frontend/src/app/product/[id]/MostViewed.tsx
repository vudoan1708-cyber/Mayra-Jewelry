import Image from 'next/image';
import MotionFramerWrapper from './MotionFramerWrapper';
import { getMostViewedJewelryItems } from '../../../server/data';
import NavItem from '../../../components/Navigation/NavItem';
import Money from '../../../components/Money/Money';
import { minPrice } from '../../../helpers';

export default async function MostViewed({ id }: { id: string }) {
  const jewelryItems = await getMostViewedJewelryItems(id);
  return (
    <MotionFramerWrapper>
      {jewelryItems.length > 0
        ? jewelryItems.map((item, idx) => (
            <NavItem key={idx} href={`/product/${item.directoryId}`} withBorder={false} withHover={false}>
              <figure className="text-sm h-80 overflow-hidden">
                <Image
                  key={idx}
                  id={item.directoryId}
                  src={item.media?.[0].url}
                  alt={item.itemName}
                  width="360"
                  height="360"
                  style={{ objectFit: "contain", width: "auto", height: "auto" }}
                  className="border rounded-lg max-w-[360px] max-h-[360px] cursor-pointer hover:opacity-90 transition-all" />
                <figcaption className="absolute bottom-0 w-full bg-transparent-white flex justify-between items-center px-2 py-1">
                  <b className="text-lg text-gray-800">{item.itemName}</b>
                  <b><Money amount={minPrice(item.prices)} currency={item.currency} /></b>
                </figcaption>
              </figure>
            </NavItem>
          ))
        : <></>
      }
    </MotionFramerWrapper>
  )
};
