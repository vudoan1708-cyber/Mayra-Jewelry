'use client'

import { useEffect, useState, type MouseEventHandler } from 'react';

import Image from 'next/image';
import { useRouter } from 'next/navigation';

import { motion } from 'framer-motion';

import NavItem from '../Navigation/NavItem';

import { arrayBufferToBase64, PAYMENT_INFO } from '../../helpers';

const enc = new TextEncoder();

export default function GridItem({ key, img, children }: { key: string, img: string, children?: React.ReactNode }) {
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

  const amount = 12000;
  const info = PAYMENT_INFO;

  const navigate: MouseEventHandler<HTMLAnchorElement> = (e) => {
    e.preventDefault();
    router.push(`/product/${encryptedId ?? ''}?amount=${amount}&info=${info}`);
  };

  return (
    <motion.div
      key={key}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      whileInView={{ opacity: 1 }}
      whileHover={{ opacity: .9 }}
      transition={{ type: 'spring', stiffness: 300 }}
      className="relative cursor-pointer">
      <NavItem href="/product" withBorder={false} withHover={false} onClick={navigate}>
        <figure className="text-sm h-80 overflow-hidden">
          {/* 1080 - 1280 */}
          <Image
            src={`/images/jewelry/${img}`}
            alt={img}
            width="450"
            height="320"
            style={{ width: "auto", height: "auto" }}
            className="object-contain h-full w-full rounded-md" />
          {children && (
            <figcaption className="absolute bottom-0 w-full bg-transparent-white flex justify-between items-center px-2 py-1">
              {children}
            </figcaption>
          )}
        </figure>
      </NavItem>
    </motion.div>
  )
}
