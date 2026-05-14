'use client'

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';

import { useCartCount, type CartItem } from '../../../stores/CartCountProvider';

const reorderAndMergeDuplicate = (items: CartItem[]) => {
  let newItems: CartItem[] = [];
  let mostRecent: CartItem;
  items.sort((a, b) => b.variation.id?.localeCompare(a.variation.id)).sort((a, b) => b.itemName.localeCompare(a.itemName)).forEach((currentValue, idx) => {
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
import Card from './Card';
import Money from '../../../components/Money/Money';
import PaymentView from '../../../components/PaymentView/PaymentView';
import { PAYMENT_INFO, SAVE_TO_CART, WAIT } from '../../../helpers';
import { computeCartBreakdown, type PersonalDiscount, REFERRAL_DISCOUNT_FRACTION } from '../../../helpers/referral';
import type { ReferralCoupon } from '../../../server/actions/coupons';
import type { JewelryItemInfo } from '../../../../types';

export default function Cart({ userId, userEmail, referralActive, couponToApply }: { userId: string; userEmail: string; referralActive: boolean; couponToApply: ReferralCoupon | null }) {
  const router = useRouter();
  const { removeAll } = useCartCount();
  const translateCart = useTranslations('cart');
  const translateCommon = useTranslations('common');
  const translateDiscount = useTranslations('discount');

  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const getTheLatestCartItems = useCallback(() => {
    setCartItems(() => reorderAndMergeDuplicate(useCartCount.getState().items));
  }, []);
  const removeAllCartItems = () => {
    removeAll();
    getTheLatestCartItems();
    localStorage.setItem(SAVE_TO_CART, '');
    setTimeout(() => {
      router.push('/account?tab=orderHistory');
    }, WAIT - 250);
  };

  useEffect(() => {
    getTheLatestCartItems();
  }, [getTheLatestCartItems]);

  const personalDiscounts: PersonalDiscount[] = useMemo(() => {
    const layers: PersonalDiscount[] = [];
    if (referralActive) layers.push({ label: translateDiscount('referralDiscount'), fraction: REFERRAL_DISCOUNT_FRACTION });
    if (couponToApply) layers.push({ label: translateDiscount('ownedCoupon'), fraction: couponToApply.percent / 100 });
    return layers;
  }, [referralActive, couponToApply, translateDiscount]);

  const breakdown = useMemo(
    () => computeCartBreakdown(
      cartItems.map((item) => ({ sum: item.sum ?? 0, productDiscount: item.variation.discount ?? 0 })),
      personalDiscounts,
    ),
    [cartItems, personalDiscounts],
  );

  const totalCount = cartItems.reduce((acc, prev) => acc + (prev?.count ?? 0), 0);
  // VietQR memo limit is ~50 chars.
  const info = totalCount === 1 && cartItems[0]
    ? `${PAYMENT_INFO} ${cartItems[0].itemName}`.slice(0, 50)
    : `${PAYMENT_INFO}`.slice(0, 50);

  if (cartItems?.length > 0) {
    return (
      <div className={`w-dvw mt-4 mb-5 grid grid-cols-1 md:grid-cols-[60%_1fr] lg:grid-cols-[2fr_1fr] justify-around gap-2 p-2`}>
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={`grid grid-cols-1 [grid-template-rows:min-content] gap-3 justify-start items-start`}
        >
          {cartItems.map((item, idx) => (
            <span key={`${item.itemName.split(' ').join('_').toLowerCase()}_${item.variation.id?.toLowerCase()}_${idx}`}>
              <Card
                item={item}
                idx={idx}
                getTheLatestCartItems={getTheLatestCartItems}
                router={router} />
            </span>
            ))
          }
        </motion.section>

        <div className="flex flex-col gap-3">
          <div className="bg-accent-100 border border-accent-300/40 rounded-2xl shadow-md shadow-black/20 p-4 text-brand-700">
            <div className="grid grid-cols-[1fr_auto] gap-y-1.5 gap-x-3 items-baseline text-sm">
              <span className="text-brand-700/80">{translateDiscount('subtotal')}</span>
              <Money amount={breakdown.subtotal} currency="VND" />
              {breakdown.productDiscountValue > 0 && (
                <>
                  <span className="text-brand-700/80">{translateDiscount('productDiscount')}</span>
                  <b className="text-emerald-700 flex items-baseline">
                    −<Money amount={breakdown.productDiscountValue} currency="VND" />
                  </b>
                </>
              )}
              {breakdown.personalDiscounts.map((layer) => (
                <span key={layer.label} className="contents">
                  <span className="text-brand-700/80">{layer.label} (−{Math.round(layer.fraction * 100)}%)</span>
                  <b className="text-emerald-700 flex items-baseline">
                    −<Money amount={layer.value} currency="VND" />
                  </b>
                </span>
              ))}
              <hr className="col-span-2 border-0 border-b border-accent-500/30 my-1" />
              <span className="text-base font-semibold">{translateDiscount('total')}</span>
              <b className="text-base">
                <Money amount={breakdown.total} currency="VND" />
              </b>
            </div>
          </div>

          <PaymentView
            userId={userId}
            userEmail={userEmail}
            amount={String(breakdown.total)}
            info={info}
            items={useCartCount.getState().items.map<Partial<JewelryItemInfo>>((item) => ({
              directoryId: item.id,
              itemName: item.itemName,
            }))}
            couponId={couponToApply?.id ?? ''}
            onSuccessfulConfirmation={removeAllCartItems} />
        </div>
      </div>
    )
  }
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col justify-center items-center h-full p-3">
      <div className="bg-accent-200 rounded-2xl shadow-lg px-5 py-4 flex flex-col items-center max-w-md text-center">
        <p className="text-[100px] text-center select-none leading-none">🛒</p>
        <p className="mt-2">{translateCart('empty')} <a onClick={() => { router.push('/browse'); }}>{translateCommon('browseCollection')}</a> {translateCart('emptyCta')}</p>
      </div>
    </motion.div>
  );
}
