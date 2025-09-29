'use client'

import Image from 'next/image';
import { use, useState } from 'react';

import { motion } from 'framer-motion';

import { base64ToArrayBuffer } from '../../../helpers';

const dec = new TextDecoder();

export default function Product({ params }: { params: Promise<{ id: Array<string> }> }) {
  const { id } = use(params);
  const encryptedId = decodeURIComponent(id.join('/'));
  const arrayBufferData = base64ToArrayBuffer(encryptedId);

  const [imgUrl] = useState<string>(() => dec.decode(arrayBufferData));

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { duration: 0.2 } }}
    >
      <Image
        src={`/images/jewelry/${imgUrl}`}
        alt={imgUrl}
        width="450"
        height="320"
        style={{ objectFit: "contain", width: "auto", height: "auto" }} />
      <p>Some item description here...</p>
    </motion.section>
  );
}
