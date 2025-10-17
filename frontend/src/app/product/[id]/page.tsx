import Wrapper from './Wrapper';
import MostViewed from './MostViewed';
import { auth } from '../../auth';
import { getJewelryItem, updateJewelry } from '../../../server/data';

export default async function Product({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const decodedId = decodeURIComponent(id);

  const session = await auth();

  const jewelryItem = await getJewelryItem(decodedId);

  // As soon as this page loads, it means the view count of this produce has increased
  await updateJewelry({ directoryId: decodedId, views: jewelryItem.views + 1 });

  return (
    <div className="w-full mb-5 grid grid-cols-1 md:grid-cols-[60%_1fr] lg:grid-cols-[2fr_1fr] justify-around gap-2 p-2">
      <Wrapper
        id={decodedId}
        itemName={jewelryItem.itemName}
        featureCollection={jewelryItem.featureCollection}
        type={jewelryItem.type}
        description={jewelryItem.description}
        prices={jewelryItem.prices}
        userId={session?.user?.id ?? ''} />
      <MostViewed id={id} />
    </div>
  );
}
