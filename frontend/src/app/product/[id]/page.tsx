import Wrapper from './Wrapper';
import { getJewelryItem } from '../../../server/data';
import MostViewed from './MostViewed';

export default async function Product({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const jewelryItem = await getJewelryItem(id);

  return (
    <div className="w-full mb-5 grid grid-cols-1 md:grid-cols-[60%_1fr] lg:grid-cols-[2fr_1fr] justify-around gap-2 p-2">
      <Wrapper
        id={id}
        itemName={jewelryItem.itemName}
        featureCollection={jewelryItem.featureCollection}
        type={jewelryItem.type}
        description={jewelryItem.description}
        prices={jewelryItem.prices} />
      <MostViewed id={id} />
    </div>
  );
}
