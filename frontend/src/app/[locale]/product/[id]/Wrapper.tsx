'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';

import { Suspense, useEffect, useState } from 'react';

import { motion } from 'framer-motion';

import ItemInfoSection from './ItemInfoSection';

import type { Media, Prices } from '../../../../../types';
import { PAYMENT_INFO } from '../../../../helpers';
import { applyStackedDiscounts, REFERRAL_DISCOUNT_FRACTION } from '../../../../helpers/referral';

import Loading from '../../../../components/Loading/Loading';
import PaymentView from '../../../../components/PaymentView/PaymentView';
import type { JewelryVariation, MaterialId } from '../../../../components/Jewelry/Variation';
import type { Session } from 'next-auth';
import { captureReferralCookie } from '../../../../server/actions/referral';

type VariationSeed = Pick<JewelryVariation, 'key' | 'id' | 'style' | 'amount' | 'discount'>;
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
  referralActive,
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
  referralActive: boolean;
}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const tMaterials = useTranslations('materials');

  useEffect(() => {
    const incomingRef = searchParams.get('ref');
    if (!incomingRef) return;
    captureReferralCookie(incomingRef).finally(() => {
      const next = new URLSearchParams(searchParams.toString());
      next.delete('ref');
      const queryString = next.toString();
      router.replace(queryString ? `${pathname}?${queryString}` : pathname, { scroll: false });
    });
  }, [searchParams, router, pathname]);

  const findPrice = (seed: VariationSeed) => prices.find((price) => price.variation === seed.id);
  const [availableVariations] = useState<Array<JewelryVariation>>(() => {
    return variationSeeds
      .filter((seed) => findPrice(seed))
      .map((seed) => {
        const matchingPrice = findPrice(seed);
        return {
          ...seed,
          label: tMaterials(seed.id),
          amount: matchingPrice?.amount ?? 0,
          discount: matchingPrice?.discount ?? 0,
        };
      });
  });
  const preselectedVariation = (searchParams.get('variation') ?? '') as MaterialId | '';

  const [currentVariation, setCurrentVariation] = useState<JewelryVariation>(
    availableVariations.find((variation) => variation.id === preselectedVariation) ?? availableVariations[0],
  );

  const productFraction = currentVariation?.discount ?? 0;
  const referralFraction = referralActive ? REFERRAL_DISCOUNT_FRACTION : 0;
  const finalAmount = applyStackedDiscounts(currentVariation?.amount ?? 0, [productFraction, referralFraction]);

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
          media={media ?? []}
          availableVariations={availableVariations}
          currentVariation={currentVariation}
          onSelectVariation={setCurrentVariation}
          referralActive={referralActive} />
      </motion.section>

      <PaymentView
        userId={session?.user?.id ?? ''}
        userEmail={session?.user?.email ?? ''}
        amount={String(Math.round(finalAmount))}
        info={searchParams.get('info') ?? `${PAYMENT_INFO} ${itemName}`}
        items={[{ directoryId: id, itemName }]} />
    </Suspense>
  )
}
