'use client'

import Image from 'next/image';
import { useRouter } from 'next/navigation';

import { motion } from 'framer-motion';

import Variation, { type JewelryVariation } from './Variation';
import NavItem from '../Navigation/NavItem';

import { arrayBufferToBase64 } from '../../helpers';
import { useEffect, useState, type MouseEventHandler } from 'react';

const variations: Array<JewelryVariation> = [
  { key: 0, label: 'Bạc', style: 'bg-gray-400' },
  { key: 1, label: 'Vàng', style: 'bg-amber-300' },
  { key: 2, label: 'Vàng trắng', style: 'bg-slate-100' },
];

const enc = new TextEncoder();

export default function GridItem({ index, img }: { index: number, img: string }) {
  const router = useRouter();
  const [encryptedId, setEncryptedId] = useState<string>('');

  useEffect(() => {
    const setId = () => {
      const data = enc.encode(img).buffer;
      const base64 = arrayBufferToBase64(data);
      setEncryptedId(base64);
    };
    setId();
  }, [img]);

  const navigate: MouseEventHandler<HTMLAnchorElement> = (e) => {
    e.preventDefault();
    router.push(`/product/${encryptedId ?? ''}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { delay: 0.2 * (index + 1) } }}
      whileHover={{ scale: 1.05, opacity: .9 }}
      transition={{ type: 'spring', stiffness: 300 }}
      className="relative cursor-pointer">
      <NavItem href="/product" withBorder={false} withHover={false} onClick={navigate}>
        <figure className="text-sm h-80 overflow-hidden">
          <Image
            src={`/images/jewelry/${img}`}
            alt={img}
            width="450"
            height="320"
            style={{ objectFit: "contain", width: "auto", height: "auto" }}
            className="object-cover h-full w-full rounded-lg" />
          <figcaption className="absolute bottom-0 w-full bg-transparent-white flex justify-between items-center px-2 py-1">
            <div>
              <b>Mayra Collection</b>
              <p className="font-light">{img}</p>
              <div className="flex gap-2 items-center">
                {variations.map((variation) => (
                  <Variation key={`${img}_${variation.key}`} variation={variation} />
                ))}
              </div>
            </div>
            <b>300,000₫</b>
          </figcaption>
        </figure>
      </NavItem>
    </motion.div>
  )
}
