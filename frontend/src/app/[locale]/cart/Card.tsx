'use client'

import Image from 'next/image';
import type { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';

import { useEffect, useMemo, useState } from 'react';

import { Trash2 } from 'lucide-react';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';

import throttle from 'lodash/throttle';

import Variation from '../../../components/Jewelry/Variation';

import { PAYMENT_INFO, SAVE_TO_CART, WAIT } from '../../../helpers';
import { useCartCount, type CartItem } from '../../../stores/CartCountProvider';
import { getJewelryItem } from '../../../server/data';
import Share from './Share';
import Money from '../../../components/Money/Money';
import NavItem from '../../../components/Navigation/NavItem';

export default function Card({
  item, idx, getTheLatestCartItems, router,
}: {
  item: CartItem; idx: number; getTheLatestCartItems: () => void; router: AppRouterInstance;
}) {
  const { addItem, removeItem, removeAllByItemName } = useCartCount();
  const t = useTranslations('cart');
  const tCommon = useTranslations('common');
  const tMaterials = useTranslations('materials');
  const [imgUrls, setImgUrls] = useState<Array<string>>(item.imgUrls ?? []);

  useEffect(() => {
    let cancelled = false;
    if (item.imgUrls && item.imgUrls.length > 0) {
      setImgUrls(item.imgUrls);
      return;
    }
    (async () => {
      try {
        const fresh = await getJewelryItem(item.id);
        if (cancelled) return;
        const urls = (fresh?.media ?? []).map((m) => m.url);
        if (urls.length > 0) setImgUrls(urls);
      } catch (e) {
        console.error(e);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [item.id, item.imgUrls]);

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

  const info = `${PAYMENT_INFO} ${item.itemName}`;
  const variationLabel = item.variation.id ? tMaterials(item.variation.id) : item.variation.label;
  const stop = (e: React.MouseEvent) => e.stopPropagation();
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0, transition: { delay: (idx + 1) * 0.2 } }}
      exit={{ opacity: 0, y: -10 }}
      className="grid grid-cols-[110px_1fr] md:grid-cols-[160px_1fr] gap-3 sm:gap-4 p-3 rounded-2xl bg-accent-100 border border-accent-300/40 shadow-md shadow-black/20 cursor-pointer w-full max-w-[640px]"
      title={t('viewItem')}
      onClick={() => { router.push(`/product/${item.id ?? ''}?amount=${item.amount}&info=${info}&variation=${item.variation.id}`); }}>
      {/* Image + quantity stepper */}
      <div className="flex flex-col gap-2 items-center col-start-1 row-start-1 md:row-span-2 self-start">
        {imgUrls[0] && (
          <Image
            priority
            alt={item.itemName}
            src={imgUrls[0]}
            width="240"
            height="240"
            className="rounded-md w-full aspect-square object-cover"
          />
        )}
        <div
          className="inline-flex items-center gap-0.5 rounded-full bg-accent-200/40 border border-accent-500/30 p-0.5"
          onClick={stop}
        >
          <button
            type="button"
            aria-label={t('decrease')}
            title={t('decrease')}
            className="w-7 h-7 rounded-full text-brand-700 hover:bg-accent-300/50 flex items-center justify-center transition leading-none text-lg"
            onClick={() => { throttleDecrement(item); }}
          >
            −
          </button>
          <span className="min-w-[20px] text-center text-sm font-semibold text-brand-700">{item.count}</span>
          <button
            type="button"
            aria-label={t('increase')}
            title={t('increase')}
            className="w-7 h-7 rounded-full bg-accent-300 text-brand-700 hover:bg-accent-200 flex items-center justify-center transition leading-none text-lg shadow-sm"
            onClick={() => { throttleIncrement(item); }}
          >
            +
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="flex flex-col gap-1.5 col-start-2 row-start-1 self-start min-w-0">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-base sm:text-lg md:text-xl text-brand-700 font-semibold leading-tight min-w-0">{item.itemName}</h3>
          <button
            type="button"
            aria-label={t('removeAll')}
            title={t('removeAll')}
            style={{ borderColor: 'rgba(239, 68, 68, 0.4)', color: '#ef4444', backgroundColor: 'transparent' }}
            className="shrink-0 w-9 h-9 rounded-full border flex items-center justify-center transition hover:!bg-red-50"
            onClick={(e) => { e.stopPropagation(); throttleRemoveAll(item); }}
          >
            <Trash2 size={18} strokeWidth={2} color="#ef4444" style={{ width: 18, height: 18, flexShrink: 0 }} />
          </button>
        </div>
        <h3 className="text-base sm:text-lg md:text-xl text-brand-700 font-semibold">
          <Money amount={item.sum ?? 0} currency="VND" />
        </h3>
        {item.featureCollection && (
          <span className="flex gap-1 items-center text-sm text-brand-700">
            <b>{tCommon('collection')}:</b>
            <NavItem
              href={`/collections/${item.featureCollection}`}
              withBorder={false}
              className="!underline decoration-accent-500/70 underline-offset-4 !text-sm !text-brand-500 hover:!text-accent-600 hover:decoration-accent-600"
              onClick={stop}
            >
              {item.featureCollection}
            </NavItem>
          </span>
        )}
        <p className="text-xs text-brand-700/60">{t('freeShipping')}</p>
        {item.variation && (
          <span className="flex items-center gap-2 text-sm text-brand-700">
            <Variation variation={item.variation} onSelect={() => {}} />
            <span>{variationLabel}</span>
          </span>
        )}
        <div className="flex items-center justify-between gap-3">
          <label htmlFor="gift" className="text-sm text-brand-700 inline-flex gap-2 items-center" onClick={stop}>
            <input name="gift" type="checkbox" onChange={() => {}} />
            {t('wrapAsGift')}
          </label>
          <span className="text-sm" onClick={stop}>
            <Share encodedId={item.id} itemName={item.itemName} itemAmount={item.amount} itemVariation={item.variation.id} />
          </span>
        </div>
      </div>

    </motion.div>
  )
}
