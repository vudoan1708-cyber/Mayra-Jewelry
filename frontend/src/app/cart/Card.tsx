'use client'

import Image from 'next/image';
import type { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';

import { useEffect, useMemo, useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { Trash2 } from 'lucide-react';

import { motion } from 'framer-motion';
import throttle from 'lodash/throttle';

import Button from '../../components/Button';
import Variation from '../../components/Jewelry/Variation';

import { arrayBufferToBase64, PAYMENT_INFO, SAVE_TO_CART, WAIT } from '../../helpers';
import { useCartCount, type CartItem } from '../../stores/CartCountProvider';

const enc = new TextEncoder();

export default function Card({ item, idx, key, getTheLatestCartItems, router }: { item: CartItem, idx: number, key: string, getTheLatestCartItems: () => void, router: AppRouterInstance }) {
  const [encryptedId, setEncryptedId] = useState<string>('');
  const { addItem, removeItem } = useCartCount();

  useEffect(() => {
    const setId = () => {
      const data = enc.encode(item.imgUrl).buffer;
      const base64 = arrayBufferToBase64(data);
      setEncryptedId(base64);
    };
    setId();
  }, [item.imgUrl]);

  const updateCart = (item: CartItem, action: 'decrease' | 'increase' = 'increase') => {
    const listOfActions = {
      increase: () => {
        addItem(item);
        toast.success('Món đồ đã được đưa vào giỏ đồ điện tử! 🎉');
      },
      decrease: () => {
        removeItem(item);
        toast.warning('Món đồ đã được bỏ đi!')
      },
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
  const throttleIncrement = useMemo(() => throttle(updateCart, WAIT), []);
  const throttleDecrement = useMemo(() => throttle((item) => updateCart(item, 'decrease'), WAIT), []);

  const info = PAYMENT_INFO;
  return (
    <>
      <motion.div
        key={key}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0, transition: { delay: (idx + 1) * 0.2 } }}
        exit={{ opacity: 0, y: -10 }}
        className="flex justify-between items-center gap-3 p-1 rounded-md bg-white shadow-lg cursor-pointer"
        title="Xem thông tin món đồ"
        onClick={() => { router.push(`/product/${encryptedId ?? ''}?amount=${item.amount}&info=${info}&variation=${item.variation.label}`); }}>
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
          {item.variation && (
            <span className="flex items-center gap-0.5">
              <Variation variation={item.variation} onSelect={() => {}} />
                <p className="text-sm">{item.variation.label}</p>
            </span>
          )}
          <small>{item.sum}₫</small>

          <Button variant="circle" tooltip="Bỏ hết" className="absolute bottom-0 right-0 mb-[1px] mr-[1px] p-1 border-1 border-brand-500 bg-white !text-brand-500" onClick={() => {}}>
            <Trash2 />
          </Button>
        </div>
      </motion.div>
      
      {/* Toast container for message feedback */}
      <ToastContainer aria-label="Added to cart" position="bottom-left" autoClose={3000} />
    </>
  )
}
