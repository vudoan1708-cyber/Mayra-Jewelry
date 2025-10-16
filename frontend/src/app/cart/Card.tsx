'use client'

import Image from 'next/image';
import type { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';

import { useMemo } from 'react';

import { Trash2 } from 'lucide-react';

import { motion } from 'framer-motion';

import throttle from 'lodash/throttle';

import Button from '../../components/Button';
import Variation from '../../components/Jewelry/Variation';

import { PAYMENT_INFO, SAVE_TO_CART, WAIT } from '../../helpers';
import { useCartCount, type CartItem } from '../../stores/CartCountProvider';
import Share from './Share';
import Money from '../../components/Money/Money';
import NavItem from '../../components/Navigation/NavItem';

export default function Card({
  item, idx, getTheLatestCartItems, router,
}: {
  item: CartItem; idx: number; getTheLatestCartItems: () => void; router: AppRouterInstance;
}) {
  const { addItem, removeItem, removeAllByItemName } = useCartCount();

  const updateCart = (item: CartItem, action: 'decrease' | 'increase' | 'removeAll' = 'increase') => {
    const listOfActions = {
      increase: () => {
        addItem(item);
      },
      decrease: () => {
        removeItem(item);
      },
      removeAll: () => {
        removeAllByItemName(item);
      }
    };
    listOfActions[action]();
    const currentState = {
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

    getTheLatestCartItems();
  };
  const throttleIncrement = useMemo(() => throttle(updateCart, WAIT), []);
  const throttleDecrement = useMemo(() => throttle((item) => updateCart(item, 'decrease'), WAIT), []);
  const throttleRemoveAll = useMemo(() => throttle((item) => updateCart(item, 'removeAll'), WAIT), []);

  const info = PAYMENT_INFO;
  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0, transition: { delay: (idx + 1) * 0.2 } }}
        exit={{ opacity: 0, y: -10 }}
        className="grid grid-cols-[220px_1fr] md:grid-cols-[240px_2fr_1fr] justify-between items-start gap-3 p-1 rounded-md bg-white shadow-lg cursor-pointer md:max-h-[300px]"
        title="Xem thông tin món đồ"
        onClick={() => { router.push(`/product/${item.id ?? ''}?amount=${item.amount}&info=${info}&variation=${item.variation.label}`); }}>
        <div className="flex flex-col gap-1 h-full justify-between items-center col-start-1">
          <Image
            priority
            alt={`image is shown with a name of ${item.itemName}`}
            src={item.imgUrl}
            width="240"
            height="240"
            className="rounded-md md:max-h-[240px] self-start justify-self-start"
            style={{ objectFit: 'cover' }}
          />
          <span className="flex gap-3 items-center">
            <Button variant="circle" tooltip="Bớt 1" className="p-1 border-1 border-red-400 bg-white !text-red-500 hover:border-red-400 focus:border-red-400" onClick={() => { throttleDecrement(item); }}>-</Button>
            <span className="">{item.count}</span>
            <Button variant="circle" tooltip="Thêm 1" className="p-1 border-1 border-brand-500 bg-white !text-brand-600" onClick={() => { throttleIncrement(item); }}>+</Button>
          </span>
        </div>

        <div className="relative flex flex-col gap-1 h-full col-start-1 md:col-start-2 md:row-start-1 md:max-h-[288px] md:overflow-auto">
          <h3 className="text-lg md:text-xl text-brand-500 font-semibold">{item.itemName}</h3>
          {item.featureCollection && (
            <span className="flex gap-[4px] items-center">
              <b>Bộ sưu tập: </b><NavItem href={`/collections/${item.featureCollection}`} className="!underline !text-sm" onClick={(e) => { e.stopPropagation(); }}>{item.featureCollection}</NavItem>
            </span>
          )}
          <p className="text-gray-500">Miễn phí ship hàng</p>
          <div>
            {item.variation && (
              <span className="flex items-center gap-0.5 md:gap-[4px]">
                <Variation variation={item.variation} onSelect={() => {}} />
                  <p className="text-base">{item.variation.label}</p>
              </span>
            )}
          </div>
          <label htmlFor="gift" onClick={(e) => { e.stopPropagation(); }}>
            <input name="gift" type="checkbox" onChange={(e) => {}} />
            Gói quà lại giúp mình
          </label>

          <span>
            <Share encodedId={item.id} itemAmount={item.amount} itemVariation={item.variation.label} />
          </span>
        </div>

        <div className="relative flex flex-col gap-1 justify-between items-end text-right h-full col-start-2 row-start-1 md:col-start-3">
          <h3 className="text-lg md:text-xl">
            <Money amount={item.sum ?? 0} currency="VND" />
          </h3>

          <Button
            variant="circle"
            tooltip="Bỏ hết"
            className="relative bottom-0 right-0 mb-[1px] mr-[1px] p-1 border-1 border-red-400 bg-white !text-red-500 hover:border-red-400 focus:border-red-400"
            onClick={() => { throttleRemoveAll(item); }}>
            <Trash2 />
          </Button>
        </div>
      </motion.div>
    </>
  )
}
