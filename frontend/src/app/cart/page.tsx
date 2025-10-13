'use client'

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { motion } from 'framer-motion';

import { useCartCount, type CartItem } from '../../stores/CartCountProvider';
import Card from './Card';
import PaymentView from '../../components/PaymentView/PaymentView';
import { PAYMENT_INFO } from '../../helpers';

export default function Cart() {
  const router = useRouter();

  const [cartItems, setCartItems] = useState<CartItem[]>([]);

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

  const info = PAYMENT_INFO;

  if (cartItems?.length > 0) {
    return (
      <div className={`w-dvw mt-4 mb-5 grid grid-cols-1 md:grid-cols-[60%_1fr] lg:grid-cols-[2fr_1fr] justify-around gap-2 p-2`}>
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={`grid grid-cols-1 [grid-template-rows:min-content] gap-3 justify-start items-start`}
        >
          {cartItems.map((item, idx) => (
            <span key={`${item.itemName.split(' ').join('_').toLowerCase()}_${item.variation.label.toLowerCase()}_${idx}`}>
              <Card
                item={item}
                idx={idx}
                getTheLatestCartItems={getTheLatestCartItems}
                router={router} />
            </span>
            ))
          }
        </motion.section>

        <PaymentView amount="1000" info={info} />
      </div>
    )
  }
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col justify-center items-center h-full">
      <p className="text-[100px] text-center select-none">🛒</p>
      <p>Giỏ đồ của bạn đang trống. <a onClick={() => { router.push('/'); }}>Quay về trang chủ</a> để chọn thêm các món đồ vào giỏ đồ điện tử của bạn</p>
    </motion.div>
  );
}
