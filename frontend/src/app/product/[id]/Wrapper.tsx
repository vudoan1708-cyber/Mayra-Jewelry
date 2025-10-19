'use client';

import { useSearchParams } from 'next/navigation';

import { Suspense, useEffect, useRef, useState } from 'react';

import { motion } from 'framer-motion';

import ItemInfoSection from './ItemInfoSection';

import type { Media, Prices } from '../../../../types';
import { ENGLISH_TO_VIETNAMESE, PAYMENT_INFO } from '../../../helpers';

import Loading from '../../../components/Loading/Loading';
import PaymentView from '../../../components/PaymentView/PaymentView';
import type { JewelryVariation } from '../../../components/Jewelry/Variation';

const variations: Array<JewelryVariation> = [
  { key: 0, label: 'Bạc', style: 'bg-gray-400', amount: 0 },
  { key: 1, label: 'Vàng', style: 'bg-amber-300', amount: 0 },
  { key: 2, label: 'Vàng trắng', style: 'bg-slate-100', amount: 0 },
];
export default function Wrapper({
  id,
  itemName,
  featureCollection,
  type,
  description,
  prices,
  userId,
  userEmail,
}: {
  id: string;
  itemName: string;
  featureCollection: string;
  type: 'ring' | 'bracelet';
  description: string;
  prices: Prices[];
  userId: string;
  userEmail: string;
}) {
  const searchParams = useSearchParams();
  const [imgUrls, setImgUrls] = useState<Array<string>>([]);

  const findPrices = (variation: JewelryVariation) => prices.find((price) => variation.label === ENGLISH_TO_VIETNAMESE[price.variation]);
  const [availableVariations] = useState<Array<JewelryVariation>>(() => {
    return variations
      .filter((variation) => findPrices(variation))
      .map((variation) => ({
        ...variation,
        amount: findPrices(variation)?.amount ?? 0,
      }));
  });
  const variationRef = useRef(availableVariations[0]);
  const preselectedVariation = searchParams.get('variation') ?? '';

  const [selectedVariation] = useState<JewelryVariation>(availableVariations.find((variation) => variation.label === preselectedVariation) ?? availableVariations[0]);
  const [amount] = useState<number>(parseInt(searchParams.get('amount') ?? '0') || variationRef.current.amount);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(id);
      if (stored) {
        const parsed = JSON.parse(stored);
        setImgUrls(parsed.map((value: Media) => value.url));
      }
    } catch (e) {
      console.error(e);
    }
  }, [id]);

  return (
    <Suspense fallback={<Loading />}>
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: { delay: 0.8, duration: 0.2 } }}
        className="relative grid grid-cols-1 md:[grid-template-columns:repeat(2,1fr)] gap-1 items-start mt-8"
      >
        <ItemInfoSection
          id={id}
          itemName={itemName}
          description={description}
          featureCollection={featureCollection}
          type={type}
          amount={parseInt(searchParams.get('amount') ?? amount.toString())}
          imgUrls={imgUrls}
          availableVariations={availableVariations}
          selectedVariation={selectedVariation} />
      </motion.section>

      <PaymentView
        userId={userId}
        userEmail={userEmail}
        amount={searchParams.get('amount') ?? amount.toString()}
        info={searchParams.get('info') ?? `${PAYMENT_INFO} ${itemName}`}
        items={[{ directoryId: id, itemName }]} />
    </Suspense>
  )
}
