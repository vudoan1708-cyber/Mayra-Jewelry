'use client'

import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';

import { motion } from 'framer-motion';

import { Heart, ShoppingCart } from 'lucide-react';
import throttle from 'lodash/throttle';

import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Variation, { type JewelryVariation } from '../../../components/Jewelry/Variation';
import Money from '../../../components/Money/Money';
import Button from '../../../components/Button';

import { useCartCount } from '../../../stores/CartCountProvider';
import { SAVE_TO_CART, WAIT } from '../../../helpers';
import { useEffect, useMemo, useRef, useState } from 'react';

const variations: Array<JewelryVariation> = [
  { key: 0, label: 'Bạc', style: 'bg-gray-400' },
  { key: 1, label: 'Vàng', style: 'bg-amber-300' },
  { key: 2, label: 'Vàng trắng', style: 'bg-slate-100' },
];
export default function ItemInfoSection({ imgUrl, preselectedVariation = '' }: { imgUrl: string, preselectedVariation?: string }) {
  const router = useRouter();
  const params = useSearchParams();
  const amount = parseInt(params.get('amount') ?? '0');

  const [selectedVariation, setSelectedVariation] = useState<JewelryVariation>(variations.find((variation) => variation.label === preselectedVariation) ?? variations[0]);
  const variationRef = useRef(variations[0]);

  const numberOfPurchases = 7;
  const itemName = 'Nhẫn Bạc Với 4 Cánh Hoa (4 Leaf Clover)';
  const description = 'Tượng trưng cho sự may mắn và độc đáo, làm tôn lên vẻ đẹp giản dị không quá cầu kì.';

  const { addItem } = useCartCount();

  const selectVariation = (__variation: JewelryVariation) => {
    setSelectedVariation(__variation);
    variationRef.current = __variation;
  };

  const shoppingCartClicked = () => {
    addItem({
      itemName,
      imgUrl,
      variation: variationRef.current,
      amount,
    });
    const currentState = {
      items: useCartCount.getState().items,
    };
    localStorage.setItem(SAVE_TO_CART, JSON.stringify(currentState));
    toast.success('Món đồ đã được đưa vào giỏ đồ điện tử! 🎉');
  };

  const throttleIncrement = useMemo(() => throttle(shoppingCartClicked, WAIT), []);

  useEffect(()  => {
    return () => {
      throttleIncrement.cancel();
    }
  }, [throttleIncrement]);

  return (
    <>
      <div className="relative flex flex-col justify-center items-center !w-[100%]">
        <Image
          src={`/images/jewelry/${imgUrl}`}
          alt={imgUrl}
          width="520"
          height="520"
          className="border rounded-lg min-w-[320px] min-h-[320px] max-h-[540px] object-cover" />
        <div className="flex gap-2 justify-start items-center mt-2">
          {variations.map((variation) => (
            <Variation key={`${imgUrl}_${variation.key}`} variation={variation} selected={selectedVariation.key} onSelect={() => { selectVariation(variation); }} />
          ))}
        </div>
      </div>

      <div className="self-start grid gap-2">
        <h2 className="text-3xl text-brand-500 font-semibold">{itemName}</h2>
        <small>
          <b className="font-bold text-brand-500">{numberOfPurchases} lượt</b> mua món hàng này
          <motion.hr
            initial={{ width: 0 }}
            animate={{ width: '100%', transition: { duration: 1, delay: 1.6 } }}
            className="border-0 border-b border-b-transparent-black mt-1" />
        </small>

        <h2 className="text-xl"><Money amount={amount} /></h2>

        {/* Item Description */}
        <ul className="flex flex-1 flex-col">
          <li>{description}</li>
        </ul>

        <div>
          <div className="flex gap-1 items-center my-2">
            <Variation key={`${imgUrl}_slected_${selectedVariation.key}`} variation={selectedVariation} />
            Bạn đã chọn chất liệu <b>{selectedVariation.label}</b>
          </div>
          <Button variant="tertiary" className="justify-self-start" onClick={throttleIncrement}>
            <ShoppingCart />
            Thêm vào giỏ đồ
          </Button>
          <Button variant="tertiary" className="justify-self-start" onClick={() => {}}>
            <Heart />
            Thêm vào Wishlist
          </Button>
        </div>
      </div>
      {/* Toast container for message feedback */}
      <ToastContainer aria-label="Added to cart" position="bottom-left" className="cursor-pointer" onClick={() => { router.push('/cart'); }} />
    </>
  )
}
