'use client'

import { type MouseEventHandler } from 'react';

import Image from 'next/image';
import { useRouter } from 'next/navigation';

import { motion } from 'framer-motion';

import NavItem from '../Navigation/NavItem';

import type { Media } from '../../../types';

export default function GridItem({
  key, encodedId, media, alt, children,
}: {
  key: string; encodedId: string, media: Media[]; alt: string; children?: React.ReactNode,
}) {
  const router = useRouter();
  const thumbnail = media.find((file) => file.fileName.endsWith('file-thumbnail'))?.url ?? '';
  
  try {
    localStorage.setItem(encodedId, JSON.stringify(media));
  } catch (e) {
    console.error(e);
  }

  const navigate: MouseEventHandler<HTMLAnchorElement> = (e) => {
    e.preventDefault();
    router.push(`/product/${encodedId ?? ''}`);
  };

  return (
    <motion.div
      key={key}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      whileInView={{ opacity: 1 }}
      whileHover={{ opacity: .9 }}
      transition={{ type: 'spring', stiffness: 300 }}
      className="relative cursor-pointer overflow-hidden">
      <NavItem href="/product" withBorder={false} withHover={false} onClick={navigate}>
        <figure className="text-sm h-96 overflow-hidden">
          {/* Original ratio: 1080 - 1280 */}
          <Image
            src={thumbnail}
            alt={alt}
            width="520"
            height="520"
            style={{ width: "auto", height: "auto" }}
            className="object-contain h-full w-full rounded-md hover:scale-105 transition-all" />
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
