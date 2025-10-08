'use client'

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

import { AnimatePresence, motion } from 'framer-motion';
import { Trash2 } from 'lucide-react';
import throttle from 'lodash/throttle';

import Button from '../../components/Button';
import Variation from '../../components/Jewelry/Variation';

import { useCartCount, type CartItem } from '../../stores/CartCountProvider';
import { SAVE_TO_CART } from '../../helpers';

export default function Cart() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const { addItem, removeItem } = useCartCount();

  const reorderAndMergeDuplicate = (items: CartItem[]) => {
    let newItems: CartItem[] = [];
    let mostRecent: CartItem;
    items.sort((a, b) => b.variation.label.localeCompare(a.variation.label)).sort((a, b) => b.itemName.localeCompare(a.itemName)).forEach((currentValue, idx) => {
      if (mostRecent?.itemName !== currentValue.itemName || mostRecent?.variation.key !== currentValue.variation.key) {
        if (mostRecent) {
          newItems = [ ...newItems, mostRecent ];
        }
        mostRecent = {
          ...currentValue,
          sum: 0,
          count: 0,
        };
      }
      (mostRecent.count as number)++;
      (mostRecent.sum as number) += mostRecent.amount;

      if (idx === items.length - 1) {
        newItems = [ ...newItems, mostRecent ];
      }
    });
    return newItems;
  };
  const getTheLatestCartItems = () => {
    const {items} = useCartCount.getState();
    setCartItems(() => reorderAndMergeDuplicate(items));
  };

  useEffect(() => {
    getTheLatestCartItems();
  }, []);

  const updateCart = (item: CartItem, action: 'decrease' | 'increase' = 'increase') => {
    const listOfActions = {
      increase: () => { addItem(item) },
      decrease: () => { removeItem(item) },
    };
    listOfActions[action]();
    const currentState = {
      count: useCartCount.getState().count,
      items: useCartCount.getState().items,
    };
    item.count = currentState.items.reduce((acc, prev) => {
      if (prev.variation.key === item.variation.key && prev.itemName === item.itemName) {
        return acc + 1;
      }
      return acc;
    }, 0);
    item.sum = currentState.items.reduce((acc, prev) => {
      if ((prev.variation.key === item.variation.key && prev.itemName === item.itemName)) {
        return acc + prev.amount;
      }
      return acc;
    }, 0);
    localStorage.setItem(SAVE_TO_CART, JSON.stringify(currentState));

    if (!item.sum) {
      getTheLatestCartItems();
    }
  };
  const throttleIncrement = useMemo(() => throttle(updateCart, 1000), []);
  const throttleDecrement = useMemo(() => throttle((item) => updateCart(item, 'decrease'), 1000), []);

  if (cartItems?.length > 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-20"
      >
      {cartItems.map((item, idx) => (
        <AnimatePresence>
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0, transition: { delay: (idx + 1) * 0.2 } }}
            exit={{ opacity: 0, y: -10 }}
            className="flex justify-between items-center gap-3 p-1 rounded-md bg-white shadow-lg cursor-pointer">
            <div className="flex flex-col gap-1">
              <Image
                alt={`image is shown with a name of ${item.itemName}`}
                src={`/images/jewelry/${item.imgUrl}`}
                width="120"
                height="120"
                className="rounded-md"
              />
              <span className="self-center flex gap-3 items-center">
                <Button variant="circle" tooltip="Bớt 1" className="p-1 border-1 border-red-400 bg-white !text-red-500 hover:border-red-400 focus:border-red-400" onClick={() => { throttleDecrement(item); }}>-</Button>
                <span className="">{item.count}</span>
                <Button variant="circle" tooltip="Thêm 1" className="p-1 border-1 border-brand-500 bg-white !text-brand-600" onClick={() => { throttleIncrement(item); }}>+</Button>
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
        </AnimatePresence>
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
