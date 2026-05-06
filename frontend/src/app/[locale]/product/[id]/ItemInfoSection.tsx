'use client'

import Image from 'next/image';
import { useRouter } from 'next/navigation';

import { useEffect, useMemo, useRef, useState, type MouseEventHandler } from 'react';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';

import { Heart, ShoppingCart } from 'lucide-react';

import throttle from 'lodash/throttle';

import Variation, { type JewelryVariation } from '../../../../components/Jewelry/Variation';
import Money from '../../../../components/Money/Money';
import Button from '../../../../components/Button';
import Loading from '../../../../components/Loading/Loading';

import { useCartCount } from '../../../../stores/CartCountProvider';
import { SAVE_TO_CART, WAIT } from '../../../../helpers';
import NavItem from '../../../../components/Navigation/NavItem';
import { addToWishlist, deleteFromWishlist } from '../../../../server/data';
import FullScreenLoading from '../../../../components/Loading/FullScreenLoading';
import Share from '../../cart/Share';
import type { Session } from 'next-auth';

export default function ItemInfoSection({
  id,
  itemName,
  amount,
  description,
  featureCollection,
  type,
  purchases,
  imgUrls,
  availableVariations,
  selectedVariation,
  session,
  buyerWishlistFound,
}: {
  id: string;
  itemName: string;
  amount: number,
  description: string;
  featureCollection: string;
  type: 'ring' | 'bracelet';
  purchases: number;
  imgUrls: string[];
  availableVariations: Array<JewelryVariation>;
  selectedVariation: JewelryVariation;
  session: Session | null;
  buyerWishlistFound: boolean;
}) {
  const router = useRouter();
  const t = useTranslations('product');
  const [variation, setSelectedVariation] = useState<JewelryVariation>(selectedVariation);

  const [loadingImg, setLoadingImg] = useState<boolean>(true);
  const imgUrlRef = useRef<Array<string>>(imgUrls);
  useEffect(() => {
    setLoadingImg(!imgUrls);
    imgUrlRef.current = imgUrls;
  }, [imgUrls]);

  const [hasItemWishlisted, setItemWishlisted] = useState<boolean>(buyerWishlistFound);
  const [loading, setLoading] = useState<boolean>(false);
  const [showZoom, setShowZoom] = useState<boolean>(false);
  const [zoom] = useState<number>(3);

  const imgRef = useRef<HTMLImageElement>(null);
  const zoomRef = useRef<HTMLDivElement>(null);

  const { addItem } = useCartCount();

  const selectVariation = (__variation: JewelryVariation) => {
    setSelectedVariation(__variation);
  };

  const shoppingCartClicked = () => {
    addItem({
      id,
      itemName,
      imgUrls: imgUrlRef.current,
      featureCollection,
      type,
      variation,
      amount,
    });
    const currentState = {
      items: useCartCount.getState().items,
    };
    localStorage.setItem(SAVE_TO_CART, JSON.stringify(currentState));
    setTimeout(() => {
      router.push('/cart');
    }, WAIT - 250);
  };

  const userId = session?.user?.id ?? '';

  const throttleIncrement = useMemo(() => throttle(shoppingCartClicked, WAIT), []);

  const onWishlistButtonClicked = async () => {
    if (!session) {
      router.push(`/wishlist?from=/product/${id}`);
      return;
    }
    setLoading(true);
    try {
      if (!hasItemWishlisted) {
        const buyer = await addToWishlist({ buyerId: userId, wishlistItems: [{ directoryId: id }] });
        setItemWishlisted(!!buyer);
        return;
      }

      await deleteFromWishlist({ buyerId: userId, wishlistItems: [{ directoryId: id }] });
      setItemWishlisted(false);
    } catch (e) {
      alert((e as { message: string }).message);
    } finally {
      setLoading(false);
    }
  };

  const enterImage = () => {
    setShowZoom(true);
  };

  const unhoverImage = () => {
    setShowZoom(false);
  };
  
  const mouseMoveOnImage: MouseEventHandler<HTMLImageElement> = (e) => {
    if (!imgRef.current || !zoomRef.current) return;
    const rect = imgRef.current.getBoundingClientRect();

    const getCursorPos = () => {
      let x = e.clientX - rect.left;
      let y = e.clientY - rect.top;
  
      // Consider any page scrolling
      x -= window.scrollX;
      y -= window.scrollY;
      return { x, y };
    };

    zoomRef.current.style.backgroundSize = `${imgRef.current.width * zoom}px ${imgRef.current.height * zoom}px`;

    const w = zoomRef.current.offsetWidth / 2;
    const h = zoomRef.current.offsetHeight / 2;

    const moveMagnifier = () => {
      if (!imgRef.current || !zoomRef.current) return;
      e.preventDefault();

      const bw = 3;
      const pos = getCursorPos();
      let { x, y } = pos;

      // Prevent the magnifier glass from being positioned outside the image
      if (x > imgRef.current.width - (w / zoom)) { x = imgRef.current.width - (w / zoom); }
      if (x < w / zoom) { x = w / zoom; }
      if (y > imgRef.current.height - (h / zoom)) { y = imgRef.current.height - (h / zoom); }
      if (y < h / zoom) { y = h / zoom; }

      zoomRef.current.style.backgroundPosition = `-${(x * zoom) - w + bw}px -${(y * zoom) - h + bw}px`;
    };

    moveMagnifier();
  };

  useEffect(() => {
    setItemWishlisted(buyerWishlistFound);
  }, [buyerWishlistFound]);

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
            <div className="relative w-full h-full flex justify-center">
              <Image
                ref={imgRef}
                src={imgUrls[0]}
                alt={itemName}
                width="520"
                height="520"
                className="border border-accent-300/40 rounded-lg min-w-[320px] min-h-[320px] max-h-[540px] object-cover bg-white"
                onMouseEnter={enterImage}
                onMouseMove={mouseMoveOnImage}
                onMouseOut={unhoverImage} />
              {showZoom && (
                <div
                  ref={zoomRef}
                  style={{
                    backgroundImage: `url('${imgRef.current?.src}')`,
                    backgroundRepeat: 'no-repeat',
                  }}
                  className="hidden md:block absolute left-[100%] top-0 h-full min-w-[320px] min-h-[320px] w-full rounded-lg z-10 shadow-lg bg-white">
                </div>
              )}
            </div>
          )
        }
        <div className="flex gap-2 justify-start items-center mt-3">
          {availableVariations.map((variation) => (
            <Variation key={`${imgUrls[0]}_${variation.key}`} variation={variation} selected={selectedVariation.key} onSelect={() => { selectVariation(variation); }} />
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
          <Money amount={amount} />
        </h2>
        <motion.hr
          initial={{ width: 0 }}
          animate={{ width: '100%', transition: { duration: 1, delay: 1.6 } }}
          className="border-0 border-b border-accent-500/30" />

        {featureCollection && (
          <div className="flex gap-1 items-center text-brand-700">
            <h2 className="text-base font-semibold">{t('collection')}</h2>
            <NavItem
              href={`/collections/${featureCollection}`}
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
            <Variation key={`${imgUrls[0]}_slected_${selectedVariation.key}`} variation={selectedVariation} />
            {t('selectedMaterial')} <b className="text-brand-700">{selectedVariation.label}</b>
          </div>
          <Button variant="tertiary" className="!text-sm !py-1.5 !gap-1.5 !text-brand-500 hover:!text-accent-600" onClick={throttleIncrement}>
            <ShoppingCart size={16} strokeWidth={1.75} />
            {t('addToCart')}
          </Button>
          <Button variant="tertiary" className={`!text-sm !py-1.5 !gap-1.5 !text-brand-500 hover:!text-accent-600 ${loading && 'cursor-wait'}`} onClick={onWishlistButtonClicked}>
            <Heart size={16} strokeWidth={1.75} fill={hasItemWishlisted ? 'var(--brand-500)' : 'none'} />
            {hasItemWishlisted ? t('removeFromWishlist') : t('addToWishlist')}
          </Button>
          <div className="mt-1 pt-3 border-t border-accent-500/30 text-center">
            <Share encodedId={id} itemName={itemName} itemAmount={amount} itemVariation={variation.id} />
          </div>
        </div>
      </div>

      {loading && <FullScreenLoading />}
    </>
  )
}
