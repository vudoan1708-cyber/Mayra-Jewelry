'use client'

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { motion } from 'framer-motion';

import { useCartCount, type CartItem } from '../../stores/CartCountProvider';
import Button from '../../components/Button';
import { SAVE_TO_CART } from '../../helpers';
import { Trash2 } from 'lucide-react';
import Variation from '../../components/Jewelry/Variation';

export default function Cart() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const { addItem } = useCartCount();

  const reorderAndMergeDuplicate = (items: CartItem[]) => {
    let newItems: CartItem[] = [];
    let mostRecent: CartItem;
    items.sort((a, b) => b.itemName.localeCompare(a.itemName)).forEach((currentValue, idx) => {
      if (mostRecent?.itemName !== currentValue.itemName) {
        if (mostRecent) {
          newItems = [ ...newItems, mostRecent ];
        }
        mostRecent = {
          ...currentValue,
          sum: currentValue.amount,
          count: 1,
        };
        return;
      }
      (mostRecent.count as number)++;
      (mostRecent.sum as number) += mostRecent.amount;

      if (idx === items.length - 1) {
        newItems = [ ...newItems, mostRecent ];
      }
    });
    return newItems;
  };
  useEffect(() => {
    const {items} = useCartCount.getState();
    setCartItems(() => reorderAndMergeDuplicate(items));
  }, []);

  const incrementCart = (item: CartItem) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { count, sum, ...rest  } = item;
    addItem(rest);
    const currentState = {
      count: useCartCount.getState().count,
      items: useCartCount.getState().items,
    };
    localStorage.setItem(SAVE_TO_CART, JSON.stringify(currentState));
  };

  if (cartItems?.length > 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-20"
      >
      {cartItems.map((item, idx) => (
          <motion.div
            key={idx}
            className="flex items-center gap-3 p-1 rounded-md bg-white shadow-lg cursor-pointer">
            <div className="flex flex-col gap-1">
              <Image
                alt={`image is shown with a name of ${item.itemName}`}
                src={`/images/jewelry/${item.imgUrl}`}
                width="120"
                height="120"
                className="rounded-md"
              />
              <span className="self-center flex gap-3 items-center">
                <Button variant="circle" tooltip="Bớt 1" className="p-1 border-1 border-red-400 bg-white !text-red-400 hover:border-red-400" onClick={() => {}}>-</Button>
                <span className="">{item.count}</span>
                <Button variant="circle" tooltip="Thêm 1" className="p-1 border-1 border-brand-500 bg-white !text-brand-500" onClick={() => { incrementCart(item); }}>+</Button>
              </span>
            </div>
            <div className="relative flex flex-col gap-1 items-end h-full">
              <h3 className="text-md text-brand-500 font-semibold">{item.itemName}</h3>
              <span className="flex items-center gap-0.5">
                <Variation variation={item.variation} onSelect={() => {}} />
                  <p className="text-sm">{item.variation.label}</p>
              </span>
              <small>{item.sum}₫</small>

              <Button variant="circle" tooltip="Bỏ hết" className="absolute bottom-0 right-0 mb-[1px] mr-[1px] p-1 border-1 border-brand-500 bg-white !text-brand-500" onClick={() => {}}>
                <Trash2 />
              </Button>
            </div>
          </motion.div>
        ))
        }
      </motion.div>
    )
  }
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 justify-center items-center h-full mt-20">
      <p className="text-[100px] text-center select-none">🛒</p>
      <p>Giỏ đồ của bạn đang trống. <a onClick={() => { router.push('/'); }}>Quay về trang chủ</a> để chọn thêm các món đồ vào giỏ đồ điện tử của bạn</p>
    </motion.div>
  );
}
