import Image from 'next/image';
import { motion } from 'framer-motion';

import Variation, { type JewelryVariation } from '../../../components/Jewelry/Variation';
import { Heart, ShoppingCart } from 'lucide-react';
import Button from '../../../components/Button';
import { useCartCount } from '../../../stores/CartCountProvider';
import { useEffect } from 'react';
import { CART_COUNT } from '../../../helpers';

const variations: Array<JewelryVariation> = [
  { key: 0, label: 'Bạc', style: 'bg-gray-400' },
  { key: 1, label: 'Vàng', style: 'bg-amber-300' },
  { key: 2, label: 'Vàng trắng', style: 'bg-slate-100' },
];
export default function ItemInfoSection({ imgUrl }: { imgUrl: string }) {
  const { carts, increment } = useCartCount();

  useEffect(() => {
    localStorage.setItem(CART_COUNT, carts.toString());
  }, [carts]);

  const numberOfPurchases = 7;
  return (
    <>
      <div className="relative flex flex-col justify-center items-center !w-[100%]">
        <Image
          src={`/images/jewelry/${imgUrl}`}
          alt={imgUrl}
          width="450"
          height="450"
          className="border rounded-lg min-w-[320px] min-h-[320px]" />
        <div className="flex gap-2 justify-start items-center mt-2">
          {variations.map((variation) => (
            <Variation key={`${imgUrl}_${variation.key}`} variation={variation} />
          ))}
        </div>
      </div>

      <div className="self-start grid gap-2">
        <h2 className="text-3xl text-brand-500 font-semibold">Nhẫn Bạc Với 4 Cánh Hoa (4 Leaf Clover)</h2>
        <small>
          <b className="font-bold text-brand-500">{numberOfPurchases} lượt</b> mua món hàng này
          <motion.hr
            initial={{ width: 0 }}
            animate={{ width: '100%', transition: { duration: 1, delay: 1.6 } }}
            className="border-0 border-b border-b-transparent-black mt-1" />
        </small>
        <ul className="flex flex-1 flex-col">
          <li>Tượng trưng cho sự may mắn và độc đáo, làm tôn lên vẻ đẹp giản dị không quá cầu kì.</li>
        </ul>

        <div>
          <Button variant="tertiary" className="justify-self-start" onClick={increment}>
            <ShoppingCart />
            Thêm vào giỏ đồ
          </Button>
          <Button variant="tertiary" className="justify-self-start" onClick={() => {}}>
            <Heart />
            Thêm vào danh sách yêu thích
          </Button>
        </div>
      </div>
    </>
  )
}
