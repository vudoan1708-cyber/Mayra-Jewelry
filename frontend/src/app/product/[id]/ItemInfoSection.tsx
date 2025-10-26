'use client'

import Image from 'next/image';
import { useRouter } from 'next/navigation';

import { useEffect, useMemo, useRef, useState, type MouseEventHandler } from 'react';

import { motion } from 'framer-motion';

import { Heart, ShoppingCart } from 'lucide-react';

import throttle from 'lodash/throttle';

import Variation, { type JewelryVariation } from '../../../components/Jewelry/Variation';
import Money from '../../../components/Money/Money';
import Button from '../../../components/Button';
import Loading from '../../../components/Loading/Loading';

import { useCartCount } from '../../../stores/CartCountProvider';
import { SAVE_TO_CART, WAIT } from '../../../helpers';
import NavItem from '../../../components/Navigation/NavItem';
import { addToWishlist, deleteFromWishlist } from '../../../server/data';
import FullScreenLoading from '../../../components/Loading/FullScreenLoading';
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
      <div className="relative flex flex-col justify-center items-center !w-[100%]">
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
                className="border rounded-lg min-w-[320px] min-h-[320px] max-h-[540px] object-cover"
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
                  className="hidden md:block absolute left-[100%] top-0 h-full min-w-[320px] min-h-[320px] w-full rounded-lg z-10 shadow-lg">
                </div>
              )}
            </div>
          )
        }
        <div className="flex gap-2 justify-start items-center mt-2">
          {availableVariations.map((variation) => (
            <Variation key={`${imgUrls[0]}_${variation.key}`} variation={variation} selected={selectedVariation.key} onSelect={() => { selectVariation(variation); }} />
          ))}
        </div>
      </div>

      <div className="self-start grid gap-2">
        <h2 className="text-3xl text-brand-500 font-semibold">{itemName}</h2>
        <small>
          <b className="font-bold text-brand-500">{purchases} lượt</b> mua món hàng này
          <motion.hr
            initial={{ width: 0 }}
            animate={{ width: '100%', transition: { duration: 1, delay: 1.6 } }}
            className="border-0 border-b border-b-transparent-black mt-1" />
        </small>

        <h2 className="text-xl">
          <Money amount={amount} />
        </h2>
        <motion.hr
          initial={{ width: 0 }}
          animate={{ width: '100%', transition: { duration: 1, delay: 1.6 } }}
          className="border-0 border-b border-b-transparent-black" />

        <div className="flex gap-1 items-center">
          <h2>Bộ sưu tập: </h2>
          <NavItem href={`/collections/${featureCollection}`} className="!underline !text-sm" onClick={(e) => { e.stopPropagation(); }}>{featureCollection}</NavItem>
        </div>

        {/* Item Description */}
        <h2 className="text-2xl">Thông tin sản phẩm</h2>
        <ul className="flex flex-1 flex-col list-none">
          {description.split('\n').map((line, idx) => (
            <li key={idx}>{line}</li>
          ))}
        </ul>

        <div>
          <div className="flex gap-1 items-center my-2">
            <Variation key={`${imgUrls[0]}_slected_${selectedVariation.key}`} variation={selectedVariation} />
            Bạn đã chọn chất liệu <b>{selectedVariation.label}</b>
          </div>
          <Button variant="tertiary" className="justify-self-start" onClick={throttleIncrement}>
            <ShoppingCart />
            Thêm vào giỏ đồ
          </Button>
          <Button variant="tertiary" className={`justify-self-start ${loading && 'cursor-wait'}`} onClick={onWishlistButtonClicked}>
            <Heart fill={hasItemWishlisted ? 'var(--brand-500)' : 'none'} />
            {hasItemWishlisted ? 'Bỏ ra khỏi Wishlist' : 'Thêm vào Wishlist'}
          </Button>
        </div>
      </div>

      {loading && <FullScreenLoading />}
    </>
  )
}
