'use client';

import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';

import { Suspense, useMemo, useRef, useState } from 'react';

import { motion } from 'framer-motion';

import ItemInfoSection from './ItemInfoSection';

import type { Media, Prices } from '../../../../../types';
import { PAYMENT_INFO } from '../../../../helpers';

import Loading from '../../../../components/Loading/Loading';
import PaymentView from '../../../../components/PaymentView/PaymentView';
import type { JewelryVariation, MaterialId } from '../../../../components/Jewelry/Variation';
import type { Session } from 'next-auth';

type VariationSeed = Pick<JewelryVariation, 'key' | 'id' | 'style' | 'amount'>;
const variationSeeds: Array<VariationSeed> = [
  { key: 0, id: 'Silver', style: 'bg-gray-400', amount: 0 },
  { key: 1, id: 'Gold', style: 'bg-amber-300', amount: 0 },
  { key: 2, id: 'White Gold', style: 'bg-slate-100', amount: 0 },
];
export default function Wrapper({
  id,
  itemName,
  featureCollection,
  type,
  description,
  prices,
  purchases,
  media,
  session,
  buyerWishlistFound,
}: {
  id: string;
  itemName: string;
  featureCollection: string;
  type: 'ring' | 'bracelet';
  description: string;
  prices: Prices[];
  purchases: number;
  media: Media[] | null;
  session: Session | null;
  buyerWishlistFound: boolean;
}) {
  const searchParams = useSearchParams();
  const tMaterials = useTranslations('materials');
  const imgUrls = useMemo(() => (media ?? []).map((m) => m.url), [media]);

  const findPrice = (seed: VariationSeed) => prices.find((price) => price.variation === seed.id);
  const [availableVariations] = useState<Array<JewelryVariation>>(() => {
    return variationSeeds
      .filter((seed) => findPrice(seed))
      .map((seed) => ({
        ...seed,
        label: tMaterials(seed.id),
        amount: findPrice(seed)?.amount ?? 0,
      }));
  });
  const variationRef = useRef(availableVariations[0]);
  const preselectedVariation = (searchParams.get('variation') ?? '') as MaterialId | '';

  const [selectedVariation] = useState<JewelryVariation>(availableVariations.find((variation) => variation.id === preselectedVariation) ?? availableVariations[0]);
  const [amount] = useState<number>(parseInt(searchParams.get('amount') ?? '0') || variationRef.current.amount);

  return (
    <Suspense fallback={<Loading />}>
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: { delay: 0.8, duration: 0.2 } }}
        className="relative grid grid-cols-1 md:[grid-template-columns:repeat(2,1fr)] gap-3 items-start mt-8 px-3 md:px-6 max-w-7xl mx-auto"
      >
        <ItemInfoSection
          id={id}
          itemName={itemName}
          description={description}
          featureCollection={featureCollection}
          type={type}
          purchases={purchases}
          amount={parseInt(searchParams.get('amount') ?? amount.toString())}
          imgUrls={imgUrls}
          availableVariations={availableVariations}
          selectedVariation={selectedVariation}
          session={session}
          buyerWishlistFound={buyerWishlistFound} />
      </motion.section>

      <PaymentView
        userId={session?.user?.id ?? ''}
        userEmail={session?.user?.email ?? ''}
        amount={searchParams.get('amount') ?? amount.toString()}
        info={searchParams.get('info') ?? `${PAYMENT_INFO} ${itemName}`}
        items={[{ directoryId: id, itemName }]} />
    </Suspense>
  )
}
