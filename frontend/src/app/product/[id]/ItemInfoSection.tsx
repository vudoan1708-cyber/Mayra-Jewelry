'use client'

import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';

import { useEffect, useMemo, useRef, useState } from 'react';

import { motion } from 'framer-motion';

import { Heart, ShoppingCart } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import throttle from 'lodash/throttle';

import Variation, { type JewelryVariation } from '../../../components/Jewelry/Variation';
import Money from '../../../components/Money/Money';
import Button from '../../../components/Button';
import Loading from '../../../components/Loading/Loading';

import { useCartCount } from '../../../stores/CartCountProvider';
import { SAVE_TO_CART, WAIT } from '../../../helpers';

export default function ItemInfoSection({
  id, itemName, amount, description, imgUrls, availableVariations, selectedVariation,
}: {
  id: string; itemName: string; amount: number, description: string; imgUrls: string[]; availableVariations: Array<JewelryVariation>; selectedVariation: JewelryVariation;
}) {
  const router = useRouter();
  const [variation, setSelectedVariation] = useState<JewelryVariation>(selectedVariation);

  const [loadingImg, setLoadingImg] = useState<boolean>(true);
  const imgUrlRef = useRef<Array<string>>(imgUrls);
  useEffect(() => {
    setLoadingImg(!imgUrls);
    imgUrlRef.current = imgUrls;
  }, [imgUrls]);

  const numberOfPurchases = 7;

  const { addItem } = useCartCount();

  const selectVariation = (__variation: JewelryVariation) => {
    setSelectedVariation(__variation);
  };

  const shoppingCartClicked = () => {
    addItem({
      id,
      itemName,
      imgUrl: imgUrlRef.current[0],
      variation,
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
        {loadingImg
          ? <Loading />
          : (
            <Image
              src={imgUrls[0]}
              alt={itemName}
              width="520"
              height="520"
              className="border rounded-lg min-w-[320px] min-h-[320px] max-h-[540px] object-cover" />
          )
        }
        <div className="flex gap-2 justify-start items-center mt-2">
          {availableVariations.map((variation) => (
            <Variation key={`${imgUrls[0]}_${variation.key}`} variation={variation} selected={selectedVariation.key} onSelect={() => { selectVariation(variation); }} />
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

        <h2 className="text-xl">
          <Money amount={amount} />
        </h2>
        <motion.hr
          initial={{ width: 0 }}
          animate={{ width: '100%', transition: { duration: 1, delay: 1.6 } }}
          className="border-0 border-b border-b-transparent-black" />

        {/* Item Description */}
        <h2 className="text-2xl">Thông tin sản phẩm</h2>
        <ul className="flex flex-1 flex-col list-none">
          {description.split('\n').map((line, idx) => (
            <li key={idx}>{line}</li>
          ))}
        </ul>

        <div>
          <div className="flex gap-1 items-center my-2">
            <Variation key={`${imgUrls[0]}_slected_${selectedVariation.key}`} variation={selectedVariation} />
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
