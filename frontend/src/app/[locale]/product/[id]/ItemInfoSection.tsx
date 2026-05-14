'use client'

import Image from 'next/image';
import { useRouter } from 'next/navigation';

import { useEffect, useMemo, useRef, useState, type MouseEventHandler } from 'react';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';

import { ShoppingCart } from 'lucide-react';

import throttle from 'lodash/throttle';

import Variation, { type JewelryVariation } from '../../../../components/Jewelry/Variation';
import Money from '../../../../components/Money/Money';
import Button from '../../../../components/Button';
import Loading from '../../../../components/Loading/Loading';

import { useCartCount } from '../../../../stores/CartCountProvider';
import { browseThumbnailOf, detailHeroOf, extrasForVariation, SAVE_TO_CART, slugifyCollection, WAIT } from '../../../../helpers';
import { REFERRAL_DISCOUNT_PERCENT, type DiscountLayer } from '../../../../helpers/referral';

import type { Media } from '../../../../../types';
import NavItem from '../../../../components/Navigation/NavItem';
import Share from '../../cart/Share';

export default function ItemInfoSection({
  id,
  itemName,
  description,
  featureCollection,
  type,
  purchases,
  media,
  availableVariations,
  currentVariation,
  onSelectVariation,
  referralActive,
}: {
  id: string;
  itemName: string;
  description: string;
  featureCollection: string;
  type: 'ring' | 'bracelet';
  purchases: number;
  media: Media[];
  availableVariations: Array<JewelryVariation>;
  currentVariation: JewelryVariation;
  onSelectVariation: (variation: JewelryVariation) => void;
  referralActive: boolean;
}) {
  const router = useRouter();
  const t = useTranslations('product');
  const tDiscount = useTranslations('discount');
  const extraDiscounts: DiscountLayer[] = referralActive
    ? [{ percent: REFERRAL_DISCOUNT_PERCENT, label: tDiscount('referralLabel') }]
    : [];

  const imgUrls = useMemo(() => {
    const fallbackVariation = availableVariations[0]?.id;
    const isFirstVariation = fallbackVariation === currentVariation.id;
    const heroUrl = isFirstVariation ? detailHeroOf(media) : undefined;
    const extras = extrasForVariation(media, currentVariation.id, fallbackVariation).map((m) => m.url);
    return heroUrl ? [heroUrl, ...extras] : extras;
  }, [media, currentVariation.id, availableVariations]);

  const [loadingImg, setLoadingImg] = useState<boolean>(true);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const safeIndex = currentIndex < imgUrls.length ? currentIndex : 0;
  const imgUrlRef = useRef<Array<string>>(imgUrls);
  useEffect(() => {
    setLoadingImg(imgUrls.length === 0);
    imgUrlRef.current = imgUrls;
    setCurrentIndex(0);
  }, [imgUrls]);

  const [showZoom, setShowZoom] = useState<boolean>(false);
  const [zoom] = useState<number>(3);

  const imgRef = useRef<HTMLImageElement>(null);
  const zoomRef = useRef<HTMLDivElement>(null);

  const { addItem } = useCartCount();

  const selectVariation = (variation: JewelryVariation) => {
    onSelectVariation(variation);
  };

  const pickCartImgUrls = (): string[] => {
    if (imgUrlRef.current.length > 0) return imgUrlRef.current;
    const fallback = detailHeroOf(media) ?? browseThumbnailOf(media);
    if (fallback) return [fallback];
    return [];
  };

  const shoppingCartClicked = (variation: JewelryVariation) => {
    addItem({
      id,
      itemName,
      imgUrls: pickCartImgUrls(),
      featureCollection,
      type,
      variation,
      amount: variation.amount,
    });
    const currentState = {
      items: useCartCount.getState().items,
    };
    localStorage.setItem(SAVE_TO_CART, JSON.stringify(currentState));
    setTimeout(() => {
      router.push('/cart');
    }, WAIT - 250);
  };

  const throttleIncrement = useMemo(() => throttle(shoppingCartClicked, WAIT), []);

  const enterImage = () => {
    setShowZoom(true);
  };

  const unhoverImage = () => {
    setShowZoom(false);
  };
  
  const mouseMoveOnImage: MouseEventHandler<HTMLImageElement> = (e) => {
    if (!imgRef.current || !zoomRef.current) return;
    e.preventDefault();
    const rect = imgRef.current.getBoundingClientRect();

    const dispW = rect.width;
    const dispH = rect.height;
    const naturalW = imgRef.current.naturalWidth;
    const naturalH = imgRef.current.naturalHeight;
    if (!dispW || !dispH || !naturalW || !naturalH) return;

    // Mirror `object-cover` so the zoom view shares the source's crop and aspect.
    const coverScale = Math.max(dispW / naturalW, dispH / naturalH);
    const coverW = naturalW * coverScale;
    const coverH = naturalH * coverScale;
    const cropX = (coverW - dispW) / 2;
    const cropY = (coverH - dispH) / 2;

    zoomRef.current.style.backgroundSize = `${coverW * zoom}px ${coverH * zoom}px`;

    const w = zoomRef.current.offsetWidth / 2;
    const h = zoomRef.current.offsetHeight / 2;

    let x = e.clientX - rect.left;
    let y = e.clientY - rect.top;

    // Keep the magnifier window within the visible image bounds.
    const halfViewW = w / zoom;
    const halfViewH = h / zoom;
    if (x < halfViewW) x = halfViewW;
    if (x > dispW - halfViewW) x = dispW - halfViewW;
    if (y < halfViewH) y = halfViewH;
    if (y > dispH - halfViewH) y = dispH - halfViewH;

    const bgX = (x + cropX) * zoom - w;
    const bgY = (y + cropY) * zoom - h;
    zoomRef.current.style.backgroundPosition = `-${bgX}px -${bgY}px`;
  };

  useEffect(()  => {
    return () => {
      throttleIncrement.cancel();
    }
  }, [throttleIncrement]);

  return (
    <>
      <div className="relative flex flex-col justify-center items-center !w-[100%] bg-accent-100 border border-accent-300/40 rounded-2xl shadow-xl shadow-black/30 p-4 md:p-6 text-brand-700">
        {loadingImg
          ? <Loading />
          : (
            <div className="relative w-full max-w-[520px] aspect-square mx-auto">
              <Image
                ref={imgRef}
                key={imgUrls[safeIndex]}
                src={imgUrls[safeIndex]}
                alt={itemName}
                fill
                sizes="(max-width: 768px) 100vw, 520px"
                className="border border-accent-300/40 rounded-lg object-cover bg-white"
                onMouseEnter={enterImage}
                onMouseMove={mouseMoveOnImage}
                onMouseOut={unhoverImage} />
              {imgUrls.length > 1 && (
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2.5 px-3 py-2 rounded-full bg-white/85 backdrop-blur-sm shadow-md">
                  <div className="flex items-center gap-1.5">
                    {imgUrls.map((url, idx) => (
                      <button
                        key={`${url}_${idx}`}
                        type="button"
                        onClick={() => setCurrentIndex(idx)}
                        aria-label={t('galleryGoTo', { index: idx + 1 })}
                        aria-current={idx === safeIndex}
                        className="group p-1.5 -m-1.5 flex items-center justify-center"
                      >
                        <span
                          className={`block h-2.5 rounded-full transition-all ${
                            idx === safeIndex
                              ? 'w-7 bg-brand-700'
                              : 'w-2.5 bg-brand-700/40 group-hover:bg-brand-700/70'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  <span className="text-[11px] tabular-nums text-brand-700/80 leading-none px-0.5 select-none">
                    {safeIndex + 1} / {imgUrls.length}
                  </span>
                </div>
              )}
              {showZoom && (
                <div
                  ref={zoomRef}
                  style={{
                    backgroundImage: `url('${imgRef.current?.src}')`,
                    backgroundRepeat: 'no-repeat',
                  }}
                  className="hidden md:block absolute left-[100%] top-0 h-full w-full min-w-[320px] rounded-lg z-10 shadow-lg bg-white">
                </div>
              )}
            </div>
          )
        }
        <div className="flex gap-2 justify-start items-center mt-3">
          {availableVariations.map((variation) => (
            <Variation key={`${imgUrls[0]}_${variation.key}`} variation={variation} selected={currentVariation.key} onSelect={() => { selectVariation(variation); }} />
          ))}
        </div>
      </div>

      <div className="self-start grid gap-3 bg-accent-100 border border-accent-300/40 rounded-2xl shadow-xl shadow-black/30 p-5 md:p-7 text-brand-700">
        <h2 className="text-3xl text-brand-700 font-semibold leading-tight">{itemName}</h2>
        <small className="text-brand-500/80">
          <b className="font-bold text-brand-700">{t('purchasesCount', { count: purchases })}</b> {t('purchasesSuffix')}
          <motion.hr
            initial={{ width: 0 }}
            animate={{ width: '100%', transition: { duration: 1, delay: 1.6 } }}
            className="border-0 border-b border-accent-500/30 mt-1" />
        </small>

        <h2 className="text-2xl text-brand-700 font-semibold">
          <Money amount={currentVariation.amount} discount={currentVariation.discount} extraDiscounts={extraDiscounts} />
        </h2>
        <motion.hr
          initial={{ width: 0 }}
          animate={{ width: '100%', transition: { duration: 1, delay: 1.6 } }}
          className="border-0 border-b border-accent-500/30" />

        {featureCollection && (
          <div className="flex gap-1 items-center text-brand-700">
            <h2 className="text-base font-semibold">{t('collection')}</h2>
            <NavItem
              href={`/collections/${slugifyCollection(featureCollection)}`}
              withBorder={false}
              className="!underline decoration-accent-500/70 underline-offset-4 !text-sm !text-brand-500 hover:!text-accent-600 hover:decoration-accent-600"
              onClick={(e) => { e.stopPropagation(); }}
            >
              {featureCollection}
            </NavItem>
          </div>
        )}

        {/* Item Description */}
        <h2 className="text-2xl text-brand-700 font-semibold mt-1">{t('info')}</h2>
        <ul className="flex flex-1 flex-col list-none text-brand-700/90 leading-relaxed">
          {description.split('\n').map((line, idx) => (
            <li key={idx}>{line}</li>
          ))}
        </ul>

        <div className="mt-2 flex flex-col gap-2">
          <div className="flex gap-1 items-center text-brand-700">
            <Variation key={`${imgUrls[0]}_selected_${currentVariation.key}`} variation={currentVariation} />
            {t('selectedMaterial')} <b className="text-brand-700">{currentVariation.label}</b>
          </div>
          <Button variant="tertiary" className="!text-sm !py-1.5 !gap-1.5 !text-brand-500 hover:!text-accent-600" onClick={() => throttleIncrement(currentVariation)}>
            <ShoppingCart size={16} strokeWidth={1.75} />
            {t('addToCart')}
          </Button>
          <div className="mt-1 pt-3 border-t border-accent-500/30 text-center">
            <Share encodedId={id} itemName={itemName} itemAmount={currentVariation.amount} itemVariation={currentVariation.id} />
          </div>
        </div>
      </div>
    </>
  )
}
