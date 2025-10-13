'use client';

import { useSearchParams } from 'next/navigation';
import Image from 'next/image';

import { useEffect, useRef, useState } from 'react';

import { motion } from 'framer-motion';

import ItemInfoSection from './ItemInfoSection';
import PaymentView from '../../../components/PaymentView/PaymentView';
import type { JewelryVariation } from '../../../components/Jewelry/Variation';

import { ENGLISH_TO_VIETNAMESE, PAYMENT_INFO } from '../../../helpers';

import type { Media, Prices } from '../../../../types';

const variations: Array<JewelryVariation> = [
  { key: 0, label: 'Bạc', style: 'bg-gray-400', amount: 0 },
  { key: 1, label: 'Vàng', style: 'bg-amber-300', amount: 0 },
  { key: 2, label: 'Vàng trắng', style: 'bg-slate-100', amount: 0 },
];
export default function Wrapper({
  id, itemName, description, prices,
}: {
  id: string; itemName: string; description: string; prices: Prices[]
}) {
  const searchParams = useSearchParams();
  const [imgUrls, setImgUrls] = useState<Array<string>>([]);
  const decodedId = decodeURIComponent(id);

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
      const stored = localStorage.getItem(decodedId);
      if (stored) {
        const parsed = JSON.parse(stored);
        setImgUrls(parsed.map((value: Media) => value.url));
      }
    } catch (e) {
      console.error(e);
    }
  }, [decodedId]);

  return (
    <>
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: { delay: 0.8, duration: 0.2 } }}
        className="relative grid grid-cols-1 md:[grid-template-columns:repeat(2,1fr)] gap-1 items-start mt-8"
      >
        <ItemInfoSection
          id={id}
          itemName={itemName}
          amount={parseInt(searchParams.get('amount') ?? amount.toString())}
          description={description}
          imgUrls={imgUrls}
          availableVariations={availableVariations}
          selectedVariation={selectedVariation} />
      </motion.section>

      <PaymentView amount={searchParams.get('amount') ?? amount.toString()} info={searchParams.get('info') ?? PAYMENT_INFO} />

      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: { delay: 1, duration: 0.2 } }}
        className="col-span-1 md:col-span-2">
        <h2 className="text-2xl text-brand-500 font-semibold mt-6 self-start">Những món hàng được view thường xuyên</h2>
        <div className="flex gap-2 overflow-auto">
          {/* {Array.from({ length: 4 }).map((_, idx) => (
            <Image
              key={idx}
              src={imgUrl}
              alt={imgUrl}
              width="360"
              height="360"
              style={{ objectFit: "contain", width: "auto", height: "auto" }}
              className="border rounded-lg max-w-[360px] max-h-[360px]" />
          ))} */}
        </div>
      </motion.section>
    </>
  )
}
